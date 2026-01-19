import { Router } from 'express';
import {
  submitContactForm,
  contactRateLimiter,
  getAllContactSubmissions,
  getContactSubmissionById,
  deleteContactSubmission,
} from '../controllers/contact.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

// Public routes
router.post('/submit', contactRateLimiter, submitContactForm);

// Admin routes (deprecated - use CMS routes instead)
router.get('/', authMiddleware, requirePermission(Permission.CONTACT_SUBMISSIONS_READ), getAllContactSubmissions);
router.get('/:id', authMiddleware, requirePermission(Permission.CONTACT_SUBMISSIONS_READ), getContactSubmissionById);
router.delete('/:id', authMiddleware, requirePermission(Permission.CONTACT_SUBMISSIONS_DELETE), deleteContactSubmission);

export default router;
