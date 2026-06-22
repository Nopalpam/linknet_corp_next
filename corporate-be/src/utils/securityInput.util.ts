const FORBIDDEN_PROPERTY_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export type SortOrder = 'asc' | 'desc';

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

export const isSafeObjectKey = (key: string): boolean =>
  Boolean(key) && !FORBIDDEN_PROPERTY_KEYS.has(key);

export const assertSafeObjectKey = (key: string, label = 'Object key'): string => {
  if (!isSafeObjectKey(key)) {
    throw new Error(`${label} is not allowed`);
  }

  return key;
};

export const toNullPrototypeObject = (
  value: Record<string, unknown>,
  allowedKeys?: ReadonlySet<string>,
): Record<string, unknown> => {
  const result = Object.create(null) as Record<string, unknown>;

  for (const [key, entry] of Object.entries(value)) {
    if (!isSafeObjectKey(key) || (allowedKeys && !allowedKeys.has(key))) {
      continue;
    }

    result[key] = entry;
  }

  return result;
};

export const getSingleString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length === 1 && typeof value[0] === 'string') {
    return value[0];
  }

  return undefined;
};

export const normalizeOptionalString = (
  value: unknown,
  options: { maxLength?: number; trim?: boolean } = {},
): string | undefined => {
  const raw = getSingleString(value);
  if (raw === undefined) return undefined;

  const normalized = options.trim === false ? raw : raw.trim();
  if (!normalized) return undefined;

  const maxLength = options.maxLength || 255;
  return normalized.slice(0, maxLength);
};

export const normalizeRequiredString = (
  value: unknown,
  label: string,
  options: { maxLength?: number; trim?: boolean } = {},
): string => {
  const normalized = normalizeOptionalString(value, options);
  if (!normalized) {
    throw new Error(`${label} is required`);
  }

  return normalized;
};

export const normalizePositiveInt = (
  value: unknown,
  fallback: number,
  max: number,
): number => {
  const raw = getSingleString(value);
  const parsed = typeof value === 'number'
    ? value
    : Number.parseInt(raw || '', 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.trunc(parsed), max);
};

export const normalizeBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;

  const raw = getSingleString(value)?.trim().toLowerCase();
  if (!raw) return undefined;
  if (['true', '1', 'yes', 'enabled'].includes(raw)) return true;
  if (['false', '0', 'no', 'disabled'].includes(raw)) return false;
  return undefined;
};

export const normalizeSortOrder = (value: unknown, fallback: SortOrder = 'desc'): SortOrder =>
  getSingleString(value)?.toLowerCase() === 'asc' ? 'asc' : fallback;

export const normalizeEnum = <T extends string>(
  value: unknown,
  allowedValues: ReadonlySet<T>,
  fallback: T,
): T => {
  const raw = getSingleString(value);
  return raw && allowedValues.has(raw as T) ? raw as T : fallback;
};

export const normalizeOtpToken = (value: unknown): string | undefined => {
  const raw = normalizeOptionalString(value, { maxLength: 6 });
  return raw && /^[0-9]{6}$/.test(raw) ? raw : undefined;
};

export const normalizeRequestId = (value: unknown): string | undefined => {
  const raw = getSingleString(value)?.trim();
  if (!raw || !REQUEST_ID_PATTERN.test(raw)) {
    return undefined;
  }

  return raw;
};

const isLogSeparator = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code <= 31 || (code >= 127 && code <= 159) || char === ' ';
};

export const sanitizeLogString = (value: string, maxLength = 500): string => {
  let result = '';
  let lastWasSpace = false;

  for (const char of value) {
    if (isLogSeparator(char)) {
      if (!lastWasSpace) {
        result += ' ';
        lastWasSpace = true;
      }
      continue;
    }

    result += char;
    lastWasSpace = false;
  }

  return result.trim().slice(0, maxLength);
};

export const sanitizeForLog = (value: unknown, depth = 0): unknown => {
  if (depth > 5) return '[MAX_DEPTH]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return sanitizeLogString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Error) {
    return {
      name: sanitizeLogString(value.name),
      message: sanitizeLogString(value.message),
      stack: value.stack ? sanitizeLogString(value.stack, 2000) : undefined,
    };
  }

  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => sanitizeForLog(item, depth + 1));
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([key]) => isSafeObjectKey(key))
      .map(([key, entry]) => [sanitizeLogString(key, 100), sanitizeForLog(entry, depth + 1)]);

    return Object.assign(Object.create(null), Object.fromEntries(entries));
  }

  return sanitizeLogString(
    typeof value === 'bigint' ? value.toString() : Object.prototype.toString.call(value)
  );
};
