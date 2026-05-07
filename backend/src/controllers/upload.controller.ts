/**
 * Upload Controller
 * 
 * Handles all upload-related HTTP endpoints:
 * - POST   /upload                  — Upload file via backend (multipart)
 * - POST   /upload/presigned        — Get presigned URL for direct client upload
 * - POST   /upload/presigned/confirm — Confirm presigned upload (save to DB)
 * - GET    /upload/presigned-get     — Get presigned GET URL for private files
 * - GET    /upload/status            — Storage driver status
 * 
 * ⚠️ CATATAN UNTUK MEETING IT:
 *   Ada 2 opsi upload yang didukung:
 *   
 *   OPSI 1: Upload via Backend (default)
 *   Client → Backend (multer) → S3
 *   + Backend bisa validate/process file (resize, watermark, scan virus)
 *   + Lebih secure (credential tidak ke client)
 *   - Backend jadi bottleneck untuk file besar
 *   
 *   OPSI 2: Upload via Presigned URL
 *   Client → Backend (request URL) → Client → S3 (direct upload)
 *   + Performa lebih baik (bypass backend)
 *   + Cocok untuk file besar
 *   - Perlu CORS config di S3 bucket
 *   - Backend tidak bisa validate file sebelum upload
 *   - Butuh confirm step untuk save metadata ke DB
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadFile, getStorageStatus } from '../utils/upload';
import s3Service from '../services/s3/s3Service';
import logger from '../utils/logger';
import {
  getFileCategory,
  getMaxFileSize,
  isAllowedFileMetadata,
} from '../middleware/upload.middleware';

const isPresignedUploadEnabled = (): boolean => {
  if (process.env.PRESIGNED_UPLOAD_ENABLED !== undefined) {
    return process.env.PRESIGNED_UPLOAD_ENABLED === 'true';
  }

  // Direct-to-S3 uploads bypass backend scanning, so production must opt in.
  return process.env.NODE_ENV !== 'production';
};

const normalizePresignedExpiry = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) return 300;
  return Math.min(Math.max(parsed, 60), 300);
};

const sanitizeUploadFolder = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return 'uploads/quarantine';
  }

  const normalized = value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, '/');

  if (
    !normalized ||
    normalized.includes('..') ||
    !/^[a-zA-Z0-9/_-]+$/.test(normalized)
  ) {
    return 'uploads/quarantine';
  }

  // Keep direct uploads in a quarantine prefix until a backend-side
  // verification workflow promotes the object.
  return normalized.startsWith('uploads/quarantine')
    ? normalized
    : `uploads/quarantine/${normalized}`;
};

/**
 * Upload file via backend (standard multipart upload).
 * File goes: Client → Backend (multer buffer) → Cloud Storage
 * 
 * POST /api/v1/upload
 * Content-Type: multipart/form-data
 * Body: { file: File, folder?: string }
 */
