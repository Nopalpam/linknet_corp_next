import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt.util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: string;
  userId: string;
  email: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const getRequestAccessToken = (req: Request): string | undefined => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return req.cookies?.auth_token;
};

/**
 * Extend Express Request to include user with roles and permissions
 */
export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
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
    // Get token from Authorization header or HttpOnly cookie
    const token = getRequestAccessToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
        code: 'NO_TOKEN'
      });
      return;
    }

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
        username: true,
        status: true,
        lockedAt: true,
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

    if (user.lockedAt) {
      res.status(403).json({
        success: false,
        message: 'Account is locked',
        code: 'ACCOUNT_LOCKED'
      });
      return;
    }

    if (!decoded.sessionId) {
      res.status(401).json({
        success: false,
        message: 'Session validation required',
        code: 'TOKEN_SESSION_REQUIRED'
      });
      return;
    }

    const activeSession = await prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        tokenId: decoded.sessionId,
        expiresAt: { gt: new Date() }
      },
      select: { id: true }
    });

    if (!activeSession) {
      res.status(401).json({
        success: false,
        message: 'Session has expired or was replaced by a newer login',
        code: 'SESSION_INVALID'
      });
      return;
    }

    // Attach user to request with roles and permissions
    req.user = {
      id: user.id,
      userId: user.id, // Keep for backward compatibility
      email: user.email,
      username: user.username,
      roles: decoded.roles || [],
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
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
    // Get token from Authorization header or HttpOnly cookie
    const token = getRequestAccessToken(req);

    if (!token) {
      // No token, user is guest - allow access
      next();
      return;
    }

    try {
      // Verify token
      const decoded = verifyAccessToken(token);

      // Check if user exists and is active
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          status: true,
          deletedAt: true
        }
      });

      const activeSession = user && decoded.sessionId
        ? await prisma.refreshToken.findFirst({
            where: {
              userId: user.id,
              tokenId: decoded.sessionId,
              expiresAt: { gt: new Date() },
            },
            select: { id: true },
          })
        : null;

      if (user && !user.deletedAt && user.status === 'ACTIVE' && activeSession) {
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
    const token = getRequestAccessToken(req);

    if (token) {
      try {
        const decoded = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            username: true,
            status: true,
            deletedAt: true
          }
        });

        const activeSession = user && decoded.sessionId
          ? await prisma.refreshToken.findFirst({
              where: {
                userId: user.id,
                tokenId: decoded.sessionId,
                expiresAt: { gt: new Date() },
              },
              select: { id: true },
            })
          : null;

        if (user && !user.deletedAt && user.status === 'ACTIVE' && activeSession) {
          req.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
            username: user.username,
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
