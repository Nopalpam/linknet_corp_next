/**
 * File Manager V2 Routes
 * 
 * Uses the new storage abstraction layer.
 * Endpoints:
 *   POST   /api/v1/fm/upload    - Upload file(s)
 *   GET    /api/v1/fm            - List files
 *   GET    /api/v1/fm/:id        - Get file details / download
 *   DELETE /api/v1/fm/:id        - Delete file
 */

import { Router } from 'express';
import {
  uploadFileV2,
  listFilesV2,
  getFileV2,
  deleteFileV2,
} from '../controllers/filemanagerV2.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/v1/fm/upload
 * @desc    Upload files via storage abstraction
 * @access  Private
 */
router.post(
  '/upload',
  authMiddleware,
  upload.array('files', 10),
  uploadFileV2
);

/**
 * @route   GET /api/v1/fm
 * @desc    List files with pagination & filtering
 * @access  Private
 */
router.get('/', authMiddleware, listFilesV2);

/**
 * @route   GET /api/v1/fm/:id
 * @desc    Get file details or download
 * @access  Private
 */
router.get('/:id', authMiddleware, getFileV2);

/**
 * @route   DELETE /api/v1/fm/:id
 * @desc    Delete file
 * @access  Private
 */
router.delete('/:id', authMiddleware, deleteFileV2);

export default router;
