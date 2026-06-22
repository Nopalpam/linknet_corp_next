/**
 * Storage Interface
 * 
 * Defines the contract for all storage implementations.
 * Any storage driver (local, S3, Azure, etc.) must implement this interface.
 */

export interface StorageFile {
  key: string;              // Unique identifier / path in storage
  url: string;              // Public URL to access the file
  originalName: string;     // Original filename
  mimeType: string;         // MIME type
  size: number;             // File size in bytes
  metadata?: Record<string, string>;
}

export interface UploadParams {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  folder?: string;          // Virtual folder path
  isPublic?: boolean;       // Whether file should be publicly accessible
  metadata?: Record<string, string>;
}

export interface ListParams {
  prefix?: string;          // Filter by path prefix (folder)
  maxResults?: number;      // Limit results
  continuationToken?: string; // Pagination token
}

export interface ListResult {
  files: StorageFile[];
  continuationToken?: string; // For pagination
  hasMore: boolean;
}

export interface IStorageProvider {
  /**
   * Upload a file to storage
   */
  upload(params: UploadParams): Promise<StorageFile>;

  /**
   * Get file metadata (without downloading)
   */
  getFileInfo(key: string): Promise<StorageFile | null>;

  /**
   * Get a readable stream or buffer for downloading
   */
  download(key: string): Promise<Buffer>;

  /**
   * Get a signed/public URL for direct download
   */
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /**
   * Delete a file from storage
   */
  delete(key: string): Promise<boolean>;

  /**
   * List files in storage
   */
  list(params?: ListParams): Promise<ListResult>;

  /**
   * Check if a file exists
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get the storage provider name
   */
  getProviderName(): string;
}
