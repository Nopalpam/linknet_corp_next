/**
 * Role Management API Client
 */

import api from '../api';
import {
  Role,
  RoleDetail,
  CreateRoleDto,
  UpdateRoleDto,
  GetPermissionsResponse,
} from '@/types/role.types';

export const roleApi = {
  /**
   * Get all roles with permissions
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/cms/roles');
    return response.data.data;
  },

  /**
   * Get role by ID
   */
  getRoleById: async (id: string): Promise<RoleDetail> => {
    const response = await api.get(`/cms/roles/${id}`);
    return response.data.data;
  },

  /**
   * Create new role
   */
  createRole: async (dto: CreateRoleDto): Promise<Role> => {
    const response = await api.post('/cms/roles', dto);
    return response.data.data;
  },

  /**
   * Update role
   */
  updateRole: async (id: string, dto: UpdateRoleDto): Promise<Role> => {
    const response = await api.put(`/cms/roles/${id}`, dto);
    return response.data.data;
  },

  /**
   * Delete role
   */
  deleteRole: async (id: string): Promise<void> => {
    await api.delete(`/cms/roles/${id}`);
  },

  /**
   * Get all permissions grouped by module
   */
  getPermissions: async (): Promise<GetPermissionsResponse> => {
    const response = await api.get('/cms/roles/permissions');
    return response.data.data;
  },
};