export const uploadSingleFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file provided',
      });
      return;
    }

    const folder = (req.body.folder as string) || 'uploads';

    const result = await uploadFile({
      buffer: file.buffer,
      filename: file.originalname,
      mimeType: file.mimetype,
      folder,
      isPublic: true,
    });

    logger.info(`[UploadController] File uploaded by user ${req.user.userId}: ${result.cloudKey}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        path: result.path,
        cloudKey: result.cloudKey,
        cloudProvider: result.cloudProvider,
        size: result.size,
        originalName: file.originalname,
        mimeType: file.mimetype,
      },
    });
  } catch (error) {
    logger.error('[UploadController] Upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
    });
  }
};

/**
 * Upload multiple files via backend.
 * 
 * POST /api/v1/upload/multiple
 * Content-Type: multipart/form-data
 * Body: { files: File[], folder?: string }
 */
export const uploadMultipleFiles = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const folder = (req.body.folder as string) || 'uploads';
    const results = [];

    for (const file of files) {
      try {
        const result = await uploadFile({
          buffer: file.buffer,
          filename: file.originalname,
          mimeType: file.mimetype,
          folder,
          isPublic: true,
        });

        results.push({
          url: result.url,
          path: result.path,
          cloudKey: result.cloudKey,
          cloudProvider: result.cloudProvider,
          size: result.size,
          originalName: file.originalname,
          mimeType: file.mimetype,
          success: true,
        });
      } catch (error) {
        results.push({
          originalName: file.originalname,
          mimeType: file.mimetype,
          success: false,
          error: 'Upload failed',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    res.status(201).json({
      success: true,
      message: `Uploaded ${successCount}/${files.length} file(s)`,
      data: results,
    });
  } catch (error) {
    logger.error('[UploadController] Multiple upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Generate a presigned URL for direct client-to-S3 upload.
 * Only available when STORAGE_DRIVER=s3.
 * 
 * POST /api/v1/upload/presigned
 * Body: {
 *   filename: string,         // e.g., "photo.jpg"
 *   contentType: string,      // e.g., "image/jpeg"
 *   folder?: string,          // e.g., "uploads/images"
 *   expiresIn?: number        // Seconds (default: 300)
 * }
 * 
 * Response: {
 *   url: string,              // PUT this URL with file body
 *   key: string,              // S3 key (save this for confirm step)
 *   expiresIn: number,
 *   expiresAt: string,
 *   publicUrl: string         // Final public URL after upload
 * }
 */
export const getPresignedUploadUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!isPresignedUploadEnabled()) {
      res.status(403).json({
        success: false,
        message: 'Presigned uploads are disabled in this environment',
      });
      return;
    }

    // Check if S3 driver is active
    if (!s3Service.isConfigured()) {
      res.status(400).json({
        success: false,
        message: 'Presigned URLs are only available when STORAGE_DRIVER=s3. Current driver is not S3.',
      });
      return;
    }

    const { filename, contentType, folder, expiresIn, size } = req.body;

    if (!filename || typeof filename !== 'string') {
      res.status(400).json({
        success: false,
        message: 'filename is required',
      });
      return;
    }

    if (!contentType || typeof contentType !== 'string') {
      res.status(400).json({
        success: false,
        message: 'contentType is required',
      });
      return;
    }

    if (!isAllowedFileMetadata(filename, contentType)) {
      res.status(400).json({
        success: false,
        message: 'Invalid file type for presigned upload',
      });
      return;
    }

    const numericSize = typeof size === 'number' ? size : parseInt(String(size || ''), 10);
    if (!Number.isFinite(numericSize) || numericSize <= 0) {
      res.status(400).json({
        success: false,
        message: 'size is required for presigned upload',
      });
      return;
    }

    const maxSize = getMaxFileSize(getFileCategory(contentType));
    if (numericSize > maxSize) {
      res.status(400).json({
        success: false,
        message: `File exceeds maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`,
      });
      return;
    }

    const sanitizedFolder = sanitizeUploadFolder(folder);
    const normalizedExpiresIn = normalizePresignedExpiry(expiresIn);

    const result = await s3Service.generatePresignedUploadUrl(
      filename,
      {
        folder: sanitizedFolder,
        contentType,
        metadata: {
          requestedBy: req.user.userId,
          expectedSize: String(numericSize),
          scanStatus: 'pending',
        },
      },
      normalizedExpiresIn
    );

    logger.info(`[UploadController] Presigned upload URL generated for user ${req.user.userId}: ${result.key}`);

    res.json({
      success: true,
      data: {
        uploadUrl: result.url,
        key: result.key,
        expiresIn: result.expiresIn,
        expiresAt: result.expiresAt.toISOString(),
        // Instructions for frontend
        instructions: {
          method: 'PUT',
          headers: {
            'Content-Type': contentType,
          },
          body: 'Raw file bytes (not FormData)',
        },
        note: 'Object is written to quarantine prefix and must be verified before public use.',
      },
    });
  } catch (error) {
    logger.error('[UploadController] Presigned URL generation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned URL',
    });
  }
};

/**
 * Generate a presigned GET URL for private file access.
 * Only available when STORAGE_DRIVER=s3.
 * 
 * GET /api/v1/upload/presigned-get?key=uploads/images/file.jpg&expiresIn=3600
 */
export const getPresignedGetUrl = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!s3Service.isConfigured()) {
      res.status(400).json({
        success: false,
        message: 'Presigned URLs are only available when STORAGE_DRIVER=s3.',
      });
      return;
    }

    const key = req.query.key as string;
    const expiresIn = parseInt((req.query.expiresIn as string) || '3600', 10);

    if (!key) {
      res.status(400).json({
        success: false,
        message: 'key parameter is required',
      });
      return;
    }

    const result = await s3Service.generatePresignedGetUrl(key, expiresIn);

    res.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
        expiresIn: result.expiresIn,
        expiresAt: result.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    logger.error('[UploadController] Presigned GET URL failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate presigned GET URL',
    });
  }
};

/**
 * Get storage driver status.
 * Useful for health checks and debugging.
 * 
 * GET /api/v1/upload/status
 */
export const getUploadStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const status = getStorageStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get storage status',
    });
  }
};
