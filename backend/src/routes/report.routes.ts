import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

/**
 * @route   GET /reports/filter
 * @desc    Filter reports for public frontend (AJAX)
 * @access  Public
 */
router.get(
  '/reports/filter',
  reportController.filterReports.bind(reportController)
);

/**
 * @route   GET /reports/years
 * @desc    Get available years for filter dropdown
 * @access  Public
 */
router.get(
  '/reports/years',
  reportController.getReportYears.bind(reportController)
);

/**
 * @route   GET /reports/section/:id/items
 * @desc    Get items for a section (public modal)
 * @access  Public
 */
router.get(
  '/reports/section/:id/items',
  reportController.getPublicSectionItems.bind(reportController)
);

// ============================================
// CMS REPORT TYPES ROUTES (Protected)
// ============================================

/**
 * @route   GET /cms/report-types/list
 * @desc    Get active report types for dropdown
 * @access  Private
 */
router.get(
  '/cms/report-types/list',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportTypesList.bind(reportController)
);

/**
 * @route   POST /cms/report-types/toggle-status
 * @desc    Toggle report type status
 * @access  Private
 */
router.post(
  '/cms/report-types/toggle-status',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.toggleReportTypeStatus.bind(reportController)
);

/**
 * @route   POST /cms/report-types/destroy-multiple
 * @desc    Bulk soft delete report types
 * @access  Private
 */
router.post(
  '/cms/report-types/destroy-multiple',
  authMiddleware,
  requirePermission('reports.delete'),
  reportController.deleteMultipleReportTypes.bind(reportController)
);

/**
 * @route   GET /cms/report-types/:id/sections
 * @desc    Get sections for a report type
 * @access  Private
 */
router.get(
  '/cms/report-types/:id/sections',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportTypeSections.bind(reportController)
);

/**
 * @route   POST /cms/report-types/:id/sections/update-order
 * @desc    Reorder sections within a report type
 * @access  Private
 */
router.post(
  '/cms/report-types/:id/sections/update-order',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateSectionsOrder.bind(reportController)
);

/**
 * @route   GET /cms/report-types/:id/grid-items
 * @desc    Get grid items for a report type
 * @access  Private
 */
router.get(
  '/cms/report-types/:id/grid-items',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportTypeGridItems.bind(reportController)
);

/**
 * @route   POST /cms/report-types/:id/grid-items/update-order
 * @desc    Reorder grid items within a report type
 * @access  Private
 */
router.post(
  '/cms/report-types/:id/grid-items/update-order',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateGridItemsOrder.bind(reportController)
);

/**
 * @route   GET /cms/report-types
 * @desc    Get report types with pagination
 * @access  Private
 */
router.get(
  '/cms/report-types',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportTypes.bind(reportController)
);

/**
 * @route   POST /cms/report-types
 * @desc    Create new report type
 * @access  Private
 */
router.post(
  '/cms/report-types',
  authMiddleware,
  requirePermission('reports.create'),
  reportController.createReportType.bind(reportController)
);

/**
 * @route   GET /cms/report-types/:id
 * @desc    Get single report type
 * @access  Private
 */
router.get(
  '/cms/report-types/:id',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportTypeById.bind(reportController)
);

/**
 * @route   PUT /cms/report-types/:id
 * @desc    Update report type
 * @access  Private
 */
router.put(
  '/cms/report-types/:id',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateReportType.bind(reportController)
);

/**
 * @route   DELETE /cms/report-types/:id
 * @desc    Soft delete report type
 * @access  Private
 */
router.delete(
  '/cms/report-types/:id',
  authMiddleware,
  requirePermission('reports.delete'),
  reportController.deleteReportType.bind(reportController)
);

// ============================================
// CMS REPORT SECTIONS ROUTES (Protected)
// ============================================

/**
 * @route   GET /cms/report-sections/list
 * @desc    Get active sections for dropdown
 * @access  Private
 */
router.get(
  '/cms/report-sections/list',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportSectionsList.bind(reportController)
);

/**
 * @route   POST /cms/report-sections/toggle-status
 * @desc    Toggle section status
 * @access  Private
 */
router.post(
  '/cms/report-sections/toggle-status',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.toggleReportSectionStatus.bind(reportController)
);

