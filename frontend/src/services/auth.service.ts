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
    accessToken: string;
    refreshToken: string;
  };
};

export type ProfileResponse = {
  success: boolean;
  data: {
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

export type LogoutResponse = {
  success: boolean;
  message: string;
};

export type RefreshTokenResponse = {
  success: boolean;
  data: {
    accessToken: string;
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
      // Enhanced error handling for auth failures
      if (error?.message?.includes('401') || error?.code === 'TOKEN_EXPIRED' || error?.code === 'TOKEN_INVALID') {
        const authError = new Error('Session expired. Please login again.');
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
}

export const authService = new AuthService();
