import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { storageService } from '../utils/upload';
import imageProcessingService from '../services/imageProcessing.service';
import { getFileCategory } from '../middleware/upload.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import path from 'path';
import {
  normalizeOptionalString,
  normalizePositiveInt,
  normalizeRequiredString,
  normalizeSortOrder as normalizeInputSortOrder,
  sanitizeLogString,
} from '../utils/securityInput.util';
import { normalizeStorageKey } from '../utils/storagePathSecurity.util';

const prisma = new PrismaClient();
const FILE_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'originalName', 'name', 'size', 'mimeType']);

const clampPositiveInt = (value: unknown, fallback: number, max: number): number => {
  return normalizePositiveInt(value, fallback, max);
};

const normalizeSortField = (value: unknown): string => {
  const sortBy = typeof value === 'string' && FILE_SORT_FIELDS.has(value) ? value : 'createdAt';
  return sortBy;
};

const normalizeSortOrder = (value: unknown): 'asc' | 'desc' => {
  return normalizeInputSortOrder(value);
};

const slugifyFolderName = (value: string): string => {
  let result = '';
  let lastWasDash = false;

  for (const char of value.trim().toLowerCase()) {
    const isAlphaNum = (char >= 'a' && char <= 'z') || (char >= '0' && char <= '9');

    if (isAlphaNum) {
      result += char;
      lastWasDash = false;
    } else if (!lastWasDash && result) {
      result += '-';
      lastWasDash = true;
    }
  }

  return (result.endsWith('-') ? result.slice(0, -1) : result) || 'folder';
};

/**
 * Upload files to cloud storage
 * POST /api/filemanager/upload
 */
export const uploadFiles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No files provided',
      });
      return;
    }

    const folderId = normalizeOptionalString(req.body.folderId, { maxLength: 100 });
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Determine file category and folder path
        const category = getFileCategory(file.mimetype);
        const folderPath = category === 'unknown' ? 'uploads/misc' : `uploads/${category}`;

        // Upload original file via unified storage service
        const uploadResult = await storageService.uploadFile(
          file.buffer,
          file.originalname,
          {
            folder: folderPath,
            contentType: file.mimetype,
          }
        );

        let thumbnails = null;
        let width = null;
        let height = null;

        // Process images: generate thumbnails
        if (imageProcessingService.isImage(file.mimetype)) {
          try {
            // Get image metadata
            const metadata = await imageProcessingService.getImageMetadata(file.buffer);
            width = metadata.width || null;
            height = metadata.height || null;

            // Generate thumbnails
            const thumbnailResults = await imageProcessingService.generateThumbnails(file.buffer);

            // Upload thumbnails
            const [smallUpload, mediumUpload, largeUpload] = await Promise.all([
              storageService.uploadFile(
                thumbnailResults.small.buffer,
                `thumb_small_${path.parse(uploadResult.cloudKey).name}.webp`,
                {
                  folder: `${folderPath}/thumbnails`,
                  contentType: 'image/webp',
                }
              ),
              storageService.uploadFile(
                thumbnailResults.medium.buffer,
                `thumb_medium_${path.parse(uploadResult.cloudKey).name}.webp`,
                {
                  folder: `${folderPath}/thumbnails`,
                  contentType: 'image/webp',
                }
              ),
              storageService.uploadFile(
                thumbnailResults.large.buffer,
                `thumb_large_${path.parse(uploadResult.cloudKey).name}.webp`,
                {
                  folder: `${folderPath}/thumbnails`,
                  contentType: 'image/webp',
                }
              ),
            ]);

            thumbnails = {
              small: smallUpload.url,
              medium: mediumUpload.url,
              large: largeUpload.url,
            };
          } catch (error) {
            console.error('Error processing image thumbnails:', error);
            // Continue without thumbnails
          }
        }

        // Save to database
        const fileRecord = await prisma.file.create({
          data: {
            name: uploadResult.cloudKey,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: uploadResult.path,
            url: uploadResult.url,
            cloudProvider: storageService.getDriver(),
            cloudPath: uploadResult.path,
            cloudKey: uploadResult.cloudKey,
            thumbnail: thumbnails?.medium || null,
            thumbnails: thumbnails ? thumbnails : undefined,
            width,
            height,
            folderId: folderId || null,
            createdById: req.user.userId,
            isPublic: true,
          },
        });

        uploadedFiles.push({
          id: fileRecord.id,
          filename: fileRecord.name,
          originalName: fileRecord.originalName,
          url: fileRecord.url,
          thumbnails: fileRecord.thumbnails,
          size: fileRecord.size,
          mimeType: fileRecord.mimeType,
          width: fileRecord.width,
          height: fileRecord.height,
        });
      } catch (error) {
        console.error('Error uploading file', {
          originalName: sanitizeLogString(file.originalname, 255),
          error,
        });
        // Continue with other files
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get files with pagination and filters
 * GET /api/filemanager/files
 */
export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const pageNum = clampPositiveInt(req.query.page, 1, 100000);
    const limitNum = clampPositiveInt(req.query.limit, 20, 100);
    const search = normalizeOptionalString(req.query.search, { maxLength: 100 });
    const type = normalizeOptionalString(req.query.type, { maxLength: 100 });
    const folderId = normalizeOptionalString(req.query.folderId, { maxLength: 100 });
    const skip = (pageNum - 1) * limitNum;
    const orderField = normalizeSortField(req.query.sortBy);
    const orderDirection = normalizeSortOrder(req.query.sortOrder);

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.mimeType = { startsWith: type };
    }

    if (folderId) {
      where.folderId = folderId;
    }

    // Get total count
    const total = await prisma.file.count({ where });

    // Get files
    const files = await prisma.file.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [orderField]: orderDirection,
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: files,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get folders tree structure
 * GET /api/filemanager/folders
 */
