import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ApiResponse = {
  success: (data: any, message: string = 'Success') => ({
    success: true,
    message,
    data,
  }),
};

/**
 * Track a page visit from public website
 * POST /api/v1/public/track-visit
 */
export async function trackVisit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { page, referrer, sessionId } = req.body;

    if (!page || typeof page !== 'string') {
      res.status(400).json({ success: false, message: 'Page is required' });
      return;
    }

    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.socket.remoteAddress || null;

    await prisma.visitorLog.create({
      data: {
        page: page.substring(0, 500),
        referrer: referrer ? String(referrer).substring(0, 1000) : null,
        userAgent: userAgent ? userAgent.substring(0, 500) : null,
        ipAddress,
        sessionId: sessionId ? String(sessionId).substring(0, 100) : null,
      },
    });

    res.status(201).json({ success: true, message: 'Visit tracked' });
  } catch (error) {
    next(error);
  }
}

/**
 * Get visitor statistics for dashboard
 * GET /api/v1/cms/dashboard/visitors
 * Query: year, month
 */
export async function getVisitorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { year, month } = req.query;

    const now = new Date();

    // Build date ranges
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Optional filter for year/month
    const filterWhere: any = {};
    if (year) {
      const y = parseInt(year as string, 10);
      if (!isNaN(y)) {
        filterWhere.createdAt = {
          gte: new Date(y, month ? parseInt(month as string, 10) - 1 : 0, 1),
          lt: month
            ? new Date(y, parseInt(month as string, 10), 1)
            : new Date(y + 1, 0, 1),
        };
      }
    }

    const [totalVisitors, todayVisitors, weeklyVisitors, monthlyVisitors, totalPageViews] = await Promise.all([
      // Total unique sessions (or total rows if no session)
      prisma.visitorLog.groupBy({
        by: ['sessionId'],
        where: filterWhere.createdAt ? filterWhere : undefined,
      }).then(r => r.length),

      // Today's visitors
      prisma.visitorLog.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: todayStart, lt: todayEnd },
        },
      }).then(r => r.length),

      // This week's visitors
      prisma.visitorLog.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: weekStart, lt: todayEnd },
        },
      }).then(r => r.length),

      // This month's visitors
      prisma.visitorLog.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: monthStart, lt: monthEnd },
        },
      }).then(r => r.length),

      // Total page views
      prisma.visitorLog.count({
        where: filterWhere.createdAt ? filterWhere : undefined,
      }),
    ]);

    // Previous month for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthVisitors = await prisma.visitorLog.groupBy({
      by: ['sessionId'],
      where: {
        createdAt: { gte: prevMonthStart, lt: prevMonthEnd },
      },
    }).then(r => r.length);

    const monthlyChange = prevMonthVisitors > 0
      ? (((monthlyVisitors - prevMonthVisitors) / prevMonthVisitors) * 100).toFixed(1)
      : '0';

    res.json(ApiResponse.success({
      totalVisitors,
      todayVisitors,
      weeklyVisitors,
      monthlyVisitors,
      totalPageViews,
      monthlyChange: `${parseFloat(monthlyChange) >= 0 ? '+' : ''}${monthlyChange}%`,
    }, 'Visitor statistics retrieved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get visitor chart data (daily or monthly)
 * GET /api/v1/cms/dashboard/visitors/chart
 * Query: period=daily|monthly, year, month
 */
export async function getVisitorChartData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { period = 'daily', year, month } = req.query;
    const now = new Date();

    if (period === 'monthly') {
      // Monthly data for the given year (or current year)
      const y = year ? parseInt(year as string, 10) : now.getFullYear();
      const months = [];
      for (let m = 0; m < 12; m++) {
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 1);
        const [visitors, pageViews] = await Promise.all([
          prisma.visitorLog.groupBy({
            by: ['sessionId'],
            where: { createdAt: { gte: start, lt: end } },
          }).then(r => r.length),
          prisma.visitorLog.count({
            where: { createdAt: { gte: start, lt: end } },
          }),
        ]);
        months.push({
          label: start.toLocaleString('en', { month: 'short' }),
          visitors,
          pageViews,
        });
      }
      res.json(ApiResponse.success({ period: 'monthly', data: months }));
    } else {
      // Daily data for the given month (or current month)
      const y = year ? parseInt(year as string, 10) : now.getFullYear();
      const m = month ? parseInt(month as string, 10) - 1 : now.getMonth();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const days = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const start = new Date(y, m, d);
        const end = new Date(y, m, d + 1);
        const [visitors, pageViews] = await Promise.all([
          prisma.visitorLog.groupBy({
            by: ['sessionId'],
            where: { createdAt: { gte: start, lt: end } },
          }).then(r => r.length),
          prisma.visitorLog.count({
            where: { createdAt: { gte: start, lt: end } },
          }),
        ]);
        days.push({
          label: `${d}`,
          visitors,
          pageViews,
        });
      }
      res.json(ApiResponse.success({ period: 'daily', data: days }));
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Get content overview stats for dashboard
 * GET /api/v1/cms/dashboard/content
 */
export async function getContentOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [
      totalPages, publishedPages, draftPages,
      totalMenus,
      totalNews, publishedNews, draftNews,
      totalFiles,
    ] = await Promise.all([
      prisma.page.count({ where: { deletedAt: null } }),
      prisma.page.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
      prisma.page.count({ where: { deletedAt: null, status: 'DRAFT' } }),
      prisma.menu.count({ where: { isActive: true } }),
      prisma.news.count({ where: { deleted_at: null } }),
      prisma.news.count({ where: { deleted_at: null, status: 'PUBLISHED' } }),
      prisma.news.count({ where: { deleted_at: null, status: 'DRAFT' } }),
      prisma.file.count({ where: { deletedAt: null } }),
    ]);

    res.json(ApiResponse.success({
      pages: { total: totalPages, published: publishedPages, draft: draftPages },
      menus: { total: totalMenus },
      news: { total: totalNews, published: publishedNews, draft: draftNews },
      files: { total: totalFiles },
    }, 'Content overview retrieved'));
  } catch (error) {
    next(error);
  }
}

/**
 * Get recent activities for dashboard
 * GET /api/v1/cms/dashboard/recent-activity
 * Query: limit (default 5)
 */
export async function getRecentActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 5, 50);

    const activities = await prisma.logActivity.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    const formattedActivities = activities.map(a => ({
      id: a.id,
      user: a.user ? `${a.user.firstName} ${a.user.lastName}`.trim() : 'System',
      userEmail: a.user?.email || null,
      userAvatar: a.user?.avatar || null,
      action: a.action,
      module: a.module,
      description: a.description || `${a.action} ${a.module}`,
      target: a.recordId || null,
      createdAt: a.createdAt.toISOString(),
    }));

    res.json(ApiResponse.success(formattedActivities, 'Recent activity retrieved'));
  } catch (error) {
    next(error);
  }
}
