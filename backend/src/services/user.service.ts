import { PrismaClient, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppError } from '../types/error.types';
import {
  GetUsersQuery,
  CreateUserDto,
  UpdateUserDto,
  BulkDeleteUsersDto,
  UserListResponse,
  UserDetailResponse,
} from '../types/user.types';

const prisma = new PrismaClient();

/**
 * User Management Service
 */
export class UserService {
  /**
   * Get paginated list of users with filters
   */
  async getUsers(query: GetUsersQuery): Promise<UserListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      role,
      emailVerified,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Email verified filter
    if (emailVerified !== undefined) {
      if (emailVerified) {
        where.emailVerifiedAt = { not: null };
      } else {
        where.emailVerifiedAt = null;
      }
    }

    // Role filter
    if (role) {
      where.userRoles = {
        some: {
          role: {
            OR: [
              { id: role },
              { slug: role },
            ],
          },
        },
      };
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.firstName = sortOrder;
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder;
    } else if (sortBy === 'last_login_at') {
      orderBy.lastLoginAt = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    const data = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.userRoles.map((ur) => ur.role).filter((role) => role !== null),
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get user by ID with detailed information
   */
  async getUserById(userId: string): Promise<UserDetailResponse> {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
              },
            },
          },
        },
        refreshTokens: {
          where: {
            expiresAt: {
              gte: new Date(),
            },
          },
        },
        logActivities: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            action: true,
            module: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Get unique permissions from all roles
    const permissions = await prisma.permission.findMany({
      where: {
        rolePermissions: {
          some: {
            roleId: {
              in: user.userRoles.map((ur) => ur.roleId),
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        module: true,
      },
      distinct: ['id'],
    });

    // Count total activities
    const totalActivities = await prisma.logActivity.count({
      where: {
        userId: user.id,
      },
    });

    // Count logins (activities with action 'login')
    const totalLogins = await prisma.logActivity.count({
      where: {
        userId: user.id,
        action: 'login',
      },
    });

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      phone: user.phone,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map((ur) => ur.role),
      permissions,
      stats: {
        totalLogins,
        totalActivities,
        activeSessions: user.refreshTokens.length,
      },
      recentActivities: user.logActivities,
    };
  }

  /**
   * Create new user
   */
  async createUser(dto: CreateUserDto, createdBy: string): Promise<UserDetailResponse> {
    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: dto.email,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new AppError('Email already exists', 409, 'DUPLICATE_ENTRY');
    }

    // Generate username from email
    const username = dto.email.split('@')[0] + '_' + crypto.randomBytes(4).toString('hex');

    // Hash password if provided, otherwise generate random password
    let hashedPassword: string;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    } else {
      const randomPassword = crypto.randomBytes(16).toString('hex');
      hashedPassword = await bcrypt.hash(randomPassword, 10);
    }

    // Verify roles exist
    const roles = await prisma.role.findMany({
      where: {
        id: {
          in: dto.roles,
        },
        deletedAt: null,
      },
    });

    if (roles.length !== dto.roles.length) {
      throw new AppError('One or more roles not found', 404, 'NOT_FOUND');
    }

    // Create user with roles
    const user = await prisma.user.create({
      data: {
        email: dto.email,
        username,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        status: dto.status || UserStatus.ACTIVE,
        userRoles: {
          create: dto.roles.map((roleId) => ({
            roleId,
          })),
        },
      },
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId: createdBy,
        action: 'create',
        module: 'users_management',
        description: `Created user: ${user.email}`,
        metadata: {
          targetUserId: user.id,
          targetUserEmail: user.email,
        },
      },
    });

    // TODO: Send welcome email with set password link
    // This should be implemented with your email service

    return this.getUserById(user.id);
  }

  /**
   * Update user
   */
  async updateUser(
    userId: string,
    dto: UpdateUserDto,
    updatedBy: string
  ): Promise<UserDetailResponse> {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Prevent updating own roles (privilege escalation prevention)
    if (dto.roles && userId === updatedBy) {
      throw new AppError(
        'You cannot update your own roles',
        403,
        'FORBIDDEN'
      );
    }

    // Check if email already exists (if email is being updated)
    if (dto.email && dto.email !== user.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: dto.email,
          deletedAt: null,
          id: {
            not: userId,
          },
        },
      });

      if (existingUser) {
        throw new AppError('Email already exists', 409, 'DUPLICATE_ENTRY');
      }
    }

    // Verify roles exist if being updated
    if (dto.roles) {
      const roles = await prisma.role.findMany({
        where: {
          id: {
            in: dto.roles,
          },
          deletedAt: null,
        },
      });

      if (roles.length !== dto.roles.length) {
        throw new AppError('One or more roles not found', 404, 'NOT_FOUND');
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        status: dto.status,
        ...(dto.roles && {
          userRoles: {
            deleteMany: {},
            create: dto.roles.map((roleId) => ({
              roleId,
            })),
          },
        }),
      },
    });

    // Log activity
    const changes: string[] = [];
    if (dto.email && dto.email !== user.email) changes.push('email');
    if (dto.firstName && dto.firstName !== user.firstName) changes.push('firstName');
    if (dto.lastName && dto.lastName !== user.lastName) changes.push('lastName');
    if (dto.phone !== undefined && dto.phone !== user.phone) changes.push('phone');
    if (dto.status && dto.status !== user.status) changes.push('status');
    if (dto.roles) changes.push('roles');

    await prisma.logActivity.create({
      data: {
        userId: updatedBy,
        action: 'update',
        module: 'users_management',
        description: `Updated user: ${user.email} (${changes.join(', ')})`,
        metadata: {
          targetUserId: userId,
          targetUserEmail: user.email,
          changes,
        },
      },
    });

    return this.getUserById(userId);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    // Prevent self-deletion
    if (userId === deletedBy) {
      throw new AppError(
        'You cannot delete your own account',
        403,
        'FORBIDDEN'
      );
    }

    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Prevent deleting super admin
    const hasSuperAdminRole = user.userRoles.some(
      (ur) => ur.role.slug === 'super_admin' && ur.role.isSystem
    );

    if (hasSuperAdminRole) {
      throw new AppError(
        'Cannot delete super admin user',
        403,
        'FORBIDDEN'
      );
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId: deletedBy,
        action: 'delete',
        module: 'users_management',
        description: `Deleted user: ${user.email}`,
        metadata: {
          targetUserId: userId,
          targetUserEmail: user.email,
        },
      },
    });
  }

  /**
   * Toggle user status (ACTIVE <-> INACTIVE)
   */
  async toggleUserStatus(userId: string, toggledBy: string): Promise<UserDetailResponse> {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    // Determine new status
    const newStatus = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;

    // Update status
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: newStatus,
      },
    });

    // If set to inactive, revoke all refresh tokens (sessions)
    if (newStatus === UserStatus.INACTIVE) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
        },
      });
    }

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId: toggledBy,
        action: 'toggle_status',
        module: 'users_management',
        description: `Changed user status: ${user.email} (${user.status} → ${newStatus})`,
        metadata: {
          targetUserId: userId,
          targetUserEmail: user.email,
          oldStatus: user.status,
          newStatus,
        },
      },
    });

    return this.getUserById(userId);
  }

  /**
   * Bulk delete users
   */
  async bulkDeleteUsers(dto: BulkDeleteUsersDto, deletedBy: string): Promise<{ deleted: number }> {
    const { userIds } = dto;

    // Prevent self-deletion
    if (userIds.includes(deletedBy)) {
      throw new AppError(
        'You cannot delete your own account',
        403,
        'FORBIDDEN'
      );
    }

    // Get users to delete
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
        deletedAt: null,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Check for super admin
    const superAdminUsers = users.filter((u) =>
      u.userRoles.some((ur) => ur.role.slug === 'super_admin' && ur.role.isSystem)
    );

    if (superAdminUsers.length > 0) {
      throw new AppError(
        'Cannot delete super admin users',
        403,
        'FORBIDDEN'
      );
    }

    // Soft delete all
    const result = await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId: deletedBy,
        action: 'bulk_delete',
        module: 'users_management',
        description: `Bulk deleted ${result.count} users`,
        metadata: {
          deletedUserIds: userIds,
          deletedCount: result.count,
        },
      },
    });

    return { deleted: result.count };
  }
}

export const userService = new UserService();
