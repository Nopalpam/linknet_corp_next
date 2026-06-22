import { PrismaClient } from '@prisma/client';
import path from 'path';
import { randomUUID } from 'crypto';
import slugify from 'slugify';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { normalizeStorageFolder } from '../utils/storagePathSecurity.util';
import {
  normalizeOptionalString,
  normalizePositiveInt,
  normalizeSortOrder as normalizeInputSortOrder,
} from '../utils/securityInput.util';
import {
  FilemanagerClientError,
  InternalMediaObject,
  uploadFilesToFilemanager,
  deleteObjectFromFilemanager,
  bulkDeleteObjectsFromFilemanager,
  listObjectsFromFilemanager,
  probeFilemanagerDebug,
  transferObjectsInFilemanager,
} from '../services/media/filemanager.client';

const prisma = new PrismaClient();
const FILE_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'originalName', 'name', 'size', 'mimeType']);
const FILEMANAGER_LIST_LIMIT = Math.min(
  Math.max(Number.parseInt(process.env.FILEMANAGER_LIST_LIMIT || '10000', 10) || 10000, 1),
  10000
);

const clampPositiveInt = (value: unknown, fallback: number, max: number): number => {
  return normalizePositiveInt(value, fallback, max);
};

const normalizeSortField = (value: unknown): string => (
  typeof value === 'string' && FILE_SORT_FIELDS.has(value) ? value : 'createdAt'
);

const normalizeSortOrder = (value: unknown): 'asc' | 'desc' => (
  normalizeInputSortOrder(value)
);

const buildStorageFolder = (folderPath?: string | null): string => (
  folderPath ? normalizeStorageFolder(folderPath, folderPath) : ''
);

const buildStorageListPrefix = (folder: { path: string } | null): string => (
  folder ? buildStorageFolder(folder.path) : ''
);
const MIME_BY_EXTENSION: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

const guessMimeType = (key: string): string => (
  MIME_BY_EXTENSION[path.extname(key).toLowerCase()] || 'application/octet-stream'
);

const toIsoString = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
};

const buildFilemanagerFailure = (
  error: unknown,
  operation: string,
  fallbackMessage: string,
) => {
  if (error instanceof FilemanagerClientError) {
    const payload = error.payload as { details?: { diagnostic?: Record<string, unknown> } } | null | undefined;
    const diagnostic = payload?.details?.diagnostic || null;
    const diagnosticSource = typeof diagnostic?.source === 'string' ? diagnostic.source : null;
    const diagnosticCode = typeof diagnostic?.code === 'string' ? diagnostic.code : null;
    const diagnosticMessage = typeof diagnostic?.message === 'string' ? diagnostic.message : null;
    const diagnosticLikelyCause = typeof diagnostic?.likelyCause === 'string' ? diagnostic.likelyCause : null;

    return {
      statusCode: error.statusCode || 502,
      body: {
        success: false,
        message: diagnosticMessage || error.message || fallbackMessage,
        code: diagnosticCode || error.code,
        details: {
          source: diagnosticSource || 'corporate-fm',
          operation,
          statusCode: error.statusCode,
          routePath: error.routePath,
          requestId: error.requestId,
          likelyCause: diagnosticLikelyCause || error.likelyCause,
          details: error.payload || null,
        },
      },
    };
  }

  return {
    statusCode: 502,
    body: {
      success: false,
      message: error instanceof Error ? error.message : fallbackMessage,
      code: 'FILEMANAGER_GATEWAY_ERROR',
      details: {
        source: 'corporate-be',
        operation,
        likelyCause: 'corporate-be could not complete the request to corporate-fm.',
      },
    },
  };
};

const mapS3ObjectToFile = (
  object: InternalMediaObject,
  folder: { id: string; name: string; path: string } | null,
) => {
  const originalName = path.basename(object.key);
  const createdAt = toIsoString(object.lastModified);

  return {
    id: `s3:${encodeURIComponent(object.key)}`,
    name: path.parse(originalName).name || originalName,
    originalName,
    mimeType: guessMimeType(object.key),
    size: object.size || 0,
    url: object.url,
    thumbnail: null,
    thumbnails: null,
    width: null,
    height: null,
    downloads: 0,
    isPublic: true,
    cloudProvider: 's3',
    cloudPath: object.key,
    cloudKey: object.key,
    source: 's3',
    createdAt,
    updatedAt: createdAt,
    createdBy: null,
    folder,
  };
};

