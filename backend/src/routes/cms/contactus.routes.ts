import { Router } from 'express';
import {
  getContactSubmissions,
  getContactSubmissionById,
  deleteContactSubmission,
  deleteMultipleSubmissions,
  exportContactSubmissions,
  updateSubmissionStatus,
} from '../../controllers/cms/contactus.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { Permission } from '../../constants/permissions';
import { validateRequest } from '../../middleware/validation.middleware';
import {
  getContactSubmissionsValidation,
  getContactByIdValidation,
  updateSubmissionStatusValidation,
  deleteContactValidation,
  bulkDeleteContactValidation
} from '../../validators/contact.validator';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/cms/contactus
 * @desc    Get all contact submissions with pagination
 * @access  Private (requires contact_submissions.read permission)
 */
router.get(
  '/',
  requirePermission(Permission.CONTACT_SUBMISSIONS_READ),
  getContactSubmissionsValidation,
  validateRequest,
  getContactSubmissions
);

/**
 * @route   GET /api/cms/contactus/:id
 * @desc    Get contact submission detail (auto mark as read)
 * @access  Private (requires contact_submissions.read permission)
 */
router.get(
  '/:id',
  requirePermission(Permission.CONTACT_SUBMISSIONS_READ),
  getContactByIdValidation,
  validateRequest,
  getContactSubmissionById
);

/**
 * @route   PATCH /api/cms/contactus/:id/status
 * @desc    Update submission status (mark as read/unread)
 * @access  Private (requires contact_submissions.reply permission)
 */
router.patch(
  '/:id/status',
  requirePermission(Permission.CONTACT_SUBMISSIONS_REPLY),
  updateSubmissionStatusValidation,
  validateRequest,
  updateSubmissionStatus
);

/**
 * @route   DELETE /api/cms/contactus/:id
 * @desc    Delete contact submission by ID
 * @access  Private (requires contact_submissions.delete permission)
 */
router.delete(
  '/:id',
  requirePermission(Permission.CONTACT_SUBMISSIONS_DELETE),
  deleteContactValidation,
  validateRequest,
  deleteContactSubmission
);

/**
 * @route   POST /api/cms/contactus/destroy-multiple
 * @desc    Delete multiple contact submissions
 * @access  Private (requires contact_submissions.delete permission)
 */
router.post(
  '/destroy-multiple',
  requirePermission(Permission.CONTACT_SUBMISSIONS_DELETE),
  bulkDeleteContactValidation,
  validateRequest,
  deleteMultipleSubmissions
);

/**
 * @route   GET /api/cms/contactus/export
 * @desc    Export contact submissions to CSV
 * @access  Private (requires contact_submissions.read permission)
 */
router.get(
  '/export',
  requirePermission(Permission.CONTACT_SUBMISSIONS_READ),
  exportContactSubmissions
);

export default router;
