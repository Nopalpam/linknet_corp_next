import { Router } from 'express';
import { LabelDataBankController } from '../controllers/labelDataBank.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.get('/public/labels', LabelDataBankController.getPublicLabels);

router.use('/cms/labels', authMiddleware);

router.get('/cms/labels', checkPermission(Permission.PAGES_READ), LabelDataBankController.getGroups);
router.post('/cms/labels', checkPermission(Permission.PAGES_CREATE), LabelDataBankController.createGroup);
router.put('/cms/labels/:id', checkPermission(Permission.PAGES_UPDATE), LabelDataBankController.updateGroup);
router.delete('/cms/labels/:id', checkPermission(Permission.PAGES_DELETE), LabelDataBankController.deleteGroup);

router.get('/cms/labels/:parent/tree', checkPermission(Permission.PAGES_READ), LabelDataBankController.getTree);
router.post('/cms/labels/:parent/tree', checkPermission(Permission.PAGES_CREATE), LabelDataBankController.createLabel);
router.put('/cms/labels/:parent/tree/:id', checkPermission(Permission.PAGES_UPDATE), LabelDataBankController.updateLabel);
router.patch('/cms/labels/:parent/tree/:id/move', checkPermission(Permission.PAGES_UPDATE), LabelDataBankController.moveLabel);
router.delete('/cms/labels/:parent/tree/:id', checkPermission(Permission.PAGES_DELETE), LabelDataBankController.deleteLabel);

export default router;
