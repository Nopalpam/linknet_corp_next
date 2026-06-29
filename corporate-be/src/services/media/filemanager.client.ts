import logger from '../../utils/logger';

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  requestId?: string;
  details?: unknown;
};

interface BulkDeleteResult {
  deletedKeys: string[];
  failedKeys: string[];
}

export interface InternalMediaStoredFile {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface InternalMediaObject {
  key: string;
  size: number;
  lastModified?: string | Date | null;
  url: string;
}

export interface InternalObjectTransfer {
  sourceKey: string;
  destinationKey: string;
}

export class FilemanagerClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly routePath: string;
  readonly requestId?: string;
  readonly payload?: unknown;
  readonly likelyCause: string;

  constructor(message: string, options: {
    statusCode: number;
    code: string;
    routePath: string;
    requestId?: string;
    payload?: unknown;
    likelyCause: string;
  }) {
    super(message);
    this.name = 'FilemanagerClientError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.routePath = options.routePath;
    this.requestId = options.requestId;
    this.payload = options.payload;
    this.likelyCause = options.likelyCause;
  }
}

const STAGING_FILEMANAGER_URL = 'https://dev-fm.lncorp.local';
const FILEMANAGER_TIMEOUT_MS = Math.min(
  Math.max(Number.parseInt(process.env.FILEMANAGER_TIMEOUT_MS || '15000', 10) || 15000, 1000),
  60000
);

const trimTrailingSlashes = (value: string): string => {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }
  return value.slice(0, end);
};

const resolveFilemanagerInternalUrl = (): string => {
  const configured = process.env.FILEMANAGER_INTERNAL_URL?.trim();
  if (configured) {
    return trimTrailingSlashes(configured);
  }

  const deploymentEnv = (process.env.APP_ENV || process.env.ENVIRONMENT || process.env.NODE_ENV || 'development')
    .toLowerCase();

  if (['development', 'dev', 'staging', 'stage', 'test'].includes(deploymentEnv)) {
    return STAGING_FILEMANAGER_URL;
  }

  throw new Error('FILEMANAGER_INTERNAL_URL must be configured outside trusted non-production environments');
};

const FILEMANAGER_INTERNAL_URL = resolveFilemanagerInternalUrl();
const FILEMANAGER_API_KEY = process.env.FILEMANAGER_API_KEY?.trim();

const extractFilemanagerDiagnostic = (payload: unknown): {
  source?: string;
  code?: string;
  message?: string;
  likelyCause?: string;
  statusCode?: number;
  awsRequestId?: string;
} | null => {
  if (!payload || typeof payload !== 'object') return null;

  const details = (payload as { details?: unknown }).details;
  if (!details || typeof details !== 'object') return null;

  const diagnostic = (details as { diagnostic?: unknown }).diagnostic;
  if (!diagnostic || typeof diagnostic !== 'object') return null;

  return diagnostic as {
    source?: string;
    code?: string;
    message?: string;
    likelyCause?: string;
    statusCode?: number;
    awsRequestId?: string;
  };
};

const buildHeaders = (
  headers?: Record<string, string>,
  requestId?: string,
): Record<string, string> => {
  const nextHeaders = {
    ...(headers || {}),
    ...(requestId ? { 'X-Request-ID': requestId } : {}),
    ...(FILEMANAGER_API_KEY ? { 'x-api-key': FILEMANAGER_API_KEY } : {}),
  };

  return nextHeaders;
};

const mapFilemanagerStatusToLikelyCause = (status: number): string => {
  switch (status) {
    case 401:
    case 403:
      return 'corporate-be cannot authenticate to corporate-fm. Check FILEMANAGER_API_KEY and corporate-fm API_KEY.';
    case 404:
      return 'corporate-fm route was not found. Check FILEMANAGER_INTERNAL_URL and route deployment.';
    case 413:
      return 'Upload payload exceeds corporate-fm or proxy limits.';
    case 415:
      return 'corporate-fm rejected the file MIME type or extension.';
    case 429:
      return 'corporate-fm rate limit was reached. Verify corporate-fm is only reachable internally or raise the hardcoded service-level limits in corporate-fm.';
    case 503:
      return 'corporate-fm or AWS S3 dependency is unavailable. Check S3 credential provider/IAM Role and service logs.';
    default:
      return status >= 500
        ? 'corporate-fm failed while processing the request. Check corporate-fm logs with the request ID.'
        : 'corporate-fm rejected the request. Check request payload and File Manager service logs.';
  }
};

