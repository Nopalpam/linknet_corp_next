import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { Permission } from '../../constants/permissions';
import * as PageController from '../../controllers/cms/page.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', requirePermission(Permission.PAGES_READ), PageController.getPages);
router.get('/slug/check', requirePermission(Permission.PAGES_READ), PageController.checkSlugAvailability);
router.post('/components/schema-sync/dry-run', requirePermission(Permission.PAGES_READ), PageController.dryRunComponentSchemaSync);
router.post('/components/schema-sync', requirePermission(Permission.PAGES_UPDATE), PageController.syncAllComponentSchemas);
router.get('/:id/history', requirePermission(Permission.PAGES_READ), PageController.getPageHistory);
router.get('/:id', requirePermission(Permission.PAGES_READ), PageController.getPage);
router.post('/', requirePermission(Permission.PAGES_CREATE), PageController.createPage);
router.put('/:id', requirePermission(Permission.PAGES_UPDATE), PageController.updatePage);
router.delete('/:id', requirePermission(Permission.PAGES_DELETE), PageController.deletePage);
router.put('/:id/components', requirePermission(Permission.PAGES_UPDATE), PageController.saveComponents);

export default router;
