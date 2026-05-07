import { Router } from 'express';
import {
  uploadFiles,
  getFiles,
  getFolders,
  createFolder,
  deleteFile,
  moveFiles,
  searchFiles,
} from '../controllers/filemanager.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';
import {
  scanUploadedFiles,
  upload,
  validateFileSize,
  validateUploadFields,
} from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/filemanager/upload
 * @desc    Upload files to cloud storage
 * @access  Private
 */
router.post(
  '/upload',
  authMiddleware,
  requirePermission(Permission.FILES_CREATE),
  upload.array('files', 10),
  validateUploadFields,
  validateFileSize,
  scanUploadedFiles,
  uploadFiles
);

/**
 * @route   GET /api/filemanager/files
 * @desc    Get files with pagination and filters
 * @access  Private
 */
router.get('/files', authMiddleware, requirePermission(Permission.FILES_READ), getFiles);

/**
 * @route   GET /api/filemanager/folders
 * @desc    Get folder tree structure
 * @access  Private
 */
router.get('/folders', authMiddleware, requirePermission(Permission.FOLDERS_READ), getFolders);

/**
 * @route   POST /api/filemanager/folder
 * @desc    Create new folder
 * @access  Private
 */
router.post('/folder', authMiddleware, requirePermission(Permission.FOLDERS_CREATE), createFolder);

/**
 * @route   DELETE /api/filemanager/files/:id
 * @desc    Delete file
 * @access  Private
 */
router.delete('/files/:id', authMiddleware, requirePermission(Permission.FILES_DELETE), deleteFile);

/**
 * @route   POST /api/filemanager/move
 * @desc    Move files to another folder
 * @access  Private
 */
router.post('/move', authMiddleware, requirePermission(Permission.FILES_UPDATE), moveFiles);

/**
 * @route   GET /api/filemanager/search
 * @desc    Search files by name, type, tags
 * @access  Private
 */
router.get('/search', authMiddleware, requirePermission(Permission.FILES_READ), searchFiles);

export default router;
