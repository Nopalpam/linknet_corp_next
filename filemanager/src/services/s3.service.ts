import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { s3Client, AWS_BUCKET_NAME, CDN_URL } from '../config/aws.config';
import { UploadedFile, FileListItem, BulkDeleteResult, StoredObjectMetadata } from '../types';
import { normalizeStorageFolder, normalizeStorageKey } from '../utils/pathSecurity.util';

/**
 * Build the public URL for a given S3 object key.
 * Uses CloudFront CDN if CDN_URL is configured, otherwise falls back to S3 URL.
 */
const buildPublicUrl = (key: string): string => {
  if (CDN_URL) {
    const host = CDN_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${host}/${key}`;
  }
  const region = process.env.AWS_REGION || 'ap-southeast-3';
  return `https://${AWS_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
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
  const safeFolder = normalizeStorageFolder(folder, 'uploads');
  const safeBaseName = sanitizeBaseName(originalName);
  const extension = sanitizeExtension(originalName);
  return `${safeFolder}/${uuidv4()}-${safeBaseName}${extension}`;
};

/**
 * Upload a single file to S3.
 */
export const uploadFile = async (
  file: Express.Multer.File,
  folder = 'uploads'
): Promise<UploadedFile> => {
  const key = buildObjectKey(folder, file.originalname);

  const command = new PutObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
    // ACL intentionally omitted — bucket-level policy controls access
  });

  await s3Client.send(command);

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
export const deleteFile = async (key: string): Promise<void> => {
  const safeKey = normalizeStorageKey(key);
  const command = new DeleteObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: safeKey,
  });

  await s3Client.send(command);
};

/**
 * List files in a given S3 prefix (folder).
 */
export const listFiles = async (
  prefix = '',
  maxKeys = 100
): Promise<FileListItem[]> => {
  const safePrefix = prefix ? normalizeStorageFolder(prefix, 'uploads') : '';
  const command = new ListObjectsV2Command({
    Bucket: AWS_BUCKET_NAME,
    Prefix: safePrefix,
    MaxKeys: Math.min(maxKeys, 1000),
  });

  const response = await s3Client.send(command);
  const contents = response.Contents ?? [];

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
  expiresIn = 3600
): Promise<string> => {
  const safeKey = normalizeStorageKey(key);
  const command = new GetObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: safeKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

export const getObjectMetadata = async (key: string): Promise<StoredObjectMetadata> => {
  const safeKey = normalizeStorageKey(key);
  const command = new HeadObjectCommand({
    Bucket: AWS_BUCKET_NAME,
    Key: safeKey,
  });

  const response = await s3Client.send(command);

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
 * Delete multiple S3 objects in a single API call (max 1000 per S3 spec).
 * Returns a result object listing which keys succeeded and which failed.
 */
export const bulkDeleteFiles = async (keys: string[]): Promise<BulkDeleteResult> => {
  if (keys.length === 0) return { deleted: [], failed: [] };

  // S3 DeleteObjects supports max 1000 keys per request
  const batch = keys.slice(0, 1000).map((key) => normalizeStorageKey(key));

  const command = new DeleteObjectsCommand({
    Bucket: AWS_BUCKET_NAME,
    Delete: {
      Objects: batch.map((k) => ({ Key: k })),
      Quiet: false,
    },
  });

  const response = await s3Client.send(command);

  const deleted = (response.Deleted ?? []).map((d) => d.Key ?? '').filter(Boolean);
  const failed = (response.Errors ?? []).map((e) => ({
    key: e.Key ?? '',
    reason: e.Message ?? 'Unknown error',
  }));

  return { deleted, failed };
};
