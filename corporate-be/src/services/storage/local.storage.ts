/**
 * Local Storage Provider
 * 
 * Implements IStorageProvider for local filesystem storage.
 * Used for development and environments without cloud storage.
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  IStorageProvider,
  StorageFile,
  UploadParams,
  ListParams,
  ListResult,
} from './storage.interface';
import logger from '../../utils/logger';
import {
  normalizeStorageFilename,
  normalizeStorageFolder,
  normalizeStorageKey,
  resolveWithinUploadDir,
} from '../../utils/storagePathSecurity.util';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const LOCAL_HTTP_PROTOCOL = 'http';
const BASE_URL = process.env.BASE_URL || `${LOCAL_HTTP_PROTOCOL}://localhost:${process.env.PORT || 5000}`;

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.resolve(UPLOAD_DIR);
    this.baseUrl = BASE_URL;
    this.ensureDir(this.uploadDir);
  }

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private getAbsolutePath(key: string): string {
    return resolveWithinUploadDir(this.uploadDir, key);
  }

  private keyToUrl(key: string): string {
    return `${this.baseUrl}/uploads/${normalizeStorageKey(key)}`;
  }

  async upload(params: UploadParams): Promise<StorageFile> {
    try {
      const { buffer, originalName, mimeType, folder, metadata } = params;

      // Generate unique filename
      const ext = path.extname(originalName);
      const uniqueName = normalizeStorageFilename(`${uuidv4()}${ext}`);
      const folderPath = normalizeStorageFolder(folder, 'general');
      const key = normalizeStorageKey(`${folderPath}/${uniqueName}`);

      // Ensure directory exists
      const dirPath = resolveWithinUploadDir(this.uploadDir, folderPath);
      this.ensureDir(dirPath);

      // Write file
      const filePath = this.getAbsolutePath(key);
      const handle = await fs.promises.open(filePath, 'wx', 0o600);
      try {
        await handle.writeFile(buffer);
      } finally {
        await handle.close();
      }

      logger.info('[LocalStorage] Uploaded file', {
        key,
        bytes: buffer.length,
      });

      return {
        key,
        url: this.keyToUrl(key),
        originalName,
        mimeType,
        size: buffer.length,
        metadata,
      };
    } catch (error) {
      logger.error('[LocalStorage] Upload failed:', error);
      throw new Error('Failed to upload file to local storage');
    }
  }

  async getFileInfo(key: string): Promise<StorageFile | null> {
    try {
      const normalizedKey = normalizeStorageKey(key);
      const filePath = this.getAbsolutePath(normalizedKey);
      const stats = await fs.promises.stat(filePath);
      const ext = path.extname(normalizedKey).toLowerCase();

      return {
        key: normalizedKey,
        url: this.keyToUrl(normalizedKey),
        originalName: path.basename(normalizedKey),
        mimeType: this.getMimeType(ext),
        size: stats.size,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error('[LocalStorage] getFileInfo failed', { key, error });
      }
      return null;
    }
  }

  async download(key: string): Promise<Buffer> {
    try {
      const filePath = this.getAbsolutePath(normalizeStorageKey(key));
      return await fs.promises.readFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error('File not found');
      }
      throw error;
    }
  }

  getDownloadUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    // Local storage returns direct URL (no signing needed)
    return Promise.resolve(this.keyToUrl(key));
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.getAbsolutePath(key);
      await fs.promises.unlink(filePath);
      logger.info('[LocalStorage] Deleted file', { key });
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn('[LocalStorage] File not found for deletion', { key });
        return false;
      }
      logger.error('[LocalStorage] Delete failed', { key, error });
      return false;
    }
  }

  async list(params?: ListParams): Promise<ListResult> {
    try {
      const prefix = params?.prefix || '';
      const maxResults = params?.maxResults || 100;
      const safePrefix = prefix ? normalizeStorageFolder(prefix, '') : '';
      const searchDir = prefix
        ? resolveWithinUploadDir(this.uploadDir, safePrefix)
        : this.uploadDir;

      if (!fs.existsSync(searchDir)) {
        return { files: [], hasMore: false };
      }

      const files: StorageFile[] = [];
      await this.walkDir(searchDir, prefix, files);

      // Apply pagination
      const limited = files.slice(0, maxResults);
      const hasMore = files.length > maxResults;

      return {
        files: limited,
        hasMore,
      };
    } catch (error) {
      logger.error('[LocalStorage] List failed:', error);
      return { files: [], hasMore: false };
    }
  }

  private async walkDir(dir: string, prefix: string, results: StorageFile[]): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(this.uploadDir, fullPath).split(path.sep).join('/');

      if (entry.isDirectory()) {
        await this.walkDir(fullPath, prefix, results);
      } else if (entry.isFile()) {
        const stats = await fs.promises.stat(fullPath);
        const ext = path.extname(entry.name).toLowerCase();

        results.push({
          key: relativePath,
          url: this.keyToUrl(relativePath),
          originalName: entry.name,
          mimeType: this.getMimeType(ext),
          size: stats.size,
        });
      }
    }
  }

<<<<<<< HEAD:corporate-be/src/services/storage/local.storage.ts
  async exists(key: string): Promise<boolean> {
    try {
      await fs.promises.access(this.getAbsolutePath(normalizeStorageKey(key)));
      return true;
    } catch {
      return false;
    }
=======
  exists(key: string): Promise<boolean> {
    return Promise.resolve(fs.existsSync(this.getAbsolutePath(key)));
>>>>>>> f1a6f58a3c0c4e02945907a97e04de3aa22b5221:backend/src/services/storage/local.storage.ts
  }

  getProviderName(): string {
    return 'local';
  }

  private getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.zip': 'application/zip',
      '.rar': 'application/x-rar-compressed',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export default LocalStorageProvider;
