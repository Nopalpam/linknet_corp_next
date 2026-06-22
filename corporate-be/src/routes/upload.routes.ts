/**
 * Upload Routes
 * 
 * All upload-related endpoints:
 * 
 * POST   /api/v1/upload              — Upload single file via backend
 * POST   /api/v1/upload/multiple     — Upload multiple files via backend
 * POST   /api/v1/upload/presigned    — Get presigned URL for direct S3 upload
 * GET    /api/v1/upload/presigned-get — Get presigned URL for private file access
 * GET    /api/v1/upload/status       — Storage driver status
 */

import { Router } from 'express';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import {
  uploadSingleFile,
  uploadMultipleFiles,
  getPresignedUploadUrl,
  getPresignedGetUrl,
  getUploadStatus,
} from '../controllers/upload.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import { generalRateLimiter, uploadRateLimiter } from '../middleware/rateLimiter.middleware';
import { scanUploadedFiles, upload, validateFileSize } from '../middleware/upload.middleware';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

/**
 * @route   POST /api/v1/upload
 * @desc    Upload single file via backend to cloud storage
 * @access  Private
 */
router.post(
  '/',
  authMiddleware,
  requirePermission(Permission.FILES_CREATE),
  uploadRateLimiter,
  upload.single('file'),
  validateFileSize,
  scanUploadedFiles,
  uploadSingleFile
);

/**
 * @route   POST /api/v1/upload/multiple
 * @desc    Upload multiple files via backend to cloud storage
 * @access  Private
 */
router.post(
  '/multiple',
  authMiddleware,
  requirePermission(Permission.FILES_CREATE),
  uploadRateLimiter,
  upload.array('files', 10),
  validateFileSize,
  scanUploadedFiles,
  uploadMultipleFiles
);

/**
 * @route   POST /api/v1/upload/presigned
 * @desc    Get presigned URL for direct client-to-S3 upload
 * @access  Private
 * @note    Only available when STORAGE_DRIVER=s3
 */
router.post(
  '/presigned',
  authMiddleware,
  requirePermission(Permission.FILES_CREATE),
  uploadRateLimiter,
  getPresignedUploadUrl
);

/**
 * @route   GET /api/v1/upload/presigned-get
 * @desc    Get presigned GET URL for private file access
 * @access  Private
 * @note    Only available when STORAGE_DRIVER=s3
 */
router.get(
  '/presigned-get',
  authMiddleware,
  requirePermission(Permission.FILES_READ),
  getPresignedGetUrl
);

/**
 * @route   GET /api/v1/upload/status
 * @desc    Get storage driver configuration status
 * @access  Private
 */
router.get(
  '/status',
  authMiddleware,
  requirePermission(Permission.FILES_READ),
  getUploadStatus
);

export default router;
