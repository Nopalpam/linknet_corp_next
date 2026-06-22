import multer from 'multer';
import { Request } from 'express';
import path from 'path';
import {
  fileUploadScanner,
  getFileUploadScannerConfig,
} from '../services/file-upload-scanner.service';

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

const PUBLIC_FORM_FILE_TYPES = {
  images: {
    mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
  },
};

const DANGEROUS_EXTENSIONS = new Set([
  '.asp',
  '.aspx',
  '.bat',
  '.cgi',
  '.cmd',
  '.com',
  '.dll',
  '.exe',
  '.htm',
  '.html',
  '.jar',
  '.jsp',
  '.jspx',
  '.msi',
  '.phtml',
  '.php',
  '.pl',
  '.ps1',
  '.py',
  '.rb',
  '.scr',
  '.sh',
  '.svg',
  '.vbs',
]);

const getPublicFormUploadMaxBytes = (): number => {
  const configured = parseInt(process.env.PUBLIC_FORM_UPLOAD_MAX_BYTES || '', 10);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : 10 * 1024 * 1024;
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
  const ext = path.extname(filename).toLowerCase();

  return Object.values(FILE_TYPES).some(
    (fileType) => fileType.mimeTypes.includes(mimeType) && fileType.extensions.includes(ext)
  );
};

export const isAllowedPublicFormFileMetadata = (filename: string, mimeType: string): boolean => {
  const ext = path.extname(filename).toLowerCase();

  return Object.values(PUBLIC_FORM_FILE_TYPES).some(
    (fileType) => fileType.mimeTypes.includes(mimeType) && fileType.extensions.includes(ext)
  );
};

const isSafeOriginalFilename = (filename: string): boolean => {
  if (!filename || /[\x00-\x1F\x7F]/.test(filename)) {
    return false;
  }

  const normalized = filename.replace(/\\/g, '/');
  const basename = path.posix.basename(normalized);
  if (!basename || basename !== normalized) {
    return false;
  }

  const parts = basename.toLowerCase().split('.').filter(Boolean);
  if (parts.length < 2) {
    return false;
  }

  return !parts.some((part, index) => index > 0 && DANGEROUS_EXTENSIONS.has(`.${part}`));
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
  if (!isSafeOriginalFilename(file.originalname)) {
    cb(new Error('Invalid file name'));
    return;
  }

  // Check mime type and extension
  if (isAllowedFileMetadata(file.originalname, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${getAllowedExtensions().join(', ')}`));
  }
};

const publicFormFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (!isSafeOriginalFilename(file.originalname)) {
    cb(new Error('Invalid file name'));
    return;
  }

  if (isAllowedPublicFormFileMetadata(file.originalname, file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid public form file type. Allowed types: .jpg, .jpeg, .png, .webp, .pdf, .doc, .docx, .xls, .xlsx'));
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

export const publicFormUpload = multer({
  storage,
  fileFilter: publicFormFileFilter,
  limits: {
    fileSize: getPublicFormUploadMaxBytes(),
    files: 1,
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

export const validatePublicFormFileSize = (req: Request, res: any, next: any) => {
  const files = getUploadedFiles(req);
  const maxSize = getPublicFormUploadMaxBytes();

  for (const file of files) {
    if (file.size > maxSize) {
      return res.status(413).json({
        success: false,
        message: `File exceeds maximum public form upload size of ${Math.round(maxSize / (1024 * 1024))}MB`,
      });
    }
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
        const threats = scanResult.threats || [];
        const clamAvUnavailable = threats.some((threat) =>
          threat.toLowerCase().includes('clamav is not installed') ||
          threat.toLowerCase().includes('clamav scan could not be completed')
        );

        return res.status(clamAvUnavailable ? 503 : 400).json({
          success: false,
          message: clamAvUnavailable
            ? 'File security scan failed because ClamAV is required but unavailable'
            : 'File security scan failed',
          code: clamAvUnavailable ? 'CLAMAV_UNAVAILABLE' : 'FILE_SECURITY_SCAN_FAILED',
          threats,
          details: {
            source: 'validation',
            code: clamAvUnavailable ? 'CLAMAV_UNAVAILABLE' : 'FILE_SECURITY_SCAN_FAILED',
            likelyCause: clamAvUnavailable
              ? 'Install ClamAV in the backend runtime image, or set ANTIVIRUS_REQUIRED=false only in trusted non-production/staging environments.'
              : 'The uploaded file failed malware or content validation.',
            scanner: getFileUploadScannerConfig(),
          },
        });
      }
    }

    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'File security scan failed',
      code: 'FILE_SECURITY_SCAN_ERROR',
      details: {
        source: 'validation',
        likelyCause: 'The upload scanner could not validate the file. Check backend upload scanner logs.',
        scanner: getFileUploadScannerConfig(),
      },
    });
  }
};

// Export file type configurations for use in other modules
export const fileTypeConfig = FILE_TYPES;
