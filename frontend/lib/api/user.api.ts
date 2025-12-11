/**
 * User Management API Client
 */

import api from '../api';
import {
  UserListResponse,
  UserDetail,
  GetUsersParams,
  CreateUserDto,
  UpdateUserDto,
  BulkDeleteUsersDto,
} from '@/types/user.types';

export const userApi = {
  /**
   * Get paginated list of users
   */
  getUsers: async (params?: GetUsersParams): Promise<UserListResponse> => {
    const response = await api.get('/cms/users', { params });
    return {
      data: response.data.data,
      pagination: response.data.pagination,
    };
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserDetail> => {
    const response = await api.get(`/cms/users/${id}`);
    return response.data.data;
  },

  /**
   * Create new user
   */
  createUser: async (dto: CreateUserDto): Promise<UserDetail> => {
    const response = await api.post('/cms/users', dto);
    return response.data.data;
  },

  /**
   * Update user
   */
  updateUser: async (id: string, dto: UpdateUserDto): Promise<UserDetail> => {
    const response = await api.put(`/cms/users/${id}`, dto);
    return response.data.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/cms/users/${id}`);
  },

  /**
   * Toggle user status
   */
  toggleUserStatus: async (id: string): Promise<UserDetail> => {
    const response = await api.post(`/cms/users/${id}/toggle-status`);
    return response.data.data;
  },

  /**
   * Bulk delete users
   */
  bulkDeleteUsers: async (dto: BulkDeleteUsersDto): Promise<{ deleted: number }> => {
    const response = await api.post('/cms/users/bulk-delete', dto);
    return response.data.data;
  },
};
