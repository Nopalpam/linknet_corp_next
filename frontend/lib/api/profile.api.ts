/**
 * Profile Management API Client
 */

import api from '../api';

export interface Profile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  status: string;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  roles: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }[];
  permissions: string[];
  twoFactorEnabled: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<Profile> => {
    const response = await api.get('/profile');
    return response.data.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (dto: UpdateProfileDto): Promise<Profile> => {
    const response = await api.put('/profile', dto);
    return response.data.data;
  },

  /**
   * Upload/Update avatar
   */
  updateAvatar: async (file: File): Promise<{ avatar: string; updatedAt: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.put('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete avatar
   */
  deleteAvatar: async (): Promise<void> => {
    await api.delete('/profile/avatar');
  },

  /**
   * Change password
   */
  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await api.put('/profile/password', dto);
  },

  /**
   * Delete account (soft delete)
   */
  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/profile', { data: { password } });
  },
};
