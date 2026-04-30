import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import * as jsonDiff from 'json-diff';

// API Response helper
const ApiResponse = {
  success: (data: any, message: string = 'Success') => ({
    success: true,
    message,
    data,
  }),
  error: (message: string, errors?: any) => ({
    success: false,
    message,
    errors,
  }),
};

const prisma = new PrismaClient();

/**
 * Get paginated activity logs with filters
 * GET /api/cms/log-activity
 */
export async function getActivityLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      userId,
      module,
      recordId,
      action,
      dateFrom,
      dateTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (userId) {
      where.userId = userId as string;
    }

    if (module) {
      where.module = module as string;
    }

    if (recordId) {
      where.recordId = recordId as string;
    }

    if (action) {
      where.action = action as string;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { ipAddress: { contains: search as string, mode: 'insensitive' } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
        { user: { username: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    // Get logs with user info
    const [logs, total] = await Promise.all([
      prisma.logActivity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          [sortBy as string]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.logActivity.count({ where }),
    ]);

    res.json(
      ApiResponse.success(
        {
          logs,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum),
          },
        },
        'Activity logs retrieved successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get activity log by ID with diff view
 * GET /api/cms/log-activity/:id
 */
export async function getActivityLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const log = await prisma.logActivity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    if (!log || log.deletedAt) {
      res.status(404).json(ApiResponse.error('Activity log not found'));
      return;
    }

    // Generate diff if both old and new data exist
    let diff = null;
    if (log.oldData && log.newData) {
      diff = jsonDiff.diff(log.oldData, log.newData);
    }

    res.json(
      ApiResponse.success(
        {
          ...log,
          diff,
        },
        'Activity log retrieved successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Soft delete activity log
 * DELETE /api/cms/log-activity/:id
 */
export async function deleteActivityLog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const log = await prisma.logActivity.findUnique({
      where: { id },
    });

    if (!log || log.deletedAt) {
      res.status(404).json(ApiResponse.error('Activity log not found'));
      return;
    }

    await prisma.logActivity.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json(ApiResponse.success(null, 'Activity log deleted successfully'));
  } catch (error) {
    next(error);
  }
}

/**
 * Cleanup old logs
 * POST /api/cms/log-activity/cleanup
 */
export async function cleanupOldLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { days = 90 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await prisma.logActivity.updateMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json(
      ApiResponse.success(
        {
          deletedCount: result.count,
          cutoffDate,
        },
        `Cleaned up ${result.count} logs older than ${days} days`,
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get activity log statistics
 * GET /api/cms/log-activity/stats
 */
export async function getActivityLogStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dateFrom, dateTo } = req.query;

    const where: any = {
      deletedAt: null,
    };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    // Get stats
    const [totalLogs, actionStats, moduleStats, topUsers] = await Promise.all([
      // Total logs count
      prisma.logActivity.count({ where }),

      // Logs by action
      prisma.logActivity.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),

      // Logs by module
      prisma.logActivity.groupBy({
        by: ['module'],
        where,
        _count: true,
      }),

      // Top active users
      prisma.logActivity.groupBy({
        by: ['userId'],
        where: {
          ...where,
          userId: { not: null },
        },
        _count: true,
        orderBy: {
          _count: {
            userId: 'desc',
          },
        },
        take: 10,
      }),
    ]);

    // Get user details for top users
    const userIds = topUsers.map((u) => u.userId).filter((id): id is string => id !== null);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    const topUsersWithDetails = topUsers.map((stat) => ({
      user: users.find((u) => u.id === stat.userId),
      count: stat._count,
    }));

    res.json(
      ApiResponse.success(
        {
          totalLogs,
          actionStats: actionStats.map((stat) => ({
            action: stat.action,
            count: stat._count,
          })),
          moduleStats: moduleStats.map((stat) => ({
            module: stat.module,
            count: stat._count,
          })),
          topUsers: topUsersWithDetails,
        },
        'Activity log statistics retrieved successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
}

/**
 * Get user activity timeline
 * GET /api/cms/log-activity/user/:userId/timeline
 */
export async function getUserActivityTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const { limit = '50' } = req.query;

    const logs = await prisma.logActivity.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json(
      ApiResponse.success(
        {
          logs,
          userId,
        },
        'User activity timeline retrieved successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
}
