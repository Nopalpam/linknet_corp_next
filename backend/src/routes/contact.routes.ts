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
import { validateRequest } from '../middleware/validation.middleware';
import { 
  submitContactValidation,
  getContactByIdValidation,
  deleteContactValidation
} from '../validators/contact.validator';

const router = Router();

// Public routes
router.post('/submit', contactRateLimiter, submitContactValidation, validateRequest, submitContactForm);

// Admin routes (deprecated - use CMS routes instead)
router.get('/', authMiddleware, requirePermission(Permission.CONTACT_SUBMISSIONS_READ), getAllContactSubmissions);
router.get('/:id', authMiddleware, requirePermission(Permission.CONTACT_SUBMISSIONS_READ), getContactByIdValidation, validateRequest, getContactSubmissionById);
router.delete('/:id', authMiddleware, requirePermission(Permission.CONTACT_SUBMISSIONS_DELETE), deleteContactValidation, validateRequest, deleteContactSubmission);

export default router;
