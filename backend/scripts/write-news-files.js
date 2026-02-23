// Write all news module backend files
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

// =====================================
// 1. NEWS SERVICE
// =====================================
const newsService = `import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { sanitizeHtmlContent } from '../utils/htmlSanitizer';

const prisma = new PrismaClient();

// ================== INTERFACES ==================

export interface NewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  dataStatus?: number;
  idCategory?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateNewsData {
  titleEn: string;
  titleId?: string;
  newsDate: Date | string;
  newsThumbnail?: string;
  excerptEn?: string;
  excerptId?: string;
  contentEn: string;
  contentId?: string;
  newsLink?: string;
  idCategory?: number;
  metaKeyword?: string;
  customCss?: string;
  customJs?: string;
  dataStatus?: number;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {}

// ================== BIGINT SERIALIZER ==================

function serializeNews(item: any) {
  if (!item) return item;
  return {
    ...item,
    id: item.id !== undefined ? Number(item.id) : item.id,
    idCategory: item.idCategory !== undefined ? (item.idCategory !== null ? Number(item.idCategory) : null) : undefined,
    viewCount: item.viewCount !== undefined ? Number(item.viewCount) : undefined,
    viewCountUnique: item.viewCountUnique !== undefined ? Number(item.viewCountUnique) : undefined,
    category: item.category ? {
      ...item.category,
      id: item.category.id !== undefined ? Number(item.category.id) : item.category.id,
    } : undefined,
    highlights: item.highlights ? item.highlights.map((h: any) => ({
      ...h,
      id: Number(h.id),
      idNews: Number(h.idNews),
    })) : undefined,
    // Computed: reading time estimation (~200 words per minute)
    readingTime: item.contentEn ? Math.max(1, Math.ceil(item.contentEn.replace(/<[^>]*>/g, '').split(/\\\\s+/).length / 200)) : 1,
  };
}

function serializeNewsList(items: any[]) {
  return items.map(serializeNews);
}

function serializeHighlight(h: any) {
  if (!h) return h;
  return {
    ...h,
    id: Number(h.id),
    idNews: Number(h.idNews),
    dataOrder: h.dataOrder !== null ? Number(h.dataOrder) : null,
    news: h.news ? serializeNews(h.news) : undefined,
  };
}

function serializeHighlights(items: any[]) {
  return items.map(serializeHighlight);
}

// ================== NEWS SERVICE ==================

export class NewsService {
  // Get news with pagination (CMS)
  async getNews(params: NewsQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      dataStatus,
      idCategory,
      sortBy = 'newsDate',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.NewsContentWhereInput = {};

    if (dataStatus !== undefined) {
      where.dataStatus = dataStatus;
    }

    if (idCategory !== undefined) {
      where.idCategory = BigInt(idCategory);
    }

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleId: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [news, total] = await Promise.all([
      prisma.newsContent.findMany({
        where,
        include: {
          category: {
            select: { id: true, categoryName: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.newsContent.count({ where }),
    ]);

    return {
      data: serializeNewsList(news),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // Get active news (public)
  async getActiveNews(params: NewsQueryParams) {
    const {
      page = 1,
      limit = 12,
      idCategory,
      sortBy = 'newsDate',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.NewsContentWhereInput = {
      dataStatus: 1,
    };

    if (idCategory !== undefined) {
      where.idCategory = BigInt(idCategory);
    }

    const [news, total] = await Promise.all([
      prisma.newsContent.findMany({
        where,
        include: {
          category: {
            select: { id: true, categoryName: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.newsContent.count({ where }),
    ]);

    return {
      data: serializeNewsList(news),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // Get active news by category slug (public)
  async getNewsByCategorySlug(categorySlug: string, page = 1, limit = 12) {
    const category = await prisma.newsCategory.findFirst({
      where: { slug: categorySlug, dataStatus: { in: [1, 2] } },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const skip = (page - 1) * limit;
    const where: Prisma.NewsContentWhereInput = {
      dataStatus: 1,
      idCategory: category.id,
    };

    const [news, total] = await Promise.all([
      prisma.newsContent.findMany({
        where,
        include: {
          category: {
            select: { id: true, categoryName: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { newsDate: 'desc' },
      }),
      prisma.newsContent.count({ where }),
    ]);

    return {
      data: serializeNewsList(news),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  // Get highlighted news
  async getHighlightedNews(limit = 5) {
    const highlights = await prisma.newsHighlight.findMany({
      include: {
        news: {
          include: {
            category: {
              select: { id: true, categoryName: true, slug: true },
            },
          },
        },
      },
      orderBy: { dataOrder: 'asc' },
      take: limit,
    });

    return serializeHighlights(
      highlights.filter((h) => h.news.dataStatus === 1)
    );
  }

  // Get single news by ID (CMS)
  async getNewsById(id: number) {
    const news = await prisma.newsContent.findUnique({
      where: { id: BigInt(id) },
      include: {
        category: true,
        highlights: true,
      },
    });

    if (!news) {
      throw new AppError('News not found', 404);
    }

    return serializeNews(news);
  }

  // Get news by slug (public)
  async getNewsBySlug(slug: string, trackView = false, ipAddress?: string, userAgent?: string) {
    const news = await prisma.newsContent.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!news || news.dataStatus !== 1) {
      throw new AppError('News not found', 404);
    }

    if (trackView) {
      await this.trackView(Number(news.id), ipAddress, userAgent);
    }

    return serializeNews(news);
  }

  // Track news view
  async trackView(newsId: number, ipAddress?: string, userAgent?: string) {
    const existingView = ipAddress
      ? await prisma.newsView.findFirst({
          where: {
            mediaId: BigInt(newsId),
            ipAddress,
            userAgent: userAgent || null,
          },
        })
      : null;

    await prisma.newsView.create({
      data: {
        mediaId: BigInt(newsId),
        ipAddress,
        userAgent,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await prisma.newsContent.update({
      where: { id: BigInt(newsId) },
      data: {
        viewCount: { increment: 1 },
        ...(existingView === null && ipAddress ? { viewCountUnique: { increment: 1 } } : {}),
      },
    });
  }

  // Create news
  async createNews(data: CreateNewsData, userEmail: string) {
    if (data.idCategory) {
      const category = await prisma.newsCategory.findUnique({
        where: { id: BigInt(data.idCategory) },
      });
      if (!category) {
        throw new AppError('Category not found', 400);
      }
    }

    const baseSlug = slugify(data.titleEn, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.newsContent.findUnique({ where: { slug } })) {
      slug = baseSlug + '-' + counter;
      counter++;
    }

    const now = new Date();
    const news = await prisma.newsContent.create({
      data: {
        titleEn: data.titleEn,
        titleId: data.titleId,
        slug,
        newsDate: new Date(data.newsDate),
        newsThumbnail: data.newsThumbnail,
        excerptEn: data.excerptEn ? sanitizeHtmlContent(data.excerptEn) : undefined,
        excerptId: data.excerptId ? sanitizeHtmlContent(data.excerptId) : undefined,
        contentEn: sanitizeHtmlContent(data.contentEn),
        contentId: data.contentId ? sanitizeHtmlContent(data.contentId) : undefined,
        newsLink: data.newsLink,
        idCategory: data.idCategory ? BigInt(data.idCategory) : null,
        metaKeyword: data.metaKeyword,
        customCss: data.customCss,
        customJs: data.customJs,
        dataStatus: data.dataStatus ?? 1,
        createdBy: userEmail,
        createdAt: now,
        updatedAt: now,
      },
      include: {
        category: true,
      },
    });

    return serializeNews(news);
  }

  // Update news
  async updateNews(id: number, data: UpdateNewsData, userEmail: string) {
    const existingNews = await prisma.newsContent.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingNews) {
      throw new AppError('News not found', 404);
    }

    if (data.idCategory !== undefined && data.idCategory !== null) {
      const category = await prisma.newsCategory.findUnique({
        where: { id: BigInt(data.idCategory) },
      });
      if (!category) {
        throw new AppError('Category not found', 400);
      }
    }

    let slug = existingNews.slug;
    if (data.titleEn && data.titleEn !== existingNews.titleEn) {
      const baseSlug = slugify(data.titleEn, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.newsContent.findFirst({
          where: { slug, id: { not: BigInt(id) } },
        });
        if (!existing) break;
        slug = baseSlug + '-' + counter;
        counter++;
      }
    }

    const news = await prisma.newsContent.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.titleEn !== undefined && { titleEn: data.titleEn, slug }),
        ...(data.titleId !== undefined && { titleId: data.titleId }),
        ...(data.newsDate !== undefined && { newsDate: new Date(data.newsDate) }),
        ...(data.newsThumbnail !== undefined && { newsThumbnail: data.newsThumbnail }),
        ...(data.excerptEn !== undefined && { excerptEn: data.excerptEn ? sanitizeHtmlContent(data.excerptEn) : null }),
        ...(data.excerptId !== undefined && { excerptId: data.excerptId ? sanitizeHtmlContent(data.excerptId) : null }),
        ...(data.contentEn !== undefined && { contentEn: sanitizeHtmlContent(data.contentEn) }),
        ...(data.contentId !== undefined && { contentId: data.contentId ? sanitizeHtmlContent(data.contentId) : null }),
        ...(data.newsLink !== undefined && { newsLink: data.newsLink }),
        ...(data.idCategory !== undefined && { idCategory: data.idCategory ? BigInt(data.idCategory) : null }),
        ...(data.metaKeyword !== undefined && { metaKeyword: data.metaKeyword }),
        ...(data.customCss !== undefined && { customCss: data.customCss }),
        ...(data.customJs !== undefined && { customJs: data.customJs }),
        ...(data.dataStatus !== undefined && { dataStatus: data.dataStatus }),
        updatedBy: userEmail,
        updatedAt: new Date(),
      },
      include: {
        category: true,
      },
    });

    return serializeNews(news);
  }

  // Delete news (hard delete, cascades to highlights & views via FK)
  async deleteNews(id: number) {
    const existingNews = await prisma.newsContent.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingNews) {
      throw new AppError('News not found', 404);
    }

    await prisma.newsContent.delete({
      where: { id: BigInt(id) },
    });
  }

  // ================== HIGHLIGHT MANAGEMENT ==================

  // Get all highlights
  async getHighlights() {
    const highlights = await prisma.newsHighlight.findMany({
      include: {
        news: {
          select: {
            id: true,
            titleEn: true,
            titleId: true,
            slug: true,
            newsThumbnail: true,
            newsDate: true,
            dataStatus: true,
          },
        },
      },
      orderBy: { dataOrder: 'asc' },
    });

    return serializeHighlights(highlights);
  }

  // Get available news for highlight (active & not yet highlighted)
  async getAvailableForHighlight() {
    const highlightedNewsIds = await prisma.newsHighlight.findMany({
      select: { idNews: true },
    });

    const excludeIds = highlightedNewsIds.map((h) => h.idNews);

    const where: Prisma.NewsContentWhereInput = {
      dataStatus: 1,
    };

    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }

    const news = await prisma.newsContent.findMany({
      where,
      orderBy: { newsDate: 'desc' },
      select: {
        id: true,
        titleEn: true,
        titleId: true,
        slug: true,
        newsThumbnail: true,
        newsDate: true,
      },
    });

    return news.map((n) => ({
      ...n,
      id: Number(n.id),
    }));
  }

  // Create highlight
  async createHighlight(idNews: number, userEmail: string) {
    const news = await prisma.newsContent.findUnique({
      where: { id: BigInt(idNews) },
    });

    if (!news) {
      throw new AppError('News not found', 404);
    }

    if (news.dataStatus !== 1) {
      throw new AppError('Only active news can be highlighted', 400);
    }

    const existing = await prisma.newsHighlight.findFirst({
      where: { idNews: BigInt(idNews) },
    });
    if (existing) {
      throw new AppError('News is already highlighted', 400);
    }

    const maxOrder = await prisma.newsHighlight.aggregate({
      _max: { dataOrder: true },
    });
    const nextOrder = (maxOrder._max?.dataOrder || 0) + 1;

    const highlight = await prisma.newsHighlight.create({
      data: {
        idNews: BigInt(idNews),
        dataOrder: nextOrder,
        createdBy: userEmail,
        updatedBy: userEmail,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        news: {
          select: {
            id: true,
            titleEn: true,
            titleId: true,
            slug: true,
            newsThumbnail: true,
            newsDate: true,
            dataStatus: true,
          },
        },
      },
    });

    return serializeHighlight(highlight);
  }

  // Remove highlight
  async removeHighlight(id: number) {
    const highlight = await prisma.newsHighlight.findUnique({
      where: { id: BigInt(id) },
    });

    if (!highlight) {
      throw new AppError('Highlight not found', 404);
    }

    await prisma.newsHighlight.delete({
      where: { id: BigInt(id) },
    });
  }

  // Bulk remove highlights
  async bulkRemoveHighlights(ids: number[]) {
    await prisma.newsHighlight.deleteMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
    });
  }

  // Reorder highlights
  async reorderHighlights(updates: { id: number; order: number }[], userEmail: string) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.newsHighlight.update({
          where: { id: BigInt(update.id) },
          data: { dataOrder: update.order, updatedBy: userEmail, updatedAt: new Date() },
        })
      )
    );
  }
}

export default new NewsService();
`;

