import multer from 'multer';
import { Request } from 'express';

// Memory storage for multer (we'll process and upload to cloud)
const storage = multer.memoryStorage();

// File filter for images only
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
  }
};

// Multer configuration for avatar upload
export const avatarUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max size
  },
});

// Error messages for multer errors
export const getMulterErrorMessage = (error: any): string => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'File size exceeds 5MB limit';
      case 'LIMIT_FILE_COUNT':
        return 'Too many files uploaded';
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Unexpected file field';
      default:
        return `Upload error: ${error.message}`;
    }
  }
  return error.message || 'Unknown upload error';
};
