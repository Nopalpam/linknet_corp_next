import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import {
  s3Client,
  AWS_REGION_NAME,
  AWS_BUCKET_NAME,
  AWS_BUCKET_ENV,
  AWS_ENDPOINT,
  AWS_REGION_SOURCE,
  AWS_REGION_FALLBACK_USED,
  AWS_BUCKET_FALLBACK_USED,
  CDN_URL,
} from '../config/aws.config';
import {
  UploadedFile,
  FileListItem,
  BulkDeleteResult,
  StoredObjectMetadata,
  ObjectTransferMapping,
  ObjectTransferResult,
} from '../types';
import { normalizeStorageFolder, normalizeStorageKey } from '../utils/pathSecurity.util';
import { toSafeErrorLog } from '../utils/errorDebug.util';

type S3OperationContext = Record<string, unknown> & {
  requestId?: string;
  operation: string;
};

const detectCredentialSource = (): string => {
  if (
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SESSION_TOKEN
  ) {
    return 'environment-static-credentials';
  }

  if (process.env.AWS_WEB_IDENTITY_TOKEN_FILE || process.env.AWS_ROLE_ARN) {
    return 'web-identity-or-irsa';
  }

  if (
    process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
    process.env.AWS_CONTAINER_CREDENTIALS_FULL_URI
  ) {
    return 'container-credentials';
  }

  if (process.env.AWS_PROFILE) {
    return 'shared-aws-profile';
  }

  return 'aws-sdk-default-provider-chain';
};

const getEndpointHostForLog = (): string | null => {
  if (!AWS_ENDPOINT) return null;
  try {
    return new URL(AWS_ENDPOINT).host;
  } catch {
    return 'invalid-endpoint';
  }
};

const S3_LIST_MAX_OBJECTS = Math.min(
  Math.max(parseInt(process.env.S3_LIST_MAX_OBJECTS || '10000', 10) || 10000, 1),
  10000
);

export const getSafeS3Config = (): Record<string, unknown> => ({
  region: AWS_REGION_NAME,
  regionEnvName: AWS_REGION_SOURCE,
  regionFallbackUsed: AWS_REGION_FALLBACK_USED,
  bucket: AWS_BUCKET_NAME,
  bucketEnvName: AWS_BUCKET_ENV,
  bucketFallbackUsed: AWS_BUCKET_FALLBACK_USED,
  bucketConfigured: Boolean(AWS_BUCKET_NAME),
  cdnConfigured: Boolean(CDN_URL),
  endpointConfigured: Boolean(AWS_ENDPOINT),
  endpointHost: getEndpointHostForLog(),
  prefixDefault: '',
  listMaxObjects: S3_LIST_MAX_OBJECTS,
  credentialProvider: 'aws-sdk-default-provider-chain',
  credentialSourceHint: detectCredentialSource(),
  staticCredentialEnvPresent: Boolean(
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SESSION_TOKEN
  ),
});

export const getCredentialDebugInfo = async (): Promise<Record<string, unknown>> => {
  try {
    const provider = s3Client.config.credentials;
    if (!provider) {
      return {
        resolved: false,
        credentialSourceHint: detectCredentialSource(),
        message: 'S3 client has no explicit credentials provider; SDK default provider chain will be used lazily.',
      };
    }

    if (typeof provider === 'function') {
      await provider();
    }

    return {
      resolved: true,
      credentialSourceHint: detectCredentialSource(),
      message: 'AWS credentials resolved by the SDK without exposing access keys.',
    };
  } catch (error) {
    return {
      resolved: false,
      credentialSourceHint: detectCredentialSource(),
      error: error instanceof Error ? error.message : 'Unknown credential resolution error',
    };
  }
};

const logS3Start = ({ requestId, operation, ...context }: S3OperationContext): void => {
  console.info('[FM:S3] start', { requestId, operation, ...context });
};

const logS3Success = ({ requestId, operation, ...context }: S3OperationContext): void => {
  console.info('[FM:S3] success', { requestId, operation, ...context });
};

const logS3Error = (error: unknown, context: S3OperationContext): void => {
  console.error('[FM:S3] error', toSafeErrorLog(error, context.requestId, context));
};

/**
 * Build the public URL for a given S3 object key.
 * Uses CloudFront CDN if CDN_URL is configured, otherwise falls back to S3 URL.
 */
