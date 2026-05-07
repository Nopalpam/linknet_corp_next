import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { Readable } from 'stream';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const isConfiguredValue = (value?: string): value is string => {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim();
  return normalizedValue.length > 0 && !normalizedValue.startsWith('<FILL:');
};

const allowPublicBlobAccess = (): boolean => process.env.AZURE_BLOB_PUBLIC_ACCESS === 'true';

interface UploadOptions {
  folder: string;
  filename?: string;
  contentType?: string;
  isPublic?: boolean;
}

interface UploadResult {
  url: string;
  path: string;
  cloudKey: string;
  container: string;
}

class AzureStorageService {
  private blobServiceClient?: BlobServiceClient; // Optional karena mungkin tidak dikonfigurasi
  private containerName: string;
  private accountName: string;

  constructor() {
    const storageDriver = (process.env.STORAGE_TYPE || process.env.STORAGE_DRIVER || 'local').toLowerCase();
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;

    if (storageDriver !== 'azure') {
      this.accountName = 'local';
      this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';
      return;
    }
    
    if (!isConfiguredValue(connectionString) || !isConfiguredValue(accountName)) {
      console.warn('[Azure Storage] Credentials not configured. Azure Storage features will be disabled.');
      console.warn('[Azure Storage] Set AZURE_STORAGE_CONNECTION_STRING and AZURE_STORAGE_ACCOUNT_NAME to enable.');
      // Don't throw error, just initialize with dummy values for development
      this.accountName = 'dummy';
      this.containerName = 'uploads';
      return;
    }

    try {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';
      this.accountName = accountName;
    } catch (error) {
      console.warn('[Azure Storage] Failed to initialize client. Azure Storage features will be disabled.');
      console.warn('[Azure Storage] Reason:', error instanceof Error ? error.message : 'Unknown error');
      this.accountName = 'dummy';
      this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'uploads';
    }
  }

  /**
   * Check if Azure Storage is configured and available
   */
  private isConfigured(): boolean {
    return this.blobServiceClient !== undefined;
  }

  /**
   * Get container client, create if doesn't exist
   */
  private async getContainerClient(): Promise<ContainerClient> {
    if (!this.isConfigured() || !this.blobServiceClient) {
      throw new Error('Azure Storage is not configured');
    }
    
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    
    // Create container if it doesn't exist
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create(
        allowPublicBlobAccess()
          ? { access: 'blob' }
          : undefined
      );
    }

    return containerClient;
  }

  /**
   * Generate unique filename with UUID
   */
  private generateUniqueFilename(originalName: string, customFilename?: string): string {
    if (customFilename) {
      return customFilename;
    }

    const ext = path.extname(originalName);
    const uuid = uuidv4();
    return `${uuid}${ext}`;
  }

  /**
   * Build blob path with organized structure
   */
  private buildBlobPath(folder: string, filename: string): string {
    // Remove leading/trailing slashes and normalize
    const normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
    return `${normalizedFolder}/${filename}`;
  }

  /**
   * Upload file to Azure Blob Storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      const containerClient = await this.getContainerClient();
      const filename = this.generateUniqueFilename(originalName, options.filename);
      const blobPath = this.buildBlobPath(options.folder, filename);
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

      // Upload with metadata
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: options.contentType || 'application/octet-stream',
        },
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString(),
        },
      };

      await blockBlobClient.upload(fileBuffer, fileBuffer.length, uploadOptions);

      // Generate URL
      const url = blockBlobClient.url;

      return {
        url,
        path: blobPath,
        cloudKey: blobPath,
        container: this.containerName,
      };
    } catch (error) {
      console.error('Azure Storage upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload from stream (for large files)
   */
  async uploadStream(
    stream: Readable,
    originalName: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      const containerClient = await this.getContainerClient();
      const filename = this.generateUniqueFilename(originalName, options.filename);
      const blobPath = this.buildBlobPath(options.folder, filename);
      
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

      // Upload stream with metadata
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: options.contentType || 'application/octet-stream',
        },
        metadata: {
          originalName: originalName,
          uploadedAt: new Date().toISOString(),
        },
      };

      await blockBlobClient.uploadStream(stream, undefined, undefined, uploadOptions);

      const url = blockBlobClient.url;

      return {
        url,
        path: blobPath,
        cloudKey: blobPath,
        container: this.containerName,
      };
    } catch (error) {
      console.error('Azure Storage stream upload error:', error);
      throw new Error(`Failed to upload stream: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Azure Blob Storage
   */
  async deleteFile(blobPath: string): Promise<void> {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      
      await blockBlobClient.deleteIfExists();
    } catch (error) {
      console.error('Azure Storage delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(blobPaths: string[]): Promise<void> {
    try {
      const deletePromises = blobPaths.map(path => this.deleteFile(path));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Azure Storage bulk delete error:', error);
      throw new Error(`Failed to delete files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(blobPath: string): Promise<boolean> {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      
      return await blockBlobClient.exists();
    } catch (error) {
      console.error('Azure Storage exists check error:', error);
      return false;
    }
  }

  /**
   * Generate SAS URL with expiration (for private files)
   */
  async generateSasUrl(blobPath: string, _expiresInMinutes: number = 60): Promise<string> {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      
      // Note: For SAS token generation, you need to use shared key credentials
      // This is a placeholder - implement based on your auth strategy
      return blockBlobClient.url;
    } catch (error) {
      console.error('Azure Storage SAS generation error:', error);
      throw new Error(`Failed to generate SAS URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(blobPath: string): Promise<any> {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
      
      const properties = await blockBlobClient.getProperties();
      
      return {
        contentType: properties.contentType,
        contentLength: properties.contentLength,
        lastModified: properties.lastModified,
        metadata: properties.metadata,
      };
    } catch (error) {
      console.error('Azure Storage metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy file within storage
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<string> {
    try {
      const containerClient = await this.getContainerClient();
      const sourceBlob = containerClient.getBlockBlobClient(sourcePath);
      const destBlob = containerClient.getBlockBlobClient(destinationPath);
      
      await destBlob.beginCopyFromURL(sourceBlob.url);
      
      return destBlob.url;
    } catch (error) {
      console.error('Azure Storage copy error:', error);
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for a blob
   */
  getPublicUrl(blobPath: string): string {
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobPath}`;
  }
}

export default new AzureStorageService();