// =====================================
// 2. NEWS CONTROLLER
// =====================================
const newsController = `import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import newsService, { NewsQueryParams, CreateNewsData, UpdateNewsData } from '../services/news.service';
import { AppError } from '../types/error.types';

export class NewsController {
  // ================== CMS ENDPOINTS ==================

  // Get all news with pagination (CMS)
  async getNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, dataStatus, idCategory, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        dataStatus: dataStatus !== undefined ? parseInt(dataStatus as string, 10) : undefined,
        idCategory: idCategory ? parseInt(idCategory as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsService.getNews(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single news by ID (CMS)
  async getNewsById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid News ID', 400);
      }

      const news = await newsService.getNewsById(id);

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create news (CMS)
  async createNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        titleEn,
        titleId,
        newsDate,
        newsThumbnail,
        excerptEn,
        excerptId,
        contentEn,
        contentId,
        newsLink,
        idCategory,
        metaKeyword,
        customCss,
        customJs,
        dataStatus,
      } = req.body;

      if (!titleEn || titleEn.trim() === '') {
        throw new AppError('Title (English) is required', 400);
      }
      if (!contentEn || contentEn.trim() === '') {
        throw new AppError('Content (English) is required', 400);
      }
      if (!newsDate) {
        throw new AppError('News date is required', 400);
      }

      const data: CreateNewsData = {
        titleEn: titleEn.trim(),
        titleId: titleId?.trim(),
        newsDate,
        newsThumbnail,
        excerptEn: excerptEn?.trim(),
        excerptId: excerptId?.trim(),
        contentEn: contentEn.trim(),
        contentId: contentId?.trim(),
        newsLink: newsLink?.trim(),
        idCategory: idCategory ? parseInt(idCategory, 10) : undefined,
        metaKeyword: metaKeyword?.trim(),
        customCss: customCss?.trim(),
        customJs: customJs?.trim(),
        dataStatus: dataStatus !== undefined ? parseInt(dataStatus, 10) : undefined,
      };

      const userEmail = req.user?.email || 'system@admin.com';
      const news = await newsService.createNews(data, userEmail);

      res.status(201).json({
        success: true,
        message: 'News created successfully',
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update news (CMS)
  async updateNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid News ID', 400);
      }

      const {
        titleEn,
        titleId,
        newsDate,
        newsThumbnail,
        excerptEn,
        excerptId,
        contentEn,
        contentId,
        newsLink,
        idCategory,
        metaKeyword,
        customCss,
        customJs,
        dataStatus,
      } = req.body;

      if (titleEn !== undefined && titleEn.trim() === '') {
        throw new AppError('Title (English) cannot be empty', 400);
      }
      if (contentEn !== undefined && contentEn.trim() === '') {
        throw new AppError('Content (English) cannot be empty', 400);
      }

      const data: UpdateNewsData = {
        ...(titleEn !== undefined && { titleEn: titleEn.trim() }),
        ...(titleId !== undefined && { titleId: titleId?.trim() }),
        ...(newsDate !== undefined && { newsDate }),
        ...(newsThumbnail !== undefined && { newsThumbnail }),
        ...(excerptEn !== undefined && { excerptEn: excerptEn?.trim() }),
        ...(excerptId !== undefined && { excerptId: excerptId?.trim() }),
        ...(contentEn !== undefined && { contentEn: contentEn.trim() }),
        ...(contentId !== undefined && { contentId: contentId?.trim() }),
        ...(newsLink !== undefined && { newsLink: newsLink?.trim() }),
        ...(idCategory !== undefined && { idCategory: idCategory ? parseInt(idCategory, 10) : null }),
        ...(metaKeyword !== undefined && { metaKeyword: metaKeyword?.trim() }),
        ...(customCss !== undefined && { customCss: customCss?.trim() }),
        ...(customJs !== undefined && { customJs: customJs?.trim() }),
        ...(dataStatus !== undefined && { dataStatus: parseInt(dataStatus, 10) }),
      };

      const userEmail = req.user?.email || 'system@admin.com';
      const news = await newsService.updateNews(id, data, userEmail);

      res.json({
        success: true,
        message: 'News updated successfully',
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete news (CMS)
  async deleteNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid News ID', 400);
      }

      await newsService.deleteNews(id);

      res.json({
        success: true,
        message: 'News deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== PUBLIC ENDPOINTS ==================

  // Get active news (Public)
  async getActiveNews(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, idCategory, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        idCategory: idCategory ? parseInt(idCategory as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsService.getActiveNews(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get news by category slug (Public)
  async getNewsByCategorySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { categorySlug } = req.params;
      const { page, limit } = req.query;

      if (!categorySlug) {
        throw new AppError('Category slug is required', 400);
      }

      const result = await newsService.getNewsByCategorySlug(
        categorySlug,
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 12
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get highlighted news (Public)
  async getHighlightedNews(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const news = await newsService.getHighlightedNews(
        limit ? parseInt(limit as string, 10) : 5
      );

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get news by slug (Public)
  async getNewsBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw new AppError('Slug is required', 400);
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const news = await newsService.getNewsBySlug(slug, true, ipAddress, userAgent);

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== HIGHLIGHT MANAGEMENT ==================

  // Get all highlights (CMS)
  async getHighlights(_req: Request, res: Response, next: NextFunction) {
    try {
      const highlights = await newsService.getHighlights();

      res.json({
        success: true,
        data: highlights,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get available news for highlight (CMS)
  async getAvailableForHighlight(_req: Request, res: Response, next: NextFunction) {
    try {
      const news = await newsService.getAvailableForHighlight();

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create highlight (CMS)
  async createHighlight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { idNews } = req.body;

      if (!idNews) {
        throw new AppError('News ID is required', 400);
      }

      const userEmail = req.user?.email || 'system@admin.com';
      const highlight = await newsService.createHighlight(parseInt(idNews, 10), userEmail);

      res.status(201).json({
        success: true,
        message: 'Highlight created successfully',
        data: highlight,
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove highlight (CMS)
  async removeHighlight(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid Highlight ID', 400);
      }

      await newsService.removeHighlight(id);

      res.json({
        success: true,
        message: 'Highlight removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk remove highlights (CMS)
  async bulkRemoveHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      await newsService.bulkRemoveHighlights(ids.map((id: any) => parseInt(id, 10)));

      res.json({
        success: true,
        message: 'Highlights removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Reorder highlights (CMS)
  async reorderHighlights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates array is required', 400);
      }

      const userEmail = req.user?.email || 'system@admin.com';
      await newsService.reorderHighlights(updates, userEmail);

      res.json({
        success: true,
        message: 'Highlights reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== NEWS VIEW (Public) ==================

  // Track view (Public, no auth)
  async trackNewsView(req: Request, res: Response, next: NextFunction) {
    try {
      const newsId = parseInt(req.params.newsId, 10);
      if (isNaN(newsId)) {
        throw new AppError('Invalid News ID', 400);
      }

      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await newsService.trackView(newsId, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'View tracked',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsController();
`;

