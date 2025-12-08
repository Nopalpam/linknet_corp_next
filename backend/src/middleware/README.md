# Middleware

This directory contains custom middleware functions.

## Example: Auth Middleware
`src/middleware/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@config/index';
import { ResponseHandler } from '@utils/response.handler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return ResponseHandler.unauthorized(res, 'No token provided');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return ResponseHandler.unauthorized(res, 'Invalid token');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return ResponseHandler.forbidden(res, 'Access denied');
    }
    next();
  };
};
```

## Example: Validation Middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from '@utils/response.handler';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseHandler.validationError(res, errors.array());
  }
  next();
};
```
