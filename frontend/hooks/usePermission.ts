'use client';

import { useAuth } from '@/lib/auth-context';
import { PermissionSlug, RoleSlug } from '@/lib/constants/permissions';

/**
 * Hook to check if the current user has a specific permission
 * @param permission - Permission slug to check
 * @returns boolean indicating if user has the permission
 * 
 * @example
 * const canCreateUser = usePermission(Permission.USERS_MANAGEMENT_CREATE);
 * if (canCreateUser) {
 *   // Show create user button
 * }
 */
export function usePermission(permission: PermissionSlug | string): boolean {
  const { user } = useAuth();

  if (!user || !user.permissions) {
    return false;
  }

  return user.permissions.includes(permission);
}

/**
 * Hook to check if user has any of the specified permissions
 * @param permissions - Array of permission slugs to check
 * @returns boolean indicating if user has at least one permission
 * 
 * @example
 * const canManageUsers = usePermissions([
 *   Permission.USERS_MANAGEMENT_CREATE,
 *   Permission.USERS_MANAGEMENT_UPDATE
 * ]);
 */
export function usePermissions(...permissions: (PermissionSlug | string)[]): boolean {
  const { user } = useAuth();

  if (!user || !user.permissions || permissions.length === 0) {
    return false;
  }

  return permissions.some((permission) => user.permissions.includes(permission));
}

/**
 * Hook to check if user has all of the specified permissions
 * @param permissions - Array of permission slugs to check
 * @returns boolean indicating if user has all permissions
 * 
 * @example
 * const canFullyManageUsers = useAllPermissions([
 *   Permission.USERS_MANAGEMENT_READ,
 *   Permission.USERS_MANAGEMENT_UPDATE,
 *   Permission.USERS_MANAGEMENT_DELETE
 * ]);
 */
export function useAllPermissions(...permissions: (PermissionSlug | string)[]): boolean {
  const { user } = useAuth();

  if (!user || !user.permissions || permissions.length === 0) {
    return false;
  }

  return permissions.every((permission) => user.permissions.includes(permission));
}

/**
 * Hook to check if the current user has a specific role
 * @param role - Role slug to check
 * @returns boolean indicating if user has the role
 * 
 * @example
 * const isAdmin = useRole(Role.ADMIN);
 */
export function useRole(role: RoleSlug | string): boolean {
  const { user } = useAuth();

  if (!user || !user.roles) {
    return false;
  }

  return user.roles.some((r) => r.slug === role);
}

/**
 * Hook to check if user has any of the specified roles
 * @param roles - Array of role slugs to check
 * @returns boolean indicating if user has at least one role
 * 
 * @example
 * const isAdminOrEditor = useRoles([Role.ADMIN, Role.EDITOR]);
 */
export function useRoles(...roles: (RoleSlug | string)[]): boolean {
  const { user } = useAuth();

  if (!user || !user.roles || roles.length === 0) {
    return false;
  }

  return roles.some((role) => user.roles.some((r) => r.slug === role));
}

/**
 * Hook to get all user permissions
 * @returns Array of permission slugs
 */
export function useUserPermissions(): string[] {
  const { user } = useAuth();
  return user?.permissions || [];
}

/**
 * Hook to get all user roles
 * @returns Array of role objects
 */
export function useUserRoles(): Array<{ id: string; name: string; slug: string }> {
  const { user } = useAuth();
  return user?.roles || [];
}
