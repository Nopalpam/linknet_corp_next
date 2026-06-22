/**
 * Career Routes
 * Admin CMS + Public routes for career positions
 * 
 * ADMIN ENDPOINTS (requires auth):
 *   GET    /cms/careers           → List with filter & pagination
 *   GET    /cms/careers/stats     → Statistics
 *   GET    /cms/careers/:id       → Get detail by ID
 *   POST   /cms/careers           → Create new position
 *   PUT    /cms/careers/:id       → Update position
 *   DELETE /cms/careers/:id       → Delete single position
 *   POST   /cms/careers/bulk-delete     → Delete multiple positions
 *   POST   /cms/careers/:id/toggle-status → Toggle active/inactive
 *
 * PUBLIC ENDPOINTS (no auth):
 *   GET    /careers               → List published only
 *   GET    /careers/filters       → Get filter options
 *   GET    /careers/:slug         → Get detail by slug (published only)
 */

import { Router } from 'express';
import careerController from '../controllers/career.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import {
  createCareerValidation,
  updateCareerValidation,
  bulkDeleteCareerValidation,
  careerListValidation,
  careerIdValidation,
  careerSlugValidation,
} from '../validators/career.validator';

const router = Router();

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================

// GET /careers - List published careers
router.get(
  '/careers',
  careerListValidation,
  careerController.getPublicCareers
);

// GET /careers/filters - Get filter options
router.get(
  '/careers/filters',
  careerController.getFilterOptions
);

// GET /careers/:slug - Get career by slug (published only)
router.get(
  '/careers/:slug',
  careerSlugValidation,
  careerController.getBySlug
);

// ============================================
// ADMIN ROUTES (auth required)
// ============================================

// GET /cms/careers/stats - Statistics (must be before :id route)
router.get(
  '/cms/careers/stats',
  authMiddleware,
  requirePermission('careers.read'),
  careerController.getStats
);

// GET /cms/careers - List all careers
router.get(
  '/cms/careers',
  authMiddleware,
  requirePermission('careers.read'),
  careerListValidation,
  careerController.getAdminCareers
);

// GET /cms/careers/:id - Get career by ID
router.get(
  '/cms/careers/:id',
  authMiddleware,
  requirePermission('careers.read'),
  careerIdValidation,
  careerController.getById
);

// POST /cms/careers - Create career
router.post(
  '/cms/careers',
  authMiddleware,
  requirePermission('careers.create'),
  createCareerValidation,
  careerController.create
);

// PUT /cms/careers/:id - Update career
router.put(
  '/cms/careers/:id',
  authMiddleware,
  requirePermission('careers.update'),
  updateCareerValidation,
  careerController.update
);

// DELETE /cms/careers/:id - Delete career
router.delete(
  '/cms/careers/:id',
  authMiddleware,
  requirePermission('careers.delete'),
  careerIdValidation,
  careerController.delete
);

// POST /cms/careers/bulk-delete - Bulk delete
router.post(
  '/cms/careers/bulk-delete',
  authMiddleware,
  requirePermission('careers.delete'),
  bulkDeleteCareerValidation,
  careerController.bulkDelete
);

// POST /cms/careers/:id/toggle-status - Toggle status
router.post(
  '/cms/careers/:id/toggle-status',
  authMiddleware,
  requirePermission('careers.update'),
  careerIdValidation,
  careerController.toggleStatus
);

export default router;
