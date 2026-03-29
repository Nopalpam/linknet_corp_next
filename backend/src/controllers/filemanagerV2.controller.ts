/**
 * File Manager API Controller (v2 - Storage Abstraction)
 * 
 * Uses the new storage abstraction layer for file operations.
 * Endpoints:
 *   POST   /api/v1/files/upload   - Upload file(s)
 *   GET    /api/v1/files          - List files
 *   GET    /api/v1/files/:id      - Get file / download
 *   DELETE /api/v1/files/:id      - Delete file
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { getStorageProvider } from '../services/storage';
import path from 'path';
import logger from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Upload file(s)
 * POST /api/v1/files/upload
 */
export const uploadFileV2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No files provided' });
      return;
    }

    const { folder } = req.body;
    const storage = getStorageProvider();
    const uploadedFiles = [];

    for (const file of files) {
      try {
        const folderPath = folder || 'filemanager';
        
        // Upload via storage abstraction
        const result = await storage.upload({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          folder: folderPath,
        });

        // Save to database
        const dbFile = await prisma.file.create({
          data: {
            name: path.parse(file.originalname).name,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: result.key,
            url: result.url,
            cloudProvider: storage.getProviderName(),
            cloudKey: result.key,
            createdById: req.user.userId,
            folderId: req.body.folderId || null,
            isPublic: false,
          },
        });

        uploadedFiles.push({
          id: dbFile.id,
          name: dbFile.name,
          originalName: dbFile.originalName,
          mimeType: dbFile.mimeType,
          size: dbFile.size,
          url: dbFile.url,
          createdAt: dbFile.createdAt,
        });
      } catch (fileError) {
        logger.error(`Failed to upload file ${file.originalname}:`, fileError);
        // Continue with other files
      }
    }

    if (uploadedFiles.length === 0) {
      res.status(500).json({
        success: false,
        message: 'All file uploads failed',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: {
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length,
        totalRequested: files.length,
      },
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
    });
  }
};

/**
 * List files with pagination and filtering
 * GET /api/v1/files
 */
export const listFilesV2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const mimeType = req.query.mimeType as string;
    const folderId = req.query.folderId as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const where: any = {
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

    res.status(200).json({
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
    logger.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
    });
  }
};

/**
 * Get single file / download
 * GET /api/v1/files/:id
 */
export const getFileV2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const download = req.query.download === 'true';

    const file = await prisma.file.findUnique({
      where: { id },
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
      },
    });

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    if (download) {
      // Increment download count
      await prisma.file.update({
        where: { id },
        data: { downloads: { increment: 1 } },
      });

      // Get download URL from storage provider
      const storage = getStorageProvider();
      const downloadUrl = await storage.getDownloadUrl(file.cloudKey || file.path);

      res.status(200).json({
        success: true,
        data: {
          downloadUrl,
          filename: file.originalName,
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { file },
    });
  } catch (error) {
    logger.error('Get file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file',
    });
  }
};

/**
 * Delete file
 * DELETE /api/v1/files/:id
 */
export const deleteFileV2 = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const file = await prisma.file.findUnique({
      where: { id },
      select: {
        id: true,
        path: true,
        cloudKey: true,
        cloudProvider: true,
        originalName: true,
      },
    });

    if (!file) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    // Delete from storage
    const storage = getStorageProvider();
    try {
      await storage.delete(file.cloudKey || file.path);
    } catch (storageError) {
      logger.warn(`Failed to delete file from storage (${file.cloudKey || file.path}):`, storageError);
      // Continue with DB soft delete even if storage delete fails
    }

    // Soft delete in database
    await prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.status(200).json({
      success: true,
      message: `File "${file.originalName}" deleted successfully`,
    });
  } catch (error) {
    logger.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
    });
  }
};
