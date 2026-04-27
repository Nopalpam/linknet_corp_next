import { Router } from 'express';
import { getPublicFormModule, submitPublicFormModule } from './formModule.controller';

const router = Router();

router.get('/forms/:businessUnit/:slug', getPublicFormModule);
router.post('/forms/:businessUnit/:slug/submissions', submitPublicFormModule);

export default router;