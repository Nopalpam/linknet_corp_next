import { PrismaClient, User } from '@prisma/client';
import { redisClient } from '../config/redis';
import { PermissionSlug, RoleSlug } from '../constants/permissions';

const prisma = new PrismaClient();

// Cache expiration time (1 hour)
const CACHE_EXPIRATION = 3600;

/**
 * Get cache key for user permissions
 */
const getUserPermissionsCacheKey = (userId: string): string => {
  return `user:${userId}:permissions`;
};

/**
 * Get cache key for user roles
 */
const getUserRolesCacheKey = (userId: string): string => {
  return `user:${userId}:roles`;
};

/**
 * Invalidate user permissions and roles cache
 */
export const invalidateUserCache = async (userId: string): Promise<void> => {
  try {
    await redisClient.del(getUserPermissionsCacheKey(userId));
    await redisClient.del(getUserRolesCacheKey(userId));
  } catch (error) {
    console.error('Error invalidating user cache:', error);
  }
};

/**
 * Invalidate cache for all users with a specific role
 */
export const invalidateRoleCache = async (roleId: string): Promise<void> => {
  try {
    // Get all users with this role
    const userRoles = await prisma.userRole.findMany({
      where: { roleId },
      select: { userId: true },
    });

    // Invalidate cache for each user
    const invalidatePromises = userRoles.map((ur) => invalidateUserCache(ur.userId));
    await Promise.all(invalidatePromises);
  } catch (error) {
    console.error('Error invalidating role cache:', error);
  }
};

/**
 * Get user permissions from database
 */
const getUserPermissionsFromDB = async (userId: string): Promise<string[]> => {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      role: {
        deletedAt: null,
      },
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  // Flatten and deduplicate permissions
  const permissions = new Set<string>();
  userRoles.forEach((userRole) => {
    userRole.role.rolePermissions.forEach((rp) => {
      permissions.add(rp.permission.slug);
    });
  });

  return Array.from(permissions);
};

/**
 * Get user permissions with caching
 * @param userId - User ID
 * @returns Array of permission slugs
 */
export const getUserPermissions = async (userId: string): Promise<string[]> => {
  try {
    const cacheKey = getUserPermissionsCacheKey(userId);

    // Try to get from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const permissions = await getUserPermissionsFromDB(userId);

    // Cache the result
    await redisClient.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(permissions));

    return permissions;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    // Fallback to DB without cache on error
    return getUserPermissionsFromDB(userId);
  }
};

/**
 * Get user roles from database
 */
const getUserRolesFromDB = async (userId: string): Promise<string[]> => {
  const userRoles = await prisma.userRole.findMany({
    where: {
      userId,
      role: {
        deletedAt: null,
      },
    },
    include: {
      role: true,
    },
  });

  return userRoles.map((ur) => ur.role.slug);
};

/**
 * Get user roles with caching
 * @param userId - User ID
 * @returns Array of role slugs
 */
export const getUserRoles = async (userId: string): Promise<string[]> => {
  try {
    const cacheKey = getUserRolesCacheKey(userId);

    // Try to get from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const roles = await getUserRolesFromDB(userId);

    // Cache the result
    await redisClient.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(roles));

    return roles;
  } catch (error) {
    console.error('Error getting user roles:', error);
    // Fallback to DB without cache on error
    return getUserRolesFromDB(userId);
  }
};

/**
 * Check if user has a specific permission
 * @param user - User object or user ID
 * @param permission - Permission slug to check
 * @returns True if user has the permission
 */
export const hasPermission = async (
  user: User | string,
  permission: PermissionSlug | string
): Promise<boolean> => {
  const userId = typeof user === 'string' ? user : user.id;
  const roles = await getUserRoles(userId);
  if (roles.includes('super-admin')) return true;
  const permissions = await getUserPermissions(userId);
  return permissions.includes(permission);
};

/**
 * Check if user has any of the specified permissions
 * @param user - User object or user ID
 * @param permissions - Array of permission slugs to check
 * @returns True if user has at least one of the permissions
 */
export const hasAnyPermission = async (
  user: User | string,
  permissions: (PermissionSlug | string)[]
): Promise<boolean> => {
  const userId = typeof user === 'string' ? user : user.id;
  const roles = await getUserRoles(userId);
  if (roles.includes('super-admin')) return true;
  const userPermissions = await getUserPermissions(userId);
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Check if user has all of the specified permissions
 * @param user - User object or user ID
 * @param permissions - Array of permission slugs to check
 * @returns True if user has all of the permissions
 */
export const hasAllPermissions = async (
  user: User | string,
  permissions: (PermissionSlug | string)[]
): Promise<boolean> => {
  const userId = typeof user === 'string' ? user : user.id;
  const roles = await getUserRoles(userId);
  if (roles.includes('super-admin')) return true;
  const userPermissions = await getUserPermissions(userId);
  return permissions.every((permission) => userPermissions.includes(permission));
};

/**
 * Check if user has a specific role
 * @param user - User object or user ID
 * @param role - Role slug to check
 * @returns True if user has the role
 */
export const hasRole = async (user: User | string, role: RoleSlug | string): Promise<boolean> => {
  const userId = typeof user === 'string' ? user : user.id;
  const roles = await getUserRoles(userId);
  return roles.includes(role);
};

/**
 * Check if user has any of the specified roles
 * @param user - User object or user ID
 * @param roles - Array of role slugs to check
 * @returns True if user has at least one of the roles
 */
export const hasAnyRole = async (
  user: User | string,
  roles: (RoleSlug | string)[]
): Promise<boolean> => {
  const userId = typeof user === 'string' ? user : user.id;
  const userRoles = await getUserRoles(userId);
  return roles.some((role) => userRoles.includes(role));
};

/**
 * Check if user has all of the specified roles
 * @param user - User object or user ID
 * @param roles - Array of role slugs to check
 * @returns True if user has all of the roles
 */
export const hasAllRoles = async (
  user: User | string,
  roles: (RoleSlug | string)[]
): Promise<boolean> => {
  const userId = typeof user === 'string' ? user : user.id;
  const userRoles = await getUserRoles(userId);
  return roles.every((role) => userRoles.includes(role));
};
