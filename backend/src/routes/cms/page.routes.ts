import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as PageController from '../../controllers/cms/page.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', PageController.getPages);
router.get('/slug/check', PageController.checkSlugAvailability);
router.get('/:id/history', PageController.getPageHistory);
router.get('/:id', PageController.getPage);
router.post('/', PageController.createPage);
router.put('/:id', PageController.updatePage);
router.delete('/:id', PageController.deletePage);
router.put('/:id/components', PageController.saveComponents);

export default router;
