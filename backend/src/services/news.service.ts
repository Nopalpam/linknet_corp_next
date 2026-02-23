import { PrismaClient, Prisma } from '@prisma/client';
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

export interface UpdateNewsData extends Omit<Partial<CreateNewsData>, 'idCategory'> {
  idCategory?: number | null;
}

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
    readingTime: item.contentEn ? Math.max(1, Math.ceil(item.contentEn.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)) : 1,
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
