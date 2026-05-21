import { Request, Response, NextFunction } from 'express';
import * as s3Service from '../services/s3.service';
import { sendSuccess, sendError } from '../utils/response.util';

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (req.file) return [req.file];
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  return Object.values(req.files).flat();
};

const normalizeFolder = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) {
    return 'cms/shared';
  }

  return value;
};

const extractKey = (req: Request): string | null => {
  const candidate =
    typeof req.body?.key === 'string'
      ? req.body.key
      : typeof req.query.key === 'string'
        ? req.query.key
        : null;

  if (!candidate?.trim()) {
    return null;
  }

  return decodeURIComponent(candidate.trim());
};

export const uploadMediaFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = getUploadedFiles(req);
    if (files.length === 0) {
      sendError(res, 'No files provided. Use field name "files".', 400);
      return;
    }

    const folder = normalizeFolder(req.body?.folder);
    const uploadedFiles = await Promise.all(
      files.map((file) => s3Service.uploadFile(file, folder))
    );

    sendSuccess(
      res,
      {
        folder,
        files: uploadedFiles,
        totalUploaded: uploadedFiles.length,
      },
      'Media files uploaded successfully',
      201
    );
  } catch (err) {
    next(err);
  }
};

export const listMediaObjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : '';
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10), 1000);

    const files = await s3Service.listFiles(prefix, limit);
    sendSuccess(res, { prefix, files, count: files.length });
  } catch (err) {
    next(err);
  }
};

export const getMediaObjectMetadata = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = extractKey(req);

    if (!key) {
      sendError(res, 'A non-empty "key" value is required', 400);
      return;
    }

    if (key.includes('..')) {
      sendError(res, 'Invalid file key', 400);
      return;
    }

    const metadata = await s3Service.getObjectMetadata(key);
    sendSuccess(res, metadata);
  } catch (err) {
    next(err);
  }
};

export const deleteMediaObject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const key = extractKey(req);

    if (!key) {
      sendError(res, 'A non-empty "key" value is required', 400);
      return;
    }

    if (key.includes('..')) {
      sendError(res, 'Invalid file key', 400);
      return;
    }

    await s3Service.deleteFile(key);
    sendSuccess(res, { key }, 'Media object deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const bulkDeleteMediaObjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keys } = req.body as { keys?: unknown };

    if (!Array.isArray(keys) || keys.length === 0) {
      sendError(res, 'Body must contain a non-empty "keys" array', 400);
      return;
    }

    if (keys.length > 1000) {
      sendError(res, 'Maximum 1000 keys per request', 400);
      return;
    }

    const sanitizedKeys = keys.map((key) => {
      if (typeof key !== 'string' || !key.trim() || key.includes('..')) {
        throw new Error('Each key must be a non-empty safe string');
      }

      return decodeURIComponent(key.trim());
    });

    const result = await s3Service.bulkDeleteFiles(sanitizedKeys);
    const statusCode = result.failed.length > 0 ? 207 : 200;
    sendSuccess(res, result, 'Bulk delete completed', statusCode);
  } catch (err) {
    next(err);
  }
};