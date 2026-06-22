/**
 * User Management DTOs
 */

export interface GetUsersQuery {
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
  username: string;
  firstName: string;
  lastName: string;
  password?: string;
  roles: string[];
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateUserDto {
  email?: string;
  username?: string;
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
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListItem {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  status: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  roles: {
    id: string;
    name: string;
    slug: string;
  }[];
}

export interface UserDetailResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  phone: string | null;
  status: string;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roles: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }[];
  permissions: {
    id: string;
    name: string;
    slug: string;
    module: string;
  }[];
  stats: {
    totalLogins: number;
    totalActivities: number;
    activeSessions: number;
  };
  recentActivities: {
    id: string;
    action: string;
    module: string;
    description: string | null;
    createdAt: Date;
  }[];
}
