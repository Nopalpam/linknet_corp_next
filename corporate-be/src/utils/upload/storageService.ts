/**
 * Unified Storage Service
 * 
 * Abstraction layer that routes storage operations to the configured driver:
 * - 'local'  → Local filesystem (development)
 * - 'azure'  → Azure Blob Storage
 * - 's3'     → AWS S3 / S3-compatible storage
 * 
 * Set STORAGE_DRIVER in .env to switch between drivers.
 * All modules should use this service instead of calling drivers directly.
 * 
 * ⚠️ CATATAN UNTUK MEETING IT:
 *   - Saat ini mendukung 3 driver: local, azure, s3
 *   - Untuk production, rekomendasikan 's3' atau 'azure' sesuai infrastruktur
 *   - Fallback ke 'local' jika driver tidak dikonfigurasi
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../utils/logger';
import s3Service from '../../services/s3/s3Service';
import azureStorageService from '../../services/azureStorage.service';
import {
  normalizeStorageFilename,
  normalizeStorageFolder,
  normalizeStorageKey,
  resolveWithinUploadDir,
} from '../storagePathSecurity.util';

// ============================================================
// Types
// ============================================================

export type StorageDriver = 'local' | 'azure' | 's3';

export interface UploadOptions {
  folder?: string;            // Subfolder path (e.g., 'uploads/images')
  filename?: string;          // Custom filename
  contentType?: string;       // MIME type
  isPublic?: boolean;         // Set public access
  metadata?: Record<string, string>;
}

export interface StorageUploadResult {
  url: string;                // Public-facing URL
  path: string;               // Storage path / key
  cloudKey: string;           // Cloud object key (same as path for cloud drivers)
  cloudProvider: StorageDriver;
  size: number;
}

export interface StorageDeleteResult {
  success: boolean;
  key: string;
}

// ============================================================
// Configuration
// ============================================================

const getDriver = (): StorageDriver => {
  const driver = (process.env.STORAGE_DRIVER || 'local').toLowerCase() as StorageDriver;
  if (!['local', 'azure', 's3'].includes(driver)) {
    logger.warn('[Storage] Unknown driver, falling back to local', { driver });
    return 'local';
  }
  return driver;
};

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// ============================================================
// Local Storage Operations
// ============================================================

const ensureDir = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const localUpload = async (
  buffer: Buffer,
  originalName: string,
  options: UploadOptions = {}
): Promise<StorageUploadResult> => {
  const folder = normalizeStorageFolder(options.folder, 'uploads');
  const targetDir = resolveWithinUploadDir(UPLOAD_DIR, folder);
  ensureDir(targetDir);

  const ext = path.extname(originalName).toLowerCase();
  const uniqueFilename = normalizeStorageFilename(options.filename || `${Date.now()}-${uuidv4()}${ext}`);
  const relativePath = normalizeStorageKey(`${folder}/${uniqueFilename}`);
  const filePath = resolveWithinUploadDir(UPLOAD_DIR, relativePath);

  const handle = await fs.promises.open(filePath, 'wx', 0o600);
  try {
    await handle.writeFile(buffer);
  } finally {
    await handle.close();
  }

  const url = `/uploads/${relativePath}`;

  logger.info('[Storage:local] Uploaded file', {
    key: relativePath,
    bytes: buffer.length,
  });

  return {
    url,
    path: relativePath,
    cloudKey: relativePath,
    cloudProvider: 'local',
    size: buffer.length,
  };
};

const localDelete = async (key: string): Promise<StorageDeleteResult> => {
  try {
    const normalizedKey = normalizeStorageKey(key);
    const filePath = resolveWithinUploadDir(UPLOAD_DIR, normalizedKey);
    await fs.promises.unlink(filePath);
    logger.info('[Storage:local] Deleted file', { key: normalizedKey });
    return { success: true, key: normalizedKey };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.warn('[Storage:local] File not found', { key });
      return { success: false, key };
    }
    logger.error('[Storage:local] Delete failed', { key, error });
    return { success: false, key };
  }
};

// ============================================================
// Unified Storage Service Class
// ============================================================

class StorageService {
  /**
   * Get the active storage driver name.
   */
  getDriver(): StorageDriver {
    return getDriver();
  }

  /**
   * Check if cloud storage (S3 or Azure) is properly configured.
   */
  isCloudConfigured(): boolean {
    const driver = getDriver();
    switch (driver) {
      case 's3':
        return s3Service.isConfigured();
      case 'azure':
        return azureStorageService !== undefined;
      case 'local':
        return true;
      default:
        return false;
    }
  }

  /**
   * Upload a file to the configured storage driver.
   * 
   * @param buffer       - File content as Buffer
   * @param originalName - Original filename
   * @param options      - Upload options
   */
  async uploadFile(
    buffer: Buffer,
    originalName: string,
    options: UploadOptions = {}
  ): Promise<StorageUploadResult> {
    const driver = getDriver();

    logger.info('[Storage] Uploading file', {
      driver,
      originalName,
      bytes: buffer.length,
    });

    switch (driver) {
      case 's3': {
        const result = await s3Service.uploadFile(buffer, originalName, {
          folder: options.folder,
          filename: options.filename,
          contentType: options.contentType,
          isPublic: options.isPublic,
          metadata: options.metadata,
        });
        return {
          url: result.url,
          path: result.path,
          cloudKey: result.cloudKey,
          cloudProvider: 's3',
          size: result.size,
        };
      }

      case 'azure': {
        const result = await azureStorageService.uploadFile(buffer, originalName, {
          folder: options.folder || 'uploads',
          filename: options.filename,
          contentType: options.contentType,
          isPublic: options.isPublic,
        });
        return {
          url: result.url,
          path: result.path,
          cloudKey: result.cloudKey,
          cloudProvider: 'azure',
          size: buffer.length,
        };
      }

      case 'local':
      default:
        return localUpload(buffer, originalName, options);
    }
  }

  /**
   * Delete a file from the configured storage driver.
   * 
   * @param key - File path/key
   */
  async deleteFile(key: string): Promise<StorageDeleteResult> {
    const driver = getDriver();

    logger.info('[Storage] Deleting file', { driver, key });

    switch (driver) {
      case 's3':
        try {
          await s3Service.deleteFile(key);
          return { success: true, key };
        } catch (error) {
          logger.error('[Storage:s3] Delete failed', { key, error });
          return { success: false, key };
        }

      case 'azure':
        try {
          await azureStorageService.deleteFile(key);
          return { success: true, key };
        } catch (error) {
          logger.error('[Storage:azure] Delete failed', { key, error });
          return { success: false, key };
        }

      case 'local':
      default:
        return localDelete(key);
    }
  }

  /**
   * Delete multiple files from the configured storage driver.
   * 
   * @param keys - Array of file paths/keys
   */
  async deleteFiles(keys: string[]): Promise<StorageDeleteResult[]> {
    const driver = getDriver();

    if (keys.length === 0) return [];

    switch (driver) {
      case 's3':
        try {
          await s3Service.deleteFiles(keys);
          return keys.map((key) => ({ success: true, key }));
        } catch (error) {
          logger.error('[Storage:s3] Bulk delete failed:', error);
          return keys.map((key) => ({ success: false, key }));
        }

      case 'azure':
        try {
          await azureStorageService.deleteFiles(keys);
          return keys.map((key) => ({ success: true, key }));
        } catch (error) {
          logger.error('[Storage:azure] Bulk delete failed:', error);
          return keys.map((key) => ({ success: false, key }));
        }

      case 'local':
      default: {
        const results: StorageDeleteResult[] = [];
        for (const key of keys) {
          results.push(await localDelete(key));
        }
        return results;
      }
    }
  }

  /**
   * Generate a public URL for a given file key.
   * Uses CDN URL if configured (for S3/Azure).
   */
  generatePublicUrl(key: string): string {
    const driver = getDriver();

    switch (driver) {
      case 's3':
        return s3Service.generatePublicUrl(key);

      case 'azure':
        return azureStorageService.getPublicUrl(key);

      case 'local':
      default:
        return `/uploads/${key}`;
    }
  }

  /**
   * Check if a file exists in the configured storage driver.
   */
  async fileExists(key: string): Promise<boolean> {
    const driver = getDriver();

    switch (driver) {
      case 's3':
        return s3Service.fileExists(key);

      case 'azure':
        return azureStorageService.fileExists(key);

      case 'local':
      default: {
        const filePath = resolveWithinUploadDir(UPLOAD_DIR, key);
        return fs.existsSync(filePath);
      }
    }
  }

  /**
   * Get storage driver status information (safe for API response — no secrets).
   */
  getStatus(): {
    driver: StorageDriver;
    configured: boolean;
    info: Record<string, any>;
  } {
    const driver = getDriver();

    switch (driver) {
      case 's3':
        return {
          driver,
          configured: s3Service.isConfigured(),
          info: s3Service.getConfigInfo(),
        };

      case 'azure':
        return {
          driver,
          configured: true,
          info: { provider: 'azure' },
        };

      case 'local':
      default:
        return {
          driver: 'local',
          configured: true,
          info: { uploadDir: UPLOAD_DIR },
        };
    }
  }
}

// Export singleton
const storageService = new StorageService();
export default storageService;
