import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import logger from './logger';

// Storage configuration from environment
const STORAGE_DRIVER = process.env.STORAGE_DRIVER || 'local'; // 'local' | 'azure' | 's3'
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
const AZURE_STORAGE_CONTAINER = process.env.AZURE_STORAGE_CONTAINER || 'avatars';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
}

/**
 * Get Azure Blob Container Client
 */
const getContainerClient = (): ContainerClient | null => {
  try {
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      logger.warn('Azure Storage connection string not configured.');
      return null;
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    return blobServiceClient.getContainerClient(AZURE_STORAGE_CONTAINER);
  } catch (error) {
    logger.error('Failed to initialize Azure Blob Storage:', error);
    return null;
  }
};

/**
 * Ensure local upload directory exists
 */
const ensureUploadDir = (): void => {
  const avatarDir = path.join(UPLOAD_DIR, 'avatars');
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
    logger.info(`Created local avatar directory: ${avatarDir}`);
  }
};

/**
 * Upload to local filesystem
 */
const uploadToLocal = async (
  buffer: Buffer,
  filename: string
): Promise<UploadResult> => {
  try {
    ensureUploadDir();

    const uniqueFilename = `${uuidv4()}-${filename}`;
    const avatarDir = path.join(UPLOAD_DIR, 'avatars');
    const filePath = path.join(avatarDir, uniqueFilename);

    // Write file to disk
    await fs.promises.writeFile(filePath, buffer);

    // Return relative URL for frontend
    const url = `/uploads/avatars/${uniqueFilename}`;

    logger.info(`Uploaded avatar to local storage: ${url}`);

    return {
      url,
      filename: uniqueFilename,
      size: buffer.length
    };
  } catch (error) {
    logger.error('Failed to upload to local storage:', error);
    throw new Error('Failed to upload avatar to local storage');
  }
};

/**
 * Upload image to Azure Blob Storage
 */
const uploadToAzure = async (
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> => {
  try {
    const containerClient = getContainerClient();

    if (!containerClient) {
      throw new Error('Azure Storage not configured');
    }

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'blob' // Public read access for avatars
    });

    // Create blob client
    const blobName = `${uuidv4()}-${filename}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload buffer to blob
    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType,
        blobCacheControl: 'public, max-age=31536000' // Cache for 1 year
      }
    });

    logger.info(`Uploaded avatar to Azure Blob Storage: ${blobName}`);

    return {
      url: blockBlobClient.url,
      filename: blobName,
      size: buffer.length
    };
  } catch (error) {
    logger.error('Failed to upload to Azure Blob Storage:', error);
    throw new Error('Failed to upload avatar to Azure Blob Storage');
  }
};

/**
 * Main upload function - routes to appropriate storage driver
 */
export const uploadToAzureBlob = async (
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> => {
  const driver = STORAGE_DRIVER.toLowerCase();

  logger.info(`Using storage driver: ${driver}`);

  switch (driver) {
    case 'local':
      return uploadToLocal(buffer, filename);

    case 'azure':
      return uploadToAzure(buffer, filename, contentType);

    case 's3':
      // TODO: Implement S3 upload when needed
      logger.warn('S3 storage not implemented yet, falling back to local');
      return uploadToLocal(buffer, filename);

    default:
      logger.warn(`Unknown storage driver: ${driver}, falling back to local`);
      return uploadToLocal(buffer, filename);
  }
};

/**
 * Delete from local filesystem
 */
const deleteFromLocal = async (filename: string): Promise<boolean> => {
  try {
    const avatarDir = path.join(UPLOAD_DIR, 'avatars');
    const filePath = path.join(avatarDir, filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      logger.info(`Deleted avatar from local storage: ${filename}`);
      return true;
    }

    logger.warn(`File not found in local storage: ${filename}`);
    return false;
  } catch (error) {
    logger.error('Failed to delete from local storage:', error);
    return false;
  }
};

/**
 * Delete from Azure Blob Storage
 */
const deleteFromAzure = async (blobName: string): Promise<boolean> => {
  try {
    const containerClient = getContainerClient();

    if (!containerClient) {
      logger.warn('Azure Storage not configured. Cannot delete blob.');
      return false;
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();

    logger.info(`Deleted avatar from Azure Blob Storage: ${blobName}`);
    return true;
  } catch (error) {
    logger.error('Failed to delete from Azure Blob Storage:', error);
    return false;
  }
};

/**
 * Extract filename from URL or blob name
 * Supports both local URLs (/uploads/avatars/file.jpg) and Azure Blob URLs
 */
export const extractBlobNameFromUrl = (url: string): string | null => {
  try {
    if (!url) return null;

    // If it's already just a filename (no slashes), return it
    if (!url.includes('/')) {
      return url;
    }

    // Extract filename from URL
    const urlParts = url.split('/');
    const filename = urlParts[urlParts.length - 1];
    return filename || null;
  } catch (error) {
    logger.error('Failed to extract filename from URL:', error);
    return null;
  }
};

/**
 * Delete image from storage (routes to appropriate driver)
 */
export const deleteFromAzureBlob = async (filenameOrUrl: string): Promise<boolean> => {
  const driver = STORAGE_DRIVER.toLowerCase();

  // Extract filename from URL if needed
  const filename = extractBlobNameFromUrl(filenameOrUrl);

  if (!filename) {
    logger.error('Failed to extract filename from URL');
    return false;
  }

  logger.info(`Deleting from storage driver: ${driver}, file: ${filename}`);

  switch (driver) {
    case 'local':
      return deleteFromLocal(filename);

    case 'azure':
      return deleteFromAzure(filename);

    case 's3':
      // TODO: Implement S3 delete when needed
      logger.warn('S3 storage not implemented yet');
      return false;

    default:
      logger.warn(`Unknown storage driver: ${driver}`);
      return false;
  }
};
