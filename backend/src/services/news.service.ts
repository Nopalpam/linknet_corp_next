import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { sanitizeHtmlContent } from '../utils/htmlSanitizer';
import { v4 as uuidv4 } from 'uuid';
import { SettingsService } from './settings.service';

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
  slug?: string;
  news_date: Date | string;
  news_thumbnail?: string;
  excerpt_en?: string;
  excerpt_id?: string;
  content_en: string;
  content_id?: string;
  author?: string;
  category_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  custom_css?: string;
  custom_js?: string;
  status?: string;
  visibility?: string;
  published_at?: Date | string | null;
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
  title: 'title_en',
  titleId: 'title_id',
  title_id: 'title_id',
  viewCount: 'view_count',
  view_count: 'view_count',
  slug: 'slug',
  status: 'status',
};

function normalizeSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

function coalesceText(value?: string | null, fallback?: string | null) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed) return trimmed;
  const fallbackTrimmed = typeof fallback === 'string' ? fallback.trim() : '';
  return fallbackTrimmed || null;
}

async function getConfiguredTimezone() {
  const timezone = await SettingsService.getSettingValue('timezone');
  return typeof timezone === 'string' && timezone.trim() ? timezone.trim() : 'Asia/Jakarta';
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const zonedUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );

  return zonedUtc - date.getTime();
}

function localDateTimeToUtc(value: string, timeZone: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return new Date(value);

  const [, year, month, day, hour, minute, second = '0'] = match;
  const localAsUtc = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  let utcDate = new Date(localAsUtc - getTimeZoneOffsetMs(new Date(localAsUtc), timeZone));
  const correctedOffset = getTimeZoneOffsetMs(utcDate, timeZone);
  utcDate = new Date(localAsUtc - correctedOffset);
  return utcDate;
}

function parseScheduledDate(value: Date | string | null | undefined, timeZone: string) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }

  return localDateTimeToUtc(trimmed, timeZone);
}

async function getDatabaseNow() {
  const rows = await prisma.$queryRaw<{ now: Date }[]>`SELECT CURRENT_TIMESTAMP AS now`;
  return rows[0]?.now || new Date();
}

