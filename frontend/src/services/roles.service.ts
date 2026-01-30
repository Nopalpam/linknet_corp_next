import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const api = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

export interface PermissionsResponse {
  success: boolean;
  data: {
    permissions: Permission[];
    grouped: Record<string, Permission[]>;
    modules: string[];
  };
}

export interface RolesResponse {
  success: boolean;
  data: Role[];
}

export interface RoleResponse {
  success: boolean;
  data: Role;
}

class RolesService {
  private basePath = '/cms/roles';

  /**
   * Get all roles
   */
  async getRoles(): Promise<RolesResponse> {
    const response = await api.get<RolesResponse>(this.basePath);
    return response.data;
  }

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<RoleResponse> {
    const response = await api.get<RoleResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Get all permissions grouped by module
   */
  async getPermissions(): Promise<PermissionsResponse> {
    const response = await api.get<PermissionsResponse>(`${this.basePath}/permissions`);
    return response.data;
  }

  /**
   * Create new role
   */
  async createRole(dto: CreateRoleDto): Promise<RoleResponse> {
    const response = await api.post<RoleResponse>(this.basePath, dto);
    return response.data;
  }

  /**
   * Update role
   */
  async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleResponse> {
    const response = await api.put<RoleResponse>(`${this.basePath}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`${this.basePath}/${id}`);
    return response.data;
  }
}

export const rolesService = new RolesService();
