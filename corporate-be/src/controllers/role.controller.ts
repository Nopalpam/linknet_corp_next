import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import { invalidateRoleCache } from '../utils/rbac';
import { PermissionsByModule, Role as RoleSlug } from '../constants/permissions';

const prisma = new PrismaClient();

type RoleIdRecord = {
  id: string;
};

type PermissionRecord = {
  id: string;
  module: string;
  slug: string;
  name: string;
  description: string | null;
};

type RolePermissionRecord = {
  permission: {
    id: string;
    name: string;
    slug: string;
    module: string;
  };
};

type RoleListRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  rolePermissions: RolePermissionRecord[];
  createdAt: Date;
  updatedAt: Date;
  _count: {
    userRoles: number;
  };
};

type PermissionGroupRecord = {
  id: string;
  name: string;
  slug: string;
  module: string;
  description: string | null;
};

const titleCase = (value: string) =>
  value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const permissionNameFromSlug = (slug: string) => {
  const [module = '', action = ''] = slug.split('.');
  return `${titleCase(action)} ${titleCase(module)}`.trim();
};

const permissionDescriptionFromSlug = (slug: string) => {
  const [module = 'module', action = 'manage'] = slug.split('.');
  return `${titleCase(action)} access for ${titleCase(module)}.`;
};

const getPermissionCatalog = () => Object.entries(PermissionsByModule).flatMap(([module, slugs]) => (
  slugs.map((slug) => ({
    module,
    slug,
    name: permissionNameFromSlug(slug),
    description: permissionDescriptionFromSlug(slug),
  }))
));

const normalizePermissionIds = (permissionIds: unknown): string[] => {
  if (permissionIds === undefined || permissionIds === null) return [];
  if (!Array.isArray(permissionIds)) {
    throw new AppError('permissionIds must be an array', 400, 'VALIDATION_ERROR');
  }

  return Array.from(
    new Set(
      permissionIds
        .filter((permissionId): permissionId is string => typeof permissionId === 'string')
        .map((permissionId) => permissionId.trim())
        .filter(Boolean)
    )
  );
};

const ensurePermissionsExist = async (permissionIds: string[]) => {
  if (permissionIds.length === 0) return;

  const foundPermissions = await prisma.permission.findMany({
    where: { id: { in: permissionIds } },
    select: { id: true },
  });

  if (foundPermissions.length !== permissionIds.length) {
    throw new AppError('One or more permissions not found', 400, 'VALIDATION_ERROR');
  }
};

async function syncPermissionsFromCatalog() {
  const catalog = getPermissionCatalog();
  const permissions = await Promise.all(
    catalog.map((permission) => prisma.permission.upsert({
      where: { slug: permission.slug },
      update: {
        module: permission.module,
        description: permission.description,
      },
      create: permission,
    })),
  );

  const privilegedRoles = await prisma.role.findMany({
    where: {
      slug: { in: [RoleSlug.SUPER_ADMIN, RoleSlug.ADMIN] },
      deletedAt: null,
    },
    select: { id: true },
  });

  if (privilegedRoles.length > 0 && permissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: privilegedRoles.flatMap((role: RoleIdRecord) => (
        permissions.map((permission: PermissionRecord) => ({
          roleId: role.id,
          permissionId: permission.id,
        }))
      )),
      skipDuplicates: true,
    });
  }
}

/**
 * Get all roles with their permissions
 */
export const getRoles = async (_req: Request, res: Response) => {
  await syncPermissionsFromCatalog();

  const roles = await prisma.role.findMany({
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

  const formattedRoles = roles.map((role: RoleListRecord) => ({
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    isSystem: role.isSystem,
    userCount: role._count.userRoles,
    permissionCount: role.rolePermissions.length,
    permissions: role.rolePermissions.map((rp: RolePermissionRecord) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      slug: rp.permission.slug,
      module: rp.permission.module,
    })),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  }));

  res.json({
    success: true,
    data: formattedRoles,
  });
};

/**
 * Get single role by ID
 */
export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const role = await prisma.role.findFirst({
    where: {
      id,
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

  // Get user count
  const userCount = await prisma.userRole.count({
    where: { roleId: id },
  });

  const formattedRole = {
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    isSystem: role.isSystem,
    userCount,
    permissions: role.rolePermissions.map((rp: RolePermissionRecord) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      slug: rp.permission.slug,
      module: rp.permission.module,
    })),
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };

  res.json({
    success: true,
    data: formattedRole,
  });
};

/**
 * Create new role
 */
