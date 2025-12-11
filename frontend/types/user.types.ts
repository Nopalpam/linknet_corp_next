/**
 * User Management Types
 */

export interface UserRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface UserPermission {
  id: string;
  name: string;
  slug: string;
  module: string;
}

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  roles: UserRole[];
}

export interface UserDetail {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
  permissions: UserPermission[];
  stats: {
    totalLogins: number;
    totalActivities: number;
    activeSessions: number;
  };
  recentActivities: UserActivity[];
}

export interface UserActivity {
  id: string;
  action: string;
  module: string;
  description: string | null;
  createdAt: string;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  role?: string;
  emailVerified?: boolean;
  sortBy?: 'created_at' | 'name' | 'email' | 'last_login_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserDto {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: string[];
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface BulkDeleteUsersDto {
  userIds: string[];
}

export interface UserListResponse {
  data: UserListItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