export const getFolders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Get all folders
    const folders = await prisma.folder.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        path: 'asc',
      },
      include: {
        _count: {
          select: {
            files: true,
            children: true,
          },
        },
      },
    });

    // Build tree structure
    const buildTree = (parentId: string | null = null): any[] => {
      return folders
        .filter(folder => folder.parentId === parentId)
        .map(folder => ({
          id: folder.id,
          name: folder.name,
          path: folder.path,
          parentId: folder.parentId,
          fileCount: folder._count.files,
          childCount: folder._count.children,
          children: buildTree(folder.id),
        }));
    };

    const tree = buildTree();

    res.json({
      success: true,
      data: tree,
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve folders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Create new folder
 * POST /api/filemanager/folder
 */
export const createFolder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    let name: string;
    try {
      name = normalizeRequiredString(req.body?.name, 'Folder name', { maxLength: 120 });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Folder name is required',
      });
      return;
    }

    const parentId = normalizeOptionalString(req.body?.parentId, { maxLength: 100 });

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Folder name is required',
      });
      return;
    }

    // Generate slug and path
    const slug = slugifyFolderName(name);
    let folderPath = slug;

    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parentFolder) {
        res.status(404).json({
          success: false,
          message: 'Parent folder not found',
        });
        return;
      }

      folderPath = `${parentFolder.path}/${slug}`;
    }

    // Check if path already exists
    const existing = await prisma.folder.findFirst({
      where: {
        path: folderPath,
        deletedAt: null,
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'Folder with this name already exists in this location',
      });
      return;
    }

    // Create folder
    const folder = await prisma.folder.create({
      data: {
        name,
        slug,
        path: folderPath,
        parentId: parentId || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      data: folder,
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create folder',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete file
 * DELETE /api/filemanager/files/:id
 */
export const deleteFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    // Get file
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      res.status(404).json({
        success: false,
        message: 'File not found',
      });
      return;
    }

    // TODO: Check if file is used in content (pages, news, etc.)
    // For now, we'll allow deletion

    // Delete from cloud storage (unified — works with local, azure, or s3)
    try {
      await storageService.deleteFile(file.cloudKey!);

      // Delete thumbnails if exist
      if (file.thumbnails && typeof file.thumbnails === 'object') {
        const thumbnails = file.thumbnails as any;
        const thumbnailPaths: string[] = [];

        // Extract keys from URLs for cloud providers
        const extractKey = (url: string): string | null => {
          try {
            if (url.startsWith('/uploads/')) {
              return normalizeStorageKey(url.slice('/uploads/'.length));
            }
            const urlObj = new URL(url);
            const parts = urlObj.pathname.substring(1).split('/');
            // For Azure: skip container name; For S3: the full path is the key
            const key = storageService.getDriver() === 'azure'
              ? parts.slice(1).join('/')
              : parts.join('/');
            return normalizeStorageKey(key);
          } catch {
            return null;
          }
        };

        if (thumbnails.small) {
          const key = extractKey(thumbnails.small);
          if (key) thumbnailPaths.push(key);
        }
        if (thumbnails.medium) {
          const key = extractKey(thumbnails.medium);
          if (key) thumbnailPaths.push(key);
        }
        if (thumbnails.large) {
          const key = extractKey(thumbnails.large);
          if (key) thumbnailPaths.push(key);
        }

        if (thumbnailPaths.length > 0) {
          await storageService.deleteFiles(thumbnailPaths);
        }
      }
    } catch (error) {
      console.error('Error deleting from cloud storage:', error);
      // Continue with database deletion
    }

    // Soft delete from database
    await prisma.file.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Move files to another folder
 * POST /api/filemanager/move
 */
export const moveFiles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const rawFileIds = Array.isArray(req.body?.fileIds) ? req.body.fileIds as unknown[] : [];
    const fileIds: string[] = rawFileIds.length > 0
      ? Array.from(
          new Set<string>(
            rawFileIds
              .map((value) => normalizeOptionalString(value, { maxLength: 100 }))
              .filter((value): value is string => Boolean(value))
          )
        )
      : [];
    const targetFolderId = normalizeOptionalString(req.body?.targetFolderId, { maxLength: 100 });

    if (fileIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'File IDs are required',
      });
      return;
    }

    // Verify target folder exists if provided
    if (targetFolderId) {
      const targetFolder = await prisma.folder.findUnique({
        where: { id: targetFolderId },
      });

      if (!targetFolder) {
        res.status(404).json({
          success: false,
          message: 'Target folder not found',
        });
        return;
      }
    }

    // Move files
    await prisma.file.updateMany({
      where: {
        id: { in: fileIds },
        deletedAt: null,
      },
      data: {
        folderId: targetFolderId || null,
      },
    });

    res.json({
      success: true,
      message: `Successfully moved ${fileIds.length} file(s)`,
    });
  } catch (error) {
    console.error('Move files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to move files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Search files
 * GET /api/filemanager/search
 */
export const searchFiles = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const q = normalizeOptionalString(req.query.q, { maxLength: 100 }) || '';
    const type = normalizeOptionalString(req.query.type, { maxLength: 100 });
    const limitNum = clampPositiveInt(req.query.limit, 20, 100);

    // Build where clause
    const where: any = {
      deletedAt: null,
      OR: [
        { originalName: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ],
    };

    if (type) {
      where.mimeType = { startsWith: type };
    }

    // Search files
    const files = await prisma.file.findMany({
      where,
      take: limitNum,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: files,
      total: files.length,
    });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
