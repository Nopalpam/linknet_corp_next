import { Response } from 'express';
import crypto from 'crypto';

const ACCESS_TOKEN_COOKIE = 'auth_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const CSRF_TOKEN_COOKIE = 'csrf_token';
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieDomain = (): string | undefined => {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  return domain || undefined;
};

const isCookieSecure = (): boolean =>
  process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true';

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/',
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  const domain = getCookieDomain();
  const secure = isCookieSecure();
  const csrfToken = crypto.randomBytes(32).toString('hex');

  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    ...(domain && { domain }),
    secure,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    ...(domain && { domain }),
    secure,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });

  res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    ...(domain && { domain }),
    secure,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });
};

export const clearAuthCookies = (res: Response): void => {
  const domain = getCookieDomain();
  const secure = isCookieSecure();
  const options = {
    ...baseCookieOptions,
    ...(domain && { domain }),
    secure,
  };

  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
  res.clearCookie(CSRF_TOKEN_COOKIE, {
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    ...(domain && { domain }),
    secure,
  });
};
