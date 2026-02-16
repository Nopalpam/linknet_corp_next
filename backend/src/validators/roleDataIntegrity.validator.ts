/**
 * Enhanced Role Service Data Integrity Validation
 * 
 * Control: MBSS2.0-ApplicationCoding-005
 * Purpose: Validate role and permission data integrity during processing
 */

import {
  validateNoDuplicates,
  validateCollectionSize,
  DataIntegrityError
} from '../utils/dataIntegrity.util';

/**
 * Validate role slug uniqueness
 */
export async function validateRoleSlugUnique(
  slug: string,
  excludeRoleId: string | null,
  prisma: any
): Promise<void> {
  const existing = await prisma.role.findFirst({
    where: {
      slug: slug.toLowerCase(),
      deletedAt: null,
      ...(excludeRoleId && { id: { not: excludeRoleId } })
    }
  });

  if (existing) {
    throw new DataIntegrityError(
      'Role slug already exists',
      { slug, existingRoleId: existing.id }
    );
  }
}

/**
 * Validate role is not a system role
 */
export async function validateNotSystemRole(
  roleId: string,
  prisma: any
): Promise<void> {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null
    }
  });

  if (!role) {
    throw new DataIntegrityError('Role not found', { roleId });
  }

  if (role.isSystem) {
    throw new DataIntegrityError(
      'Cannot modify or delete system role',
      { roleId, roleName: role.name, reason: 'Protected system role' }
    );
  }
}

/**
 * Validate permissions exist and are valid
 */
export async function validatePermissions(
  permissionIds: string[],
  prisma: any
): Promise<void> {
  if (permissionIds.length === 0) {
    return; // Optional permissions
  }

  // Validate collection size
  validateCollectionSize(permissionIds, 'permissions', 0, 100);

  // Validate no duplicates
  validateNoDuplicates(permissionIds, 'permissions');

  // Validate all permissions exist
  const permissions = await prisma.permission.findMany({
    where: {
      id: { in: permissionIds }
    },
    select: { id: true }
  });

  if (permissions.length !== permissionIds.length) {
    const foundIds = permissions.map((p: any) => p.id);
    const missingIds = permissionIds.filter(id => !foundIds.includes(id));
    
    throw new DataIntegrityError(
      'One or more permissions not found',
      { missingPermissionIds: missingIds }
    );
  }
}

/**
 * Validate role can be deleted (no active users)
 */
export async function validateRoleDeletion(
  roleId: string,
  prisma: any
): Promise<void> {
  // Validate not a system role
  await validateNotSystemRole(roleId, prisma);

  // Check for users with this role
  const userCount = await prisma.userRole.count({
    where: {
      roleId,
      user: {
        deletedAt: null
      }
    }
  });

  if (userCount > 0) {
    throw new DataIntegrityError(
      `Cannot delete role: ${userCount} active users still have this role`,
      {
        roleId,
        activeUserCount: userCount,
        recommendation: 'Remove role from all users before deleting'
      }
    );
  }
}

/**
 * Validate user-role assignment
 */
export async function validateUserRoleAssignment(
  userId: string,
  roleId: string,
  prisma: any
): Promise<void> {
  // Validate user exists
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    }
  });

  if (!user) {
    throw new DataIntegrityError('User not found', { userId });
  }

  // Validate role exists
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null
    }
  });

  if (!role) {
    throw new DataIntegrityError('Role not found', { roleId });
  }

  // Check if assignment already exists
  const existing = await prisma.userRole.findFirst({
    where: {
      userId,
      roleId
    }
  });

  if (existing) {
    throw new DataIntegrityError(
      'User already has this role assigned',
      { userId, roleId }
    );
  }
}

/**
 * Validate role update consistency
 */
export async function validateRoleUpdate(
  roleId: string,
  updateData: any,
  prisma: any
): Promise<void> {
  // Validate role exists and is not system role
  await validateNotSystemRole(roleId, prisma);

  const existingRole = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null
    }
  });

  if (!existingRole) {
    throw new DataIntegrityError('Role not found', { roleId });
  }

  // If changing slug, validate uniqueness
  if (updateData.slug && updateData.slug !== existingRole.slug) {
    await validateRoleSlugUnique(updateData.slug, roleId, prisma);
  }

  // If updating permissions, validate
  if (updateData.permissions) {
    await validatePermissions(updateData.permissions, prisma);
  }
}

/**
 * Validate permission consistency
 */
export function validatePermissionData(permissionData: any): void {
  const requiredFields = ['name', 'slug', 'module'];
  const missing = requiredFields.filter(field => !permissionData[field]);

  if (missing.length > 0) {
    throw new DataIntegrityError(
      'Missing required permission fields',
      { missingFields: missing }
    );
  }

  // Validate slug format (lowercase, alphanumeric with dots, underscores, hyphens)
  const slugPattern = /^[a-z0-9._-]+$/;
  if (!slugPattern.test(permissionData.slug)) {
    throw new DataIntegrityError(
      'Permission slug must be lowercase alphanumeric with dots, underscores, or hyphens only',
      { slug: permissionData.slug, pattern: slugPattern.toString() }
    );
  }
}

/**
 * Validate bulk role assignment
 */
export async function validateBulkRoleAssignment(
  userIds: string[],
  roleIds: string[],
  prisma: any
): Promise<void> {
  // Validate collection sizes
  validateCollectionSize(userIds, 'userIds', 1, 100);
  validateCollectionSize(roleIds, 'roleIds', 1, 10);

  // Validate no duplicates
  validateNoDuplicates(userIds, 'userIds');
  validateNoDuplicates(roleIds, 'roleIds');

  // Validate all users exist
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      deletedAt: null
    },
    select: { id: true }
  });

  if (users.length !== userIds.length) {
    const foundIds = users.map((u: any) => u.id);
    const missingIds = userIds.filter(id => !foundIds.includes(id));
    
    throw new DataIntegrityError(
      'One or more users not found',
      { missingUserIds: missingIds }
    );
  }

  // Validate all roles exist
  await validatePermissions(roleIds, prisma);
}
