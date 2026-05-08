/**
 * File Controller
 * 
 * Backend-only file management endpoints for a future File Manager UI.
 * Lists and deletes files from the active storage driver (local, Azure, or S3).
 * 
 * Endpoints:
 *   GET    /api/v1/files           — List files (with prefix filter, pagination)
 *   GET    /api/v1/files/info      — Get single file metadata
 *   DELETE /api/v1/files/:key      — Delete a single file by key
 *   POST   /api/v1/files/delete    — Bulk delete files by keys
 * 
 * ⚠️ CATATAN:
 *   - Endpoint ini belum terkoneksi ke UI (File Manager UI belum dibuat)
 *   - Endpoint ini siap digunakan oleh Flmngr atau custom file manager
 *   - Untuk S3, listing via ListObjectsV2; untuk local, via filesystem
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { storageService } from '../utils/upload';
import s3Service from '../services/s3/s3Service';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import {
  normalizeStorageFolder,
  normalizeStorageKey,
  resolveWithinUploadDir,
} from '../utils/storagePathSecurity.util';

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_BULK_DELETE_KEYS = 100;

const clampPositiveInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
};

const normalizeOptionalPrefix = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return '';
  return normalizeStorageFolder(value, 'uploads');
};

/**
 * List files from the active storage driver.
 * 
 * For S3: Uses S3 ListObjectsV2 (direct bucket listing)
 * For local: Lists files from filesystem
 * For Azure: Uses DB records (Azure SDK doesn't have a simple list API wrapper here)
 * 
 * GET /api/v1/files?prefix=uploads/images/&limit=50&startAfter=...
 * 
 * Query params:
 *   prefix     - Filter by path prefix (e.g., 'uploads/images/')
 *   limit      - Max results (default: 50)
 *   startAfter - Pagination cursor (S3 only)
 *   source     - 'storage' (list from storage driver) or 'db' (list from database, default)
 */