const getSortValue = (file: any, field: string) => {
  if (field === 'size') return Number(file.size || 0);
  return String(file[field] || '').toLowerCase();
};

const sortFiles = (files: any[], sortBy: string, sortOrder: 'asc' | 'desc') => {
  const direction = sortOrder === 'asc' ? 1 : -1;
  return files.sort((a, b) => {
    const left = getSortValue(a, sortBy);
    const right = getSortValue(b, sortBy);
    if (left < right) return -1 * direction;
    if (left > right) return 1 * direction;
    return 0;
  });
};

const getFolderOrNull = async (folderId: unknown) => {
  if (typeof folderId !== 'string' || !folderId.trim()) {
    return null;
  }

  return prisma.folder.findFirst({
    where: {
      id: folderId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      path: true,
      parentId: true,
    },
  });
};

const normalizeTransferAction = (value: unknown): 'copy' | 'move' | null => (
  value === 'copy' || value === 'move' ? value : null
);

const storageKeyFromVirtualId = (id: string): string | null => {
  if (!id.startsWith('s3:')) return null;
  try {
    const key = decodeURIComponent(id.slice(3));
    return key ? key.replace(/\\/g, '/') : null;
  } catch {
    return null;
  }
};

const normalizeRenamedFile = (value: unknown, currentName: string): { originalName: string; name: string } | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 255 || path.basename(trimmed) !== trimmed || /[\\/]/.test(trimmed)) return null;

  const currentExtension = path.extname(currentName).toLowerCase();
  const requestedExtension = path.extname(trimmed).toLowerCase();
  if (requestedExtension && requestedExtension !== currentExtension) return null;

  const requestedStem = path.parse(trimmed).name;
  const safeStem = slugify(requestedStem, { lower: true, strict: true, trim: true });
  if (!safeStem) return null;
  return {
    originalName: `${safeStem}${currentExtension}`,
    name: safeStem,
  };
};

const replacePathPrefix = (value: string, oldPrefix: string, newPrefix: string): string => (
  value === oldPrefix ? newPrefix : `${newPrefix}${value.slice(oldPrefix.length)}`
);

const listFolderObjects = async (folderPath: string, requestId?: string) => {
  const result = await listObjectsFromFilemanager(folderPath, FILEMANAGER_LIST_LIMIT, requestId);
  const exactPrefix = `${folderPath}/`;
  return result.files.filter((object) => object.key.startsWith(exactPrefix) && !object.key.endsWith('/'));
};

const ensureTransferLimit = (count: number, res: Response): boolean => {
  if (count <= 1000) return true;
  res.status(413).json({
    success: false,
    message: 'A maximum of 1000 objects can be copied or moved in one operation',
  });
  return false;
};

const transferStorageObjects = async (
  mappings: Array<{ sourceKey: string; destinationKey: string }>,
  deleteSource: boolean,
  requestId?: string,
) => (
  mappings.length > 0
    ? transferObjectsInFilemanager(mappings, deleteSource, requestId)
    : { copied: [], deletedSources: [] }
);

