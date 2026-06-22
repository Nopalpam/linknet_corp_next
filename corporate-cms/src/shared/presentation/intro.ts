export type LocalizedTextValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>;

export interface SectionIntroData {
  as: string;
  label: Record<string, string>;
  title: Record<string, string>;
  description: Record<string, string>;
  align: string;
}

export const DEFAULT_SECTION_INTRO: SectionIntroData = {
  as: 'h2',
  label: { en: '', id: '' },
  title: { en: '', id: '' },
  description: { en: '', id: '' },
  align: 'left',
};

function asPlainObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function resolveIntroTextValue(value: LocalizedTextValue): string {
  if (value == null) return '';

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  const objectValue = asPlainObject(value);
  if (!objectValue) return '';

  const prioritizedKeys = ['id', 'en', 'text', 'label', 'title', 'name', 'value', 'description', 'content'];
  for (const key of prioritizedKeys) {
    const candidate = objectValue[key];
    if (
      typeof candidate === 'string' ||
      typeof candidate === 'number' ||
      typeof candidate === 'boolean'
    ) {
      const normalized = String(candidate).trim();
      if (normalized) return normalized;
    }
  }

  for (const candidate of Object.values(objectValue)) {
    if (
      typeof candidate === 'string' ||
      typeof candidate === 'number' ||
      typeof candidate === 'boolean'
    ) {
      const normalized = String(candidate).trim();
      if (normalized) return normalized;
    }
  }

  return '';
}