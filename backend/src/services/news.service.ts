import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { sanitizeHtmlContent } from '../utils/htmlSanitizer';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ================== INTERFACES ==================

export interface NewsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category_id?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateNewsData {
  title_en: string;
  title_id?: string;
  news_date: Date | string;
  news_thumbnail?: string;
  excerpt_en?: string;
  excerpt_id?: string;
  content_en: string;
  content_id?: string;
  news_link?: string;
  category_id?: string;
  meta_keywords?: string;
  custom_css?: string;
  custom_js?: string;
  status?: string;
}

export interface UpdateNewsData extends Partial<CreateNewsData> {}

// ================== SERIALIZER ==================

function serializeNews(item: any) {
  if (!item) return item;
  return {
    ...item,
    category: item.news_categories ? {
      ...item.news_categories,
    } : undefined,
    news_categories: undefined,
    // Computed: reading time estimation (~200 words per minute)
    readingTime: item.content_en ? Math.max(1, Math.ceil(item.content_en.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) : 1,
  };
}

function serializeNewsList(items: any[]) {
  return items.map(serializeNews);
}

function serializeHighlight(h: any) {
  if (!h) return h;
  return {
    ...h,
    news: h.news ? serializeNews(h.news) : undefined,
  };
}

function serializeHighlights(items: any[]) {
  return items.map(serializeHighlight);
}

// ================== NEWS SERVICE ==================

// Map frontend camelCase field names to actual Prisma column names
const NEWS_SORT_FIELD_MAP: Record<string, string> = {
  newsDate: 'news_date',
  news_date: 'news_date',
  createdAt: 'created_at',
  created_at: 'created_at',
  updatedAt: 'updated_at',
  updated_at: 'updated_at',
  titleEn: 'title_en',
  title_en: 'title_en',
  titleId: 'title_id',
  title_id: 'title_id',
  viewCount: 'view_count',
  view_count: 'view_count',
  slug: 'slug',
  status: 'status',
};

export class NewsService {
  // Get news with pagination (CMS)
  async getNews(params: NewsQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category_id,
      sortBy: rawSortBy = 'news_date',
      sortOrder = 'desc',
    } = params;

    const sortBy = NEWS_SORT_FIELD_MAP[rawSortBy] || 'news_date';
    const skip = (page - 1) * limit;

    const where: Prisma.newsWhereInput = {};

    if (status !== undefined) {
      where.status = status as any;
    }

    if (category_id !== undefined) {
      where.category_id = category_id;
    }

    if (search) {
      where.OR = [
        { title_en: { contains: search, mode: 'insensitive' } },
        { title_id: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [newsItems, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          news_categories: {
            select: { id: true, name_en: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      data: serializeNewsList(newsItems),
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
      search,
      category_id,
      sortBy: rawSortBy = 'news_date',
      sortOrder = 'desc',
    } = params;

    const sortBy = NEWS_SORT_FIELD_MAP[rawSortBy] || 'news_date';
    const skip = (page - 1) * limit;

    const where: Prisma.newsWhereInput = {
      status: 'PUBLISHED',
      deleted_at: null,
    };

    if (category_id !== undefined) {
      where.category_id = category_id;
    }

    if (search) {
      where.OR = [
        { title_en: { contains: search, mode: 'insensitive' } },
        { title_id: { contains: search, mode: 'insensitive' } },
        { content_en: { contains: search, mode: 'insensitive' } },
        { content_id: { contains: search, mode: 'insensitive' } },
        { excerpt_en: { contains: search, mode: 'insensitive' } },
        { excerpt_id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [newsItems, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          news_categories: {
            select: { id: true, name_en: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      data: serializeNewsList(newsItems),
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
    const category = await prisma.news_categories.findFirst({
      where: { slug: categorySlug, is_active: true, deleted_at: null },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const skip = (page - 1) * limit;
    const where: Prisma.newsWhereInput = {
      status: 'PUBLISHED',
      deleted_at: null,
      category_id: category.id,
    };

    const [newsItems, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          news_categories: {
            select: { id: true, name_en: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { news_date: 'desc' },
      }),
      prisma.news.count({ where }),
    ]);

    return {
      data: serializeNewsList(newsItems),
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
    const highlights = await prisma.news_highlights.findMany({
      include: {
        news: {
          include: {
            news_categories: {
              select: { id: true, name_en: true, slug: true },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
      take: limit,
    });

    return serializeHighlights(
      highlights.filter((h: any) => h.news.status === 'PUBLISHED')
    );
  }

  // Get single news by ID (CMS)
  async getNewsById(id: string) {
    const newsItem = await prisma.news.findUnique({
      where: { id },
      include: {
        news_categories: true,
        news_highlights: true,
      },
    });

    if (!newsItem) {
      throw new AppError('News not found', 404);
    }

    return serializeNews(newsItem);
  }

  // Get news by slug (public)
  async getNewsBySlug(slug: string, trackView = false, ipAddress?: string, userAgent?: string) {
    const newsItem = await prisma.news.findUnique({
      where: { slug },
      include: {
        news_categories: true,
      },
    });

    if (!newsItem || newsItem.status !== 'PUBLISHED') {
      throw new AppError('News not found', 404);
    }

    if (trackView) {
      await this.trackView(newsItem.id, ipAddress, userAgent);
    }

    return serializeNews(newsItem);
  }

  // Track news view
  async trackView(newsId: string, ipAddress?: string, userAgent?: string) {
    const existingView = ipAddress
      ? await prisma.news_views.findFirst({
          where: {
            news_id: newsId,
            ip_address: ipAddress,
            user_agent: userAgent || null,
          },
        })
      : null;

    await prisma.news_views.create({
      data: {
        id: uuidv4(),
        news_id: newsId,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    await prisma.news.update({
      where: { id: newsId },
      data: {
        view_count: { increment: 1 },
        ...(existingView === null && ipAddress ? { view_count_unique: { increment: 1 } } : {}),
      },
    });
  }

  // Create news
  async createNews(data: CreateNewsData, userId: string) {
    if (data.category_id) {
      const category = await prisma.news_categories.findUnique({
        where: { id: data.category_id },
      });
      if (!category) {
        throw new AppError('Category not found', 400);
      }
    }

    const baseSlug = slugify(data.title_en, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.news.findUnique({ where: { slug } })) {
      slug = baseSlug + '-' + counter;
      counter++;
    }

    const now = new Date();
    const newsItem = await prisma.news.create({
      data: {
        id: uuidv4(),
        title_en: data.title_en,
        title_id: data.title_id,
        slug,
        news_date: new Date(data.news_date),
        news_thumbnail: data.news_thumbnail,
        excerpt_en: data.excerpt_en ? sanitizeHtmlContent(data.excerpt_en) : undefined,
        excerpt_id: data.excerpt_id ? sanitizeHtmlContent(data.excerpt_id) : undefined,
        content_en: sanitizeHtmlContent(data.content_en),
        content_id: data.content_id ? sanitizeHtmlContent(data.content_id) : undefined,
        news_link: data.news_link,
        category_id: data.category_id || '',
        meta_keywords: data.meta_keywords,
        custom_css: data.custom_css,
        custom_js: data.custom_js,
        status: (data.status as any) ?? 'PUBLISHED',
        created_by_id: userId,
        updated_by_id: userId,
        created_at: now,
        updated_at: now,
      },
      include: {
        news_categories: true,
      },
    });

    return serializeNews(newsItem);
  }

  // Update news
  async updateNews(id: string, data: UpdateNewsData, userId: string) {
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      throw new AppError('News not found', 404);
    }

    if (data.category_id !== undefined && data.category_id !== null) {
      const category = await prisma.news_categories.findUnique({
        where: { id: data.category_id },
      });
      if (!category) {
        throw new AppError('Category not found', 400);
      }
    }

    let slug = existingNews.slug;
    if (data.title_en && data.title_en !== existingNews.title_en) {
      const baseSlug = slugify(data.title_en, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.news.findFirst({
          where: { slug, id: { not: id } },
        });
        if (!existing) break;
        slug = baseSlug + '-' + counter;
        counter++;
      }
    }

    const newsItem = await prisma.news.update({
      where: { id },
      data: {
        ...(data.title_en !== undefined && { title_en: data.title_en, slug }),
        ...(data.title_id !== undefined && { title_id: data.title_id }),
        ...(data.news_date !== undefined && { news_date: new Date(data.news_date) }),
        ...(data.news_thumbnail !== undefined && { news_thumbnail: data.news_thumbnail }),
        ...(data.excerpt_en !== undefined && { excerpt_en: data.excerpt_en ? sanitizeHtmlContent(data.excerpt_en) : null }),
        ...(data.excerpt_id !== undefined && { excerpt_id: data.excerpt_id ? sanitizeHtmlContent(data.excerpt_id) : null }),
        ...(data.content_en !== undefined && { content_en: sanitizeHtmlContent(data.content_en) }),
        ...(data.content_id !== undefined && { content_id: data.content_id ? sanitizeHtmlContent(data.content_id) : null }),
        ...(data.news_link !== undefined && { news_link: data.news_link }),
        ...(data.category_id !== undefined && { category_id: data.category_id || '' }),
        ...(data.meta_keywords !== undefined && { meta_keywords: data.meta_keywords }),
        ...(data.custom_css !== undefined && { custom_css: data.custom_css }),
        ...(data.custom_js !== undefined && { custom_js: data.custom_js }),
        ...(data.status !== undefined && { status: data.status as any }),
        updated_by_id: userId,
        updated_at: new Date(),
      },
      include: {
        news_categories: true,
      },
    });

    return serializeNews(newsItem);
  }

  // Delete news (hard delete, cascades to highlights & views via FK)
  async deleteNews(id: string) {
    const existingNews = await prisma.news.findUnique({
      where: { id },
    });

    if (!existingNews) {
      throw new AppError('News not found', 404);
    }

    await prisma.news.delete({
      where: { id },
    });
  }

  // ================== HIGHLIGHT MANAGEMENT ==================

  // Get all highlights
  async getHighlights() {
    const highlights = await prisma.news_highlights.findMany({
      include: {
        news: {
          select: {
            id: true,
            title_en: true,
            title_id: true,
            slug: true,
            news_thumbnail: true,
            news_date: true,
            status: true,
          },
        },
      },
      orderBy: { position: 'asc' },
    });

    return serializeHighlights(highlights);
  }

  // Get available news for highlight (active & not yet highlighted)
  async getAvailableForHighlight() {
    const highlightedNewsIds = await prisma.news_highlights.findMany({
      select: { news_id: true },
    });

    const excludeIds = highlightedNewsIds.map((h: any) => h.news_id);

    const where: Prisma.newsWhereInput = {
      status: 'PUBLISHED',
      deleted_at: null,
    };

    if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }

    const newsItems = await prisma.news.findMany({
      where,
      orderBy: { news_date: 'desc' },
      select: {
        id: true,
        title_en: true,
        title_id: true,
        slug: true,
        news_thumbnail: true,
        news_date: true,
      },
    });

    return newsItems;
  }

  // Create highlight
  async createHighlight(newsId: string, userId: string) {
    const newsItem = await prisma.news.findUnique({
      where: { id: newsId },
    });

    if (!newsItem) {
      throw new AppError('News not found', 404);
    }

    if (newsItem.status !== 'PUBLISHED') {
      throw new AppError('Only published news can be highlighted', 400);
    }

    const existing = await prisma.news_highlights.findFirst({
      where: { news_id: newsId },
    });
    if (existing) {
      throw new AppError('News is already highlighted', 400);
    }

    const maxOrder = await prisma.news_highlights.aggregate({
      _max: { position: true },
    });
    const nextOrder = (maxOrder._max?.position || 0) + 1;

    const highlight = await prisma.news_highlights.create({
      data: {
        id: uuidv4(),
        news_id: newsId,
        position: nextOrder,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        news: {
          select: {
            id: true,
            title_en: true,
            title_id: true,
            slug: true,
            news_thumbnail: true,
            news_date: true,
            status: true,
          },
        },
      },
    });

    return serializeHighlight(highlight);
  }

  // Remove highlight
  async removeHighlight(id: string) {
    const highlight = await prisma.news_highlights.findUnique({
      where: { id },
    });

    if (!highlight) {
      throw new AppError('Highlight not found', 404);
    }

    await prisma.news_highlights.delete({
      where: { id },
    });
  }

  // Bulk remove highlights
  async bulkRemoveHighlights(ids: string[]) {
    await prisma.news_highlights.deleteMany({
      where: { id: { in: ids } },
    });
  }

  // Reorder highlights
  async reorderHighlights(updates: { id: string; order: number }[], userId: string) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.news_highlights.update({
          where: { id: update.id },
          data: { position: update.order, updated_by: userId, updated_at: new Date() },
        })
      )
    );
  }
}

export default new NewsService();
