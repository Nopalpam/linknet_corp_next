/**
 * AWS S3 Storage Provider (Placeholder / Future-Ready)
 * 
 * Implements IStorageProvider for AWS S3 storage.
 * This is a placeholder that can be fully implemented when S3 is needed.
 * 
 * Required ENV variables when STORAGE_TYPE=s3:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_S3_BUCKET
 * - AWS_REGION
 */

import {
  IStorageProvider,
  StorageFile,
  UploadParams,
  ListParams,
  ListResult,
} from './storage.interface';
import logger from '../../utils/logger';

// NOTE: These imports will work once @aws-sdk/client-s3 is properly configured
// import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3StorageProvider implements IStorageProvider {
  // private s3Client: S3Client;
  private bucket: string;
  private region: string;

  constructor() {
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'ap-southeast-1';

    if (!this.bucket) {
      logger.warn('[S3Storage] AWS_S3_BUCKET is not configured');
    }

    // Uncomment when ready to use S3:
    // this.s3Client = new S3Client({
    //   region: this.region,
    //   credentials: process.env.AWS_ACCESS_KEY_ID ? {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    //   } : undefined, // Use IAM role if no explicit credentials
    // });

    logger.info(`[S3Storage] Initialized with bucket: ${this.bucket}, region: ${this.region}`);
  }

  async upload(_params: UploadParams): Promise<StorageFile> {
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

    throw new Error('S3 storage is not yet implemented. Please use STORAGE_TYPE=local');
  }

  async getFileInfo(_key: string): Promise<StorageFile | null> {
    // TODO: Implement with HeadObjectCommand
    throw new Error('S3 storage is not yet implemented');
  }

  async download(_key: string): Promise<Buffer> {
    // TODO: Implement with GetObjectCommand
    throw new Error('S3 storage is not yet implemented');
  }

  async getDownloadUrl(_key: string, _expiresInSeconds: number = 3600): Promise<string> {
    // TODO: Implement with getSignedUrl
    throw new Error('S3 storage is not yet implemented');
  }

  async delete(_key: string): Promise<boolean> {
    // TODO: Implement with DeleteObjectCommand
    throw new Error('S3 storage is not yet implemented');
  }

  async list(_params?: ListParams): Promise<ListResult> {
    // TODO: Implement with ListObjectsV2Command
    throw new Error('S3 storage is not yet implemented');
  }

  async exists(_key: string): Promise<boolean> {
    // TODO: Implement with HeadObjectCommand
    throw new Error('S3 storage is not yet implemented');
  }

  getProviderName(): string {
    return 's3';
  }
}

export default S3StorageProvider;
