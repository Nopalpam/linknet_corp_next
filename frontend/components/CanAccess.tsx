'use client';

import { ReactNode } from 'react';
import { usePermission, usePermissions, useAllPermissions, useRole, useRoles } from '@/hooks/usePermission';
import { PermissionSlug, RoleSlug } from '@/lib/constants/permissions';

interface CanAccessProps {
  children: ReactNode;
  permission?: PermissionSlug | string;
  permissions?: (PermissionSlug | string)[];
  allPermissions?: (PermissionSlug | string)[];
  role?: RoleSlug | string;
  roles?: (RoleSlug | string)[];
  fallback?: ReactNode;
}

/**
 * Component to conditionally render children based on user permissions or roles
 * 
 * @example
 * // Single permission check
 * <CanAccess permission={Permission.USERS_MANAGEMENT_CREATE}>
 *   <CreateUserButton />
 * </CanAccess>
 * 
 * @example
 * // Multiple permissions check (any)
 * <CanAccess permissions={[Permission.NEWS_CREATE, Permission.NEWS_UPDATE]}>
 *   <NewsForm />
 * </CanAccess>
 * 
 * @example
 * // All permissions required
 * <CanAccess allPermissions={[Permission.USERS_MANAGEMENT_READ, Permission.USERS_MANAGEMENT_DELETE]}>
 *   <DeleteUserButton />
 * </CanAccess>
 * 
 * @example
 * // Role-based check
 * <CanAccess role={Role.ADMIN}>
 *   <AdminPanel />
 * </CanAccess>
 * 
 * @example
 * // With fallback
 * <CanAccess permission={Permission.PAGES_CREATE} fallback={<div>No access</div>}>
 *   <CreatePageButton />
 * </CanAccess>
 */
export function CanAccess({
  children,
  permission,
  permissions,
  allPermissions,
  role,
  roles,
  fallback = null,
}: CanAccessProps) {
  const hasSinglePermission = usePermission(permission || '');
  const hasAnyPermission = usePermissions(...(permissions || []));
  const hasAllPermissionsCheck = useAllPermissions(...(allPermissions || []));
  const hasSingleRole = useRole(role || '');
  const hasAnyRole = useRoles(...(roles || []));

  // Check permissions
  if (permission && !hasSinglePermission) {
    return <>{fallback}</>;
  }

  if (permissions && permissions.length > 0 && !hasAnyPermission) {
    return <>{fallback}</>;
  }

  if (allPermissions && allPermissions.length > 0 && !hasAllPermissionsCheck) {
    return <>{fallback}</>;
  }

  // Check roles
  if (role && !hasSingleRole) {
    return <>{fallback}</>;
  }

  if (roles && roles.length > 0 && !hasAnyRole) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Higher-order component to wrap components with permission check
 * 
 * @example
 * const ProtectedComponent = withPermission(MyComponent, Permission.USERS_MANAGEMENT_READ);
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: PermissionSlug | string,
  fallback?: ReactNode
) {
  return function PermissionWrapper(props: P) {
    return (
      <CanAccess permission={permission} fallback={fallback}>
        <Component {...props} />
      </CanAccess>
    );
  };
}

/**
 * Higher-order component to wrap components with role check
 * 
 * @example
 * const AdminOnlyComponent = withRole(MyComponent, Role.ADMIN);
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  role: RoleSlug | string,
  fallback?: ReactNode
) {
  return function RoleWrapper(props: P) {
    return (
      <CanAccess role={role} fallback={fallback}>
        <Component {...props} />
      </CanAccess>
    );
  };
}
