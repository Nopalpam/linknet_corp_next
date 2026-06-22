import { Router } from 'express';
import { generalRateLimiter } from '../middleware/rateLimiter.middleware';
import { csrfProtectionMiddleware } from '../middleware/csrf.middleware';
import { MapCoverageController } from '../controllers/mapCoverage.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkPermission } from '../middleware/rbac.middleware';
import { Permission } from '../constants/permissions';

const router = Router();

router.use(generalRateLimiter);
router.use(csrfProtectionMiddleware);

router.use(authMiddleware);

router.get('/', checkPermission(Permission.MAP_COVERAGE_READ), MapCoverageController.getAll);
router.get('/:id', checkPermission(Permission.MAP_COVERAGE_READ), MapCoverageController.getById);
router.post('/', checkPermission(Permission.MAP_COVERAGE_CREATE), MapCoverageController.create);
router.put('/:id', checkPermission(Permission.MAP_COVERAGE_UPDATE), MapCoverageController.update);
router.delete('/:id', checkPermission(Permission.MAP_COVERAGE_DELETE), MapCoverageController.delete);

export default router;
