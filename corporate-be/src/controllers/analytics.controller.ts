/**
 * Analytics Controller
 * Handles API endpoints for Google Analytics and Internal CMS analytics
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { googleAnalyticsService } from '../services/googleAnalytics.service';
import NodeCache from 'node-cache';

const prisma = new PrismaClient();

// Cache for internal news analytics (5 min TTL)
const newsAnalyticsCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const ApiResponse = {
  success: (data: any, message: string = 'Success') => ({
    success: true,
    message,
    data,
  }),
  error: (message: string, _code: number = 500) => ({
    success: false,
    message,
  }),
};

// ============ GOOGLE ANALYTICS ENDPOINTS ============

/**
 * GET /api/v1/analytics/ga
 * Get Google Analytics data for dashboard
 * Query: startDate, endDate (optional, defaults to last 30 days)
 */
export async function getGoogleAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate } = req.query;

    const data = await googleAnalyticsService.getAnalyticsOverview(
      startDate as string | undefined,
      endDate as string | undefined
    );

    res.json(
      ApiResponse.success(
        {
          ...data,
          source: 'Google Analytics',
        },
        data.connected
          ? 'Google Analytics data retrieved'
          : 'Google Analytics not connected'
      )
    );
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analytics/ga/status
 * Check GA4 connection status
 */
export async function getGAStatus(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const status = googleAnalyticsService.getConnectionStatus();
    res.json(
      ApiResponse.success(
        {
          ...status,
          source: 'Google Analytics',
        },
        status.configured
          ? 'GA4 is configured'
          : 'GA4 is not configured'
      )
    );
  } catch (error) {
    next(error);
  }
}

// ============ INTERNAL NEWS ANALYTICS ENDPOINTS ============

/**
 * GET /api/v1/analytics/news
 * Get internal news/article analytics for dashboard
 * Query: limit (default 5)
 */
export async function getNewsAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 5, 20);

    const cacheKey = `news_analytics_${limit}`;
    const cached = newsAnalyticsCache.get(cacheKey);
    if (cached) {
      res.json(ApiResponse.success(cached, 'News analytics retrieved (cached)'));
      return;
    }

    // Top articles by view count
    const topArticles = await prisma.news.findMany({
      where: {
        deleted_at: null,
        status: 'PUBLISHED',
      },
      orderBy: {
        view_count: 'desc',
      },
      take: limit,
      select: {
        id: true,
        title_en: true,
        title_id: true,
        slug: true,
        news_thumbnail: true,
        view_count: true,
        view_count_unique: true,
        news_date: true,
        published_at: true,
        news_categories: {
          select: {
            id: true,
            name_en: true,
            slug: true,
          },
        },
      },
    });

    // Recent articles (latest 5)
    const recentArticles = await prisma.news.findMany({
      where: {
        deleted_at: null,
        status: 'PUBLISHED',
      },
      orderBy: {
        published_at: 'desc',
      },
      take: 5,
      select: {
        id: true,
        title_en: true,
        title_id: true,
        slug: true,
        news_thumbnail: true,
        view_count: true,
        news_date: true,
        published_at: true,
        news_categories: {
          select: {
            id: true,
            name_en: true,
            slug: true,
          },
        },
      },
    });

    // Total statistics
    const [totalArticles, totalPublished, totalDraft, totalViews] =
      await Promise.all([
        prisma.news.count({ where: { deleted_at: null } }),
        prisma.news.count({
          where: { deleted_at: null, status: 'PUBLISHED' },
        }),
        prisma.news.count({
          where: { deleted_at: null, status: 'DRAFT' },
        }),
        prisma.news.aggregate({
          where: { deleted_at: null },
          _sum: { view_count: true },
        }),
      ]);

    const result = {
      source: 'Internal CMS',
      topArticles: topArticles.map((article) => ({
        id: article.id,
        title: article.title_en,
        titleId: article.title_id,
        slug: article.slug,
        thumbnail: article.news_thumbnail,
        viewCount: article.view_count,
        uniqueViewCount: article.view_count_unique,
        newsDate: article.news_date,
        publishedAt: article.published_at,
        category: article.news_categories
          ? {
              id: article.news_categories.id,
              name: article.news_categories.name_en,
              slug: article.news_categories.slug,
            }
          : null,
      })),
      recentArticles: recentArticles.map((article) => ({
        id: article.id,
        title: article.title_en,
        titleId: article.title_id,
        slug: article.slug,
        thumbnail: article.news_thumbnail,
        viewCount: article.view_count,
        newsDate: article.news_date,
        publishedAt: article.published_at,
        category: article.news_categories
          ? {
              id: article.news_categories.id,
              name: article.news_categories.name_en,
              slug: article.news_categories.slug,
            }
          : null,
      })),
      summary: {
        totalArticles,
        totalPublished,
        totalDraft,
        totalViews: totalViews._sum.view_count || 0,
      },
    };

    // Cache the result
    newsAnalyticsCache.set(cacheKey, result);

    res.json(ApiResponse.success(result, 'News analytics retrieved'));
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/analytics/combined
 * Get combined analytics data (GA + Internal) in a single call
 * Useful for dashboard to reduce number of API requests
 */
export async function getCombinedAnalytics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 5, 20);

    // Fetch both in parallel
    const [gaData, newsData] = await Promise.all([
      googleAnalyticsService.getAnalyticsOverview(
        startDate as string | undefined,
        endDate as string | undefined
      ),
      (async () => {
        // Top articles
        const topArticles = await prisma.news.findMany({
          where: { deleted_at: null, status: 'PUBLISHED' },
          orderBy: { view_count: 'desc' },
          take: limit,
          select: {
            id: true,
            title_en: true,
            slug: true,
            news_thumbnail: true,
            view_count: true,
            view_count_unique: true,
            news_date: true,
            published_at: true,
            news_categories: {
              select: { id: true, name_en: true, slug: true },
            },
          },
        });

        const totalViews = await prisma.news.aggregate({
          where: { deleted_at: null },
          _sum: { view_count: true },
        });

        return {
          topArticles: topArticles.map((a) => ({
            id: a.id,
            title: a.title_en,
            slug: a.slug,
            thumbnail: a.news_thumbnail,
            viewCount: a.view_count,
            uniqueViewCount: a.view_count_unique,
            publishedAt: a.published_at,
            category: a.news_categories
              ? { name: a.news_categories.name_en }
              : null,
          })),
          totalViews: totalViews._sum.view_count || 0,
        };
      })(),
    ]);

    res.json(
      ApiResponse.success(
        {
          googleAnalytics: {
            ...gaData,
            source: 'Google Analytics',
          },
          newsAnalytics: {
            ...newsData,
            source: 'Internal CMS',
          },
        },
        'Combined analytics retrieved'
      )
    );
  } catch (error) {
    next(error);
  }
}