export const uploadMediaFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      res.status(400).json({ success: false, message: 'No files provided' });
      return;
    }

    const folderId = normalizeOptionalString(req.body.folderId, { maxLength: 100 });
    const folder = await getFolderOrNull(folderId);
    if (folderId && !folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    const storageFolder = buildStorageFolder(folder?.path);
    const uploaded = await uploadFilesToFilemanager(files, storageFolder, req.requestId);

    try {
      const storedFiles = await Promise.all(
        uploaded.files.map((uploadedFile) =>
          prisma.file.create({
            data: {
              name: path.parse(uploadedFile.originalName).name || path.basename(uploadedFile.key),
              originalName: uploadedFile.originalName,
              mimeType: uploadedFile.mimeType,
              size: uploadedFile.size,
              path: uploadedFile.key,
              url: uploadedFile.url,
              cloudProvider: 's3',
              cloudPath: uploadedFile.key,
              cloudKey: uploadedFile.key,
              folderId: folder?.id || null,
              createdById: req.user!.userId,
              isPublic: true,
              metadata: {
                uploadedAt: uploadedFile.uploadedAt,
                storageFolder,
                internalService: 'filemanager',
              },
            },
            select: {
              id: true,
              name: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              thumbnail: true,
              thumbnails: true,
              width: true,
              height: true,
              downloads: true,
              isPublic: true,
              cloudProvider: true,
              createdAt: true,
              updatedAt: true,
              createdBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              folder: {
                select: {
                  id: true,
                  name: true,
                  path: true,
                },
              },
            },
          })
        )
      );

      res.status(201).json({
        success: true,
        message: `${storedFiles.length} file(s) uploaded successfully`,
        data: {
          files: storedFiles,
          totalUploaded: storedFiles.length,
          totalRequested: files.length,
        },
      });
    } catch (dbError) {
      await bulkDeleteObjectsFromFilemanager(uploaded.files.map((file) => file.key), req.requestId).catch((cleanupError) => {
        logger.error('Failed to cleanup uploaded S3 objects after database write error:', cleanupError);
      });

      throw dbError;
    }
  } catch (error) {
    logger.error('Media upload error:', error);
    if (error instanceof FilemanagerClientError) {
      const failure = buildFilemanagerFailure(error, 'upload', 'Failed to upload media files');
      res.status(failure.statusCode).json(failure.body);
      return;
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload media files',
    });
  }
};

export const listMediaFolders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const folders = await prisma.folder.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        path: 'asc',
      },
      select: {
        id: true,
        name: true,
        path: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const fileCounts = await prisma.file.groupBy({
      by: ['folderId'],
      where: {
        deletedAt: null,
        folderId: { not: null },
      },
      _count: {
        _all: true,
      },
    });

    const fileCountMap = new Map(
      fileCounts
        .filter((entry) => entry.folderId)
        .map((entry) => [entry.folderId as string, entry._count._all])
    );

    const childCountMap = new Map<string, number>();
    for (const folder of folders) {
      if (folder.parentId) {
        childCountMap.set(folder.parentId, (childCountMap.get(folder.parentId) || 0) + 1);
      }
    }

    const buildTree = (parentId: string | null = null): Array<Record<string, unknown>> => (
      folders
        .filter((folder) => folder.parentId === parentId)
        .map((folder) => ({
          ...folder,
          fileCount: fileCountMap.get(folder.id) || 0,
          childCount: childCountMap.get(folder.id) || 0,
          children: buildTree(folder.id),
        }))
    );

    res.json({
      success: true,
      data: {
        items: buildTree(),
      },
    });
  } catch (error) {
    logger.error('List media folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve media folders',
    });
  }
};

export const createMediaFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const parentId = typeof req.body.parentId === 'string' ? req.body.parentId : null;

    if (!name) {
      res.status(400).json({ success: false, message: 'Folder name is required' });
      return;
    }

    const slug = slugify(name, { lower: true, strict: true, trim: true });
    if (!slug) {
      res.status(400).json({ success: false, message: 'Folder name must contain at least one safe character' });
      return;
    }

    const parentFolder = parentId ? await getFolderOrNull(parentId) : null;
    if (parentId && !parentFolder) {
      res.status(404).json({ success: false, message: 'Parent folder not found' });
      return;
    }

    const folderPath = normalizeStorageFolder(
      parentFolder ? `${parentFolder.path}/${slug}` : slug,
      slug
    );

    const existingFolder = await prisma.folder.findFirst({
      where: {
        path: folderPath,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingFolder) {
      res.status(409).json({
        success: false,
        message: 'Folder with this name already exists in this location',
      });
      return;
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        slug,
        path: folderPath,
        parentId: parentFolder?.id || null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        path: true,
        parentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: { folder },
    });
  } catch (error) {
    logger.error('Create media folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create media folder',
    });
  }
};

