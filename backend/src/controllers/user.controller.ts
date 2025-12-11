import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { userService } from '../services/user.service';
import { GetUsersQuery, CreateUserDto, UpdateUserDto, BulkDeleteUsersDto } from '../types/user.types';

/**
 * Get paginated list of users
 */
export const getUsers = async (req: AuthRequest, res: Response) => {
  const query: GetUsersQuery = {
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    search: req.query.search as string,
    status: req.query.status as any,
    role: req.query.role as string,
    emailVerified: req.query.emailVerified === 'true' ? true : req.query.emailVerified === 'false' ? false : undefined,
    sortBy: req.query.sortBy as any,
    sortOrder: req.query.sortOrder as any,
  };

  const result = await userService.getUsers(query);

  res.json({
    success: true,
    data: result.data,
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    },
  });
};

/**
 * Get user by ID
 */
export const getUserById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id as string);

  res.json({
    success: true,
    data: user,
  });
};

/**
 * Create new user
 */
export const createUser = async (req: AuthRequest, res: Response) => {
  const dto: CreateUserDto = req.body;
  const createdBy = req.user!.userId;

  const user = await userService.createUser(dto, createdBy);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
};

/**
 * Update user
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const dto: UpdateUserDto = req.body;
  const updatedBy = req.user!.userId;

  const user = await userService.updateUser(id as string, dto, updatedBy);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user,
  });
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const deletedBy = req.user!.userId;

  await userService.deleteUser(id as string, deletedBy);

  res.json({
    success: true,
    message: 'User deleted successfully',
  });
};

/**
 * Toggle user status
 */
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const toggledBy = req.user!.userId;

  const user = await userService.toggleUserStatus(id as string, toggledBy);

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: user,
  });
};

/**
 * Bulk delete users
 */
export const bulkDeleteUsers = async (req: AuthRequest, res: Response) => {
  const dto: BulkDeleteUsersDto = req.body;
  const deletedBy = req.user!.userId;

  const result = await userService.bulkDeleteUsers(dto, deletedBy);

  res.json({
    success: true,
    message: `Successfully deleted ${result.deleted} users`,
    data: result,
  });
};
