import path from 'path';

const MAX_STORAGE_PATH_LENGTH = 1024;
const SAFE_SEGMENT_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

const normalizeSlashes = (value: string): string => {
  const segments: string[] = [];
  let current = '';

  for (const char of value.trim()) {
    const normalized = char === '\\' ? '/' : char;

    if (normalized === '/') {
      if (current) {
        segments.push(current);
        current = '';
      }
      continue;
    }

    current += normalized;
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
  fallback = 'uploads',
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

export const normalizeStorageFilename = (value: string): string => {
  const filename = path.basename(normalizeSlashes(value));
  assertSafeSegments([filename], 'Storage filename');
  return filename;
};

export const resolveWithinUploadDir = (uploadDir: string, key: string): string => {
  const normalizedKey = normalizeStorageKey(key);
  const root = path.resolve(uploadDir);
  const target = path.resolve(root, normalizedKey);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Storage path escapes the upload directory');
  }

  return target;
};
