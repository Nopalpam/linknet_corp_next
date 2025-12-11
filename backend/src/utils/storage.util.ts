import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';

// Azure Storage configuration from environment
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
      logger.warn('Azure Storage connection string not configured. Using local storage fallback.');
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
 * Upload image to Azure Blob Storage
 */
export const uploadToAzureBlob = async (
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> => {
  try {
    const containerClient = getContainerClient();

    if (!containerClient) {
      // Fallback: return local file path if Azure is not configured
      // In production, you should configure Azure Storage
      const localUrl = `/uploads/avatars/${filename}`;
      logger.warn(`Azure Storage not configured. Would save to: ${localUrl}`);
      
      return {
        url: localUrl,
        filename,
        size: buffer.length
      };
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
    throw new Error('Failed to upload avatar to cloud storage');
  }
};

/**
 * Delete image from Azure Blob Storage
 */
export const deleteFromAzureBlob = async (blobName: string): Promise<boolean> => {
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
 * Extract blob name from URL
 */
export const extractBlobNameFromUrl = (url: string): string | null => {
  try {
    // Extract filename from Azure Blob URL
    const urlParts = url.split('/');
    const blobName = urlParts[urlParts.length - 1];
    return blobName || null;
  } catch (error) {
    logger.error('Failed to extract blob name from URL:', error);
    return null;
  }
};