const buildPublicUrl = (key: string): string => {
  if (CDN_URL) {
    const host = CDN_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}/${key}`;
  }
  return `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION_NAME}.amazonaws.com/${key}`;
};

const sanitizeBaseName = (filename: string): string => {
  const parsedName = path.parse(filename).name;
  const asciiName = Array.from(parsedName.normalize('NFKD'))
    .filter((char) => char.charCodeAt(0) <= 127)
    .join('');
  const normalized = asciiName
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_.]+|[-_.]+$/g, '')
    .toLowerCase();

  return normalized || 'file';
};

const sanitizeExtension = (filename: string): string => {
  const extension = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : '';
};

const buildObjectKey = (folder: string, originalName: string): string => {
  const safeFolder = folder ? normalizeStorageFolder(folder, folder) : '';
  const safeBaseName = sanitizeBaseName(originalName);
  const extension = sanitizeExtension(originalName);
  const filename = `${uuidv4()}-${safeBaseName}${extension}`;
  return safeFolder ? `${safeFolder}/${filename}` : filename;
};

const objectExists = async (key: string): Promise<boolean> => {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: AWS_BUCKET_NAME, Key: key }));
    return true;
  } catch (error) {
    const statusCode = (error as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    const name = (error as { name?: string })?.name;
    if (statusCode === 404 || name === 'NotFound' || name === 'NoSuchKey') return false;
    throw error;
  }
};

const encodeCopySource = (key: string): string => (
  `${AWS_BUCKET_NAME}/${key}`
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
);

/**
 * Upload a single file to S3.
 */
export const uploadFile = async (
  file: Express.Multer.File,
  folder = '',
  requestId?: string
): Promise<UploadedFile> => {
  const key = buildObjectKey(folder, file.originalname);
  logS3Start({
    requestId,
    operation: 'upload',
    key,
    folder,
    mimeType: file.mimetype,
    size: file.size,
  });

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
    // ACL intentionally omitted — bucket-level policy controls access
  });

  try {
    await s3Client.send(command);
    logS3Success({
      requestId,
      operation: 'upload',
      key,
      folder,
      size: file.size,
    });
  } catch (error) {
    logS3Error(error, {
      requestId,
      operation: 'upload',
      key,
      folder,
      size: file.size,
    });
    throw error;
  }

  return {
    key,
    originalName: path.basename(file.originalname),
    mimeType: file.mimetype,
    size: file.size,
    url: buildPublicUrl(key),
    uploadedAt: new Date().toISOString(),
  };
};

/**
 * Delete a file from S3 by its key.
 */
export const deleteFile = async (key: string, requestId?: string): Promise<void> => {
  const safeKey = normalizeStorageKey(key);
  logS3Start({ requestId, operation: 'delete', key: safeKey });
  const command = new DeleteObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: safeKey,
  });

  try {
    await s3Client.send(command);
    logS3Success({ requestId, operation: 'delete', key: safeKey });
  } catch (error) {
    logS3Error(error, { requestId, operation: 'delete', key: safeKey });
    throw error;
  }
};

/**
 * List files in a given S3 prefix (folder).
 */
export const listFiles = async (
  prefix = '',
  maxKeys = 100,
  requestId?: string
): Promise<FileListItem[]> => {
  const safePrefix = prefix ? normalizeStorageFolder(prefix, 'uploads') : '';
  const safeMaxKeys = Math.min(Math.max(maxKeys, 1), S3_LIST_MAX_OBJECTS);
  const contents: Array<{ Key?: string; Size?: number; LastModified?: Date }> = [];
  let continuationToken: string | undefined;
  let pageCount = 0;

  logS3Start({ requestId, operation: 'list', prefix: safePrefix, limit: safeMaxKeys });

  try {
    do {
      const remaining = safeMaxKeys - contents.length;
      const command = new ListObjectsV2Command({
        Bucket: AWS_BUCKET_NAME,
        Prefix: safePrefix,
        MaxKeys: Math.min(remaining, 1000),
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      pageCount += 1;
      contents.push(...(response.Contents ?? []));
      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken && contents.length < safeMaxKeys);
  } catch (error) {
    logS3Error(error, {
      requestId,
      operation: 'list',
      prefix: safePrefix,
      limit: safeMaxKeys,
      pages: pageCount,
    });
    throw error;
  }

  logS3Success({
    requestId,
    operation: 'list',
    prefix: safePrefix,
    limit: safeMaxKeys,
    count: contents.length,
    pages: pageCount,
    truncated: Boolean(continuationToken),
  });

  return contents.map((item) => ({
    key: item.Key ?? '',
    size: item.Size ?? 0,
    lastModified: item.LastModified,
    url: buildPublicUrl(item.Key ?? ''),
  }));
};

/**
 * Generate a pre-signed URL for private S3 object access.
 */
export const generateSignedUrl = async (
  key: string,
  expiresIn = 3600,
  requestId?: string
): Promise<string> => {
  const safeKey = normalizeStorageKey(key);
  logS3Start({ requestId, operation: 'signed-url', key: safeKey, expiresIn });
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: safeKey,
  });

  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    logS3Success({ requestId, operation: 'signed-url', key: safeKey, expiresIn });
    return url;
  } catch (error) {
    logS3Error(error, { requestId, operation: 'signed-url', key: safeKey, expiresIn });
    throw error;
  }
};

export const getObjectMetadata = async (
  key: string,
  requestId?: string
): Promise<StoredObjectMetadata> => {
  const safeKey = normalizeStorageKey(key);
  logS3Start({ requestId, operation: 'metadata', key: safeKey });
  const command = new HeadObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: safeKey,
  });

  const response = await s3Client.send(command).catch((error) => {
    logS3Error(error, { requestId, operation: 'metadata', key: safeKey });
    throw error;
  });
  logS3Success({
    requestId,
    operation: 'metadata',
    key: safeKey,
    size: response.ContentLength ?? 0,
    mimeType: response.ContentType ?? null,
  });

  return {
    key: safeKey,
    url: buildPublicUrl(safeKey),
    size: response.ContentLength ?? 0,
    mimeType: response.ContentType ?? null,
    lastModified: response.LastModified?.toISOString() ?? null,
    eTag: response.ETag ?? null,
  };
};

/**
 * Copy or move S3 objects without downloading their contents. Destinations are
 * never overwritten. For moves, sources are deleted only after every copy has
 * completed successfully.
 */
export const transferObjects = async (
  mappings: ObjectTransferMapping[],
  deleteSource: boolean,
  requestId?: string
): Promise<ObjectTransferResult> => {
  if (mappings.length === 0 || mappings.length > 1000) {
    throw new Error('Object transfer requires between 1 and 1000 mappings');
  }

  const safeMappings = mappings.map(({ sourceKey, destinationKey }) => ({
    sourceKey: normalizeStorageKey(sourceKey),
    destinationKey: normalizeStorageKey(destinationKey),
  }));
  const destinations = new Set(safeMappings.map((mapping) => mapping.destinationKey));
  if (destinations.size !== safeMappings.length) {
    throw new Error('Duplicate destination keys are not allowed');
  }
  if (safeMappings.some((mapping) => mapping.sourceKey === mapping.destinationKey)) {
    throw new Error('Source and destination keys must be different');
  }

  logS3Start({ requestId, operation: deleteSource ? 'move' : 'copy', count: safeMappings.length });

  for (const mapping of safeMappings) {
    if (!(await objectExists(mapping.sourceKey))) {
      throw new Error(`Source object not found: ${mapping.sourceKey}`);
    }
    if (await objectExists(mapping.destinationKey)) {
      throw new Error(`Destination object already exists: ${mapping.destinationKey}`);
    }
  }

  const copied: ObjectTransferResult['copied'] = [];
  try {
    for (const mapping of safeMappings) {
      await s3Client.send(new CopyObjectCommand({
        Bucket: AWS_BUCKET_NAME,
        CopySource: encodeCopySource(mapping.sourceKey),
        Key: mapping.destinationKey,
        MetadataDirective: 'COPY',
      }));
      copied.push({
        ...mapping,
        url: buildPublicUrl(mapping.destinationKey),
      });
    }
  } catch (error) {
    await bulkDeleteFiles(copied.map((item) => item.destinationKey), requestId).catch(() => undefined);
    logS3Error(error, { requestId, operation: deleteSource ? 'move' : 'copy', count: safeMappings.length });
    throw error;
  }

  let deletedSources: string[] = [];
  if (deleteSource) {
    const deletion = await bulkDeleteFiles(safeMappings.map((mapping) => mapping.sourceKey), requestId);
    if (deletion.failed.length > 0) {
      throw new Error(`Copied objects but failed to delete ${deletion.failed.length} source object(s)`);
    }
    deletedSources = deletion.deleted;
  }

  logS3Success({ requestId, operation: deleteSource ? 'move' : 'copy', count: copied.length });
  return { copied, deletedSources };
};

/**
 * Delete multiple S3 objects in a single API call (max 1000 per S3 spec).
 * Returns a result object listing which keys succeeded and which failed.
 */
export const bulkDeleteFiles = async (
  keys: string[],
  requestId?: string
): Promise<BulkDeleteResult> => {
  if (keys.length === 0) return { deleted: [], failed: [] };

  // S3 DeleteObjects supports max 1000 keys per request
  const batch = keys.slice(0, 1000).map((key) => normalizeStorageKey(key));
  logS3Start({ requestId, operation: 'bulk-delete', count: batch.length });

  const command = new DeleteObjectsCommand({
    Bucket: AWS_BUCKET_NAME,
    Delete: {
      Objects: batch.map((k) => ({ Key: k })),
      Quiet: false,
    },
  });

  const response = await s3Client.send(command).catch((error) => {
    logS3Error(error, { requestId, operation: 'bulk-delete', count: batch.length });
    throw error;
  });
  logS3Success({
    requestId,
    operation: 'bulk-delete',
    requested: batch.length,
    deleted: response.Deleted?.length || 0,
    failed: response.Errors?.length || 0,
  });

  const deleted = (response.Deleted ?? []).map((d) => d.Key ?? '').filter(Boolean);
  const failed = (response.Errors ?? []).map((e) => ({
    key: e.Key ?? '',
    reason: e.Message ?? 'Unknown error',
  }));

  return { deleted, failed };
};
