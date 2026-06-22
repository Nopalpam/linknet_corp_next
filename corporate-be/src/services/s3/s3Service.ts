/**
 * AWS S3 Service
 * 
 * Provides all S3 operations:
 * - uploadFile()              — Upload file buffer to S3
 * - deleteFile()              — Delete single file from S3
 * - deleteFiles()             — Bulk delete files from S3
 * - generatePublicUrl()       — Generate public URL (with optional CDN)
 * - generatePresignedUploadUrl()  — Pre-signed PUT URL for direct client upload
 * - generatePresignedGetUrl()     — Pre-signed GET URL for private file access
 * - fileExists()              — Check if file exists in S3
 * - getFileMetadata()         — Get file metadata from S3
 * - listFiles()               — List files in S3 bucket with prefix
 * - copyFile()                — Copy file within S3
 * 
 * All operations use AWS SDK v3 with proper error handling.
 * 
 * ⚠️ CATATAN UNTUK MEETING IT:
 *   - Bucket ACL: Jika bucket private, semua public URL harus via CDN atau presigned URL
 *   - Jika bucket public-read, generatePublicUrl() bisa langsung dipakai
 *   - Tanyakan retensi file: perlu lifecycle policy di S3?
 *   - Tanyakan max file size yang diizinkan untuk upload langsung vs multipart
 */

import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  GetObjectCommand,
  type _Object,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import logger from '../../utils/logger';
import { getS3Client, getS3Config } from './s3Client';
import {
  normalizeStorageFilename,
  normalizeStorageFolder,
  normalizeStorageKey,
} from '../../utils/storagePathSecurity.util';

const allowPublicAcl = (): boolean => process.env.S3_ALLOW_PUBLIC_ACL === 'true';

// ============================================================
// Types & Interfaces
// ============================================================

export interface S3UploadOptions {
  folder?: string;           // Subfolder path within bucket (e.g., 'uploads/images')
  filename?: string;         // Custom filename (auto-generated if not provided)
  contentType?: string;      // MIME type
  cacheControl?: string;     // Cache-Control header
  isPublic?: boolean;        // Set public-read ACL (default: depends on bucket policy)
  metadata?: Record<string, string>;  // Custom metadata
}

export interface S3UploadResult {
  url: string;               // Public URL or CDN URL
  path: string;              // Full S3 key path
  cloudKey: string;          // Same as path (for compatibility with existing DB schema)
  bucket: string;            // Bucket name
  cloudProvider: 's3';       // Provider identifier
  size: number;              // File size in bytes
}

export interface S3FileInfo {
  key: string;
  size: number;
  lastModified: Date | undefined;
  contentType: string | undefined;
  metadata: Record<string, string> | undefined;
}

export interface S3ListResult {
  files: S3FileInfo[];
  nextToken: string | undefined;  // For pagination
  totalCount: number;
}

export interface PresignedUrlResult {
  url: string;
  key: string;
  expiresIn: number;         // Seconds until expiration
  expiresAt: Date;           // Absolute expiration time
}

// ============================================================
// S3 Service Class
// ============================================================

class S3Service {
  /**
   * Check if S3 is properly configured and ready to use.
   */
  isConfigured(): boolean {
    const config = getS3Config();
    return config.isConfigured;
  }

  /**
   * Get current S3 configuration (safe — no secrets exposed).
   */
  getConfigInfo(): { region: string; bucket: string; publicUrl: string | null; configured: boolean } {
    const config = getS3Config();
    return {
      region: config.region,
      bucket: config.bucket,
      publicUrl: config.publicUrl,
      configured: config.isConfigured,
    };
  }

  // ========================================
  // UPLOAD OPERATIONS
  // ========================================

