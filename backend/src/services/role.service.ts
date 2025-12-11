import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import { invalidateRoleCache } from '../utils/rbac';

const prisma = new PrismaClient();

/**
 * Get all roles with permissions and user count
 */
export const getAllRoles = async () => {
  return await prisma.role.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userRoles: true,
        },
      },
    },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });
};

/**
 * Get single role by ID with permissions
 */
export const getRoleById = async (roleId: string) => {
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!role) {
    throw new AppError('Role not found', 404, 'NOT_FOUND');
  }

  return role;
};

/**
 * Create new role with permissions
 */
export const createNewRole = async (
  name: string,
  slug: string,
  description: string | null,
  permissionIds: string[]
) => {
  // Check if role with same slug exists
  const existingRole = await prisma.role.findFirst({
    where: {
      slug,
      deletedAt: null,
    },
  });

  if (existingRole) {
    throw new AppError('Role with this slug already exists', 409, 'DUPLICATE_ENTRY');
  }

  // Create role in transaction with permissions
  const role = await prisma.$transaction(async (tx) => {
    // Create role
    const newRole = await tx.role.create({
      data: {
        name,
        slug,
        description,
        isSystem: false,
      },
    });

    // Assign permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: newRole.id,
          permissionId,
        })),
      });
    }

    // Fetch role with permissions
    return await tx.role.findUnique({
      where: { id: newRole.id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  });

  return role;
};

/**
 * Update role with permissions
 */
export const updateExistingRole = async (
  roleId: string,
  name?: string,
  description?: string | null,
  permissionIds?: string[]
) => {
  // Check if role exists
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
    },
  });

  if (!role) {
    throw new AppError('Role not found', 404, 'NOT_FOUND');
  }

  // Block if system role
  if (role.isSystem) {
    throw new AppError('System roles cannot be edited', 403, 'FORBIDDEN');
  }

  // Update role in transaction
  const updatedRole = await prisma.$transaction(async (tx) => {
    // Update role
    await tx.role.update({
      where: { id: roleId },
      data: {
        name: name || role.name,
        description: description !== undefined ? description : role.description,
      },
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Delete existing permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }

      // Invalidate cache for users with this role
      await invalidateRoleCache(roleId);
    }

    // Fetch updated role with permissions
    return await tx.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  });

  return updatedRole;
};

/**
 * Delete role (soft delete)
 */
export const deleteExistingRole = async (roleId: string) => {
  // Check if role exists
  const role = await prisma.role.findFirst({
    where: {
      id: roleId,
      deletedAt: null,
    },
  });

  if (!role) {
    throw new AppError('Role not found', 404, 'NOT_FOUND');
  }

  // Prevent deletion of system roles
  if (role.isSystem) {
    throw new AppError('System roles cannot be deleted', 403, 'FORBIDDEN');
  }

  // Check if role has users
  const userCount = await prisma.userRole.count({
    where: { roleId },
  });

  if (userCount > 0) {
    throw new AppError(
      `Cannot delete role with ${userCount} assigned users. Please reassign users first.`,
      409,
      'CONFLICT'
    );
  }

  // Soft delete role
  await prisma.role.update({
    where: { id: roleId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Invalidate cache
  await invalidateRoleCache(roleId);

  return { role, userCount };
};

/**
 * Get user count for a role
 */
export const getRoleUserCount = async (roleId: string): Promise<number> => {
  return await prisma.userRole.count({
    where: { roleId },
  });
};

/**
 * Get all permissions
 */
export const getAllPermissions = async () => {
  return await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { name: 'asc' }],
  });
};

/**
 * Transfer users from one role to another
 */
export const transferUsersToRole = async (
  fromRoleId: string,
  toRoleId: string
): Promise<number> => {
  // Verify both roles exist
  const [fromRole, toRole] = await Promise.all([
    prisma.role.findFirst({ where: { id: fromRoleId, deletedAt: null } }),
    prisma.role.findFirst({ where: { id: toRoleId, deletedAt: null } }),
  ]);

  if (!fromRole || !toRole) {
    throw new AppError('Source or destination role not found', 404, 'NOT_FOUND');
  }

  // Get all users with the source role
  const userRoles = await prisma.userRole.findMany({
    where: { roleId: fromRoleId },
  });

  // Transfer users in transaction
  await prisma.$transaction(async (tx) => {
    for (const userRole of userRoles) {
      // Check if user already has the target role
      const existingRole = await tx.userRole.findFirst({
        where: {
          userId: userRole.userId,
          roleId: toRoleId,
        },
      });

      if (!existingRole) {
        // Create new role assignment
        await tx.userRole.create({
          data: {
            userId: userRole.userId,
            roleId: toRoleId,
          },
        });
      }

      // Delete old role assignment
      await tx.userRole.delete({
        where: { id: userRole.id },
      });
    }
  });

  // Invalidate cache for both roles
  await Promise.all([invalidateRoleCache(fromRoleId), invalidateRoleCache(toRoleId)]);

  return userRoles.length;
};