const requestFilemanager = async <T>(
  routePath: string,
  init: RequestInit & { headers?: Record<string, string> },
  requestId?: string,
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FILEMANAGER_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(`${FILEMANAGER_INTERNAL_URL}${routePath}`, {
      ...init,
      headers: buildHeaders(init.headers, requestId),
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    logger.error('[FilemanagerClient] Request failed', {
      routePath,
      requestId,
      message: error instanceof Error ? error.message : 'Unknown error',
      timeoutMs: isTimeout ? FILEMANAGER_TIMEOUT_MS : undefined,
    });

    throw new FilemanagerClientError(
      isTimeout
        ? 'Filemanager request timed out'
        : 'Filemanager service is unreachable',
      {
        statusCode: isTimeout ? 504 : 502,
        code: isTimeout ? 'FILEMANAGER_TIMEOUT' : 'FILEMANAGER_NETWORK_ERROR',
        routePath,
        requestId,
        payload: null,
        likelyCause: isTimeout
          ? 'corporate-fm did not respond before the backend timeout. Check pod readiness, S3 latency, and proxy timeout settings.'
          : 'corporate-be could not connect to corporate-fm. Check FILEMANAGER_INTERNAL_URL, service DNS, and network policy.',
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    const responseRequestId = response.headers.get('x-request-id') || payload?.requestId || requestId;
    const diagnostic = extractFilemanagerDiagnostic(payload);
    throw new FilemanagerClientError(
      diagnostic?.message || payload?.message || `Filemanager request failed with status ${response.status}`,
      {
        statusCode: diagnostic?.statusCode || response.status || 502,
        code: diagnostic?.code || payload?.error || `FILEMANAGER_HTTP_${response.status}`,
        routePath,
        requestId: responseRequestId,
        payload,
        likelyCause: diagnostic?.likelyCause || mapFilemanagerStatusToLikelyCause(response.status),
      }
    );
  }

  return payload.data;
};

export const uploadFilesToFilemanager = async (
  files: Express.Multer.File[],
  folder: string,
  requestId?: string,
): Promise<{ folder: string; files: InternalMediaStoredFile[]; totalUploaded: number }> => {
  const formData = new FormData();
  formData.append('folder', folder);

  for (const file of files) {
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append('files', blob, file.originalname);
  }

  return requestFilemanager('/api/media/upload', {
    method: 'POST',
    body: formData,
  }, requestId);
};

export const deleteObjectFromFilemanager = async (key: string, requestId?: string): Promise<void> => {
  await requestFilemanager<{ key: string }>('/api/media/object', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  }, requestId);
};

export const bulkDeleteObjectsFromFilemanager = async (
  keys: string[],
  requestId?: string,
): Promise<BulkDeleteResult> => {
  return requestFilemanager<BulkDeleteResult>('/api/media/objects/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keys }),
  }, requestId);
};

export const transferObjectsInFilemanager = async (
  mappings: InternalObjectTransfer[],
  deleteSource: boolean,
  requestId?: string,
): Promise<{
  copied: Array<{ sourceKey: string; destinationKey: string; url: string }>;
  deletedSources: string[];
}> => {
  return requestFilemanager('/api/media/objects/transfer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mappings, deleteSource }),
  }, requestId);
};

export const probeFilemanagerDebug = async (prefix?: string, requestId?: string): Promise<{
  data: Record<string, unknown>;
  requestId?: string;
}> => {
  const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
  const url = `${FILEMANAGER_INTERNAL_URL}/debug/file-manager${params}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FILEMANAGER_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(url, {
      headers: buildHeaders(undefined, requestId),
      signal: controller.signal,
    });
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    throw new FilemanagerClientError(
      isTimeout
        ? 'Filemanager debug probe timed out'
        : 'Filemanager debug probe is unreachable',
      {
        statusCode: isTimeout ? 504 : 502,
        code: isTimeout ? 'FILEMANAGER_TIMEOUT' : 'FILEMANAGER_NETWORK_ERROR',
        routePath: '/debug/file-manager',
        requestId,
        payload: null,
        likelyCause: isTimeout
          ? 'corporate-fm did not respond before the backend timeout.'
          : 'corporate-be could not connect to corporate-fm. Check FILEMANAGER_INTERNAL_URL, service DNS, and network policy.',
      }
    );
  } finally {
    clearTimeout(timeout);
  }

  type DebugEnvelope = {
    success?: boolean;
    message?: string;
    data?: Record<string, unknown>;
    requestId?: string;
  };

  const payload = (await response.json().catch(() => null)) as DebugEnvelope | null;

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Filemanager debug probe failed with status ${response.status}`
    );
  }

  return {
    data: payload.data || {},
    requestId: response.headers.get('x-request-id') || payload.requestId || requestId,
  };
};

export const getStorageSummaryFromFilemanager = async (prefix: string): Promise<{
  prefix: string;
  objectCountFromS3List: number;
  sampleKeys: string[];
}> => {
  const result = await listObjectsFromFilemanager(prefix, 10);

  return {
    prefix: result.prefix,
    objectCountFromS3List: result.count,
    sampleKeys: result.files.slice(0, 5).map((f) => f.key),
  };
};

export const listObjectsFromFilemanager = async (
  prefix: string,
  limit = 1000,
  requestId?: string,
): Promise<{
  prefix: string;
  files: InternalMediaObject[];
  count: number;
}> => {
  const safeLimit = Math.min(Math.max(limit, 1), 1000);

  return requestFilemanager<{
    prefix: string;
    files: InternalMediaObject[];
    count: number;
  }>(`/api/media/objects?prefix=${encodeURIComponent(prefix)}&limit=${safeLimit}`, {
    method: 'GET',
  }, requestId);
};