export const deleteMediaFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const folder = await prisma.folder.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    const [activeChildren, activeFiles] = await Promise.all([
      prisma.folder.count({ where: { parentId: id, deletedAt: null } }),
      prisma.file.count({ where: { folderId: id, deletedAt: null } }),
    ]);

    if (activeChildren > 0 || activeFiles > 0) {
      res.status(409).json({
        success: false,
        message: 'Folder must be empty before it can be deleted',
        data: {
          childCount: activeChildren,
          fileCount: activeFiles,
        },
      });
      return;
    }

    await prisma.folder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Folder deleted successfully',
      data: { id: folder.id, name: folder.name },
    });
  } catch (error) {
    logger.error('Delete media folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media folder',
    });
  }
};

export const listMediaFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const page = clampPositiveInt(req.query.page, 1, 100000);
    const limit = clampPositiveInt(req.query.limit, 20, 100);
    const search = normalizeOptionalString(req.query.search, { maxLength: 100 });
    const mimeType = normalizeOptionalString(req.query.mimeType, { maxLength: 100 });
    const folderId = normalizeOptionalString(req.query.folderId, { maxLength: 100 });
    const sortBy = normalizeSortField(req.query.sortBy);
    const sortOrder = normalizeSortOrder(req.query.sortOrder);
    const folder = await getFolderOrNull(folderId);

    if (folderId && !folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (mimeType) {
      where.mimeType = { startsWith: mimeType };
    }

    if (folderId) {
      where.folderId = folderId;
    }

    const storagePrefix = buildStorageListPrefix(folder);
    const [dbFiles, storageResult] = await Promise.all([
      prisma.file.findMany({
        where,
        select: {
          id: true,
          name: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          thumbnail: true,
          thumbnails: true,
          width: true,
          height: true,
          downloads: true,
          isPublic: true,
          cloudProvider: true,
          cloudPath: true,
          cloudKey: true,
          path: true,
          createdAt: true,
          updatedAt: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          folder: {
            select: {
              id: true,
              name: true,
              path: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      listObjectsFromFilemanager(storagePrefix, FILEMANAGER_LIST_LIMIT, req.requestId),
    ]);

    const dbKeys = new Set(
      dbFiles
        .map((file: any) => file.cloudKey || file.path)
        .filter(Boolean)
    );
    const folderView = folder ? {
      id: folder.id,
      name: folder.name,
      path: folder.path,
    } : null;
    const normalizedSearch = search ? search.toLowerCase() : '';
    const s3OnlyFiles = storageResult.files
      .filter((object) => object.key && !object.key.endsWith('/') && !dbKeys.has(object.key))
      .map((object) => mapS3ObjectToFile(object, folderView))
      .filter((file) => {
        if (mimeType && !file.mimeType.startsWith(mimeType)) return false;
        if (!normalizedSearch) return true;
        return (
          file.originalName.toLowerCase().includes(normalizedSearch) ||
          file.name.toLowerCase().includes(normalizedSearch) ||
          String(file.cloudKey || '').toLowerCase().includes(normalizedSearch)
        );
      });

    const combinedFiles = sortFiles([...dbFiles.map((file) => ({ ...file, source: 'database' })), ...s3OnlyFiles], sortBy, sortOrder);
    const total = combinedFiles.length;
    const files = combinedFiles.slice((page - 1) * limit, page * limit);
    const storage = {
      internalService: 'filemanager',
      provider: 's3',
      prefix: storageResult.prefix,
      objectCountFromS3List: storageResult.count,
      s3OnlyObjectCount: s3OnlyFiles.length,
      sampleKeys: storageResult.files.slice(0, 5).map((file) => file.key),
    };

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
        ...(storage ? { storage } : {}),
      },
    });
  } catch (error) {
    logger.error('List media files error:', error);
    if (error instanceof FilemanagerClientError) {
      const failure = buildFilemanagerFailure(error, 'list', 'Failed to list media files');
      res.status(failure.statusCode).json(failure.body);
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to list media files',
    });
  }
};

