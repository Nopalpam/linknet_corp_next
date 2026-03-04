/**
 * Upload Helper Utilities
 * 
 * Reusable helper functions for file upload operations.
 * These functions use the unified StorageService under the hood.
 */

import storageService from './storageService';
import type { UploadOptions, StorageUploadResult } from './storageService';
import logger from '../logger';

// ============================================================
// Types
// ============================================================

export interface UploadFileParams {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadImageParams extends UploadFileParams {
  /** If true, will validate that the content is actually an image */
  validateImage?: boolean;
}

// ============================================================
// Upload Functions
// ============================================================

/**
 * Upload a single file to cloud storage.
 * This is the primary reusable function for all upload operations.
 * 
 * @example
 * ```ts
 * const result = await uploadFile({
 *   buffer: req.file.buffer,
 *   filename: req.file.originalname,
 *   mimeType: req.file.mimetype,
 *   folder: 'uploads/images',
 * });
 * // result.url → stored in database
 * ```
 */
export const uploadFile = async (params: UploadFileParams): Promise<StorageUploadResult> => {
  const { buffer, filename, mimeType, folder, isPublic, metadata } = params;

  if (!buffer || buffer.length === 0) {
    throw new Error('Upload failed: empty file buffer');
  }

  if (!filename) {
    throw new Error('Upload failed: filename is required');
  }

  const options: UploadOptions = {
    folder: folder || 'uploads',
    contentType: mimeType,
    isPublic: isPublic ?? true,
    metadata,
  };

  return storageService.uploadFile(buffer, filename, options);
};

/**
 * Delete a file from cloud storage.
 * 
 * @param key - The cloud key / path of the file to delete
 * @returns true if deleted successfully
 */
export const deleteFile = async (key: string): Promise<boolean> => {
  if (!key) {
    logger.warn('[UploadHelper] deleteFile called with empty key');
    return false;
  }

  const result = await storageService.deleteFile(key);
  return result.success;
};

/**
 * Generate a public URL for a file.
 * Uses CDN URL if configured.
 * 
 * @param key - The cloud key / path of the file
 */
export const generatePublicUrl = (key: string): string => {
  if (!key) return '';
  return storageService.generatePublicUrl(key);
};

/**
 * Extract the storage key from a URL.
 * Handles local paths, S3 URLs, and Azure Blob URLs.
 * 
 * @param url - Full URL or path
 * @returns Storage key or null if extraction failed
 */
export const extractKeyFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    // Local path: /uploads/images/file.jpg → images/file.jpg
    if (url.startsWith('/uploads/')) {
      return url.replace('/uploads/', '');
    }

    // S3 URL: https://bucket.s3.region.amazonaws.com/key → key
    if (url.includes('.s3.') && url.includes('.amazonaws.com')) {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1); // Remove leading slash
    }

    // Azure Blob URL: https://account.blob.core.windows.net/container/key → key
    if (url.includes('.blob.core.windows.net')) {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      // Remove leading slash and container name
      return parts.slice(2).join('/');
    }

    // CDN URL: https://cdn.example.com/key → key
    const cdnUrl = process.env.AWS_S3_PUBLIC_URL;
    if (cdnUrl && url.startsWith(cdnUrl)) {
      return url.replace(cdnUrl.replace(/\/+$/, '') + '/', '');
    }

    // If it looks like a relative path already, return as-is
    if (!url.startsWith('http')) {
      return url;
    }

    // Try to extract path from any URL
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch {
    logger.warn(`[UploadHelper] Failed to extract key from URL: ${url}`);
    return url; // Return as-is as fallback
  }
};

/**
 * Get storage driver status (for health check / debugging).
 */
export const getStorageStatus = () => {
  return storageService.getStatus();
};
