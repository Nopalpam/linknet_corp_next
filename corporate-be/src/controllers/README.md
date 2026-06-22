# Example Controller

Example of a basic controller in the backend.

## File Location
`src/controllers/example.controller.ts`

## Example Code
```typescript
import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '@utils/response.handler';

export class ExampleController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Your logic here
      const data = { message: 'Example data' };
      return ResponseHandler.success(res, 'Data retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      // Your logic here
      return ResponseHandler.success(res, 'Data found', { id });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;
      // Your logic here
      return ResponseHandler.created(res, 'Data created successfully', data);
    } catch (error) {
      next(error);
    }
  }
}

export default new ExampleController();
```
