/**
 * Upload Module - Public Exports
 * 
 * Barrel file for the upload utilities.
 * Import from '@utils/upload' instead of individual files.
 */

// Storage Service (unified driver-based storage)
export { default as storageService } from './storageService';
export type {
  StorageDriver,
  UploadOptions,
  StorageUploadResult,
  StorageDeleteResult,
} from './storageService';

// Upload Helpers (reusable functions)
export {
  uploadFile,
  deleteFile,
  generatePublicUrl,
  extractKeyFromUrl,
  getStorageStatus,
} from './uploadHelper';
export type {
  UploadFileParams,
  UploadImageParams,
} from './uploadHelper';
