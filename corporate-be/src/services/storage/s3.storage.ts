/**
 * AWS S3 Storage Provider (Placeholder / Future-Ready)
 * 
 * Implements IStorageProvider for AWS S3 storage.
 * This is a placeholder that can be fully implemented when S3 is needed.
 * 
 * Required ENV variables when STORAGE_TYPE=s3:
 * - AWS_REGION
 * - AWS_S3_BUCKET
 * 
 * Credentials: TIDAK diset secara eksplisit. SDK menggunakan default credential
 * provider chain — IRSA (Web Identity Token) di EKS/production, atau AWS CLI
 * profile (~/.aws/credentials) di local development. Jangan tambahkan
 * AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY ke environment production.
 */

import {
  IStorageProvider,
  StorageFile,
  UploadParams,
  ListParams,
  ListResult,
} from './storage.interface';
import logger from '../../utils/logger';

const DEFAULT_AWS_REGION = 'ap-southeast-3';
const DEFAULT_AWS_BUCKET_NAME = '329599622292-jakarta-app-linknetcoid';

const readEnv = (key: string): string => process.env[key]?.trim() || '';

// NOTE: These imports will work once @aws-sdk/client-s3 is properly configured
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3StorageProvider implements IStorageProvider {
  // private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = readEnv('AWS_S3_BUCKET') || readEnv('AWS_BUCKET_NAME') || DEFAULT_AWS_BUCKET_NAME;
    this.region = readEnv('AWS_REGION') || DEFAULT_AWS_REGION;

    if (!this.bucket) {
      logger.warn('[S3Storage] AWS_S3_BUCKET is not configured');
    }

    // Uncomment when ready to use S3:
    // this.s3Client = new S3Client({
    //   region: this.region,
    //   // Tidak ada credentials block — SDK otomatis menggunakan IRSA di EKS,
    //   // atau AWS CLI profile di local dev.
    // });

    logger.info(`[S3Storage] Initialized with bucket: ${this.bucket}, region: ${this.region}`);
  }

  upload(_params: UploadParams): Promise<StorageFile> {
    // TODO: Implement S3 upload
    // const { buffer, originalName, mimeType, folder, isPublic, metadata } = params;
    // const key = folder ? `${folder}/${uuidv4()}-${originalName}` : `${uuidv4()}-${originalName}`;
    //
    // const command = new PutObjectCommand({
    //   Bucket: this.bucket,
    //   Key: key,
    //   Body: buffer,
    //   ContentType: mimeType,
    //   ACL: isPublic ? 'public-read' : 'private',
    //   Metadata: metadata,
    // });
    //
    // await this.s3Client.send(command);
    //
    // return {
    //   key,
    //   url: `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`,
    //   originalName,
    //   mimeType,
    //   size: buffer.length,
    //   metadata,
    // };

    return Promise.reject(new Error('S3 storage is not yet implemented. Please use STORAGE_TYPE=local'));
  }

  getFileInfo(_key: string): Promise<StorageFile | null> {
    // TODO: Implement with HeadObjectCommand
    return Promise.reject(new Error('S3 storage is not yet implemented'));
  }

  download(_key: string): Promise<Buffer> {
    // TODO: Implement with GetObjectCommand
    return Promise.reject(new Error('S3 storage is not yet implemented'));
  }

  getDownloadUrl(_key: string, _expiresInSeconds: number = 3600): Promise<string> {
    // TODO: Implement with getSignedUrl
    return Promise.reject(new Error('S3 storage is not yet implemented'));
  }

  delete(_key: string): Promise<boolean> {
    // TODO: Implement with DeleteObjectCommand
    return Promise.reject(new Error('S3 storage is not yet implemented'));
  }

  list(_params?: ListParams): Promise<ListResult> {
    // TODO: Implement with ListObjectsV2Command
    return Promise.reject(new Error('S3 storage is not yet implemented'));
  }

  exists(_key: string): Promise<boolean> {
    // TODO: Implement with HeadObjectCommand
    return Promise.reject(new Error('S3 storage is not yet implemented'));
  }

  getProviderName(): string {
    return 's3';
  }
}

export default S3StorageProvider;
