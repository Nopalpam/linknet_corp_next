/**
 * Role Management Types
 */

export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string | null;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleListItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetail extends Role {
  userCount: number;
}

export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string | null;
  permissionIds: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
}

export interface PermissionsByModule {
  [module: string]: Permission[];
}

export interface GetPermissionsResponse {
  permissions: Permission[];
  grouped: PermissionsByModule;
  modules: string[];
}

export interface DeleteRoleOptions {
  transferToRoleId?: string;
}
