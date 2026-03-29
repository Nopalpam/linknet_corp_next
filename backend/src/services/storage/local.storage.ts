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

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

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
    return path.join(this.uploadDir, key);
  }

  private keyToUrl(key: string): string {
    return `${this.baseUrl}/uploads/${key}`;
  }

  async upload(params: UploadParams): Promise<StorageFile> {
    try {
      const { buffer, originalName, mimeType, folder, metadata } = params;

      // Generate unique filename
      const ext = path.extname(originalName);
      const uniqueName = `${uuidv4()}${ext}`;
      const folderPath = folder || 'general';
      const key = `${folderPath}/${uniqueName}`;

      // Ensure directory exists
      const dirPath = path.join(this.uploadDir, folderPath);
      this.ensureDir(dirPath);

      // Write file
      const filePath = this.getAbsolutePath(key);
      await fs.promises.writeFile(filePath, buffer);

      logger.info(`[LocalStorage] Uploaded: ${key}`);

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
      const filePath = this.getAbsolutePath(key);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const stats = await fs.promises.stat(filePath);
      const ext = path.extname(key).toLowerCase();

      return {
        key,
        url: this.keyToUrl(key),
        originalName: path.basename(key),
        mimeType: this.getMimeType(ext),
        size: stats.size,
      };
    } catch (error) {
      logger.error(`[LocalStorage] getFileInfo failed for ${key}:`, error);
      return null;
    }
  }

  async download(key: string): Promise<Buffer> {
    const filePath = this.getAbsolutePath(key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${key}`);
    }
    return fs.promises.readFile(filePath);
  }

  async getDownloadUrl(key: string, _expiresInSeconds?: number): Promise<string> {
    // Local storage returns direct URL (no signing needed)
    return this.keyToUrl(key);
  }

  async delete(key: string): Promise<boolean> {
    try {
      const filePath = this.getAbsolutePath(key);
      if (!fs.existsSync(filePath)) {
        logger.warn(`[LocalStorage] File not found for deletion: ${key}`);
        return false;
      }

      await fs.promises.unlink(filePath);
      logger.info(`[LocalStorage] Deleted: ${key}`);
      return true;
    } catch (error) {
      logger.error(`[LocalStorage] Delete failed for ${key}:`, error);
      return false;
    }
  }

  async list(params?: ListParams): Promise<ListResult> {
    try {
      const prefix = params?.prefix || '';
      const maxResults = params?.maxResults || 100;
      const searchDir = prefix
        ? path.join(this.uploadDir, prefix)
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
      const relativePath = path.relative(this.uploadDir, fullPath).replace(/\\/g, '/');

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

  async exists(key: string): Promise<boolean> {
    return fs.existsSync(this.getAbsolutePath(key));
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