export const getMediaFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const download = req.query.download === 'true';

    const file = await prisma.file.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        url: true,
        path: true,
        cloudKey: true,
        cloudProvider: true,
        thumbnail: true,
        thumbnails: true,
        width: true,
        height: true,
        downloads: true,
        isPublic: true,
        createdAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
      },
    });

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    if (download) {
      res.json({
        success: true,
        data: {
          downloadUrl: file.url,
          filename: file.originalName,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        file,
      },
    });
  } catch (error) {
    logger.error('Get media file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media file',
    });
  }
};

export const deleteMediaFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const file = await prisma.file.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        originalName: true,
        cloudKey: true,
        path: true,
      },
    });

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    await deleteObjectFromFilemanager(file.cloudKey || file.path, req.requestId);
    await prisma.file.update({
      where: { id: file.id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        id: file.id,
        originalName: file.originalName,
      },
    });
  } catch (error) {
    logger.error('Delete media file error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete media file',
    });
  }
};

export const renameMediaFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const file = await prisma.file.findFirst({ where: { id: req.params.id, deletedAt: null } });
    const virtualKey = file ? null : storageKeyFromVirtualId(req.params.id || '');
    if (!file && !virtualKey) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    const currentName = file?.originalName || path.basename(virtualKey as string);
    const renamed = normalizeRenamedFile(req.body?.name, currentName);
    if (!renamed) {
      res.status(400).json({
        success: false,
        message: 'Invalid file name. The extension cannot be changed.',
      });
      return;
    }

    const sourceKey = file ? (file.cloudKey || file.path) : virtualKey as string;
    const sourceDirectory = path.posix.dirname(sourceKey.replace(/\\/g, '/'));
    const destinationKey = sourceDirectory === '.'
      ? renamed.originalName
      : `${sourceDirectory}/${renamed.originalName}`;

    if (sourceKey === destinationKey) {
      res.json({ success: true, message: 'File name is unchanged', data: { file } });
      return;
    }

    const storageResult = await transferStorageObjects([{ sourceKey, destinationKey }], true, req.requestId);
    const destinationUrl = storageResult.copied[0]?.url || file?.url || '';
    if (!file) {
      res.json({
        success: true,
        message: 'File renamed successfully',
        data: { file: { id: `s3:${encodeURIComponent(destinationKey)}`, originalName: renamed.originalName, url: destinationUrl } },
      });
      return;
    }
    try {
      const updatedFile = await prisma.file.update({
        where: { id: file.id },
        data: {
          name: renamed.name,
          originalName: renamed.originalName,
          path: destinationKey,
          cloudPath: destinationKey,
          cloudKey: destinationKey,
          url: destinationUrl,
        },
      });
      res.json({ success: true, message: 'File renamed successfully', data: { file: updatedFile } });
    } catch (dbError) {
      await transferStorageObjects([{ sourceKey: destinationKey, destinationKey: sourceKey }], true, req.requestId).catch(() => undefined);
      throw dbError;
    }
  } catch (error) {
    logger.error('Rename media file error:', error);
    const failure = error instanceof FilemanagerClientError
      ? buildFilemanagerFailure(error, 'rename-file', 'Failed to rename file')
      : null;
    res.status(failure?.statusCode || 500).json(failure?.body || {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to rename file',
    });
  }
};

