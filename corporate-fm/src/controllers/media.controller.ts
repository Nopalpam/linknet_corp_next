import { Request, Response, NextFunction } from 'express';
import * as s3Service from '../services/s3.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { normalizeStorageFolder, normalizeStorageKey } from '../utils/pathSecurity.util';

const LIST_MAX_OBJECTS = Math.min(
  Math.max(parseInt(process.env.S3_LIST_MAX_OBJECTS || '10000', 10) || 10000, 1),
  10000
);

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (req.file) return [req.file];
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  return Object.values(req.files).flat();
};

const normalizeFolder = (value: unknown): string => {
  return typeof value === 'string' && value.trim()
    ? normalizeStorageFolder(value, value)
    : '';
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

    let folder: string;
    try {
      folder = normalizeFolder(req.body?.folder);
    } catch {
      sendError(res, 'Invalid folder', 400);
      return;
    }
    const uploadedFiles = await Promise.all(
      files.map((file) => s3Service.uploadFile(file, folder, req.requestId))
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
    let prefix = '';
    if (typeof req.query.prefix === 'string' && req.query.prefix.trim()) {
      try {
        prefix = normalizeStorageFolder(req.query.prefix, '');
      } catch {
        sendError(res, 'Invalid prefix', 400);
        return;
      }
    }
    const parsedLimit = parseInt((req.query.limit as string) || '100', 10);
    const limit = Math.min(Math.max(parsedLimit || 100, 1), LIST_MAX_OBJECTS);

    const files = await s3Service.listFiles(prefix, limit, req.requestId);
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

    let normalizedKey: string;
    try {
      normalizedKey = normalizeStorageKey(key);
    } catch {
      sendError(res, 'Invalid file key', 400);
      return;
    }

    const metadata = await s3Service.getObjectMetadata(normalizedKey, req.requestId);
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

    let normalizedKey: string;
    try {
      normalizedKey = normalizeStorageKey(key);
    } catch {
      sendError(res, 'Invalid file key', 400);
      return;
    }

    await s3Service.deleteFile(normalizedKey, req.requestId);
    sendSuccess(res, { key: normalizedKey }, 'Media object deleted successfully');
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

      return normalizeStorageKey(decodeURIComponent(key.trim()));
    });

    const result = await s3Service.bulkDeleteFiles(sanitizedKeys, req.requestId);
    const statusCode = result.failed.length > 0 ? 207 : 200;
    sendSuccess(res, result, 'Bulk delete completed', statusCode);
  } catch (err) {
    next(err);
  }
};

export const transferMediaObjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const mappings = req.body?.mappings as unknown;
    const deleteSource = req.body?.deleteSource === true;

    if (!Array.isArray(mappings) || mappings.length === 0 || mappings.length > 1000) {
      sendError(res, 'Body must contain 1 to 1000 object mappings', 400);
      return;
    }

    const normalizedMappings = mappings.map((mapping) => {
      if (!mapping || typeof mapping !== 'object') {
        throw new Error('Each mapping must be an object');
      }
      const sourceKey = (mapping as { sourceKey?: unknown }).sourceKey;
      const destinationKey = (mapping as { destinationKey?: unknown }).destinationKey;
      if (typeof sourceKey !== 'string' || typeof destinationKey !== 'string') {
        throw new Error('Each mapping requires sourceKey and destinationKey strings');
      }
      return {
        sourceKey: normalizeStorageKey(sourceKey),
        destinationKey: normalizeStorageKey(destinationKey),
      };
    });

    const result = await s3Service.transferObjects(normalizedMappings, deleteSource, req.requestId);
    sendSuccess(
      res,
      result,
      deleteSource ? 'Media objects moved successfully' : 'Media objects copied successfully'
    );
  } catch (err) {
    next(err);
  }
};
