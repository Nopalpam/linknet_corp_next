import { Router } from 'express';
import { generalRateLimiter } from '../../../middleware/rateLimiter.middleware';
import {
  getPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} from './page.controller';
import { authMiddleware as authenticate } from '../../../middleware/auth.middleware';

const router = Router();

router.use(generalRateLimiter);

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/cms/pages
 * @desc    Get pages list with pagination and filters
 * @access  Private (pages_read)
 */
router.get('/', getPages);

/**
 * @route   GET /api/cms/pages/:id
 * @desc    Get page by ID
 * @access  Private (pages_read)
 */
router.get('/:id', getPageById);

/**
 * @route   POST /api/cms/pages
 * @desc    Create new page
 * @access  Private (pages_create)
 */
router.post('/', createPage);

/**
 * @route   PUT /api/cms/pages/:id
 * @desc    Update page
 * @access  Private (pages_update)
 */
router.put('/:id', updatePage);

/**
 * @route   DELETE /api/cms/pages/:id
 * @desc    Delete page (soft delete)
 * @access  Private (pages_delete)
 */
router.delete('/:id', deletePage);

export default router;
