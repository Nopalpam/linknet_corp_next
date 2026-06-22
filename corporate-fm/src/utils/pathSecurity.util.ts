const MAX_STORAGE_PATH_LENGTH = 1024;
const SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const normalizeSlashes = (value: string): string => {
  const segments: string[] = [];
  let current = '';

  for (const char of value.trim()) {
    const normalizedChar = char === '\\' ? '/' : char;
    if (normalizedChar === '/') {
      if (current) {
        segments.push(current);
        current = '';
      }
      continue;
    }

    current += normalizedChar;
  }

  if (current) {
    segments.push(current);
  }

  return segments.join('/');
};

const assertSafeSegments = (segments: string[], label: string): void => {
  if (segments.length === 0) {
    throw new Error(`${label} is required`);
  }

  for (const segment of segments) {
    if (
      !segment ||
      segment === '.' ||
      segment === '..' ||
      segment.includes(':') ||
      !SAFE_SEGMENT_PATTERN.test(segment)
    ) {
      throw new Error(`${label} contains an unsafe path segment`);
    }
  }
};

export const normalizeStorageFolder = (
  value: string | null | undefined,
  fallback = 'uploads'
): string => {
  const raw = typeof value === 'string' && value.trim() ? value : fallback;
  const normalized = normalizeSlashes(raw);

  if (normalized.length > MAX_STORAGE_PATH_LENGTH) {
    throw new Error('Storage folder is too long');
  }

  const segments = normalized.split('/').filter(Boolean);
  assertSafeSegments(segments, 'Storage folder');
  return segments.join('/');
};

export const normalizeStorageKey = (value: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Storage key is required');
  }

  const normalized = normalizeSlashes(value);
  if (normalized.length > MAX_STORAGE_PATH_LENGTH) {
    throw new Error('Storage key is too long');
  }

  const segments = normalized.split('/').filter(Boolean);
  assertSafeSegments(segments, 'Storage key');
  return segments.join('/');
};
