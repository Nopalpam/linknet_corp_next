/**
 * Auth Service
 * Handles all authentication related API calls
 */

import { BaseService } from './base.service';

// Response types
export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    requiresMfa?: boolean;
    tempToken?: string;
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
      status: string;
      roles: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
      permissions: string[];
      mfaEnabled?: boolean;
    };
    accessToken?: string;
    refreshToken?: string;
  };
};

export type ProfileResponse = {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
      status: string;
      roles: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
      permissions: string[];
    };
  };
};

export type LogoutResponse = {
  success: boolean;
  message: string;
};

export type RefreshTokenResponse = {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

class AuthService extends BaseService {
  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const url = this.getApiUrl('/auth/login');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // Try to parse response as JSON
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', jsonError);
        throw new Error(`Server error (${response.status}): Unable to parse response`);
      }

      if (!response.ok) {
        // Log detailed error for debugging
        console.error('Login failed:', {
          status: response.status,
          statusText: response.statusText,
          data
        });

        // Handle specific error codes
        if (response.status === 429) {
          throw new Error('Too many login attempts. Please try again after 15 minutes.');
        }
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        }
        if (response.status === 403) {
          throw new Error(data.message || 'Account access denied');
        }
        if (response.status === 500) {
          throw new Error(`Server error: ${data.message || 'Internal server error. Please try again later.'}`);
        }
        throw new Error(data.message || `Login failed (${response.status}). Please try again.`);
      }

      return data;
    } catch (error) {
      // Log network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error during login:', error);
        throw new Error('Cannot connect to server. Please check your connection.');
      }
      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Logout user (invalidate current refresh token)
   */
  async logout(refreshToken: string): Promise<LogoutResponse> {
    const url = this.getApiUrl('/auth/logout');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Logout error:', error);
      // Return success even if API call fails to ensure local cleanup
      return {
        success: true,
        message: 'Logged out locally',
      };
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ProfileResponse> {
    const url = this.getApiUrl('/auth/me');
    
    try {
      const response = await this.fetchWithAuth(url, { method: 'GET' });
      return response;
    } catch (error: any) {
      // Enhanced error handling for auth failures and network errors
      if (
        error?.message?.includes('401') || 
        error?.code === 'TOKEN_EXPIRED' || 
        error?.code === 'TOKEN_INVALID' ||
        error?.message?.includes('Session expired') ||
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('terhubung ke server')
      ) {
        const authError = new Error(error?.message || 'Session expired. Please login again.');
        (authError as any).code = 'TOKEN_EXPIRED';
        throw authError;
      }
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const url = this.getApiUrl('/auth/refresh');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Token refresh failed');
    }

    return data;
  }

  /**
   * Logout all devices
   */
  async logoutAll(): Promise<LogoutResponse> {
    const url = this.getApiUrl('/auth/logout-all');
    return this.fetchWithAuth(url, { method: 'POST' });
  }

  // ===========================================
  // MFA Methods
  // ===========================================

  /**
   * Verify MFA OTP during login
   */
  async mfaVerify(token: string, tempToken: string): Promise<LoginResponse> {
    const url = this.getApiUrl('/auth/mfa/verify');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, tempToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'MFA verification failed');
    }

    return data;
  }

  /**
   * Setup MFA for current user (returns QR code)
   */
  async mfaSetup(): Promise<{
    success: boolean;
    message: string;
    data: {
      qrCode: string;
      secret: string;
      otpauthUrl: string;
    };
  }> {
    const url = this.getApiUrl('/auth/mfa/setup');
    return this.fetchWithAuth(url, { method: 'POST' });
  }

  /**
   * Enable MFA after verifying OTP
   */
  async mfaEnable(token: string): Promise<{ success: boolean; message: string }> {
    const url = this.getApiUrl('/auth/mfa/enable');
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Disable MFA
   */
  async mfaDisable(token: string): Promise<{ success: boolean; message: string }> {
    const url = this.getApiUrl('/auth/mfa/disable');
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * Get MFA status
   */
  async mfaStatus(): Promise<{
    success: boolean;
    data: {
      mfaEnabled: boolean;
      mfaGloballyEnabled: boolean;
      hasMfaSecret: boolean;
    };
  }> {
    const url = this.getApiUrl('/auth/mfa/status');
    return this.fetchWithAuth(url, { method: 'GET' });
  }
}

export const authService = new AuthService();
