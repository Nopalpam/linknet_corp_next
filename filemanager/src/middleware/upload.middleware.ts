import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

const ALLOWED_FILE_TYPES = [
  {
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg'],
  },
  {
    mimeType: 'image/png',
    extensions: ['.png'],
  },
  {
    mimeType: 'image/gif',
    extensions: ['.gif'],
  },
  {
    mimeType: 'image/webp',
    extensions: ['.webp'],
  },
  {
    mimeType: 'application/pdf',
    extensions: ['.pdf'],
  },
  {
    mimeType: 'application/msword',
    extensions: ['.doc'],
  },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
  },
  {
    mimeType: 'application/vnd.ms-excel',
    extensions: ['.xls'],
  },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extensions: ['.xlsx'],
  },
  {
    mimeType: 'application/vnd.ms-powerpoint',
    extensions: ['.ppt'],
  },
  {
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extensions: ['.pptx'],
  },
  {
    mimeType: 'video/mp4',
    extensions: ['.mp4'],
  },
  {
    mimeType: 'video/webm',
    extensions: ['.webm'],
  },
  {
    mimeType: 'video/quicktime',
    extensions: ['.mov'],
  },
];

const ALLOWED_MIME_TYPES = ALLOWED_FILE_TYPES.map((item) => item.mimeType);
const ALLOWED_EXTENSIONS = new Set(
  ALLOWED_FILE_TYPES.flatMap((item) => item.extensions)
);

const MAX_FILE_SIZE_BYTES =
  parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtensionAllowed = ALLOWED_EXTENSIONS.has(extension);

  if (isMimeAllowed && isExtensionAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" with extension "${extension || '(none)'}" is not allowed`
      )
    );
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 10 },
  fileFilter,
});
