import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import { LabelDataBankController } from '../controllers/labelDataBank.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

router.get('/public/labels', LabelDataBankController.getPublicLabels);

router.use('/cms/labels', authMiddleware);

router.get('/cms/labels', checkPermission(Permission.LABELS_READ), LabelDataBankController.getGroups);
router.post('/cms/labels', checkPermission(Permission.LABELS_CREATE), LabelDataBankController.createGroup);
router.put('/cms/labels/:id', checkPermission(Permission.LABELS_UPDATE), LabelDataBankController.updateGroup);
router.delete('/cms/labels/:id', checkPermission(Permission.LABELS_DELETE), LabelDataBankController.deleteGroup);

router.get('/cms/labels/:parent/tree', checkPermission(Permission.LABELS_READ), LabelDataBankController.getTree);
router.post('/cms/labels/:parent/tree', checkPermission(Permission.LABELS_CREATE), LabelDataBankController.createLabel);
router.put('/cms/labels/:parent/tree/:id', checkPermission(Permission.LABELS_UPDATE), LabelDataBankController.updateLabel);
router.patch('/cms/labels/:parent/tree/:id/move', checkPermission(Permission.LABELS_UPDATE), LabelDataBankController.moveLabel);
router.delete('/cms/labels/:parent/tree/:id', checkPermission(Permission.LABELS_DELETE), LabelDataBankController.deleteLabel);

export default router;
