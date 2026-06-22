/**
 * Users Management Service
 * Handles all API calls related to Users CRUD operations
 */

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

export interface UserRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
  roles: UserRole[];
}

export interface UserDetail extends User {
  permissions?: Array<{
    id: string;
    name: string;
    slug: string;
    module: string;
  }>;
  stats?: {
    totalLogins: number;
    totalActivities: number;
    activeSessions: number;
  };
  recentActivities?: Array<{
    id: string;
    action: string;
    module: string;
    description: string;
    createdAt: string;
  }>;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role?: string;
  emailVerified?: boolean;
  sortBy?: 'name' | 'email' | 'created_at' | 'last_login_at';
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: UserDetail;
}

export interface CreateUserDto {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  roles: string[]; // Array of role IDs
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roles?: string[]; // Array of role IDs
}

export interface BulkDeleteDto {
  userIds: string[];
}

class UsersService {
  private basePath = '/cms/users';

  /**
   * Get paginated list of users with filters
   */
  async getUsers(params?: GetUsersParams): Promise<UsersResponse> {
    const response = await api.get<UsersResponse>(this.basePath, { params });
    return response.data;
  }

  /**
   * Get user by ID with detailed information
   */
  async getUserById(id: string): Promise<UserResponse> {
    const response = await api.get<UserResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Create new user
   */
  async createUser(dto: CreateUserDto): Promise<UserResponse> {
    const response = await api.post<UserResponse>(this.basePath, dto);
    return response.data;
  }

  /**
   * Update user
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const response = await api.put<UserResponse>(`${this.basePath}/${id}`, dto);
    return response.data;
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Toggle user status
   */
  async toggleUserStatus(id: string): Promise<UserResponse> {
    const response = await api.post<UserResponse>(`${this.basePath}/${id}/toggle-status`);
    return response.data;
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(dto: BulkDeleteDto): Promise<{ success: boolean; message: string; data: { deleted: number } }> {
    const response = await api.post<{ success: boolean; message: string; data: { deleted: number } }>(`${this.basePath}/bulk-delete`, dto);
    return response.data;
  }
}

export const usersService = new UsersService();
