/**
 * Internationalization Utility
 * 
 * Handles multilingual values from component_data JSON.
 * Components store text as { en: "English", id: "Indonesian" }.
 * This utility extracts the correct locale value.
 */

import type { MultilingualValue } from '@/types';

/** Default locale used for the public website */
export const DEFAULT_LOCALE = 'id';

/** Supported locales */
export type Locale = 'en' | 'id';

/**
 * Check if a value is a multilingual object.
 */
export function isMultilingual(value: any): value is MultilingualValue {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    ('en' in value || 'id' in value)
  );
}

/**
 * Extract localized string from a multilingual value.
 * Falls back to 'en' if the requested locale is missing.
 * Returns the value as-is if it's already a string.
 */
export function t(value: any, locale: Locale = DEFAULT_LOCALE): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (isMultilingual(value)) {
    return value[locale] || value.en || value.id || '';
  }
  return String(value);
}

/**
 * Get the current locale from cookies (server-side).
 * Falls back to DEFAULT_LOCALE.
 */
export function getLocaleFromCookies(cookieHeader?: string): Locale {
  if (!cookieHeader) return DEFAULT_LOCALE;
  const match = cookieHeader.match(/(?:^|;\s*)locale=(\w+)/);
  if (match && (match[1] === 'en' || match[1] === 'id')) {
    return match[1] as Locale;
  }
  return DEFAULT_LOCALE;
}
