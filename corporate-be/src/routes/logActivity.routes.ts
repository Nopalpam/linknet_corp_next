import { Router } from 'express';
import {
  getActivityLogs,
  getActivityLogById,
  deleteActivityLog,
  deleteActivityLogsBulk,
  cleanupOldLogs,
  getActivityLogStats,
  getUserActivityTimeline,
} from '../controllers/logActivity.controller';
import { authMiddleware as authenticate } from '@middleware/auth.middleware';
import { requirePermission as authorize } from '@middleware/rbac.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cms/log-activity
 * @desc    Get paginated activity logs with filters
 * @access  Private (requires 'log_activity.read' permission)
 */
router.get('/', authorize('log_activity.read'), getActivityLogs);

/**
 * @route   GET /api/cms/log-activity/stats
 * @desc    Get activity log statistics
 * @access  Private (requires 'log_activity.read' permission)
 */
router.get('/stats', authorize('log_activity.read'), getActivityLogStats);

/**
 * @route   GET /api/cms/log-activity/user/:userId/timeline
 * @desc    Get user activity timeline
 * @access  Private (requires 'log_activity.read' permission)
 */
router.get('/user/:userId/timeline', authorize('log_activity.read'), getUserActivityTimeline);

/**
 * @route   POST /api/cms/log-activity/bulk-delete
 * @desc    Soft delete all logs or logs in a date range
 * @access  Private (requires 'log_activity.delete' permission)
 */
router.post('/bulk-delete', authorize('log_activity.delete'), deleteActivityLogsBulk);

/**
 * @route   POST /api/cms/log-activity/cleanup
 * @desc    Cleanup old logs (soft delete logs older than X days)
 * @access  Private (requires 'log_activity.delete' permission)
 */
router.post('/cleanup', authorize('log_activity.delete'), cleanupOldLogs);

/**
 * @route   GET /api/cms/log-activity/:id
 * @desc    Get activity log by ID with diff view
 * @access  Private (requires 'log_activity.read' permission)
 */
router.get('/:id', authorize('log_activity.read'), getActivityLogById);

/**
 * @route   DELETE /api/cms/log-activity/:id
 * @desc    Soft delete activity log
 * @access  Private (requires 'log_activity.delete' permission)
 */
router.delete('/:id', authorize('log_activity.delete'), deleteActivityLog);

export default router;
