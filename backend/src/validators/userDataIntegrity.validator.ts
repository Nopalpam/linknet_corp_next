/**
 * Enhanced User Service Data Integrity Validation
 * 
 * Control: MBSS2.0-ApplicationCoding-005
 * Purpose: Validate user data integrity during processing operations
 */

import {
  validateCollectionSize,
  validateNoDuplicates,
  DataIntegrityError
} from '../utils/dataIntegrity.util';

/**
 * User status transition rules
 */
const USER_STATUS_TRANSITIONS: Record<string, string[]> = {
  'ACTIVE': ['INACTIVE', 'SUSPENDED'],
  'INACTIVE': ['ACTIVE', 'SUSPENDED'],
  'SUSPENDED': ['ACTIVE', 'INACTIVE']
};

/**
 * Validate user status transition
 */
export function validateUserStatusChange(
  currentStatus: string,
  newStatus: string
): void {
  if (currentStatus === newStatus) {
    return;
  }

  const allowed = USER_STATUS_TRANSITIONS[currentStatus];
  
  if (!allowed || !allowed.includes(newStatus)) {
    throw new DataIntegrityError(
      `Invalid user status transition: ${currentStatus} → ${newStatus}`,
      {
        currentStatus,
        newStatus,
        allowedTransitions: allowed || []
      }
    );
  }
}

/**
 * Validate user role assignments
 */
export async function validateUserRoles(
  roleIds: string[],
  prisma: any
): Promise<void> {
  // Validate collection size
  validateCollectionSize(roleIds, 'roles', 1, 10);

  // Validate no duplicates
  validateNoDuplicates(roleIds, 'roles');

  // Validate all roles exist
  const roles = await prisma.role.findMany({
    where: {
      id: { in: roleIds },
      deletedAt: null
    },
    select: { id: true, isSystem: true, slug: true }
  });

  if (roles.length !== roleIds.length) {
    const foundIds = roles.map((r: any) => r.id);
    const missingIds = roleIds.filter(id => !foundIds.includes(id));
    
    throw new DataIntegrityError(
      'One or more roles not found or have been deleted',
      { missingRoleIds: missingIds }
    );
  }
}

/**
 * Validate user cannot delete self
 */
export function validateNotSelfDeletion(
  targetUserId: string,
  currentUserId: string
): void {
  if (targetUserId === currentUserId) {
    throw new DataIntegrityError(
      'Cannot delete your own account',
      { targetUserId, currentUserId }
    );
  }
}

/**
 * Validate user is not protected system user
 */
export async function validateNotProtectedUser(
  userId: string,
  prisma: any
): Promise<void> {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, slug: true, isSystem: true }
          }
        }
      }
    }
  });

  if (!user) {
    throw new DataIntegrityError('User not found', { userId });
  }

  // Check for super admin role
  const hasSuperAdminRole = user.userRoles.some(
    (ur: any) => ur.role.slug === 'super_admin' && ur.role.isSystem
  );

  if (hasSuperAdminRole) {
    throw new DataIntegrityError(
      'Cannot modify or delete super admin user',
      { userId, reason: 'Protected system user' }
    );
  }
}

/**
 * Validate bulk user operation
 */
export async function validateBulkUserOperation(
  userIds: string[],
  currentUserId: string,
  prisma: any
): Promise<void> {
  // Validate collection size (max 100 users per batch)
  validateCollectionSize(userIds, 'userIds', 1, 100);

  // Validate no duplicates
  validateNoDuplicates(userIds, 'userIds');

  // Validate not attempting to delete self
  if (userIds.includes(currentUserId)) {
    throw new DataIntegrityError(
      'Cannot perform bulk operation on your own account',
      { userIds, currentUserId }
    );
  }

  // Validate no protected users in batch
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
      deletedAt: null
    },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, slug: true, isSystem: true }
          }
        }
      }
    }
  });

  const protectedUsers = users.filter((u: any) =>
    u.userRoles.some((ur: any) => ur.role.slug === 'super_admin' && ur.role.isSystem)
  );

  if (protectedUsers.length > 0) {
    throw new DataIntegrityError(
      'Batch operation includes protected system users',
      {
        protectedUserIds: protectedUsers.map((u: any) => u.id),
        reason: 'Cannot bulk modify/delete super admin users'
      }
    );
  }
}

/**
 * Validate email uniqueness
 */
export async function validateEmailUnique(
  email: string,
  excludeUserId: string | null,
  prisma: any
): Promise<void> {
  const existing = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      deletedAt: null,
      ...(excludeUserId && { id: { not: excludeUserId } })
    }
  });

  if (existing) {
    throw new DataIntegrityError(
      'Email address is already in use',
      { email, existingUserId: existing.id }
    );
  }
}

/**
 * Validate password strength requirements
 */
export function validatePasswordStrength(password: string, email?: string, username?: string): void {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  // Check password is not identical to email or username
  if (email) {
    const lowerEmail = email.toLowerCase();
    const lowerPassword = password.toLowerCase();
    
    if (lowerPassword === lowerEmail) {
      errors.push('Password cannot be identical to email or username');
    } else if (email.includes('@')) {
      const emailLocal = email.split('@')[0]!.toLowerCase();
      if (lowerPassword === emailLocal) {
        errors.push('Password cannot be identical to email or username');
      }
    }
  }
  if (username) {
    if (password.toLowerCase() === username.toLowerCase()) {
      errors.push('Password cannot be identical to username');
    }
  }

  if (errors.length > 0) {
    throw new DataIntegrityError(
      'Password does not meet strength requirements',
      { requirements: errors }
    );
  }
}

/**
 * Validate user update consistency
 */
export async function validateUserUpdate(
  userId: string,
  updateData: any,
  _currentUserId: string,
  prisma: any
): Promise<void> {
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null
    },
    include: {
      userRoles: {
        include: {
          role: {
            select: { id: true, slug: true, isSystem: true }
          }
        }
      }
    }
  });

  if (!existingUser) {
    throw new DataIntegrityError('User not found', { userId });
  }

  // If changing status, validate transition
  if (updateData.status && updateData.status !== existingUser.status) {
    validateUserStatusChange(existingUser.status, updateData.status);
  }

  // If changing email, validate uniqueness
  if (updateData.email && updateData.email !== existingUser.email) {
    await validateEmailUnique(updateData.email, userId, prisma);
  }

  // If changing password, validate strength
  if (updateData.password) {
    validatePasswordStrength(updateData.password, updateData.email || existingUser.email, existingUser.username);
  }

  // If updating roles, validate
  if (updateData.roles) {
    await validateUserRoles(updateData.roles, prisma);
  }

  // Validate not removing all roles
  if (updateData.roles && updateData.roles.length === 0) {
    throw new DataIntegrityError(
      'User must have at least one role assigned',
      { userId }
    );
  }
}
