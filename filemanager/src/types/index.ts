export interface UploadedFile {
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface FileListItem {
  key: string;
  size: number;
  lastModified: Date | undefined;
  url: string;
}

export interface BulkDeleteResult {
  deleted: string[];
  failed: Array<{ key: string; reason: string }>;
}

export interface StoredObjectMetadata {
  key: string;
  url: string;
  size: number;
  mimeType: string | null;
  lastModified: string | null;
  eTag: string | null;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
