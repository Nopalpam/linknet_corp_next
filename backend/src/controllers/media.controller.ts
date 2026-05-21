import { PrismaClient } from '@prisma/client';
import path from 'path';
import slugify from 'slugify';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';
import { normalizeStorageFolder } from '../utils/storagePathSecurity.util';
import {
  uploadFilesToFilemanager,
  deleteObjectFromFilemanager,
  bulkDeleteObjectsFromFilemanager,
} from '../services/media/filemanager.client';

const prisma = new PrismaClient();
const FILE_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'originalName', 'name', 'size', 'mimeType']);
const MEDIA_ROOT_PREFIX = normalizeStorageFolder(process.env.MEDIA_ROOT_PREFIX || 'cms/shared', 'cms/shared');

const clampPositiveInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const normalizeSortField = (value: unknown): string => (
  typeof value === 'string' && FILE_SORT_FIELDS.has(value) ? value : 'createdAt'
);

const normalizeSortOrder = (value: unknown): 'asc' | 'desc' => (
  value === 'asc' ? 'asc' : 'desc'
);

const buildStorageFolder = (folderPath?: string | null): string => (
  normalizeStorageFolder(folderPath ? `${MEDIA_ROOT_PREFIX}/${folderPath}` : MEDIA_ROOT_PREFIX, MEDIA_ROOT_PREFIX)
);

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

export const uploadMediaFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files provided' });
      return;
    }

    const folder = await getFolderOrNull(req.body.folderId);
    if (req.body.folderId && !folder) {
      res.status(404).json({ success: false, message: 'Folder not found' });
      return;
    }

    const storageFolder = buildStorageFolder(folder?.path);
    const uploaded = await uploadFilesToFilemanager(files, storageFolder);

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
      await bulkDeleteObjectsFromFilemanager(uploaded.files.map((file) => file.key)).catch((cleanupError) => {
        logger.error('Failed to cleanup uploaded S3 objects after database write error:', cleanupError);
      });

      throw dbError;
    }
  } catch (error) {
    logger.error('Media upload error:', error);
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
    const search = req.query.search as string;
    const mimeType = req.query.mimeType as string;
    const folderId = req.query.folderId as string;
    const sortBy = normalizeSortField(req.query.sortBy);
    const sortOrder = normalizeSortOrder(req.query.sortOrder);

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

    const [files, total] = await Promise.all([
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.file.count({ where }),
    ]);

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
      },
    });
  } catch (error) {
    logger.error('List media files error:', error);
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

    await deleteObjectFromFilemanager(file.cloudKey || file.path);
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