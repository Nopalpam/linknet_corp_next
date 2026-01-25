/**
 * Base Service
 * Provides common functionality for all service classes
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1';

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Cookie helper - get cookie value
const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

// Cookie helper - set cookie value
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof window === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Cookie helper - delete cookie
const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// ✅ CRITICAL: Global force logout handler
let isForceLogoutInProgress = false;

const forceLogout = () => {
  if (isForceLogoutInProgress) return;
  isForceLogoutInProgress = true;

  console.error('🔴 FORCE LOGOUT: Token expired or invalid');

  if (typeof window !== 'undefined') {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_last_refresh');
    deleteCookie(AUTH_TOKEN_KEY);

    // Redirect to login immediately
    window.location.href = '/login';
  }
};

export class BaseService {
  protected async fetchWithAuth(url: string, options: RequestInit = {}) {
    // Get token from localStorage or cookie (fallback)
    let token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    if (!token) {
      token = getCookie(AUTH_TOKEN_KEY);
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // ✅ CRITICAL: Check for TOKEN_EXPIRED code first
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      
      // Check for TOKEN_EXPIRED code
      if (errorData.code === 'TOKEN_EXPIRED' || response.status === 401) {
        console.error('🔴 Token expired detected:', errorData);
        
        // Don't try refresh if it's explicitly TOKEN_EXPIRED
        if (errorData.code === 'TOKEN_EXPIRED') {
          forceLogout();
          throw new Error('Session expired. Please login again.');
        }
        
        // For 401 without TOKEN_EXPIRED, try refresh once
        const refreshed = await this.tryRefreshToken();
        
        if (refreshed) {
          // Retry the original request with new token
          const newToken = localStorage.getItem(AUTH_TOKEN_KEY);
          const retryHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            ...(newToken && { Authorization: `Bearer ${newToken}` }),
            ...options.headers,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          if (!retryResponse.ok) {
            const retryError = await retryResponse.json().catch(() => ({ message: 'An error occurred' }));
            
            // If still unauthorized after refresh, force logout
            if (retryResponse.status === 401 || retryError.code === 'TOKEN_EXPIRED') {
              forceLogout();
              throw new Error('Session expired. Please login again.');
            }
            
            throw new Error(retryError.message || `HTTP error! status: ${retryResponse.status}`);
          }

          return retryResponse.json();
        } else {
          // Refresh failed, force logout
          forceLogout();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      // Handle other errors with user-friendly messages
      let errorMessage = errorData.message || 'An error occurred';
      
      switch (response.status) {
        case 400:
          errorMessage = errorData.message || 'Data yang dikirim tidak valid';
          break;
        case 401:
          errorMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
          break;
        case 403:
          errorMessage = 'Anda tidak memiliki akses untuk melakukan tindakan ini';
          break;
        case 404:
          errorMessage = errorData.message || 'Data tidak ditemukan';
          break;
        case 409:
          errorMessage = errorData.message || 'Data sudah ada';
          break;
        case 422:
          errorMessage = errorData.message || 'Validasi gagal';
          break;
        case 429:
          errorMessage = 'Terlalu banyak permintaan. Silakan coba lagi nanti.';
          break;
        case 500:
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi.';
          break;
        case 503:
          errorMessage = 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.';
          break;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  protected getApiUrl(endpoint: string): string {
    return `${API_URL}${API_PREFIX}${endpoint}`;
  }

  /**
   * Get authentication token (for FormData uploads)
   */
  protected getToken(): string | null {
    if (typeof window === 'undefined') return null;
    let token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      token = getCookie(AUTH_TOKEN_KEY);
    }
    return token;
  }

  /**
   * Try to refresh the access token using refresh token
   */
  private async tryRefreshToken(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const url = this.getApiUrl('/auth/refresh');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      
      if (data.success && data.data.accessToken) {
        // ✅ CRITICAL: Update BOTH localStorage AND cookie
        localStorage.setItem(AUTH_TOKEN_KEY, data.data.accessToken);
        setCookie(AUTH_TOKEN_KEY, data.data.accessToken, 7);
        console.log('✅ Token refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('auth_user');
      // ✅ CRITICAL: Also clear cookies
      deleteCookie(AUTH_TOKEN_KEY);
    }
  }
}
