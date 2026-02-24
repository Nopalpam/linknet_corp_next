// ===========================================
// API Configuration
// ===========================================

/**
 * Base URL for the backend Express.js API.
 * - Server-side: uses API_INTERNAL_URL (private, not exposed to browser)
 * - Client-side: uses NEXT_PUBLIC_API_BASE_URL
 */
export const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"
    : process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

/**
 * Site name used across the website
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "LinkNet";

/**
 * Public site URL
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

/**
 * Default revalidation time in seconds for ISR (Incremental Static Regeneration)
 */
export const DEFAULT_REVALIDATE = 60; // 1 minute
