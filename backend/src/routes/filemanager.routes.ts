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
import { upload, validateFileSize, validateUploadFields } from '../middlewares/upload.middleware';

const router = Router();

/**
 * @route   POST /api/filemanager/upload
 * @desc    Upload files to cloud storage
 * @access  Private
 */
router.post(
  '/upload',
  authMiddleware,
  upload.array('files', 10),
  validateUploadFields,
  validateFileSize,
  uploadFiles
);

/**
 * @route   GET /api/filemanager/files
 * @desc    Get files with pagination and filters
 * @access  Private
 */
router.get('/files', authMiddleware, getFiles);

/**
 * @route   GET /api/filemanager/folders
 * @desc    Get folder tree structure
 * @access  Private
 */
router.get('/folders', authMiddleware, getFolders);

/**
 * @route   POST /api/filemanager/folder
 * @desc    Create new folder
 * @access  Private
 */
router.post('/folder', authMiddleware, createFolder);

/**
 * @route   DELETE /api/filemanager/files/:id
 * @desc    Delete file
 * @access  Private
 */
router.delete('/files/:id', authMiddleware, deleteFile);

/**
 * @route   POST /api/filemanager/move
 * @desc    Move files to another folder
 * @access  Private
 */
router.post('/move', authMiddleware, moveFiles);

/**
 * @route   GET /api/filemanager/search
 * @desc    Search files by name, type, tags
 * @access  Private
 */
router.get('/search', authMiddleware, searchFiles);

export default router;