// =====================================
// 3. NEWS CATEGORY CONTROLLER
// =====================================
const newsCatController = `import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import newsCategoryService, {
  CategoryQueryParams,
  CreateCategoryData,
  UpdateCategoryData,
} from '../services/news-category.service';
import { AppError } from '../types/error.types';

export class NewsCategoryController {
  // ================== CMS ENDPOINTS ==================

  // Get all categories with pagination (CMS)
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, dataStatus, sortBy, sortOrder } = req.query;

      const params: CategoryQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        dataStatus: dataStatus !== undefined ? parseInt(dataStatus as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsCategoryService.getCategories(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all active categories (for dropdowns)
  async getActiveCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await newsCategoryService.getActiveCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single category by ID (CMS)
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid Category ID', 400);
      }

      const category = await newsCategoryService.getCategoryById(id);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create category (CMS)
  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { categoryName, slug, dataOrder, dataStatus } = req.body;

      if (!categoryName || categoryName.trim() === '') {
        throw new AppError('Category name is required', 400);
      }

      const data: CreateCategoryData = {
        categoryName: categoryName.trim(),
        slug: slug?.trim(),
        dataOrder: dataOrder !== undefined ? parseInt(dataOrder, 10) : undefined,
        dataStatus: dataStatus !== undefined ? parseInt(dataStatus, 10) : undefined,
      };

      const userEmail = req.user?.email || 'system@admin.com';
      const category = await newsCategoryService.createCategory(data, userEmail);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update category (CMS)
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid Category ID', 400);
      }

      const { categoryName, slug, dataOrder, dataStatus } = req.body;

      if (categoryName !== undefined && categoryName.trim() === '') {
        throw new AppError('Category name cannot be empty', 400);
      }

      const data: UpdateCategoryData = {
        ...(categoryName !== undefined && { categoryName: categoryName.trim() }),
        ...(slug !== undefined && { slug: slug?.trim() }),
        ...(dataOrder !== undefined && { dataOrder: parseInt(dataOrder, 10) }),
        ...(dataStatus !== undefined && { dataStatus: parseInt(dataStatus, 10) }),
      };

      const userEmail = req.user?.email || 'system@admin.com';
      const category = await newsCategoryService.updateCategory(id, data, userEmail);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle status (CMS)
  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid Category ID', 400);
      }

      const userEmail = req.user?.email || 'system@admin.com';
      const category = await newsCategoryService.toggleStatus(id, userEmail);

      res.json({
        success: true,
        message: 'Category status toggled successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete category (CMS)
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid Category ID', 400);
      }

      await newsCategoryService.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk delete categories (CMS)
  async bulkDeleteCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await newsCategoryService.bulkDeleteCategories(
        ids.map((id: any) => parseInt(id, 10))
      );

      res.json({
        success: true,
        message: 'Categories deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reorder categories (CMS)
  async updateCategoryOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates array is required', 400);
      }

      await newsCategoryService.updateCategoryOrder(updates);

      res.json({
        success: true,
        message: 'Category order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== PUBLIC ENDPOINTS ==================

  // Get category by slug (Public)
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw new AppError('Slug is required', 400);
      }

      const category = await newsCategoryService.getCategoryBySlug(slug);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsCategoryController();
`;

