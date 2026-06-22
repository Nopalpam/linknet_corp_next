/**
 * Forms API Service — client-side utilities
 *
 * Handles fetching form definitions and submitting form data
 * via the public forms API endpoints.
 *
 * Endpoints:
 *   GET  /api/v1/forms/:businessUnit/:slug
 *   POST /api/v1/forms/:businessUnit/:slug/submissions
 */

import { API_BASE_URL } from './apiBaseUrl';

/**
 * Fetch a public form module definition by businessUnit + slug.
 * Returns the module with its steps, fields (with options), rules, and
 * responseConfigs.
 *
 * @param {string} businessUnit  - 'enterprise' | 'fiber' | 'media'
 * @param {string} slug          - e.g. 'enterprise-consultation'
 * @param {AbortSignal} [signal] - Optional abort signal for cleanup
 * @returns {Promise<object>}    - The form module data object
 */
export async function fetchFormModule(businessUnit, slug, signal) {
  const res = await fetch(
    `${API_BASE_URL}/forms/${encodeURIComponent(businessUnit)}/${encodeURIComponent(slug)}`,
    {
      cache: 'no-store',
      signal,
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch form module: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Fetch active public form modules by business unit.
 *
 * @param {string} businessUnit
 * @param {AbortSignal} [signal]
 * @returns {Promise<object[]>}
 */
export async function fetchFormModules(businessUnit, signal) {
  const res = await fetch(
    `${API_BASE_URL}/forms/${encodeURIComponent(businessUnit)}`,
    {
      cache: 'no-store',
      signal,
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch form modules: ${res.status}`);
  }

  const json = await res.json();
  return json.data || [];
}

/**
 * Submit a form module response.
 *
 * @param {string} businessUnit  - 'enterprise' | 'fiber' | 'media'
 * @param {string} slug          - e.g. 'enterprise-consultation'
 * @param {{
 *   locale?: string;
 *   requestId?: string;
 *   sessionId?: string;
 *   sourcePath?: string;
 *   values: Record<string, unknown>;
 *   groups?: Array<{ groupKey: string; sortOrder?: number; label?: string; values: Record<string, unknown> }>;
 *   files?: Array<{ fieldPath: string; fileId?: string; url?: string; originalName?: string; mimeType?: string; size?: number }>;
 *   responseContext?: unknown;
 * }} payload
 * @returns {Promise<{ submission: object|null; response: object|null; persisted: boolean }>}
 */
export async function submitFormModule(businessUnit, slug, payload) {
  const res = await fetch(
    `${API_BASE_URL}/forms/${encodeURIComponent(businessUnit)}/${encodeURIComponent(slug)}/submissions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Form submission failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Submit Enterprise Page Builder forms through the required endpoint.
 *
 * @param {string} formType
 * @param {{
 *   fields: Record<string, unknown>;
 *   context?: { product?: string|null; promo?: string|null; source?: string|null; url?: string|null };
 *   locale?: string;
 *   groups?: Array<object>;
 *   files?: Array<object>;
 *   requestId?: string;
 *   sessionId?: string;
 *   responseContext?: unknown;
 * }} payload
 */
export async function submitEnterpriseForm(formType, payload) {
  const res = await fetch('/api/form-enterprise/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      form_type: formType,
      fields: payload.fields || {},
      context: payload.context,
      locale: payload.locale,
      groups: payload.groups || [],
      files: payload.files || [],
      requestId: payload.requestId,
      sessionId: payload.sessionId,
      responseContext: payload.responseContext,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Enterprise form submission failed: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

/**
 * Build a redirect URL from a form response config resolved by the backend.
 *
 * @param {{ path: string; query?: Record<string, unknown> | null }} response
 * @returns {string}
 */
export function buildRedirectUrl(response) {
  if (!response?.path) return null;

  const { path, query } = response;

  if (
    query &&
    typeof query === 'object' &&
    !Array.isArray(query) &&
    Object.keys(query).length > 0
  ) {
    const qs = new URLSearchParams(
      Object.entries(query).map(([k, v]) => [k, v == null ? '' : String(v)]),
    );
    return `${path}?${qs.toString()}`;
  }

  return path;
}
