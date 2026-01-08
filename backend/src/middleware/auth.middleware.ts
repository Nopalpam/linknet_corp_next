import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Extend Express Request to include user with roles and permissions
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    userId: string; // Keep for backward compatibility
    email: string;
    roles?: string[];
    permissions?: string[];
  };
}

/**
 * Authentication middleware (required auth)
 * Verify JWT token and attach user to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded: AccessTokenPayload;
    try {
      decoded = verifyAccessToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      const code = message.includes('expired') ? 'TOKEN_EXPIRED' 
                 : message.includes('Invalid') ? 'TOKEN_INVALID'
                 : 'TOKEN_MALFORMED';
      
      res.status(401).json({
        success: false,
        message,
        code
      });
      return;
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        status: true,
        deletedAt: true
      }
    });

    if (!user || user.deletedAt) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        message: 'Account is inactive or suspended',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }

    // Attach user to request with roles and permissions
    req.user = {
      id: user.id,
      userId: user.id, // Keep for backward compatibility
      email: user.email,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unauthorized',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Guest middleware
 * Redirect authenticated users to dashboard
 * For frontend routes like /login, /register
 */
export const guestMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, user is guest - allow access
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = verifyAccessToken(token);

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          status: true,
          deletedAt: true
        }
      });

      if (user && !user.deletedAt && user.status === 'ACTIVE') {
        // User is authenticated - send response indicating they should be redirected
        res.status(200).json({
          success: true,
          message: 'Already authenticated',
          redirect: '/cms/dashboard'
        });
        return;
      }
    } catch (error) {
      // Token is invalid or expired - allow access as guest
      next();
      return;
    }

    // User is not authenticated - allow access
    next();
  } catch (error) {
    // Error checking auth status - allow access as guest
    next();
  }
};

/**
 * Optional authentication middleware
 * Attach user to request if token is valid, but don't block if not
 * For public endpoints that have different behavior for logged-in users
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            status: true,
            deletedAt: true
          }
        });

        if (user && !user.deletedAt && user.status === 'ACTIVE') {
          req.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
            roles: decoded.roles || [],
            permissions: decoded.permissions || []
          };
        }
      } catch (error) {
        // Invalid token - continue without user
      }
    }

    next();
  } catch (error) {
    next();
  }
};
