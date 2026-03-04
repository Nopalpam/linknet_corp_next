/**
 * S3 Module - Public Exports
 * 
 * Barrel file for the S3 service module.
 * Import from '@services/s3' instead of individual files.
 */

export { getS3Client, getS3Config, resetS3Client } from './s3Client';
export type { S3Config } from './s3Client';

export { default as s3Service } from './s3Service';
export type {
  S3UploadOptions,
  S3UploadResult,
  S3FileInfo,
  S3ListResult,
  PresignedUrlResult,
} from './s3Service';
