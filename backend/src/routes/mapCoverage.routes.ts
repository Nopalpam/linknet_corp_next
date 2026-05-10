import { Router } from 'express';
import { MapCoverageController } from '../controllers/mapCoverage.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.use(authMiddleware);

router.get('/', checkPermission(Permission.MANAGEMENT_READ), MapCoverageController.getAll);
router.get('/:id', checkPermission(Permission.MANAGEMENT_READ), MapCoverageController.getById);
router.post('/', checkPermission(Permission.MANAGEMENT_CREATE), MapCoverageController.create);
router.put('/:id', checkPermission(Permission.MANAGEMENT_UPDATE), MapCoverageController.update);
router.delete('/:id', checkPermission(Permission.MANAGEMENT_DELETE), MapCoverageController.delete);

export default router;
