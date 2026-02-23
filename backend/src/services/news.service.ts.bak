import { PrismaClient, ContentStatus, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { sanitizeHtmlContent } from '../utils/htmlSanitizer';

const prisma = new PrismaClient();

// ================== INTERFACES ==================

export interface NewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContentStatus;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateNewsData {
  titleEn: string;
  titleId?: string;
  newsDate: Date | string;
  thumbnail?: string;
  excerptEn?: string;
  excerptId?: string;
  contentEn: string;
  contentId?: string;
  newsLink?: string;
  categoryId: string;
  metaKeywords?: string;
  customCss?: string;
  customJs?: string;
  status?: ContentStatus;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {}

// ================== NEWS SERVICE ==================

export class NewsService {
  // Get news with pagination
  async getNews(params: NewsQueryParams, _userId?: string) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      categoryId,
      sortBy = 'newsDate',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.NewsWhereInput = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleId: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          category: {
            select: { id: true, nameEn: true, nameId: true, slug: true },
          },
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      data: news,
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
      limit = 10,
      categoryId,
      sortBy = 'newsDate',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.NewsWhereInput = {
      deletedAt: null,
      status: 'PUBLISHED',
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          category: {
            select: { id: true, nameEn: true, nameId: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      data: news,
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
              select: { id: true, nameEn: true, nameId: true, slug: true },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
      take: limit,
    });

    return highlights
      .filter((h) => h.news.deletedAt === null && h.news.status === 'PUBLISHED')
      .map((h) => h.news);
  }

  // Get single news by ID
  async getNewsById(id: string) {
    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        updatedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        highlights: true,
      },
    });

    if (!news || news.deletedAt) {
      throw new AppError('News not found', 404);
    }

    return news;
  }

  // Get news by slug (public)
  async getNewsBySlug(slug: string, trackView = false, ipAddress?: string, userAgent?: string) {
    const news = await prisma.news.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!news || news.deletedAt || news.status !== 'PUBLISHED') {
      throw new AppError('News not found', 404);
    }

    // Track view
    if (trackView) {
      await this.trackView(news.id, ipAddress, userAgent);
    }

    return news;
  }

  // Track news view
  async trackView(newsId: string, ipAddress?: string, userAgent?: string) {
    // Check if this IP has viewed this news before
    const existingView = ipAddress
      ? await prisma.newsView.findFirst({
          where: { newsId, ipAddress },
        })
      : null;

    // Create view record
    await prisma.newsView.create({
      data: { newsId, ipAddress, userAgent },
    });

    // Update view counts
    await prisma.news.update({
      where: { id: newsId },
      data: {
        viewCount: { increment: 1 },
        ...(existingView === null && { viewCountUnique: { increment: 1 } }),
      },
    });
  }

  // Create news
  async createNews(data: CreateNewsData, userId: string) {
    // Validate category
    const category = await prisma.newsCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 400);
    }

    // Generate slug
    const baseSlug = slugify(data.titleEn, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.news.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const news = await prisma.news.create({
      data: {
        titleEn: data.titleEn,
        titleId: data.titleId,
        slug,
        newsDate: new Date(data.newsDate),
        thumbnail: data.thumbnail,
        excerptEn: data.excerptEn ? sanitizeHtmlContent(data.excerptEn) : undefined,
        excerptId: data.excerptId ? sanitizeHtmlContent(data.excerptId) : undefined,
        contentEn: sanitizeHtmlContent(data.contentEn),
        contentId: data.contentId ? sanitizeHtmlContent(data.contentId) : undefined,
        newsLink: data.newsLink,
        categoryId: data.categoryId,
        metaKeywords: data.metaKeywords,
        customCss: data.customCss,
        customJs: data.customJs,
        status: data.status || 'DRAFT',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        createdById: userId,
      },
      include: {
        category: true,
      },
    });

    return news;
  }

  // Update news
  async updateNews(id: string, data: UpdateNewsData, userId: string) {
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews || existingNews.deletedAt) {
      throw new AppError('News not found', 404);
    }

    // Validate category if changing
    if (data.categoryId && data.categoryId !== existingNews.categoryId) {
      const category = await prisma.newsCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category || category.deletedAt) {
        throw new AppError('Category not found', 400);
      }
    }

    // Update slug if title changes
    let slug = existingNews.slug;
    if (data.titleEn && data.titleEn !== existingNews.titleEn) {
      const baseSlug = slugify(data.titleEn, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.news.findFirst({
          where: { slug, id: { not: id } },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        ...(data.titleEn !== undefined && { titleEn: data.titleEn, slug }),
        ...(data.titleId !== undefined && { titleId: data.titleId }),
        ...(data.newsDate !== undefined && { newsDate: new Date(data.newsDate) }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.excerptEn !== undefined && { excerptEn: sanitizeHtmlContent(data.excerptEn) }),
        ...(data.excerptId !== undefined && { excerptId: data.excerptId ? sanitizeHtmlContent(data.excerptId) : undefined }),
        ...(data.contentEn !== undefined && { contentEn: sanitizeHtmlContent(data.contentEn) }),
        ...(data.contentId !== undefined && { contentId: data.contentId ? sanitizeHtmlContent(data.contentId) : undefined }),
        ...(data.newsLink !== undefined && { newsLink: data.newsLink }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
        ...(data.customCss !== undefined && { customCss: data.customCss }),
        ...(data.customJs !== undefined && { customJs: data.customJs }),
        ...(data.status !== undefined && {
          status: data.status,
          publishedAt:
            data.status === 'PUBLISHED' && !existingNews.publishedAt
              ? new Date()
              : existingNews.publishedAt,
        }),
        updatedById: userId,
      },
      include: {
        category: true,
      },
    });

    return news;
  }

  // Delete news (soft delete)
  async deleteNews(id: string) {
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews || existingNews.deletedAt) {
      throw new AppError('News not found', 404);
    }

    await prisma.news.update({
      where: { id },
      data: { deletedAt: new Date() },
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
            thumbnail: true,
            newsDate: true,
            status: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return highlights;
  }

  // Set highlight
  async setHighlight(newsId: string, position: number, userId: string) {
    // Validate news
    const news = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!news || news.deletedAt) {
      throw new AppError('News not found', 404);
    }

    // Check if position is taken
    const existingPosition = await prisma.newsHighlight.findUnique({
      where: { position },
    });

    if (existingPosition && existingPosition.newsId !== newsId) {
      throw new AppError('Position is already taken', 400);
    }

    // Check if news is already highlighted
    const existingHighlight = await prisma.newsHighlight.findUnique({
      where: { newsId },
    });

    if (existingHighlight) {
      // Update position
      return prisma.newsHighlight.update({
        where: { newsId },
        data: { position, updatedById: userId },
      });
    }

    // Create new highlight
    return prisma.newsHighlight.create({
      data: {
        newsId,
        position,
        createdById: userId,
      },
    });
  }

  // Remove highlight
  async removeHighlight(newsId: string) {
    const highlight = await prisma.newsHighlight.findUnique({
      where: { newsId },
    });

    if (!highlight) {
      throw new AppError('Highlight not found', 404);
    }

    await prisma.newsHighlight.delete({
      where: { newsId },
    });
  }

  // Reorder highlights
  async reorderHighlights(updates: { newsId: string; position: number }[], userId: string) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.newsHighlight.update({
          where: { newsId: update.newsId },
          data: { position: update.position, updatedById: userId },
        })
      )
    );
  }
}

export default new NewsService();
