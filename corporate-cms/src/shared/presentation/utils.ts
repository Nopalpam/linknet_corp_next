import { DEFAULT_SECTION_INTRO, resolveIntroTextValue } from './intro';

export interface PresentationMapperOptions {
  resolveField?: (source: Record<string, any> | undefined, field: string) => string;
}

export interface NormalizedIntroData {
  as: string;
  label: string;
  title: string;
  description: string;
  align: string;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function asArray<T = Record<string, any>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function hasContent(value: unknown): boolean {
  if (value == null) return false;

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value).trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (!isPlainObject(value)) {
    return false;
  }

  if (resolveIntroTextValue(value)) {
    return true;
  }

  return Object.values(value).some((entry) => hasContent(entry));
}

export function getField(
  source: Record<string, any> | undefined,
  fields: string[],
  options?: PresentationMapperOptions,
): any {
  if (!source) return undefined;

  for (const field of fields) {
    const resolved = options?.resolveField?.(source, field);
    if (hasContent(resolved)) {
      return resolved;
    }

    const candidate = source[field];
    if (hasContent(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

export function readText(
  source: Record<string, any> | undefined,
  fields: string[],
  options?: PresentationMapperOptions,
): string {
  const value = getField(source, fields, options);
  return resolveIntroTextValue(value).trim();
}

export function normalizeIntroData(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): NormalizedIntroData {
  const introSource = {
    ...DEFAULT_SECTION_INTRO,
    ...(isPlainObject(settings.intro) ? settings.intro : {}),
    ...(isPlainObject(settings.sectionIntro) ? settings.sectionIntro : {}),
    ...(isPlainObject(settings.introData) ? settings.introData : {}),
  };

  return {
    as: readText(introSource, ['as'], options) || DEFAULT_SECTION_INTRO.as,
    label: readText(introSource, ['label'], options),
    title:
      readText(introSource, ['title'], options) ||
      readText(settings, ['title', 'intro_title'], options),
    description:
      readText(introSource, ['description', 'desc'], options) ||
      readText(settings, ['description', 'desc', 'intro_description', 'content'], options),
    align: readText(introSource, ['align'], options) || DEFAULT_SECTION_INTRO.align,
  };
}

export function normalizeCtaList(
  source: Record<string, any> | undefined,
  options?: PresentationMapperOptions,
): Array<{ id?: string; text: string; href?: string }> {
  const items = asArray<Record<string, any>>(
    getField(source, ['ctaList', 'cta_list', 'buttons', 'ctaButtons', 'cta_buttons'], options),
  );

  return items
    .map((item) => ({
      id: readText(item, ['id'], options) || undefined,
      text: readText(item, ['text', 'label', 'title', 'cta_text'], options),
      href: readText(item, ['href', 'url', 'link', 'action', 'cta_link'], options) || undefined,
    }))
    .filter((item) => item.text || item.href);
}