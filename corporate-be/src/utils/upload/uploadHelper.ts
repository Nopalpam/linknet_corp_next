import storageService from './storageService';
import type { UploadOptions, StorageUploadResult } from './storageService';
import logger from '../logger';
import { normalizeStorageKey } from '../storagePathSecurity.util';

export interface UploadFileParams {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface UploadImageParams extends UploadFileParams {
  validateImage?: boolean;
}

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

export const deleteFile = async (key: string): Promise<boolean> => {
  if (!key) {
    logger.warn('[UploadHelper] deleteFile called with empty key');
    return false;
  }

  const result = await storageService.deleteFile(key);
  return result.success;
};

export const generatePublicUrl = (key: string): string => {
  if (!key) return '';
  return storageService.generatePublicUrl(key);
};

const trimTrailingSlashes = (value: string): string => {
  let end = value.length;
  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }
  return value.slice(0, end);
};

const safeStorageKey = (value: string): string | null => {
  try {
    return normalizeStorageKey(decodeURIComponent(value));
  } catch {
    return null;
  }
};

const isAmazonS3Hostname = (hostname: string): boolean => {
  const labels = hostname.toLowerCase().split('.');
  const labelCount = labels.length;
  const hasAmazonSuffix = labelCount >= 3
    && labels[labelCount - 2] === 'amazonaws'
    && labels[labelCount - 1] === 'com';
  const hasS3Label = labels.some((label) => label === 's3' || label.startsWith('s3-'));

  return hasAmazonSuffix && hasS3Label;
};

const isAzureBlobHostname = (hostname: string): boolean => {
  const labels = hostname.toLowerCase().split('.');
  return labels.length >= 5 && labels.slice(-4).join('.') === 'blob.core.windows.net';
};

const getKeyFromCdnUrl = (urlObj: URL): string | null => {
  const cdnUrl = process.env.AWS_S3_PUBLIC_URL;
  if (!cdnUrl) return null;

  try {
    const cdn = new URL(cdnUrl);
    const cdnPath = trimTrailingSlashes(cdn.pathname);
    const keyPath = cdnPath ? `${cdnPath}/` : '/';

    if (urlObj.origin !== cdn.origin || !urlObj.pathname.startsWith(keyPath)) {
      return null;
    }

    return safeStorageKey(urlObj.pathname.slice(keyPath.length));
  } catch {
    return null;
  }
};

export const extractKeyFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    if (url.startsWith('/uploads/')) {
      return safeStorageKey(url.slice('/uploads/'.length));
    }

    if (!url.includes('://')) {
      return safeStorageKey(url);
    }

    const urlObj = new URL(url);
    const cdnKey = getKeyFromCdnUrl(urlObj);
    if (cdnKey) {
      return cdnKey;
    }

    if (isAmazonS3Hostname(urlObj.hostname)) {
      return safeStorageKey(urlObj.pathname.slice(1));
    }

    if (isAzureBlobHostname(urlObj.hostname)) {
      const parts = urlObj.pathname.split('/');
      return safeStorageKey(parts.slice(2).join('/'));
    }

    return safeStorageKey(urlObj.pathname.slice(1));
  } catch {
    logger.warn('[UploadHelper] Failed to extract key from URL', {
      urlLength: url.length,
    });
    return null;
  }
};

export const getStorageStatus = () => {
  return storageService.getStatus();
};