// =====================================
// 4. NEWS ROUTES
// =====================================
const newsRoutes = `import { Router } from 'express';
import newsController from '../controllers/news.controller';
import newsCategoryController from '../controllers/news-category.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';

const router = Router();

// ================== PUBLIC NEWS ROUTES ==================

// Get active news (Public)
router.get('/public/news', newsController.getActiveNews);

// Get highlighted news (Public)
router.get('/public/news/highlights', newsController.getHighlightedNews);

// Get news by slug (Public, auto-track view)
router.get('/public/news/:slug', newsController.getNewsBySlug);

// Get news by category slug (Public, paginated)
router.get('/public/news/category/:categorySlug', newsController.getNewsByCategorySlug);

// Track news view (Public, no auth)
router.post('/news-views/:newsId', newsController.trackNewsView);

// Get active categories (Public)
router.get('/news-categories', newsCategoryController.getActiveCategories);

// Get category by slug (Public)
router.get('/news-categories/:slug', newsCategoryController.getCategoryBySlug);

// ================== CMS NEWS ROUTES ==================

// Get all news (CMS)
router.get(
  '/cms/news',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getNews
);

// Get single news by ID (CMS)
router.get(
  '/cms/news/:id',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getNewsById
);

// Create news (CMS)
router.post(
  '/cms/news',
  authMiddleware,
  requirePermission('news.create'),
  newsController.createNews
);

// Update news (CMS)
router.put(
  '/cms/news/:id',
  authMiddleware,
  requirePermission('news.update'),
  newsController.updateNews
);

// Delete news (CMS)
router.delete(
  '/cms/news/:id',
  authMiddleware,
  requirePermission('news.delete'),
  newsController.deleteNews
);

// ================== CMS HIGHLIGHT ROUTES ==================

// Get all highlights (CMS)
router.get(
  '/cms/news-highlights',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getHighlights
);

// Get available news for highlight (CMS)
router.get(
  '/cms/news-highlights/available',
  authMiddleware,
  requirePermission('news.read'),
  newsController.getAvailableForHighlight
);

// Create highlight (CMS)
router.post(
  '/cms/news-highlights',
  authMiddleware,
  requirePermission('news.update'),
  newsController.createHighlight
);

// Reorder highlights (CMS)
router.put(
  '/cms/news-highlights/reorder',
  authMiddleware,
  requirePermission('news.update'),
  newsController.reorderHighlights
);

// Bulk delete highlights (CMS) - must be before :id route
router.delete(
  '/cms/news-highlights/bulk',
  authMiddleware,
  requirePermission('news.update'),
  newsController.bulkRemoveHighlights
);

// Delete single highlight (CMS)
router.delete(
  '/cms/news-highlights/:id',
  authMiddleware,
  requirePermission('news.update'),
  newsController.removeHighlight
);

// ================== CMS CATEGORY ROUTES ==================

// Get all categories (CMS)
router.get(
  '/cms/news-categories',
  authMiddleware,
  requirePermission('news.read'),
  newsCategoryController.getCategories
);

// Get all active categories (for dropdowns) - No permission needed, just auth
router.get(
  '/cms/news-categories/active',
  authMiddleware,
  newsCategoryController.getActiveCategories
);

// Reorder categories (CMS) - must be before :id route
router.put(
  '/cms/news-categories/reorder',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.updateCategoryOrder
);

// Bulk delete categories (CMS) - must be before :id route
router.delete(
  '/cms/news-categories/bulk',
  authMiddleware,
  requirePermission('news.delete'),
  newsCategoryController.bulkDeleteCategories
);

// Get single category by ID (CMS)
router.get(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.read'),
  newsCategoryController.getCategoryById
);

// Create category (CMS)
router.post(
  '/cms/news-categories',
  authMiddleware,
  requirePermission('news.create'),
  newsCategoryController.createCategory
);

// Update category (CMS)
router.put(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.updateCategory
);

// Toggle category status (CMS)
router.patch(
  '/cms/news-categories/:id/status',
  authMiddleware,
  requirePermission('news.update'),
  newsCategoryController.toggleStatus
);

// Delete category (CMS)
router.delete(
  '/cms/news-categories/:id',
  authMiddleware,
  requirePermission('news.delete'),
  newsCategoryController.deleteCategory
);

export default router;
`;

// Write all files
fs.writeFileSync(path.join(baseDir, 'src', 'services', 'news.service.ts'), newsService, 'utf8');
fs.writeFileSync(path.join(baseDir, 'src', 'controllers', 'news.controller.ts'), newsController, 'utf8');
fs.writeFileSync(path.join(baseDir, 'src', 'controllers', 'news-category.controller.ts'), newsCatController, 'utf8');
fs.writeFileSync(path.join(baseDir, 'src', 'routes', 'news.routes.ts'), newsRoutes, 'utf8');

console.log('All backend news files written successfully!');
