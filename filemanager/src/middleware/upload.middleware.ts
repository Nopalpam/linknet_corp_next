import multer, { FileFilterCallback } from 'multer';
import { NextFunction, Request, Response } from 'express';
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

const MAX_FILE_SIZE_BYTES =
  parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;

const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some((char) => {
    const code = char.charCodeAt(0);
    return code <= 31 || code === 127;
  });

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const extension = path.extname(file.originalname).toLowerCase();
  const isFilenameSafe = isSafeOriginalFilename(file.originalname);
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtensionAllowed = ALLOWED_EXTENSIONS.has(extension);
  const isMimeExtensionPairAllowed = ALLOWED_FILE_TYPES.some(
    (item) => item.mimeType === file.mimetype && item.extensions.includes(extension)
  );

  if (isFilenameSafe && isMimeAllowed && isExtensionAllowed && isMimeExtensionPairAllowed) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type "${file.mimetype}" with extension "${extension || '(none)'}" is not allowed`
      )
    );
  }
};

const isSafeOriginalFilename = (filename: string): boolean => {
  if (!filename || hasControlCharacters(filename)) {
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

const getUploadedFiles = (req: Request): Express.Multer.File[] => {
  if (req.file) return [req.file];
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  return Object.values(req.files).flat();
};

const FILE_SIGNATURES: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/gif': ['474946383761', '474946383961'],
  'image/webp': ['52494646'],
  'application/pdf': ['255044462d'],
};

export const validateUploadedFileContent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  for (const file of getUploadedFiles(req)) {
    const expectedSignatures = FILE_SIGNATURES[file.mimetype];
    if (!expectedSignatures) {
      continue;
    }

    const fileSignature = file.buffer.toString('hex', 0, 8);
    const matches = expectedSignatures.some((signature) =>
      fileSignature.startsWith(signature)
    );

    if (!matches) {
      res.status(400).json({
        success: false,
        message: 'File content does not match declared MIME type',
      });
      return;
    }
  }

  next();
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 10 },
  fileFilter,
});