export const transferMediaFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const action = normalizeTransferAction(req.body?.action);
    if (!action) {
      res.status(400).json({ success: false, message: 'Action must be copy or move' });
      return;
    }

    const file = await prisma.file.findFirst({ where: { id: req.params.id, deletedAt: null } });
    const virtualKey = file ? null : storageKeyFromVirtualId(req.params.id || '');
    if (!file && !virtualKey) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    const targetFolderId = typeof req.body?.targetFolderId === 'string' && req.body.targetFolderId.trim()
      ? req.body.targetFolderId.trim()
      : null;
    const targetFolder = await getFolderOrNull(targetFolderId);
    if (targetFolderId && !targetFolder) {
      res.status(404).json({ success: false, message: 'Destination folder not found' });
      return;
    }
    if (action === 'move' && file && file.folderId === targetFolderId) {
      res.status(409).json({ success: false, message: 'File is already in the destination folder' });
      return;
    }

    const sourceKey = file ? (file.cloudKey || file.path) : virtualKey as string;
    const destinationBaseName = action === 'copy'
      ? `${randomUUID()}-${path.basename(sourceKey)}`
      : path.basename(sourceKey);
    const destinationKey = targetFolder
      ? `${targetFolder.path}/${destinationBaseName}`
      : destinationBaseName;
    const storageResult = await transferStorageObjects(
      [{ sourceKey, destinationKey }],
      action === 'move',
      req.requestId,
    );
    const destinationUrl = storageResult.copied[0]?.url || file?.url || '';

    if (!file) {
      res.status(action === 'copy' ? 201 : 200).json({
        success: true,
        message: action === 'copy' ? 'File copied successfully' : 'File moved successfully',
        data: {
          file: {
            id: `s3:${encodeURIComponent(destinationKey)}`,
            originalName: path.basename(destinationKey),
            url: destinationUrl,
          },
        },
      });
      return;
    }

    try {
      if (action === 'move') {
        const movedFile = await prisma.file.update({
          where: { id: file.id },
          data: {
            folderId: targetFolder?.id || null,
            path: destinationKey,
            cloudPath: destinationKey,
            cloudKey: destinationKey,
            url: destinationUrl,
          },
        });
        res.json({ success: true, message: 'File moved successfully', data: { file: movedFile } });
        return;
      }

      const copiedFile = await prisma.file.create({
        data: {
          folderId: targetFolder?.id || null,
          createdById: req.user.userId,
          name: file.name,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          path: destinationKey,
          url: destinationUrl,
          cloudProvider: file.cloudProvider,
          cloudPath: destinationKey,
          cloudKey: destinationKey,
          thumbnail: null,
          thumbnails: undefined,
          width: file.width,
          height: file.height,
          duration: file.duration,
          metadata: file.metadata === null ? undefined : file.metadata as any,
          downloads: 0,
          isPublic: file.isPublic,
        },
      });
      res.status(201).json({ success: true, message: 'File copied successfully', data: { file: copiedFile } });
    } catch (dbError) {
      if (action === 'move') {
        await transferStorageObjects([{ sourceKey: destinationKey, destinationKey: sourceKey }], true, req.requestId).catch(() => undefined);
      } else {
        await bulkDeleteObjectsFromFilemanager([destinationKey], req.requestId).catch(() => undefined);
      }
      throw dbError;
    }
  } catch (error) {
    logger.error('Transfer media file error:', error);
    const failure = error instanceof FilemanagerClientError
      ? buildFilemanagerFailure(error, 'transfer-file', 'Failed to transfer file')
      : null;
    res.status(failure?.statusCode || 500).json(failure?.body || {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to transfer file',
    });
  }
};