export const listFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let prefix = '';
    try {
      prefix = normalizeOptionalPrefix(req.query.prefix);
    } catch {
      res.status(400).json({ success: false, message: 'Invalid prefix parameter' });
      return;
    }

    const limit = clampPositiveInt(req.query.limit, 50, 100);
    let startAfter: string | undefined;
    if (typeof req.query.startAfter === 'string' && req.query.startAfter.trim()) {
      try {
        startAfter = normalizeStorageKey(req.query.startAfter);
      } catch {
        res.status(400).json({ success: false, message: 'Invalid startAfter parameter' });
        return;
      }
    }
    const source = (req.query.source as string) || 'db';

    // Option 1: List from database (default — works for all drivers)
    if (source === 'db') {
      const page = clampPositiveInt(req.query.page, 1, 100000);
      const skip = (page - 1) * limit;

      const where: any = { deletedAt: null };
      if (prefix) {
        where.cloudKey = { startsWith: prefix };
      }

      const [files, total] = await Promise.all([
        prisma.file.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            originalName: true,
            mimeType: true,
            size: true,
            url: true,
            cloudKey: true,
            cloudProvider: true,
            thumbnail: true,
            width: true,
            height: true,
            createdAt: true,
          },
        }),
        prisma.file.count({ where }),
      ]);

      res.json({
        success: true,
        data: files,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
      return;
    }

    // Option 2: List directly from storage driver
    const driver = storageService.getDriver();

    if (driver === 's3') {
      const result = await s3Service.listFiles(prefix, limit, startAfter);

      // Enrich with public URLs
      const files = result.files.map((f) => ({
        ...f,
        url: s3Service.generatePublicUrl(f.key),
      }));

      res.json({
        success: true,
        data: files,
        pagination: {
          nextToken: result.nextToken,
          count: result.totalCount,
        },
        driver,
      });
      return;
    }

    if (driver === 'local') {
      const dirPath = prefix
        ? resolveWithinUploadDir(UPLOAD_DIR, prefix)
        : path.resolve(UPLOAD_DIR);
      
      if (!fs.existsSync(dirPath)) {
        res.json({ success: true, data: [], driver });
        return;
      }

      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const files = entries
        .filter((e) => e.isFile())
        .slice(0, limit)
        .map((e) => ({
          key: prefix ? `${prefix}/${e.name}` : e.name,
          name: e.name,
          url: `/uploads/${prefix ? prefix + '/' : ''}${e.name}`,
        }));

      res.json({ success: true, data: files, driver });
      return;
    }

    // Azure or fallback — use DB
    res.json({
      success: true,
      message: 'For Azure driver, use source=db for file listing',
      data: [],
      driver,
    });
  } catch (error) {
    logger.error('[FileController] listFiles failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get single file metadata.
 * 
 * GET /api/v1/files/info?key=uploads/images/file.jpg
 */
export const getFileInfo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const key = req.query.key as string;

    if (!key) {
      res.status(400).json({ success: false, message: 'key parameter is required' });
      return;
    }

    let normalizedKey: string;
    try {
      normalizedKey = normalizeStorageKey(key);
    } catch {
      res.status(400).json({ success: false, message: 'Invalid file key' });
      return;
    }

    // Try database first
    const dbFile = await prisma.file.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { cloudKey: normalizedKey },
          { path: normalizedKey },
        ],
      },
    });

    if (dbFile) {
      res.json({ success: true, data: dbFile, source: 'database' });
      return;
    }

    // Try storage driver directly (S3)
    const driver = storageService.getDriver();
    if (driver === 's3') {
      const metadata = await s3Service.getFileMetadata(normalizedKey);
      if (metadata) {
        res.json({
          success: true,
          data: {
            ...metadata,
            url: s3Service.generatePublicUrl(normalizedKey),
          },
          source: 'storage',
        });
        return;
      }
    }

    res.status(404).json({ success: false, message: 'File not found' });
  } catch (error) {
    logger.error('[FileController] getFileInfo failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file info',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Delete a single file by cloud key.
 * Deletes from both storage and database.
 * 
 * DELETE /api/v1/files/:key
 * The key is passed as a URL parameter. URL-encode slashes if needed: uploads%2Fimages%2Ffile.jpg
 * Or use the body-based bulk delete endpoint instead.
 */
export const deleteFileByKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    // Support both URL param and query param for the key
    const key = req.params.key || (req.query.key as string);

    if (!key) {
      res.status(400).json({ success: false, message: 'File key is required' });
      return;
    }

    let normalizedKey: string;
    try {
      normalizedKey = normalizeStorageKey(key);
    } catch {
      res.status(400).json({ success: false, message: 'Invalid file key' });
      return;
    }

    // Delete from storage
    const result = await storageService.deleteFile(normalizedKey);

    // Soft delete from database (if record exists)
    await prisma.file.updateMany({
      where: {
        deletedAt: null,
        OR: [
          { cloudKey: normalizedKey },
          { path: normalizedKey },
        ],
      },
      data: {
        deletedAt: new Date(),
      },
    });

    logger.info(`[FileController] File deleted by user ${req.user.userId}: ${normalizedKey}`);

    res.json({
      success: true,
      message: result.success ? 'File deleted successfully' : 'File deleted from database (storage deletion uncertain)',
      data: { key: normalizedKey },
    });
  } catch (error) {
    logger.error('[FileController] deleteFileByKey failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Bulk delete files.
 * 
 * POST /api/v1/files/delete
 * Body: { keys: ["uploads/images/file1.jpg", "uploads/images/file2.jpg"] }
 */
export const bulkDeleteFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      res.status(400).json({ success: false, message: 'keys array is required' });
      return;
    }

    if (keys.length > MAX_BULK_DELETE_KEYS) {
      res.status(400).json({
        success: false,
        message: `Bulk delete is limited to ${MAX_BULK_DELETE_KEYS} files per request`,
      });
      return;
    }

    if (!keys.every((key) => typeof key === 'string' && key.trim())) {
      res.status(400).json({ success: false, message: 'keys must contain non-empty strings only' });
      return;
    }

    let normalizedKeys: string[];
    try {
      normalizedKeys = keys.map((key) => normalizeStorageKey(key));
    } catch {
      res.status(400).json({ success: false, message: 'One or more file keys are invalid' });
      return;
    }

    // Delete from storage
    const results = await storageService.deleteFiles(normalizedKeys);

    // Soft delete from database
    await prisma.file.updateMany({
      where: {
        deletedAt: null,
        OR: [
          { cloudKey: { in: normalizedKeys } },
          { path: { in: normalizedKeys } },
        ],
      },
      data: {
        deletedAt: new Date(),
      },
    });

    const successCount = results.filter((r) => r.success).length;

    logger.info(`[FileController] Bulk delete by user ${req.user.userId}: ${successCount}/${normalizedKeys.length} files`);

    res.json({
      success: true,
      message: `Deleted ${successCount}/${normalizedKeys.length} file(s)`,
      data: results,
    });
  } catch (error) {
    logger.error('[FileController] bulkDeleteFiles failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete files',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