function publicNewsWhere(now: Date): Prisma.newsWhereInput {
  return {
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    deleted_at: null,
    AND: [{ OR: [{ published_at: null }, { published_at: { lte: now } }] }],
  };
}

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
            select: { id: true, name_en: true, name_id: true, slug: true },
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

    const where: Prisma.newsWhereInput = publicNewsWhere(await getDatabaseNow());

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
            select: { id: true, name_en: true, name_id: true, slug: true },
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
    const now = await getDatabaseNow();
    const where: Prisma.newsWhereInput = {
      ...publicNewsWhere(now),
      category_id: category.id,
    };

    const [newsItems, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          news_categories: {
            select: { id: true, name_en: true, name_id: true, slug: true },
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
    const now = await getDatabaseNow();
    const highlights = await prisma.news_highlights.findMany({
      where: {
        news: {
          is: publicNewsWhere(now),
        },
      },
      include: {
        news: {
          include: {
            news_categories: {
              select: { id: true, name_en: true, name_id: true, slug: true },
            },
          },
        },
      },
      orderBy: { position: 'asc' },
      take: limit,
    });

    return serializeHighlights(highlights);
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

    const now = await getDatabaseNow();
    const publishedAt = newsItem?.published_at ? new Date(newsItem.published_at).getTime() : null;
    if (
      !newsItem ||
      newsItem.status !== 'PUBLISHED' ||
      newsItem.visibility !== 'PUBLIC' ||
      newsItem.deleted_at ||
      (publishedAt !== null && publishedAt > now.getTime())
    ) {
      throw new AppError('News not found', 404);
    }

    if (trackView) {
      await this.trackView(newsItem.id, ipAddress, userAgent);
    }

    return serializeNews(newsItem);
  }

  async checkSlugAvailability(slug: string, excludeId?: string) {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
      throw new AppError('Slug is required', 400);
    }

    const existing = await prisma.news.findFirst({
      where: {
        slug: normalizedSlug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, slug: true },
    });

    return {
      slug: normalizedSlug,
      available: !existing,
    };
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
    const timezone = await getConfiguredTimezone();
    if (data.category_id) {
      const category = await prisma.news_categories.findUnique({
        where: { id: data.category_id },
      });
      if (!category) {
        throw new AppError('Category not found', 400);
      }
    }

    const requestedSlug = data.slug || data.title_en;
    const baseSlug = normalizeSlug(requestedSlug);
    if (!baseSlug) {
      throw new AppError('Slug is required', 400);
    }
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.news.findUnique({ where: { slug } })) {
      slug = baseSlug + '-' + counter;
      counter++;
    }

    const now = new Date();
    const publishedAt = data.published_at
      ? parseScheduledDate(data.published_at, timezone)
      : data.status === 'DRAFT'
        ? null
        : now;
    const newsDate = data.news_date
      ? new Date(data.news_date)
      : publishedAt || now;
    const newsItem = await prisma.news.create({
      data: {
        id: uuidv4(),
        title_en: data.title_en,
        title_id: data.title_id,
        slug,
        news_date: newsDate,
        news_thumbnail: data.news_thumbnail,
        excerpt_en: data.excerpt_en ? sanitizeHtmlContent(data.excerpt_en) : undefined,
        excerpt_id: data.excerpt_id ? sanitizeHtmlContent(data.excerpt_id) : undefined,
        content_en: sanitizeHtmlContent(data.content_en),
        content_id: data.content_id ? sanitizeHtmlContent(data.content_id) : undefined,
        author: data.author,
        category_id: data.category_id || '',
        meta_title: coalesceText(data.meta_title, data.title_en),
        meta_description: coalesceText(data.meta_description, data.excerpt_en),
        meta_desc: coalesceText(data.meta_description, data.excerpt_en),
        meta_keywords: data.meta_keywords,
        custom_css: data.custom_css,
        custom_js: data.custom_js,
        status: (data.status as any) ?? 'PUBLISHED',
        visibility: data.visibility || 'PUBLIC',
        published_at: publishedAt,
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
    const timezone = await getConfiguredTimezone();
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
    if (data.slug !== undefined || (data.title_en && data.title_en !== existingNews.title_en)) {
      const baseSlug = normalizeSlug(data.slug || data.title_en || existingNews.title_en);
      if (!baseSlug) {
        throw new AppError('Slug is required', 400);
      }
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
        ...(data.title_en !== undefined && { title_en: data.title_en }),
        ...((data.slug !== undefined || data.title_en !== undefined) && { slug }),
        ...(data.title_id !== undefined && { title_id: data.title_id }),
        ...(data.news_date !== undefined && { news_date: new Date(data.news_date) }),
        ...(data.news_thumbnail !== undefined && { news_thumbnail: data.news_thumbnail }),
        ...(data.excerpt_en !== undefined && { excerpt_en: data.excerpt_en ? sanitizeHtmlContent(data.excerpt_en) : null }),
        ...(data.excerpt_id !== undefined && { excerpt_id: data.excerpt_id ? sanitizeHtmlContent(data.excerpt_id) : null }),
        ...(data.content_en !== undefined && { content_en: sanitizeHtmlContent(data.content_en) }),
        ...(data.content_id !== undefined && { content_id: data.content_id ? sanitizeHtmlContent(data.content_id) : null }),
        ...(data.author !== undefined && { author: data.author }),
        ...(data.category_id !== undefined && { category_id: data.category_id || '' }),
        ...(data.meta_title !== undefined && { meta_title: coalesceText(data.meta_title, data.title_en ?? existingNews.title_en) }),
        ...(data.meta_description !== undefined && {
          meta_description: coalesceText(data.meta_description, data.excerpt_en ?? existingNews.excerpt_en),
          meta_desc: coalesceText(data.meta_description, data.excerpt_en ?? existingNews.excerpt_en),
        }),
        ...(data.meta_keywords !== undefined && { meta_keywords: data.meta_keywords }),
        ...(data.custom_css !== undefined && { custom_css: data.custom_css }),
        ...(data.custom_js !== undefined && { custom_js: data.custom_js }),
        ...(data.status !== undefined && { status: data.status as any }),
        ...(data.visibility !== undefined && { visibility: data.visibility }),
        ...(data.published_at !== undefined && { published_at: parseScheduledDate(data.published_at, timezone) }),
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