export const createRole = async (req: Request, res: Response) => {
  const { name, slug, description, permissionIds } = req.body;
  const roleName = typeof name === 'string' ? name.trim() : '';
  const roleSlug = typeof slug === 'string' ? slug.trim() : '';
  const normalizedPermissionIds = normalizePermissionIds(permissionIds);

  // Validate required fields
  if (!roleName || !roleSlug) {
    throw new AppError('Name and slug are required', 400, 'VALIDATION_ERROR');
  }

  await ensurePermissionsExist(normalizedPermissionIds);

  // Check if role with same name or slug exists
  const existingRole = await prisma.role.findFirst({
    where: {
      OR: [
        { name: roleName },
        { slug: roleSlug },
      ],
    },
  });

  if (existingRole) {
    throw new AppError('Role with this name or slug already exists', 409, 'DUPLICATE_ENTRY');
  }

  // Create role
  const role = await prisma.role.create({
    data: {
      name: roleName,
      slug: roleSlug,
      description,
      isSystem: false,
    },
  });

  // Assign permissions if provided
  if (normalizedPermissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: normalizedPermissionIds.map((permissionId: string) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }

  // Fetch role with permissions
  const createdRole = await prisma.role.findUnique({
    where: { id: role.id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  // Log activity
  const userId = req.user?.id;
  if (userId) {
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'CREATE',
        module: 'ROLE_MANAGEMENT',
        description: `Created role: ${roleName}`,
        metadata: {
          roleId: role.id,
          roleName,
          permissionCount: normalizedPermissionIds.length,
        },
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: createdRole,
  });
};

/**
 * Update role
 */
export const updateRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, permissionIds } = req.body;
  const roleName = typeof name === 'string' ? name.trim() : undefined;
  const normalizedPermissionIds = permissionIds !== undefined
    ? normalizePermissionIds(permissionIds)
    : undefined;

  if (!id) {
    throw new AppError('Role ID is required', 400, 'VALIDATION_ERROR');
  }

  if (name !== undefined && !roleName) {
    throw new AppError('Name is required', 400, 'VALIDATION_ERROR');
  }

  // Check if role exists
  const role = await prisma.role.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!role) {
    throw new AppError('Role not found', 404, 'NOT_FOUND');
  }

  // Block if system role — unless the requesting user is a super-admin
  const userRoles = req.user?.roles ?? [];
  const isSuperAdmin = userRoles.includes('super-admin');
  if (role.isSystem && !isSuperAdmin) {
    throw new AppError('System roles cannot be edited', 403, 'FORBIDDEN');
  }

  if (roleName && roleName !== role.name) {
    const existingRole = await prisma.role.findFirst({
      where: {
        name: roleName,
        id: { not: id },
      },
    });

    if (existingRole) {
      throw new AppError('Role with this name already exists', 409, 'DUPLICATE_ENTRY');
    }
  }

  if (normalizedPermissionIds) {
    await ensurePermissionsExist(normalizedPermissionIds);
  }

  // Update role
  const updatedRole = await prisma.role.update({
    where: { id },
    data: {
      name: roleName || role.name,
      description: description !== undefined ? description : role.description,
    },
  });

  // Update permissions if provided
  if (normalizedPermissionIds) {
    // Delete existing permissions
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Add new permissions
    if (normalizedPermissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: normalizedPermissionIds.map((permissionId: string) => ({
          roleId: id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }

    // Invalidate cache for users with this role
    await invalidateRoleCache(id);
  }

  // Fetch updated role with permissions
  const roleWithPermissions = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  // Log activity
  const userId = req.user?.id;
  if (userId) {
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'UPDATE',
        module: 'ROLE_MANAGEMENT',
        description: `Updated role: ${updatedRole.name}`,
        metadata: {
          roleId: id,
          roleName: updatedRole.name,
          permissionCount: normalizedPermissionIds?.length,
        },
      },
    });
  }

  res.json({
    success: true,
    message: 'Role updated successfully',
    data: roleWithPermissions,
  });
};

/**
 * Delete role
 */
export const deleteRole = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError('Role ID is required', 400, 'VALIDATION_ERROR');
  }

  // Check if role exists
  const role = await prisma.role.findFirst({
    where: {
      id,
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
    where: { roleId: id },
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
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  // Invalidate cache
  await invalidateRoleCache(id);

  // Log activity
  const userId = req.user?.id;
  if (userId) {
    await prisma.logActivity.create({
      data: {
        userId,
        action: 'DELETE',
        module: 'ROLE_MANAGEMENT',
        description: `Deleted role: ${role.name}`,
        metadata: {
          roleId: id,
          roleName: role.name,
          userCount,
        },
      },
    });
  }

  res.json({
    success: true,
    message: 'Role deleted successfully',
  });
};

/**
 * Get all permissions grouped by module
 */
export const getPermissions = async (_req: Request, res: Response) => {
  await syncPermissionsFromCatalog();

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { name: 'asc' }],
  });

  // Group permissions by module
  const groupedPermissions: Record<string, any[]> = {};
  permissions.forEach((permission: PermissionGroupRecord) => {
    if (!groupedPermissions[permission.module]) {
      groupedPermissions[permission.module] = [];
    }
    const moduleGroup = groupedPermissions[permission.module];
    if (moduleGroup) {
      moduleGroup.push({
        id: permission.id,
        name: permission.name,
        slug: permission.slug,
        description: permission.description,
      });
    }
  });

  res.json({
    success: true,
    data: {
      permissions,
      grouped: groupedPermissions,
      modules: Object.keys(groupedPermissions),
    },
  });
};
