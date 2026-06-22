import { Request, Response } from 'express';
import crypto from 'crypto';

const ACCESS_TOKEN_COOKIE = 'auth_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const CSRF_TOKEN_COOKIE = 'csrf_token';
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const STAGING_COOKIE_DOMAIN = '.lncorp.local';
const STAGING_HOST_SUFFIX = '.lncorp.local';

const normalizeHostname = (value?: string): string | undefined => {
  if (!value) return undefined;

  try {
    const parsed = value.includes('://') ? new URL(value) : new URL(`https://${value}`);
    return parsed.hostname.toLowerCase();
  } catch {
    return value.split(':')[0]?.trim().toLowerCase() || undefined;
  }
};

const isLncorpStagingHost = (hostname?: string): boolean =>
  hostname === 'lncorp.local' || Boolean(hostname?.endsWith(STAGING_HOST_SUFFIX));

const getRequestHostnames = (req?: Request): string[] => {
  if (!req) return [];

  return [
    normalizeHostname(req.hostname),
    normalizeHostname(req.get('host')),
    normalizeHostname(req.get('origin')),
  ].filter((hostname): hostname is string => Boolean(hostname));
};

const isRequestSecure = (req?: Request): boolean => {
  if (!req) return false;

  return req.secure || req.protocol === 'https';
};

const isStagingHttpCookieBypass = (req?: Request): boolean => {
  if (!req || isRequestSecure(req)) return false;
  return getRequestHostnames(req).some(isLncorpStagingHost);
};

const getCookieDomain = (req?: Request): string | undefined => {
  const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
  if (domain) return domain;

  if (getRequestHostnames(req).some(isLncorpStagingHost)) {
    return STAGING_COOKIE_DOMAIN;
  }

  return undefined;
};

const isCookieSecure = (req?: Request): boolean => {
  if (isStagingHttpCookieBypass(req)) return false;
  return process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true';
};

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  path: '/',
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  req?: Request
): void => {
  const domain = getCookieDomain(req);
  const secure = isCookieSecure(req);
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

export const clearAuthCookies = (res: Response, req?: Request): void => {
  const domain = getCookieDomain(req);
  const secure = isCookieSecure(req);
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
