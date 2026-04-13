// Centralized i18n configuration
export const locales = ['en', 'id'] as const;
export type Locale = (typeof locales)[number];

// Fallback default locale when CMS API is unavailable
export const fallbackDefaultLocale: Locale = 'en';
