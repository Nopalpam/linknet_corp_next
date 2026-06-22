/**
 * Storage Provider Factory
 * 
 * Creates the appropriate storage provider based on STORAGE_TYPE env variable.
 * Singleton pattern ensures only one instance is created.
 * 
 * Usage:
 *   import { getStorageProvider } from '@services/storage';
 *   const storage = getStorageProvider();
 *   await storage.upload({ ... });
 */

import { IStorageProvider } from './storage.interface';
import { LocalStorageProvider } from './local.storage';
import { S3StorageProvider } from './s3.storage';
import logger from '../../utils/logger';

export type StorageType = 'local' | 's3';

let storageInstance: IStorageProvider | null = null;

/**
 * Get the configured storage provider (singleton)
 */
export const getStorageProvider = (): IStorageProvider => {
  if (storageInstance) {
    return storageInstance;
  }

  const storageType = (process.env.STORAGE_TYPE || process.env.STORAGE_DRIVER || 'local').toLowerCase() as StorageType;

  switch (storageType) {
    case 's3':
      logger.info('[StorageFactory] Using S3 storage provider');
      storageInstance = new S3StorageProvider();
      break;
    case 'local':
    default:
      logger.info('[StorageFactory] Using Local storage provider');
      storageInstance = new LocalStorageProvider();
      break;
  }

  return storageInstance;
};

/**
 * Reset storage instance (useful for testing or config change)
 */
export const resetStorageProvider = (): void => {
  storageInstance = null;
};

// Re-export types and interfaces
export type { IStorageProvider, StorageFile, UploadParams, ListParams, ListResult } from './storage.interface';
export { LocalStorageProvider } from './local.storage';
export { S3StorageProvider } from './s3.storage';