  /**
   * Upload a file buffer to S3.
   * 
   * @param buffer    - File content as Buffer
   * @param originalName - Original filename (used for extension if custom filename not provided)
   * @param options   - Upload options (folder, filename, contentType, etc.)
   * @returns Upload result with URL, path, and metadata
   * 
   * @example
   * ```ts
   * const result = await s3Service.uploadFile(
   *   imageBuffer,
   *   'photo.jpg',
   *   { folder: 'uploads/images', contentType: 'image/jpeg' }
   * );
   * // result.url => "https://bucket.s3.region.amazonaws.com/uploads/images/uuid.jpg"
   * ```
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    options: S3UploadOptions = {}
  ): Promise<S3UploadResult> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot upload file.');
    }

    try {
      const filename = this.generateUniqueFilename(originalName, options.filename);
      const key = this.buildKey(options.folder || 'uploads', filename);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: options.contentType || 'application/octet-stream',
        CacheControl: options.cacheControl || 'public, max-age=31536000', // 1 year default
        Metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        },
        // Public ACLs are disabled by default. Prefer private buckets with
        // CloudFront/signed URLs; enable S3_ALLOW_PUBLIC_ACL only after
        // bucket policy review and explicit approval.
        ...(options.isPublic && allowPublicAcl() && { ACL: 'public-read' }),
      });

      await client.send(command);

      const url = this.generatePublicUrl(key);

      logger.info('[S3] Uploaded file', { key, bytes: buffer.length });

      return {
        url,
        path: key,
        cloudKey: key,
        bucket: config.bucket,
        cloudProvider: 's3',
        size: buffer.length,
      };
    } catch (error) {
      logger.error('[S3] Upload failed:', error);
      throw new Error(
        `[S3] Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Upload a large file using multipart upload.
   * Recommended for files > 100MB.
   * 
   * @param buffer       - File content as Buffer
   * @param originalName - Original filename
   * @param options      - Upload options
   * @param onProgress   - Optional progress callback
   */
  async uploadLargeFile(
    buffer: Buffer,
    originalName: string,
    options: S3UploadOptions = {},
    onProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<S3UploadResult> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot upload file.');
    }

