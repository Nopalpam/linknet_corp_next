import { Request, Response } from 'express';
import * as s3Service from '../services/s3.service';
import { classifyError, toSafeErrorLog } from '../utils/errorDebug.util';
import { sendError, sendSuccess } from '../utils/response.util';
import { normalizeStorageFolder } from '../utils/pathSecurity.util';

const clampLimit = (value: unknown): number => {
  const parsed = parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 5;
  return Math.min(parsed, 10);
};

const resolveDebugPrefix = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) {
    return normalizeStorageFolder(value, value);
  }

  return '';
};

const routes = {
  upload: 'POST /api/media/upload',
  list: 'GET /api/media/objects',
  metadata: 'GET /api/media/metadata',
  delete: 'DELETE /api/media/object',
  bulkDelete: 'POST /api/media/objects/delete',
  legacyUpload: 'POST /api/upload',
  legacyList: 'GET /api/files',
  signedUrl: 'GET /api/signed-url',
};

export const healthS3 = async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId;
  const prefix = resolveDebugPrefix(req.query.prefix);
  const limit = clampLimit(req.query.limit);

  try {
    const [files, credentials] = await Promise.all([
      s3Service.listFiles(prefix, limit, requestId),
      s3Service.getCredentialDebugInfo(),
    ]);

    sendSuccess(res, {
      service: 'corporate-fm',
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: s3Service.getSafeS3Config(),
      credentials,
      s3: {
        listOk: true,
        prefix,
        limit,
        count: files.length,
        sample: files.map((file) => ({
          key: file.key,
          size: file.size,
          lastModified: file.lastModified?.toISOString?.() || null,
        })),
      },
    });
  } catch (error) {
    const diagnostic = classifyError(error);
    const credentials = await s3Service.getCredentialDebugInfo();
    console.error('[FM:Debug] health-s3 failed', toSafeErrorLog(error, requestId, {
      path: req.path,
      prefix,
      limit,
    }));

    sendError(res, diagnostic.message, diagnostic.statusCode, diagnostic.code, {
      diagnostic,
      config: s3Service.getSafeS3Config(),
      credentials,
      s3: {
        listOk: false,
        prefix,
        limit,
      },
    });
  }
};

export const debugFileManager = async (req: Request, res: Response): Promise<void> => {
  const requestId = req.requestId;
  const prefix = resolveDebugPrefix(req.query.prefix);
  const limit = clampLimit(req.query.limit);

  try {
    const [files, credentials] = await Promise.all([
      s3Service.listFiles(prefix, limit, requestId),
      s3Service.getCredentialDebugInfo(),
    ]);

    sendSuccess(res, {
      service: 'corporate-fm',
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        ...s3Service.getSafeS3Config(),
        apiKeyConfigured: Boolean(process.env.API_KEY),
        allowedOriginsConfigured: Boolean(process.env.ALLOWED_ORIGINS?.trim()),
        maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
      },
      credentials,
      routes,
      s3: {
        listOk: true,
        prefix,
        limit,
        count: files.length,
        sample: files.map((file) => ({
          key: file.key,
          size: file.size,
          lastModified: file.lastModified?.toISOString?.() || null,
        })),
      },
      notes: [
        'Credentials are resolved by the AWS SDK default provider chain.',
        'No access key, secret key, session token, cookie, or auth token is returned.',
      ],
    });
  } catch (error) {
    const diagnostic = classifyError(error);
    const credentials = await s3Service.getCredentialDebugInfo();
    console.error('[FM:Debug] file-manager debug failed', toSafeErrorLog(error, requestId, {
      path: req.path,
      prefix,
      limit,
    }));

    sendError(res, diagnostic.message, diagnostic.statusCode, diagnostic.code, {
      diagnostic,
      config: {
        ...s3Service.getSafeS3Config(),
        apiKeyConfigured: Boolean(process.env.API_KEY),
        allowedOriginsConfigured: Boolean(process.env.ALLOWED_ORIGINS?.trim()),
      },
      credentials,
      routes,
      s3: {
        listOk: false,
        prefix,
        limit,
      },
    });
  }
};
