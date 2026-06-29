import { Router } from 'express';
import { generalRateLimiter, uploadRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import { scanUploadedFiles, upload, validateFileSize } from '../middleware/upload.middleware';
import {
  uploadMediaFiles,
  listMediaFolders,
  createMediaFolder,
  deleteMediaFolder,
  listMediaFiles,
  getMediaFile,
  deleteMediaFile,
  getMediaDebugInfo,
  renameMediaFolder,
  transferMediaFolder,
  renameMediaFile,
  transferMediaFile,
} from '../controllers/media.controller';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

router.get('/debug/file-manager', authMiddleware, getMediaDebugInfo);

router.get('/folders', authMiddleware, requirePermission(Permission.FOLDERS_READ), listMediaFolders);
router.post('/folders', authMiddleware, requirePermission(Permission.FOLDERS_CREATE), createMediaFolder);
router.delete('/folders/:id', authMiddleware, requirePermission(Permission.FOLDERS_DELETE), deleteMediaFolder);
router.patch('/folders/:id', authMiddleware, requirePermission(Permission.FOLDERS_UPDATE), renameMediaFolder);
router.post('/folders/:id/transfer', authMiddleware, requirePermission(Permission.FOLDERS_UPDATE), transferMediaFolder);

router.post(
  '/upload',
  uploadRateLimiter,
  authMiddleware,
  requirePermission(Permission.FILES_CREATE),
  upload.array('files', 10),
  validateFileSize,
  scanUploadedFiles,
  uploadMediaFiles,
);

router.get('/files', authMiddleware, requirePermission(Permission.FILES_READ), listMediaFiles);
router.get('/files/:id', authMiddleware, requirePermission(Permission.FILES_READ), getMediaFile);
router.delete('/files/:id', authMiddleware, requirePermission(Permission.FILES_DELETE), deleteMediaFile);
router.patch('/files/:id', authMiddleware, requirePermission(Permission.FILES_UPDATE), renameMediaFile);
router.post('/files/:id/transfer', authMiddleware, requirePermission(Permission.FILES_UPDATE), transferMediaFile);

export default router;
