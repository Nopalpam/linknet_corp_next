import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

router.get('/events', eventController.getPublishedEvents);
router.post('/events/:slug/registrations', eventController.createEventRegistration);
router.get('/events/:slug', eventController.getPublishedEventBySlug);

for (const adminBase of ['/cms/events', '/admin/events']) {
  router.get(
    adminBase,
    authMiddleware,
    requirePermission('events.read'),
    eventController.getEvents
  );

  router.get(
    `${adminBase}/:id`,
    authMiddleware,
    requirePermission('events.read'),
    eventController.getEventById
  );

  router.get(
    `${adminBase}/:id/registrations`,
    authMiddleware,
    requirePermission('events.read'),
    eventController.getEventRegistrations
  );

  router.get(
    `${adminBase}/:id/registrations/:registrationId`,
    authMiddleware,
    requirePermission('events.read'),
    eventController.getEventRegistrationById
  );

  router.post(
    adminBase,
    authMiddleware,
    requirePermission('events.create'),
    eventController.createEvent
  );

  router.put(
    `${adminBase}/:id`,
    authMiddleware,
    requirePermission('events.update'),
    eventController.updateEvent
  );

  router.delete(
    `${adminBase}/:id`,
    authMiddleware,
    requirePermission('events.delete'),
    eventController.deleteEvent
  );
}

export default router;