import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/error.types';
import { hasAnyPermission, hasAllPermissions, hasAnyRole } from '../utils/rbac';
import { PermissionSlug, RoleSlug } from '../constants/permissions';

/**
 * Extended Request with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    status: string;
    [key: string]: any;
  };
}

/**
 * Middleware to check if user has any of the specified permissions
 * User needs at least one of the permissions to access the route
 * 
 * @param permissions - Array of permission slugs
 * @returns Express middleware
 * 
 * @example
 * router.get('/users', requirePermission(Permission.USERS_MANAGEMENT_READ), getUsers);
 * router.post('/users', requirePermission(Permission.USERS_MANAGEMENT_CREATE), createUser);
 */
export const requirePermission = (...permissions: (PermissionSlug | string)[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const hasAccess = await hasAnyPermission(req.user.id, permissions);

      if (!hasAccess) {
        throw new AppError(
          'Forbidden: You do not have the required permissions to access this resource',
          403,
          'INSUFFICIENT_PERMISSIONS',
          true,
          {
            requiredPermissions: permissions.join(', '),
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has all of the specified permissions
 * User needs all permissions to access the route
 * 
 * @param permissions - Array of permission slugs
 * @returns Express middleware
 * 
 * @example
 * router.delete('/users/:id', requireAllPermissions(
 *   Permission.USERS_MANAGEMENT_DELETE,
 *   Permission.USERS_MANAGEMENT_READ
 * ), deleteUser);
 */
export const requireAllPermissions = (...permissions: (PermissionSlug | string)[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const hasAccess = await hasAllPermissions(req.user.id, permissions);

      if (!hasAccess) {
        throw new AppError(
          'Forbidden: You do not have all the required permissions to access this resource',
          403,
          'INSUFFICIENT_PERMISSIONS',
          true,
          {
            requiredPermissions: permissions.join(', '),
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the specified roles
 * User needs at least one of the roles to access the route
 * 
 * @param roles - Array of role slugs
 * @returns Express middleware
 * 
 * @example
 * router.get('/admin/dashboard', requireRole(Role.SUPER_ADMIN, Role.ADMIN), getDashboard);
 */
export const requireRole = (...roles: (RoleSlug | string)[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const hasAccess = await hasAnyRole(req.user.id, roles);

      if (!hasAccess) {
        throw new AppError(
          'Forbidden: You do not have the required role to access this resource',
          403,
          'INSUFFICIENT_PERMISSIONS',
          true,
          {
            requiredRoles: roles.join(', '),
          }
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional permission check - doesn't block request but adds permission info to request
 * Useful for conditional rendering or logging
 * 
 * @param permissions - Array of permission slugs
 * @returns Express middleware
 */
export const optionalPermission = (...permissions: (PermissionSlug | string)[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        const hasAccess = await hasAnyPermission(req.user.id, permissions);
        (req as any).hasPermission = hasAccess;
      } else {
        (req as any).hasPermission = false;
      }
      next();
    } catch (error) {
      (req as any).hasPermission = false;
      next();
    }
  };
};
