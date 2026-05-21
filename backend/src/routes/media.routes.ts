import { Router } from 'express';
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
} from '../controllers/media.controller';

const router = Router();

router.get('/folders', authMiddleware, requirePermission(Permission.FOLDERS_READ), listMediaFolders);
router.post('/folders', authMiddleware, requirePermission(Permission.FOLDERS_CREATE), createMediaFolder);
router.delete('/folders/:id', authMiddleware, requirePermission(Permission.FOLDERS_DELETE), deleteMediaFolder);

router.post(
  '/upload',
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

export default router;