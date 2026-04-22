import { Request, Response, NextFunction } from 'express';
import * as s3Service from '../services/s3.service';
import { sendSuccess, sendError } from '../utils/response.util';

// ── Upload ────────────────────────────────────────────────────────
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      sendError(res, 'No file provided. Use field name "file".', 400);
      return;
    }

    const rawFolder = (req.query.folder as string) || 'uploads';
    // Sanitize: only alphanumeric, dash, underscore, forward-slash
    const folder = rawFolder.replace(/[^a-zA-Z0-9_/-]/g, '').replace(/\.{2,}/g, '') || 'uploads';

    const result = await s3Service.uploadFile(req.file, folder);
    sendSuccess(res, result, 'File uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ── List files ────────────────────────────────────────────────────
export const listFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const prefix = (req.query.prefix as string) || '';
    const limit = Math.min(parseInt((req.query.limit as string) || '100', 10), 1000);

    const files = await s3Service.listFiles(prefix, limit);
    sendSuccess(res, { files, count: files.length });
  } catch (err) {
    next(err);
  }
};

// ── Delete file ───────────────────────────────────────────────────
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawKey = req.query.key as string;

    if (!rawKey?.trim()) {
      sendError(res, 'Query parameter "key" is required', 400);
      return;
    }

    const key = decodeURIComponent(rawKey.trim());

    // Prevent path traversal
    if (key.includes('..')) {
      sendError(res, 'Invalid file key', 400);
      return;
    }

    await s3Service.deleteFile(key);
    sendSuccess(res, { key }, 'File deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ── Bulk delete files ─────────────────────────────────────────────
export const bulkDeleteFiles = async (
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

    // Validate each key: must be a non-empty string without path traversal
    for (const k of keys) {
      if (typeof k !== 'string' || !k.trim()) {
        sendError(res, 'Each key must be a non-empty string', 400);
        return;
      }
      if ((k as string).includes('..')) {
        sendError(res, `Invalid key: "${k}"`, 400);
        return;
      }
    }

    const sanitizedKeys = (keys as string[]).map((k) => decodeURIComponent(k.trim()));
    const result = await s3Service.bulkDeleteFiles(sanitizedKeys);

    const statusCode = result.failed.length > 0 ? 207 : 200;
    sendSuccess(res, result, 'Bulk delete completed', statusCode);
  } catch (err) {
    next(err);
  }
};
export const getSignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawKey = req.query.key as string;

    if (!rawKey?.trim()) {
      sendError(res, 'Query parameter "key" is required', 400);
      return;
    }

    const key = decodeURIComponent(rawKey.trim());

    if (key.includes('..')) {
      sendError(res, 'Invalid file key', 400);
      return;
    }

    const expiresIn = Math.min(
      parseInt((req.query.expires as string) || '3600', 10),
      86400 // max 24 hours
    );

    const url = await s3Service.generateSignedUrl(key, expiresIn);
    sendSuccess(res, { url, key, expiresIn });
  } catch (err) {
    next(err);
  }
};