    try {
      const filename = this.generateUniqueFilename(originalName, options.filename);
      const key = this.buildKey(options.folder || 'uploads', filename);

      const upload = new Upload({
        client,
        params: {
          Bucket: config.bucket,
          Key: key,
          Body: buffer,
          ContentType: options.contentType || 'application/octet-stream',
          CacheControl: options.cacheControl || 'public, max-age=31536000',
          Metadata: {
            originalName,
            uploadedAt: new Date().toISOString(),
            ...options.metadata,
          },
        },
        // Multipart config
        queueSize: 4,             // Concurrent uploads
        partSize: 5 * 1024 * 1024, // 5MB per part (minimum)
      });

      if (onProgress) {
        upload.on('httpUploadProgress', (progress: { loaded?: number; total?: number }) => {
          onProgress({
            loaded: progress.loaded || 0,
            total: buffer.length,
          });
        });
      }

      await upload.done();

      const url = this.generatePublicUrl(key);

      logger.info('[S3] Multipart upload completed', { key, bytes: buffer.length });

      return {
        url,
        path: key,
        cloudKey: key,
        bucket: config.bucket,
        cloudProvider: 's3',
        size: buffer.length,
      };
    } catch (error) {
      logger.error('[S3] Multipart upload failed:', error);
      throw new Error(
        `[S3] Failed multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================
  // DELETE OPERATIONS
  // ========================================

  /**
   * Delete a single file from S3.
   * 
   * @param key - S3 object key (path within bucket)
   */
  async deleteFile(key: string): Promise<void> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot delete file.');
    }

    try {
      const normalizedKey = normalizeStorageKey(key);
      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: normalizedKey,
      });

      await client.send(command);
      logger.info('[S3] Deleted file', { key: normalizedKey });
    } catch (error) {
      logger.error('[S3] Delete failed', { key, error });
      throw new Error(
        `[S3] Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete multiple files from S3 in a single request.
   * S3 supports up to 1000 objects per bulk delete.
   * 
   * @param keys - Array of S3 object keys
   */
  async deleteFiles(keys: string[]): Promise<void> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot delete files.');
    }

    if (keys.length === 0) return;

    try {
      const normalizedKeys = keys.map((key) => normalizeStorageKey(key));
      // S3 bulk delete limit is 1000 per request
      const chunks = this.chunkArray(normalizedKeys, 1000);

      for (const chunk of chunks) {
        const command = new DeleteObjectsCommand({
          Bucket: config.bucket,
          Delete: {
            Objects: chunk.map((key) => ({ Key: key })),
            Quiet: true,
          },
        });

        await client.send(command);
      }

      logger.info('[S3] Bulk deleted files', { count: normalizedKeys.length });
    } catch (error) {
      logger.error('[S3] Bulk delete failed:', error);
      throw new Error(
        `[S3] Failed to bulk delete: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================
  // URL GENERATION
  // ========================================

  /**
   * Generate a public URL for a given S3 key.
   * Uses CDN URL (AWS_S3_PUBLIC_URL) if configured, otherwise direct S3 URL.
   * 
   * ⚠️ CATATAN UNTUK MEETING IT:
   *   - Jika pakai CloudFront, set AWS_S3_PUBLIC_URL ke CloudFront distribution URL
   *   - Jika bucket private, URL ini tidak akan bisa diakses tanpa presigned URL
   *   - Jika bucket public-read, URL ini langsung bisa diakses
   */
  generatePublicUrl(key: string): string {
    const config = getS3Config();
    const normalizedKey = normalizeStorageKey(key);

    // Use CDN URL if configured
    if (config.publicUrl) {
      const baseUrl = config.publicUrl.replace(/\/+$/, ''); // Remove trailing slashes
      return `${baseUrl}/${normalizedKey}`;
    }

    // Use custom endpoint if configured
    if (config.endpoint) {
      const endpoint = config.endpoint.replace(/\/+$/, '');
      return `${endpoint}/${config.bucket}/${normalizedKey}`;
    }

    // Default: Direct S3 URL
    return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${normalizedKey}`;
  }

  // ========================================
  // PRE-SIGNED URL OPERATIONS
  // ========================================

  /**
   * Generate a pre-signed URL for uploading a file directly from the client.
   * 
   * Flow:
   * 1. Client requests presigned URL from backend
   * 2. Backend generates presigned PUT URL
   * 3. Client uploads directly to S3 using the presigned URL
   * 4. Client notifies backend with the key for DB storage
   * 
   * ⚠️ CATATAN UNTUK MEETING IT:
   *   - Pre-signed upload URL memerlukan CORS config di S3 bucket
   *   - Tanyakan apakah CORS sudah di-setup di bucket
   *   - Presigned URL lebih efisien karena file bypass backend
   *   - Tapi backend tidak bisa validate/process file sebelum upload
   * 
   * @param originalName - Original filename (used for key generation)
   * @param options      - Upload options (folder, contentType, etc.)
   * @param expiresIn    - URL expiration in seconds (default: 300 = 5 minutes)
   */
  async generatePresignedUploadUrl(
    originalName: string,
    options: S3UploadOptions = {},
    expiresIn: number = 300
  ): Promise<PresignedUrlResult> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot generate presigned URL.');
    }

    try {
      const filename = this.generateUniqueFilename(originalName, options.filename);
      const key = this.buildKey(options.folder || 'uploads', filename);

      const command = new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        ContentType: options.contentType || 'application/octet-stream',
        CacheControl: options.cacheControl || 'public, max-age=31536000',
        Metadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        },
      });

      const url = await getSignedUrl(client, command, { expiresIn });

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      logger.info('[S3] Generated presigned upload URL', { key, expiresIn });

      return {
        url,
        key,
        expiresIn,
        expiresAt,
      };
    } catch (error) {
      logger.error('[S3] Presigned upload URL generation failed:', error);
      throw new Error(
        `[S3] Failed to generate presigned upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate a pre-signed URL for downloading/viewing a private file.
   * 
   * Use this when:
   * - Bucket is private (no public read access)
   * - Files need temporary authenticated access
   * - Want to serve files through backend-controlled URLs
   * 
   * ⚠️ CATATAN UNTUK MEETING IT:
   *   - Presigned GET URL cocok untuk file private (dokumen internal, dsb)
   *   - Untuk image publik (news thumbnail, dsb), lebih baik pakai CDN / public bucket
   *   - Default expiry 1 jam, bisa disesuaikan
   * 
   * @param key       - S3 object key
   * @param expiresIn - URL expiration in seconds (default: 3600 = 1 hour)
   */
  async generatePresignedGetUrl(
    key: string,
    expiresIn: number = 3600
  ): Promise<PresignedUrlResult> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot generate presigned URL.');
    }

    try {
      const normalizedKey = normalizeStorageKey(key);
      const normalizedExpiresIn = Math.min(Math.max(expiresIn, 60), 900);
      const command = new GetObjectCommand({
        Bucket: config.bucket,
        Key: normalizedKey,
      });

      const url = await getSignedUrl(client, command, { expiresIn: normalizedExpiresIn });

      const expiresAt = new Date(Date.now() + normalizedExpiresIn * 1000);

      logger.info('[S3] Generated presigned GET URL', {
        key: normalizedKey,
        expiresIn: normalizedExpiresIn,
      });

      return {
        url,
        key: normalizedKey,
        expiresIn: normalizedExpiresIn,
        expiresAt,
      };
    } catch (error) {
      logger.error('[S3] Presigned GET URL generation failed:', error);
      throw new Error(
        `[S3] Failed to generate presigned GET URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================
  // FILE QUERY OPERATIONS
  // ========================================

  /**
   * Check if a file exists in S3.
   */
  async fileExists(key: string): Promise<boolean> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) return false;

    try {
      const normalizedKey = normalizeStorageKey(key);
      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: normalizedKey,
      });

      await client.send(command);
      return true;
    } catch (error: any) {
      if (error?.name === 'NotFound' || error?.$metadata?.httpStatusCode === 404) {
        return false;
      }
      logger.error('[S3] fileExists check failed', { key, error });
      return false;
    }
  }

  /**
   * Get file metadata from S3.
   */
  async getFileMetadata(key: string): Promise<S3FileInfo | null> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) return null;

    try {
      const normalizedKey = normalizeStorageKey(key);
      const command = new HeadObjectCommand({
        Bucket: config.bucket,
        Key: normalizedKey,
      });

      const response = await client.send(command);

      return {
        key: normalizedKey,
        size: response.ContentLength || 0,
        lastModified: response.LastModified,
        contentType: response.ContentType,
        metadata: response.Metadata,
      };
    } catch (error) {
      logger.error('[S3] getFileMetadata failed', { key, error });
      return null;
    }
  }

  /**
   * List files in S3 bucket with optional prefix filter and pagination.
   * 
   * @param prefix     - Filter by key prefix (e.g., 'uploads/images/')
   * @param maxKeys    - Maximum number of results (default: 100)
   * @param startAfter - Start listing after this key (for pagination)
   */
  async listFiles(
    prefix: string = '',
    maxKeys: number = 100,
    startAfter?: string
  ): Promise<S3ListResult> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot list files.');
    }

    try {
      const normalizedPrefix = prefix ? normalizeStorageFolder(prefix, 'uploads') : '';
      const normalizedMaxKeys = Math.min(Math.max(maxKeys, 1), 100);
      const command = new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: normalizedPrefix || undefined,
        MaxKeys: normalizedMaxKeys,
        StartAfter: startAfter,
      });

      const response = await client.send(command);

      const files: S3FileInfo[] = (response.Contents || []).map((item: _Object) => ({
        key: item.Key || '',
        size: item.Size || 0,
        lastModified: item.LastModified,
        contentType: undefined, // Not available in list, use HeadObject for details
        metadata: undefined,
      }));

      return {
        files,
        nextToken: response.NextContinuationToken,
        totalCount: response.KeyCount || 0,
      };
    } catch (error) {
      logger.error('[S3] listFiles failed:', error);
      throw new Error(
        `[S3] Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Copy a file within S3.
   * 
   * @param sourceKey      - Source object key
   * @param destinationKey - Destination object key
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<string> {
    const client = getS3Client();
    const config = getS3Config();

    if (!client) {
      throw new Error('[S3] S3 client is not configured. Cannot copy file.');
    }

    try {
      const normalizedSourceKey = normalizeStorageKey(sourceKey);
      const normalizedDestinationKey = normalizeStorageKey(destinationKey);
      const command = new CopyObjectCommand({
        Bucket: config.bucket,
        CopySource: `${config.bucket}/${normalizedSourceKey}`,
        Key: normalizedDestinationKey,
      });

      await client.send(command);

      const url = this.generatePublicUrl(normalizedDestinationKey);
      logger.info('[S3] Copied file', {
        sourceKey: normalizedSourceKey,
        destinationKey: normalizedDestinationKey,
      });

      return url;
    } catch (error) {
      logger.error('[S3] copyFile failed:', error);
      throw new Error(
        `[S3] Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Generate a unique filename using UUID while preserving the original extension.
   */
  private generateUniqueFilename(originalName: string, customFilename?: string): string {
    if (customFilename) return normalizeStorageFilename(customFilename);

    const ext = path.extname(originalName).toLowerCase();
    const uuid = uuidv4();
    const timestamp = Date.now();
    return normalizeStorageFilename(`${timestamp}-${uuid}${ext}`);
  }

  /**
   * Build the full S3 key from folder and filename.
   * Normalizes slashes and removes leading/trailing separators.
   */
  private buildKey(folder: string, filename: string): string {
    const normalizedFolder = normalizeStorageFolder(folder, 'uploads');
    const normalizedFilename = normalizeStorageFilename(filename);
    return normalizeStorageKey(`${normalizedFolder}/${normalizedFilename}`);
  }

  /**
   * Split an array into chunks of a given size.
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

// Export singleton instance
const s3Service = new S3Service();
export default s3Service;
