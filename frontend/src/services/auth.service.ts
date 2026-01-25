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
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
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
      throw new Error(data.message || 'Login failed. Please try again.');
    }

    return data;
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
    return this.fetchWithAuth(url, { method: 'GET' });
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
