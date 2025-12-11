import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import azureStorageService from '../services/azureStorage.service';
import imageProcessingService from '../services/imageProcessing.service';
import { getFileCategory } from '../middlewares/upload.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import path from 'path';

const prisma = new PrismaClient();

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

    const { folderId } = req.body;
    const uploadedFiles = [];

    for (const file of files) {
      try {
        // Determine file category and folder path
        const category = getFileCategory(file.mimetype);
        const folderPath = category === 'unknown' ? 'uploads/misc' : `uploads/${category}`;

        // Upload original file
        const uploadResult = await azureStorageService.uploadFile(
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
              azureStorageService.uploadFile(
                thumbnailResults.small.buffer,
                `thumb_small_${path.parse(uploadResult.cloudKey).name}.webp`,
                {
                  folder: `${folderPath}/thumbnails`,
                  contentType: 'image/webp',
                }
              ),
              azureStorageService.uploadFile(
                thumbnailResults.medium.buffer,
                `thumb_medium_${path.parse(uploadResult.cloudKey).name}.webp`,
                {
                  folder: `${folderPath}/thumbnails`,
                  contentType: 'image/webp',
                }
              ),
              azureStorageService.uploadFile(
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
            cloudProvider: 'azure',
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
        console.error(`Error uploading file ${file.originalname}:`, error);
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

    const {
      page = '1',
      limit = '20',
      search = '',
      type = '',
      folderId = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { originalName: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.mimeType = { startsWith: type as string };
    }

    if (folderId) {
      where.folderId = folderId as string;
    }

    // Get total count
    const total = await prisma.file.count({ where });

    // Get files
    const files = await prisma.file.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as string,
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

    const { name, parentId } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Folder name is required',
      });
      return;
    }

    // Generate slug and path
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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

    // Delete from cloud storage
    try {
      await azureStorageService.deleteFile(file.cloudKey!);

      // Delete thumbnails if exist
      if (file.thumbnails && typeof file.thumbnails === 'object') {
        const thumbnails = file.thumbnails as any;
        const thumbnailPaths: string[] = [];

        if (thumbnails.small) {
          const smallPath = new URL(thumbnails.small).pathname.substring(1);
          thumbnailPaths.push(smallPath.split('/').slice(1).join('/'));
        }
        if (thumbnails.medium) {
          const mediumPath = new URL(thumbnails.medium).pathname.substring(1);
          thumbnailPaths.push(mediumPath.split('/').slice(1).join('/'));
        }
        if (thumbnails.large) {
          const largePath = new URL(thumbnails.large).pathname.substring(1);
          thumbnailPaths.push(largePath.split('/').slice(1).join('/'));
        }

        if (thumbnailPaths.length > 0) {
          await azureStorageService.deleteFiles(thumbnailPaths);
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

    const { fileIds, targetFolderId } = req.body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
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

    const { q = '', type = '', limit = '20' } = req.query;

    const limitNum = parseInt(limit as string);

    // Build where clause
    const where: any = {
      deletedAt: null,
      OR: [
        { originalName: { contains: q as string, mode: 'insensitive' } },
        { name: { contains: q as string, mode: 'insensitive' } },
      ],
    };

    if (type) {
      where.mimeType = { startsWith: type as string };
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
