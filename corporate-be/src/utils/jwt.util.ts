import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const devAccessSecret = crypto.randomBytes(32).toString('hex');
const devRefreshSecret = crypto.randomBytes(32).toString('hex');
const configuredAccessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const configuredRefreshSecret = process.env.JWT_REFRESH_SECRET;
const JWT_ACCESS_SECRET = configuredAccessSecret || devAccessSecret;
const JWT_REFRESH_SECRET = configuredRefreshSecret || devRefreshSecret;
const JWT_ACCESS_EXPIRE = process.env.JWT_ACCESS_EXPIRE || process.env.JWT_EXPIRES_IN || '15m'; // 15 minutes
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // 7 days

if (process.env.NODE_ENV === 'production') {
  if (!configuredAccessSecret || JWT_ACCESS_SECRET.length < 32) {
    throw new Error('JWT_ACCESS_SECRET or JWT_SECRET must be a strong secret in production');
  }

  if (!configuredRefreshSecret || JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be a strong secret in production');
  }
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
  mfaChallengeId?: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string; // UUID for tracking and rotation
  type: 'refresh';
}

export type JwtPayload = AccessTokenPayload | RefreshTokenPayload;

/**
 * Generate JWT access token
 * @param user - User object with id, email, and optional roles/permissions
 * @returns Access token string
 */
export const generateAccessToken = (user: {
  id: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  sessionId?: string;
  mfaChallengeId?: string;
}): string => {
  const payload: AccessTokenPayload = {
    userId: user.id,
    email: user.email,
    roles: user.roles || [],
    permissions: user.permissions || [],
    sessionId: user.sessionId,
    mfaChallengeId: user.mfaChallengeId,
    type: 'access'
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRE,
    issuer: 'linknet-corp',
    audience: 'linknet-corp-users'
  } as jwt.SignOptions);
};

/**
 * Generate JWT refresh token
 * @param userId - User ID
 * @param tokenId - Unique token ID (UUID) for rotation tracking
 * @returns Refresh token string
 */
export const generateRefreshToken = (userId: string, tokenId?: string): { token: string; tokenId: string } => {
  const jti = tokenId || crypto.randomUUID();
  
  const payload: RefreshTokenPayload = {
    userId,
    tokenId: jti,
    type: 'refresh'
  };

  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'linknet-corp',
    audience: 'linknet-corp-users',
    jwtid: jti
  } as jwt.SignOptions);

  return { token, tokenId: jti };
};

/**
 * Hash refresh token for secure storage
 * @param token - Refresh token to hash
 * @returns Hashed token
 */
export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify access token
 * @param token - Access token to verify
 * @returns Decoded access token payload
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
      issuer: 'linknet-corp',
      audience: 'linknet-corp-users'
    }) as AccessTokenPayload;

    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Verify refresh token
 * @param token - Refresh token to verify
 * @returns Decoded refresh token payload
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'linknet-corp',
      audience: 'linknet-corp-users'
    }) as RefreshTokenPayload;

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (): string => {
  return crypto.randomBytes(32).toString('base64url');
};

/**
 * Keyed digest for random password reset bearer tokens before database storage.
 * This is not used for user password hashing.
 */
export const hashPasswordResetToken = (token: string): string => {
  const pepper = process.env.PASSWORD_RESET_TOKEN_PEPPER || JWT_REFRESH_SECRET;
  return crypto.createHmac('sha256', pepper).update(token).digest('hex');
};

/**
 * Get refresh token expiry date
 */
export const getRefreshTokenExpiry = (): Date => {
  const expireStr = JWT_REFRESH_EXPIRE;
  const days = parseInt(expireStr.replace('d', '')) || 7;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
};

/**
 * Get password reset token expiry date (1 hour)
 */
export const getPasswordResetTokenExpiry = (): Date => {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1);
  return expiryDate;
};
