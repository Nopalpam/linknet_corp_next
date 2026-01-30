import { Router } from 'express';
import {
  getUrlRedirects,
  getUrlRedirectById,
  createUrlRedirect,
  updateUrlRedirect,
  deleteUrlRedirect,
  bulkDeleteUrlRedirects,
  toggleUrlRedirectStatus,
  handleRedirect,
} from '../controllers/urlRedirect.controller';
import { authMiddleware as authenticate } from '@middleware/auth.middleware';
import { requirePermission as authorize } from '@middleware/rbac.middleware';

const router = Router();

/**
 * Public Routes
 */

/**
 * @route   GET /api/redirect/:path
 * @desc    Handle URL redirect (public)
 * @access  Public
 */
router.get('/redirect/*', handleRedirect);

/**
 * CMS Routes (Authentication Required)
 */

// All CMS routes require authentication
router.use('/cms/url-redirects', authenticate);

/**
 * @route   GET /api/cms/url-redirects
 * @desc    Get all URL redirects with pagination
 * @access  Private (requires 'url_redirection.read' permission)
 */
router.get('/cms/url-redirects', authorize('url_redirection.read'), getUrlRedirects);

/**
 * @route   GET /api/cms/url-redirects/:id
 * @desc    Get URL redirect by ID
 * @access  Private (requires 'url_redirection.read' permission)
 */
router.get('/cms/url-redirects/:id', authorize('url_redirection.read'), getUrlRedirectById);

/**
 * @route   POST /api/cms/url-redirects
 * @desc    Create new URL redirect
 * @access  Private (requires 'url_redirection.create' permission)
 */
router.post('/cms/url-redirects', authorize('url_redirection.create'), createUrlRedirect);

/**
 * @route   PUT /api/cms/url-redirects/:id
 * @desc    Update URL redirect
 * @access  Private (requires 'url_redirection.update' permission)
 */
router.put('/cms/url-redirects/:id', authorize('url_redirection.update'), updateUrlRedirect);

/**
 * @route   DELETE /api/cms/url-redirects/:id
 * @desc    Delete URL redirect
 * @access  Private (requires 'url_redirection.delete' permission)
 */
router.delete('/cms/url-redirects/:id', authorize('url_redirection.delete'), deleteUrlRedirect);

/**
 * @route   POST /api/cms/url-redirects/bulk-delete
 * @desc    Bulk delete URL redirects
 * @access  Private (requires 'url_redirection.delete' permission)
 */
router.post('/cms/url-redirects/bulk-delete', authorize('url_redirection.delete'), bulkDeleteUrlRedirects);

/**
 * @route   PATCH /api/cms/url-redirects/:id/toggle
 * @desc    Toggle URL redirect active status
 * @access  Private (requires 'url_redirection.update' permission)
 */
router.patch('/cms/url-redirects/:id/toggle', authorize('url_redirection.update'), toggleUrlRedirectStatus);

export default router;
