import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import { fileUploadScanner } from '../services/file-upload-scanner.service';

// File type configurations
const FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  videos: {
    mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    extensions: ['.mp4', '.webm', '.mov'],
    maxSize: 200 * 1024 * 1024, // 200MB
  },
};

// Get all allowed mime types
export const getAllowedMimeTypes = (): string[] => {
  return [
    ...FILE_TYPES.images.mimeTypes,
    ...FILE_TYPES.documents.mimeTypes,
    ...FILE_TYPES.videos.mimeTypes,
  ];
};

// Get all allowed extensions
export const getAllowedExtensions = (): string[] => {
  return [
    ...FILE_TYPES.images.extensions,
    ...FILE_TYPES.documents.extensions,
    ...FILE_TYPES.videos.extensions,
  ];
};

export const isAllowedFileMetadata = (filename: string, mimeType: string): boolean => {
  const allowedMimeTypes = getAllowedMimeTypes();
  const allowedExtensions = getAllowedExtensions();
  const ext = path.extname(filename).toLowerCase();

  return allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext);
};

// Determine file category based on mime type
export const getFileCategory = (mimeType: string): 'images' | 'documents' | 'videos' | 'avatars' | 'unknown' => {
  if (FILE_TYPES.images.mimeTypes.includes(mimeType)) {
    return 'images';
  }
  if (FILE_TYPES.documents.mimeTypes.includes(mimeType)) {
    return 'documents';
  }
  if (FILE_TYPES.videos.mimeTypes.includes(mimeType)) {
    return 'videos';
  }
  return 'unknown';
};

// Get max file size for category
export const getMaxFileSize = (category: string): number => {
  switch (category) {
    case 'images':
    case 'avatars':
      return FILE_TYPES.images.maxSize;
    case 'documents':
      return FILE_TYPES.documents.maxSize;
    case 'videos':
      return FILE_TYPES.videos.maxSize;
    default:
      return FILE_TYPES.documents.maxSize; // Default to documents limit
  }
};

// File filter function
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check mime type and extension
  if (isAllowedFileMetadata(file.originalname, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${getAllowedExtensions().join(', ')}`));
  }
};

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // Max 200MB (will be validated per category in controller)
    files: 10, // Max 10 files per request
  },
});

// Middleware to validate file size based on category
export const validateFileSize = (req: Request, res: any, next: any) => {
  const files = getUploadedFiles(req);

  if (files.length === 0) {
    return next();
  }

  const errors: string[] = [];

  for (const file of files) {
    const category = getFileCategory(file.mimetype);
    const maxSize = getMaxFileSize(category);

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      errors.push(
        `File "${file.originalname}" exceeds maximum size of ${maxSizeMB}MB for ${category}`
      );
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'File validation failed',
      errors,
    });
  }

  next();
};

// Middleware to validate required fields
export const validateUploadFields = (req: Request, res: any, next: any) => {
  // Folder is optional, will default to 'uploads' if not provided
  // Files are required
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({
      success: false,
      message: 'No files provided',
    });
  }

  next();
};

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (req.file) return [req.file];
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  return Object.values(req.files).flat();
};

export const scanUploadedFiles = async (req: Request, res: any, next: any) => {
  try {
    const files = getUploadedFiles(req);

    for (const file of files) {
      const scanResult = await fileUploadScanner.scanBuffer(file);
      if (!scanResult.safe) {
        return res.status(400).json({
          success: false,
          message: 'File security scan failed',
          threats: scanResult.threats || [],
        });
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'File security scan failed',
    });
  }
};

// Export file type configurations for use in other modules
export const fileTypeConfig = FILE_TYPES;
