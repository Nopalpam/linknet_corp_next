/**
 * Profile Service
 * Handles all API calls related to User Profile operations
 */

import { BaseService } from './base.service';
import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";
import { normalizeBackendAssetUrl } from "@/lib/backendAssetUrl";

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string | null;
  phone: string | null;
  status: string;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  roles: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
  }>;
  permissions: string[];
  twoFactorEnabled?: boolean;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  currentPassword?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class ProfileService extends BaseService {
  /**
   * Normalize avatar URL to use backend server
   */
  private normalizeAvatarUrl(avatar: string | null): string | null {
    if (!avatar) return null;
    return normalizeBackendAssetUrl(avatar);
  }

  /**
   * Process profile data to normalize avatar URL
   */
  private processProfileData(data: UserProfile): UserProfile {
    return {
      ...data,
      avatar: this.normalizeAvatarUrl(data.avatar),
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ data: UserProfile }> {
    const response = await this.fetchWithAuth(this.getApiUrl('/profile'));
    return {
      ...response,
      data: this.processProfileData(response.data),
    };
  }

  /**
   * Update profile information
   */
  async updateProfile(data: UpdateProfileData): Promise<{ data: UserProfile; message: string }> {
    const response = await this.fetchWithAuth(this.getApiUrl('/profile'), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return {
      ...response,
      data: this.processProfileData(response.data),
    };
  }

  /**
   * Upload avatar
   */
  async updateAvatar(file: File): Promise<{ data: Pick<UserProfile, "avatar"> & { updatedAt?: string }; message: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    // Get token from localStorage or cookie (fallback)
    let token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token && typeof window !== 'undefined') {
      const nameEQ = 'auth_token=';
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          token = c.substring(nameEQ.length, c.length);
          break;
        }
      }
    }
    const csrfToken = typeof window !== 'undefined'
      ? document.cookie
          .split(';')
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith('csrf_token='))
          ?.substring('csrf_token='.length)
      : null;
    
    const response = await fetch(this.getApiUrl('/profile/avatar'), {
      method: 'PUT',
      credentials: 'include',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      if (isUnauthorizedOrExpired(response.status, error)) {
        dispatchSessionExpired({ status: response.status, error, url: this.getApiUrl('/profile/avatar') });
        throw createSessionExpiredError(error);
      }

      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      ...result,
      data: {
        ...result.data,
        avatar: this.normalizeAvatarUrl(result.data?.avatar || null),
      },
    };
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/profile/avatar'), {
      method: 'DELETE',
    });
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/profile/password'), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/profile'), {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    });
  }
}

export const profileService = new ProfileService();
