/**
 * Cookie Consent Service
 * Handles all API calls related to Cookie Consent tracking (CMS)
 */

import { BaseService } from './base.service';

export interface CookieConsentRecord {
  id: string;
  ipAddress: string;
  os: string | null;
  browser: string | null;
  device: string | null;
  userAgent: string | null;
  fingerprint: string | null;
  consentedAt: string;
}

export interface CookieConsentStats {
  totalConsents: number;
  todayConsents: number;
  topBrowsers: { browser: string; count: number }[];
  topOS: { os: string; count: number }[];
  topDevices: { device: string; count: number }[];
}

export interface GetCookieConsentsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
}

class CookieConsentService extends BaseService {
  /**
   * Get paginated list of cookie consents (CMS)
   */
  async getAll(params?: GetCookieConsentsParams): Promise<{
    data: CookieConsentRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.fetchWithAuth(
      this.getApiUrl(`/cms/cookie-consents${query ? `?${query}` : ''}`)
    );
  }

  /**
   * Get consent statistics (CMS)
   */
  async getStats(): Promise<{ data: CookieConsentStats }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/cookie-consents/stats'));
  }

  /**
   * Delete a single consent record (CMS)
   */
  async delete(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/cookie-consents/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Delete multiple consent records (CMS)
   */
  async deleteMultiple(ids: string[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/cookie-consents/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Export consent data (CMS)
   */
  async export(params?: { startDate?: string; endDate?: string }): Promise<{
    data: CookieConsentRecord[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    return this.fetchWithAuth(
      this.getApiUrl(`/cms/cookie-consents/export${query ? `?${query}` : ''}`)
    );
  }
}

const cookieConsentService = new CookieConsentService();
export default cookieConsentService;
