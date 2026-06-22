export const API_PREFIX = '/api/v1';

const API_SUFFIX_PATTERN = /\/api\/v1\/?$/i;
const SERVER_API_ENV_KEYS = ['API_INTERNAL_URL', 'NEXT_PUBLIC_API_URL'];
const CLIENT_API_ENV_KEYS = ['NEXT_PUBLIC_API_URL'];
const STAGING_API_ORIGIN = 'https://dev-be.lncorp.local';

const cleanUrlForLog = (value) => {
  const rawValue = String(value || '').trim();
  if (!rawValue) return null;

  try {
    const url = new URL(rawValue);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return rawValue.replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
};

const getEnvSnapshot = (keys) => keys.reduce((snapshot, key) => {
  const value = process.env[key];
  snapshot[key] = {
    present: Boolean(value && String(value).trim()),
    value: cleanUrlForLog(value) || null,
  };
  return snapshot;
}, {});

const getFirstAvailableEnvValue = (keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

const isTrustedNonProduction = () => {
  const env = String(process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV || process.env.ENVIRONMENT || process.env.NODE_ENV || '').toLowerCase();
  return ['development', 'dev', 'staging', 'stage', 'test'].includes(env);
};

export function getApiBaseUrl(value = process.env.NEXT_PUBLIC_API_URL) {
  const normalizedBaseUrl = String(value || '').trim().replace(/\/+$/, '');

  if (!normalizedBaseUrl) {
    return '';
  }

  return API_SUFFIX_PATTERN.test(normalizedBaseUrl)
    ? normalizedBaseUrl.replace(/\/+$/, '')
    : `${normalizedBaseUrl}${API_PREFIX}`;
}

export function getServerApiBaseUrl() {
  const configured = getFirstAvailableEnvValue(SERVER_API_ENV_KEYS);
  if (configured) {
    return getApiBaseUrl(configured);
  }

  // This deployment cannot inject runtime env/AKV values. Keep the fallback
  // server-only so browsers continue using the same-origin content proxy.
  return getApiBaseUrl(STAGING_API_ORIGIN);
}

export function getClientApiBaseUrl() {
  const configured = getFirstAvailableEnvValue(CLIENT_API_ENV_KEYS);
  if (configured) {
    return getApiBaseUrl(configured);
  }

  return isTrustedNonProduction() ? getApiBaseUrl(STAGING_API_ORIGIN) : '';
}

export function buildApiUrl(endpoint, baseUrl = getServerApiBaseUrl()) {
  const normalizedEndpoint = String(endpoint || '').startsWith('/')
    ? String(endpoint || '')
    : `/${endpoint || ''}`;
  const normalizedBaseUrl = String(baseUrl || '').trim().replace(/\/+$/, '');

  return normalizedBaseUrl ? `${normalizedBaseUrl}${normalizedEndpoint}` : normalizedEndpoint;
}

export function getApiDebugSnapshot(runtime = 'server') {
  const isServer = runtime === 'server';
  const env = getEnvSnapshot(isServer ? SERVER_API_ENV_KEYS : CLIENT_API_ENV_KEYS);
  const finalBaseUrl = isServer ? getServerApiBaseUrl() : getClientApiBaseUrl();

  return {
    runtime,
    env,
    apiPrefix: API_PREFIX,
    finalBaseUrl,
  };
}

export function isApiDebugEnabled() {
  const value = process.env.API_DEBUG || process.env.NEXT_PUBLIC_API_DEBUG;
  if (value === 'false' || value === '0') return false;
  return value === 'true' || value === '1';
}

// Backward-compatible export for existing imports.
// Server modules get runtime private env vars; browser modules stay client-safe.
export const API_BASE_URL =
  typeof window === 'undefined' ? getServerApiBaseUrl() : getClientApiBaseUrl();