export const renameMediaFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const folder = await prisma.folder.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const slug = slugify(name, { lower: true, strict: true, trim: true });
    if (!name || name.length > 100 || !slug) {
      res.status(400).json({ success: false, message: 'A valid folder name is required' });
      return;
    }
    const parent = folder.parentId ? await getFolderOrNull(folder.parentId) : null;
    const newPath = parent ? `${parent.path}/${slug}` : slug;
    if (newPath === folder.path) {
      const updated = await prisma.folder.update({ where: { id: folder.id }, data: { name } });
      res.json({ success: true, message: 'Folder renamed successfully', data: { folder: updated } });
      return;
    }
    const conflict = await prisma.folder.findUnique({ where: { path: newPath }, select: { id: true } });
    if (conflict) {
      res.status(409).json({ success: false, message: 'Folder with this name already exists in this location' });
      return;
    }

    const objects = await listFolderObjects(folder.path, req.requestId);
    if (!ensureTransferLimit(objects.length, res)) return;
    const mappings = objects.map((object) => ({
      sourceKey: object.key,
      destinationKey: replacePathPrefix(object.key, folder.path, newPath),
    }));
    const storageResult = await transferStorageObjects(mappings, true, req.requestId);
    const urlByKey = new Map(storageResult.copied.map((item) => [item.destinationKey, item.url]));

    try {
      const descendants = await prisma.folder.findMany({
        where: { path: { startsWith: `${folder.path}/` }, deletedAt: null },
        orderBy: { path: 'asc' },
      });
      await prisma.$transaction(async (tx) => {
        await tx.folder.update({ where: { id: folder.id }, data: { name, slug, path: newPath } });
        for (const descendant of descendants) {
          await tx.folder.update({
            where: { id: descendant.id },
            data: { path: replacePathPrefix(descendant.path, folder.path, newPath) },
          });
        }
        for (const mapping of mappings) {
          await tx.file.updateMany({
            where: { OR: [{ cloudKey: mapping.sourceKey }, { path: mapping.sourceKey }], deletedAt: null },
            data: {
              path: mapping.destinationKey,
              cloudPath: mapping.destinationKey,
              cloudKey: mapping.destinationKey,
              ...(urlByKey.get(mapping.destinationKey) ? { url: urlByKey.get(mapping.destinationKey) } : {}),
            },
          });
        }
      });
      const updatedFolder = await prisma.folder.findUnique({ where: { id: folder.id } });
      res.json({ success: true, message: 'Folder renamed successfully', data: { folder: updatedFolder } });
    } catch (dbError) {
      await transferStorageObjects(
        mappings.map((mapping) => ({ sourceKey: mapping.destinationKey, destinationKey: mapping.sourceKey })),
        true,
        req.requestId,
      ).catch(() => undefined);
      throw dbError;
    }
  } catch (error) {
    logger.error('Rename media folder error:', error);
    const failure = error instanceof FilemanagerClientError
      ? buildFilemanagerFailure(error, 'rename-folder', 'Failed to rename folder')
      : null;
    res.status(failure?.statusCode || 500).json(failure?.body || {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to rename folder',
    });
  }
};

