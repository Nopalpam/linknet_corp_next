/**
 * Users Management Service
 * Handles all API calls related to Users CRUD operations
 */

import { BaseService } from './base.service';

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  roleId: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  roleId?: string;
  isActive?: boolean;
}

class UsersService extends BaseService {
  /**
   * Get all users
   */
  async getAllUsers(): Promise<{ data: User[] }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/users'));
  }

  /**
   * Get single user by ID
   */
  async getUserById(id: string): Promise<{ data: User }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/users/${id}`));
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<{ data: User; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/users'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing user
   */
  async updateUser(id: string, data: UpdateUserData): Promise<{ data: User; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/users/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/users/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Activate user
   */
  async activateUser(id: string): Promise<{ data: User; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/users/${id}/activate`), {
      method: 'POST',
    });
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<{ data: User; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/users/${id}/deactivate`), {
      method: 'POST',
    });
  }
}

export const usersService = new UsersService();
