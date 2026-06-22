import axios from 'axios';
import { refreshAuthSession } from './base.service';
import {
  createSessionExpiredError,
  dispatchSessionExpired,
  isUnauthorizedOrExpired,
} from "@/lib/sessionExpired";
import { normalizeApiError } from "@/lib/apiError";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev-be.lncorp.local';
const API_PREFIX = '/api/v1';
const CSRF_TOKEN_KEY = 'csrf_token';

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(nameEQ)) return trimmed.substring(nameEQ.length);
  }

  return null;
};

const api = axios.create({
  baseURL: `${API_URL}${API_PREFIX}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const csrfToken = getCookie(CSRF_TOKEN_KEY);
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const originalRequest = error.config;

    if (status && isUnauthorizedOrExpired(status, data)) {
      if (originalRequest && !(originalRequest as any)._retry) {
        try {
          (originalRequest as any)._retry = true;
          await refreshAuthSession();
          return api(originalRequest);
        } catch {
          // Fall through to the session modal dispatch below.
        }
      }

      dispatchSessionExpired({
        status,
        error: data,
        url: error.config?.url,
      });
      return Promise.reject(createSessionExpiredError(data));
    }

    return Promise.reject(normalizeApiError(error));
  }
);

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