export const transferMediaFolder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const action = normalizeTransferAction(req.body?.action);
    if (!action) {
      res.status(400).json({ success: false, message: 'Action must be copy or move' });
      return;
    }
    const folder = await prisma.folder.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }
    const targetFolderId = typeof req.body?.targetFolderId === 'string' && req.body.targetFolderId.trim()
      ? req.body.targetFolderId.trim()
      : null;
    const target = await getFolderOrNull(targetFolderId);
    if (targetFolderId && !target) {
      res.status(404).json({ success: false, message: 'Destination folder not found' });
      return;
    }
    if (target && (target.id === folder.id || target.path.startsWith(`${folder.path}/`))) {
      res.status(409).json({ success: false, message: 'A folder cannot be moved or copied into itself' });
      return;
    }

    let destinationSlug = folder.slug;
    let newPath = target ? `${target.path}/${destinationSlug}` : destinationSlug;
    let conflict = await prisma.folder.findUnique({ where: { path: newPath }, select: { id: true } });
    if (action === 'move' && conflict) {
      res.status(409).json({ success: false, message: 'A folder with this name already exists at the destination' });
      return;
    }
    if (action === 'copy') {
      let suffix = 1;
      while (conflict) {
        destinationSlug = `${folder.slug}-copy${suffix === 1 ? '' : `-${suffix}`}`;
        newPath = target ? `${target.path}/${destinationSlug}` : destinationSlug;
        conflict = await prisma.folder.findUnique({ where: { path: newPath }, select: { id: true } });
        suffix += 1;
      }
    }

    const objects = await listFolderObjects(folder.path, req.requestId);
    if (!ensureTransferLimit(objects.length, res)) return;
    const mappings = objects.map((object) => ({
      sourceKey: object.key,
      destinationKey: replacePathPrefix(object.key, folder.path, newPath),
    }));
    const storageResult = await transferStorageObjects(mappings, action === 'move', req.requestId);
    const urlByKey = new Map(storageResult.copied.map((item) => [item.destinationKey, item.url]));

    const descendants = await prisma.folder.findMany({
      where: { path: { startsWith: `${folder.path}/` }, deletedAt: null },
      orderBy: { path: 'asc' },
    });
    const sourceFolders = [folder, ...descendants];
    const sourceFolderIds = sourceFolders.map((item) => item.id);
    const sourceFiles = await prisma.file.findMany({
      where: { folderId: { in: sourceFolderIds }, deletedAt: null },
    });

    try {
      if (action === 'move') {
        await prisma.$transaction(async (tx) => {
          await tx.folder.update({
            where: { id: folder.id },
            data: { parentId: target?.id || null, path: newPath },
          });
          for (const descendant of descendants) {
            await tx.folder.update({
              where: { id: descendant.id },
              data: { path: replacePathPrefix(descendant.path, folder.path, newPath) },
            });
          }
          for (const file of sourceFiles) {
            const sourceKey = file.cloudKey || file.path;
            const destinationKey = replacePathPrefix(sourceKey, folder.path, newPath);
            await tx.file.update({
              where: { id: file.id },
              data: {
                path: destinationKey,
                cloudPath: destinationKey,
                cloudKey: destinationKey,
                url: urlByKey.get(destinationKey) || file.url,
              },
            });
          }
        });
        const movedFolder = await prisma.folder.findUnique({ where: { id: folder.id } });
        res.json({ success: true, message: 'Folder moved successfully', data: { folder: movedFolder } });
        return;
      }

      const copiedFolder = await prisma.$transaction(async (tx) => {
        const idMap = new Map<string, string>();
        let copiedRoot: any = null;
        for (const sourceFolder of sourceFolders) {
          const isRoot = sourceFolder.id === folder.id;
          const created = await tx.folder.create({
            data: {
              parentId: isRoot ? target?.id || null : idMap.get(sourceFolder.parentId as string) || null,
              name: isRoot ? `${sourceFolder.name} copy` : sourceFolder.name,
              slug: isRoot ? destinationSlug : sourceFolder.slug,
              path: replacePathPrefix(sourceFolder.path, folder.path, newPath),
              isPublic: sourceFolder.isPublic,
            },
          });
          idMap.set(sourceFolder.id, created.id);
          if (isRoot) copiedRoot = created;
        }
        for (const file of sourceFiles) {
          const sourceKey = file.cloudKey || file.path;
          const destinationKey = replacePathPrefix(sourceKey, folder.path, newPath);
          await tx.file.create({
            data: {
              folderId: file.folderId ? idMap.get(file.folderId) || null : null,
              createdById: req.user!.userId,
              name: file.name,
              originalName: file.originalName,
              mimeType: file.mimeType,
              size: file.size,
              path: destinationKey,
              url: urlByKey.get(destinationKey) || file.url,
              cloudProvider: file.cloudProvider,
              cloudPath: destinationKey,
              cloudKey: destinationKey,
              width: file.width,
              height: file.height,
              duration: file.duration,
              metadata: file.metadata === null ? undefined : file.metadata as any,
              isPublic: file.isPublic,
            },
          });
        }
        return copiedRoot;
      });
      res.status(201).json({ success: true, message: 'Folder copied successfully', data: { folder: copiedFolder } });
    } catch (dbError) {
      if (action === 'move') {
        await transferStorageObjects(
          mappings.map((mapping) => ({ sourceKey: mapping.destinationKey, destinationKey: mapping.sourceKey })),
          true,
          req.requestId,
        ).catch(() => undefined);
      } else if (mappings.length) {
        await bulkDeleteObjectsFromFilemanager(mappings.map((mapping) => mapping.destinationKey), req.requestId).catch(() => undefined);
      }
      throw dbError;
    }
  } catch (error) {
    logger.error('Transfer media folder error:', error);
    const failure = error instanceof FilemanagerClientError
      ? buildFilemanagerFailure(error, 'transfer-folder', 'Failed to transfer folder')
      : null;
    res.status(failure?.statusCode || 500).json(failure?.body || {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to transfer folder',
    });
  }
};

export const getMediaDebugInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const prefix = normalizeOptionalString(req.query.prefix, { maxLength: 1024 });
    const debugResult = await probeFilemanagerDebug(prefix || undefined, req.requestId);

    res.json({
      success: true,
      requestId: req.requestId || debugResult.requestId,
      data: debugResult.data,
    });
  } catch (error) {
    logger.error('Media debug probe error:', error);
    res.status(502).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to probe file manager service',
    });
  }
};
