# Routes

This directory contains API route definitions.

## Example Route
`src/routes/example.routes.ts`

```typescript
import { Router } from 'express';
import exampleController from '@controllers/example.controller';

const router = Router();

router.get('/', exampleController.getAll);
router.get('/:id', exampleController.getById);
router.post('/', exampleController.create);

export default router;
```

## Using Routes in server.ts
```typescript
import exampleRoutes from '@routes/example.routes';
app.use(`${API_PREFIX}/example`, exampleRoutes);
```
