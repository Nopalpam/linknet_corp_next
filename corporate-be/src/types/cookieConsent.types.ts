/**
 * Cookie Consent Types
 * Type definitions for cookie consent tracking
 */

export interface CookieConsentData {
  ipAddress: string;
  os: string | null;
  browser: string | null;
  device: string | null;
  userAgent: string | null;
  fingerprint: string | null;
}

export interface CookieConsentRecord {
  id: string;
  ipAddress: string;
  os: string | null;
  browser: string | null;
  device: string | null;
  userAgent: string | null;
  fingerprint: string | null;
  consentedAt: Date;
}

export interface CookieConsentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

export interface CookieConsentPaginatedResponse {
  data: CookieConsentRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface CookieConsentStatsResponse {
  totalConsents: number;
  todayConsents: number;
  topBrowsers: { browser: string; count: number }[];
  topOS: { os: string; count: number }[];
  topDevices: { device: string; count: number }[];
}
