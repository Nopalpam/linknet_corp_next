/**
 * File Management Routes
 * 
 * Backend endpoints for file management (File Manager Ready).
 * These endpoints are designed to work with any File Manager UI (custom or Flmngr).
 * 
 * Endpoints:
 *   GET    /api/v1/files              — List files (DB or storage)
 *   GET    /api/v1/files/info         — Get file metadata
 *   DELETE /api/v1/files/:key         — Delete file by key
 *   POST   /api/v1/files/delete       — Bulk delete files
 */

import { Router } from 'express';
import {
  listFiles,
  getFileInfo,
  deleteFileByKey,
  bulkDeleteFiles,
} from '../controllers/file.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/files
 * @desc    List files with optional prefix filter and pagination
 * @access  Private
 * @query   prefix, limit, page, startAfter, source (db|storage)
 */
router.get('/', authMiddleware, listFiles);

/**
 * @route   GET /api/v1/files/info
 * @desc    Get single file metadata
 * @access  Private
 * @query   key (cloud storage key)
 */
router.get('/info', authMiddleware, getFileInfo);

/**
 * @route   DELETE /api/v1/files/:key
 * @desc    Delete a single file by cloud key
 * @access  Private
 */
router.delete('/:key', authMiddleware, deleteFileByKey);

/**
 * @route   POST /api/v1/files/delete
 * @desc    Bulk delete files by cloud keys
 * @access  Private
 * @body    { keys: string[] }
 */
router.post('/delete', authMiddleware, bulkDeleteFiles);

export default router;
