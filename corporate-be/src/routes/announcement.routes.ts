import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import announcementController from '../controllers/announcement.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

router.use(generalRateLimiter);

// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================

router.get(
  '/announcements/filter',
  announcementController.filterAnnouncements.bind(announcementController)
);

router.get(
  '/announcements/section/:id/items',
  announcementController.getPublicSectionItems.bind(announcementController)
);

// ============================================
// CMS ANNOUNCEMENT TYPES ROUTES (Protected)
// ============================================

router.get(
  '/cms/announcement-types/list',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementTypesList.bind(announcementController)
);

router.post(
  '/cms/announcement-types/toggle-status',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.toggleAnnouncementTypeStatus.bind(announcementController)
);

router.post(
  '/cms/announcement-types/destroy-multiple',
  authMiddleware,
  requirePermission('announcements.delete'),
  announcementController.deleteMultipleAnnouncementTypes.bind(announcementController)
);

router.get(
  '/cms/announcement-types/:id/sections',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementTypeSections.bind(announcementController)
);

router.post(
  '/cms/announcement-types/:id/sections/update-order',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.updateSectionsOrder.bind(announcementController)
);

router.get(
  '/cms/announcement-types',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementTypes.bind(announcementController)
);

router.post(
  '/cms/announcement-types',
  authMiddleware,
  requirePermission('announcements.create'),
  announcementController.createAnnouncementType.bind(announcementController)
);

router.get(
  '/cms/announcement-types/:id',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementTypeById.bind(announcementController)
);

router.put(
  '/cms/announcement-types/:id',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.updateAnnouncementType.bind(announcementController)
);

router.delete(
  '/cms/announcement-types/:id',
  authMiddleware,
  requirePermission('announcements.delete'),
  announcementController.deleteAnnouncementType.bind(announcementController)
);

// ============================================
// CMS ANNOUNCEMENT SECTIONS ROUTES (Protected)
// ============================================

router.get(
  '/cms/announcement-sections/list',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementSectionsList.bind(announcementController)
);

router.post(
  '/cms/announcement-sections/toggle-status',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.toggleAnnouncementSectionStatus.bind(announcementController)
);

router.post(
  '/cms/announcement-sections/destroy-multiple',
  authMiddleware,
  requirePermission('announcements.delete'),
  announcementController.deleteMultipleAnnouncementSections.bind(announcementController)
);

router.get(
  '/cms/announcement-sections/:id/items',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementSectionItems.bind(announcementController)
);

router.post(
  '/cms/announcement-sections/:id/items/update-order',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.updateSectionItemsOrder.bind(announcementController)
);

router.get(
  '/cms/announcement-sections',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementSections.bind(announcementController)
);

router.post(
  '/cms/announcement-sections',
  authMiddleware,
  requirePermission('announcements.create'),
  announcementController.createAnnouncementSection.bind(announcementController)
);

router.get(
  '/cms/announcement-sections/:id',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementSectionById.bind(announcementController)
);

router.put(
  '/cms/announcement-sections/:id',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.updateAnnouncementSection.bind(announcementController)
);

router.delete(
  '/cms/announcement-sections/:id',
  authMiddleware,
  requirePermission('announcements.delete'),
  announcementController.deleteAnnouncementSection.bind(announcementController)
);

// ============================================
// CMS ANNOUNCEMENT ITEMS ROUTES (Protected)
// ============================================

router.get(
  '/cms/announcement-items/stats',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementItemStats.bind(announcementController)
);

router.post(
  '/cms/announcement-items/toggle-status',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.toggleAnnouncementItemStatus.bind(announcementController)
);

router.post(
  '/cms/announcement-items/destroy-multiple',
  authMiddleware,
  requirePermission('announcements.delete'),
  announcementController.deleteMultipleAnnouncementItems.bind(announcementController)
);

router.post(
  '/cms/announcement-items/update-order',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.updateAnnouncementItemsOrder.bind(announcementController)
);

router.get(
  '/cms/announcement-items',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementItems.bind(announcementController)
);

router.post(
  '/cms/announcement-items',
  authMiddleware,
  requirePermission('announcements.create'),
  announcementController.createAnnouncementItem.bind(announcementController)
);

router.get(
  '/cms/announcement-items/:id',
  authMiddleware,
  requirePermission('announcements.read'),
  announcementController.getAnnouncementItemById.bind(announcementController)
);

router.put(
  '/cms/announcement-items/:id',
  authMiddleware,
  requirePermission('announcements.update'),
  announcementController.updateAnnouncementItem.bind(announcementController)
);

router.delete(
  '/cms/announcement-items/:id',
  authMiddleware,
  requirePermission('announcements.delete'),
  announcementController.deleteAnnouncementItem.bind(announcementController)
);

export default router;
