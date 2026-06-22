/**
 * Bundled GA4 fallback credentials.
 *
 * Used only when runtime environment variables are missing or invalid.
 * Keep these values out of logs and API responses.
 */
const bundledServiceAccount = {};

export const GA4_BUNDLED_FALLBACK_ENV = {
  GA4_PROPERTY_ID: '201056537',
  GOOGLE_SERVICE_ACCOUNT_JSON: JSON.stringify(bundledServiceAccount),
} as const;