/**
 * @route   POST /cms/report-sections/destroy-multiple
 * @desc    Bulk soft delete sections
 * @access  Private
 */
router.post(
  '/cms/report-sections/destroy-multiple',
  authMiddleware,
  requirePermission('reports.delete'),
  reportController.deleteMultipleReportSections.bind(reportController)
);

/**
 * @route   GET /cms/report-sections/:id/items
 * @desc    Get items for a section
 * @access  Private
 */
router.get(
  '/cms/report-sections/:id/items',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportSectionItems.bind(reportController)
);

/**
 * @route   POST /cms/report-sections/:id/items/update-order
 * @desc    Reorder items within a section
 * @access  Private
 */
router.post(
  '/cms/report-sections/:id/items/update-order',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateSectionItemsOrder.bind(reportController)
);

/**
 * @route   GET /cms/report-sections
 * @desc    Get sections with pagination
 * @access  Private
 */
router.get(
  '/cms/report-sections',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportSections.bind(reportController)
);

/**
 * @route   POST /cms/report-sections
 * @desc    Create new section
 * @access  Private
 */
router.post(
  '/cms/report-sections',
  authMiddleware,
  requirePermission('reports.create'),
  reportController.createReportSection.bind(reportController)
);

/**
 * @route   GET /cms/report-sections/:id
 * @desc    Get single section
 * @access  Private
 */
router.get(
  '/cms/report-sections/:id',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportSectionById.bind(reportController)
);

/**
 * @route   PUT /cms/report-sections/:id
 * @desc    Update section
 * @access  Private
 */
router.put(
  '/cms/report-sections/:id',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateReportSection.bind(reportController)
);

/**
 * @route   DELETE /cms/report-sections/:id
 * @desc    Soft delete section
 * @access  Private
 */
router.delete(
  '/cms/report-sections/:id',
  authMiddleware,
  requirePermission('reports.delete'),
  reportController.deleteReportSection.bind(reportController)
);

// ============================================
// CMS REPORT ITEMS ROUTES (Protected)
// ============================================

/**
 * @route   GET /cms/report-items/stats
 * @desc    Get report item stats
 * @access  Private
 */
router.get(
  '/cms/report-items/stats',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportItemStats.bind(reportController)
);

/**
 * @route   POST /cms/report-items/toggle-status
 * @desc    Toggle item status
 * @access  Private
 */
router.post(
  '/cms/report-items/toggle-status',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.toggleReportItemStatus.bind(reportController)
);

/**
 * @route   POST /cms/report-items/destroy-multiple
 * @desc    Bulk soft delete items
 * @access  Private
 */
router.post(
  '/cms/report-items/destroy-multiple',
  authMiddleware,
  requirePermission('reports.delete'),
  reportController.deleteMultipleReportItems.bind(reportController)
);

/**
 * @route   POST /cms/report-items/update-order
 * @desc    Reorder items
 * @access  Private
 */
router.post(
  '/cms/report-items/update-order',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateReportItemsOrder.bind(reportController)
);

/**
 * @route   GET /cms/report-items
 * @desc    Get items with pagination
 * @access  Private
 */
router.get(
  '/cms/report-items',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportItems.bind(reportController)
);

/**
 * @route   POST /cms/report-items
 * @desc    Create new item
 * @access  Private
 */
router.post(
  '/cms/report-items',
  authMiddleware,
  requirePermission('reports.create'),
  reportController.createReportItem.bind(reportController)
);

/**
 * @route   GET /cms/report-items/:id
 * @desc    Get single item
 * @access  Private
 */
router.get(
  '/cms/report-items/:id',
  authMiddleware,
  requirePermission('reports.read'),
  reportController.getReportItemById.bind(reportController)
);

/**
 * @route   PUT /cms/report-items/:id
 * @desc    Update item
 * @access  Private
 */
router.put(
  '/cms/report-items/:id',
  authMiddleware,
  requirePermission('reports.update'),
  reportController.updateReportItem.bind(reportController)
);

/**
 * @route   DELETE /cms/report-items/:id
 * @desc    Soft delete item
 * @access  Private
 */
router.delete(
  '/cms/report-items/:id',
  authMiddleware,
  requirePermission('reports.delete'),
  reportController.deleteReportItem.bind(reportController)
);

export default router;
