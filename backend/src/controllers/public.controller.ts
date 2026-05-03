import { Request, Response } from 'express';
import { ContentStatus, Prisma, PrismaClient, PageStatus } from '@prisma/client';
import { isMainComponent, ALL_COMPONENT_TYPES } from '../constants/componentDefaults';

const prisma = new PrismaClient();

const pageRenderSelect = {
  id: true,
  title: true,
  titleEn: true,
  titleId: true,
  slug: true,
  template: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  metaThumbnail: true,
  ogImage: true,
  product: true,
  promo: true,
  source: true,
  noindex: true,
  nofollow: true,
  showNavbar: true,
  showFooter: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  components: {
    orderBy: {
      order: 'asc' as const,
    },
    select: {
      id: true,
      type: true,
      data: true,
      order: true,
      isVisible: true,
    },
  },
};

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizePublicPageSlug = (value: string): string => {
  const decoded = safeDecodeURIComponent(value);
  const segments = decoded.split('/').filter(Boolean);

  // Support legacy/public preview aliases: /page/{slug} and /pages/{slug}.
  if ((segments[0] === 'page' || segments[0] === 'pages') && segments.length > 1) {
    return segments.slice(1).join('/');
  }

  return segments.join('/');
};

const toJsonSafeValue = (value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(toJsonSafeValue);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toJsonSafeValue(nestedValue)])
    );
  }

  return value;
};

const getNewsOrderBy = (order: string | undefined): any => {
  switch (order) {
    case 'oldest':
      return { news_date: 'asc' };
    case 'alphabetical':
      return { title_en: 'asc' };
    case 'latest':
    default:
      return { news_date: 'desc' };
  }
};

const getConfiguredNewsIds = (config: any): string[] => {
  const rawIds = config?.news_ids || config?.newsIds || config?.selected_news_ids || config?.selectedNewsIds;
  return Array.isArray(rawIds)
    ? rawIds.filter((id: any) => typeof id === 'string' && id.trim()).map((id: string) => id.trim())
    : [];
};

const orderNewsByConfiguredIds = (newsItems: any[], ids: string[]) => {
  const byId = new Map(newsItems.map((news) => [news.id, news]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

const splitFeaturedNews = (newsItems: any[], featuredCount: number, gridCount: number) => ({
  featured: newsItems.slice(0, featuredCount),
  grid: newsItems.slice(featuredCount, featuredCount + gridCount),
  news: newsItems,
});

async function getDatabaseNow() {
  const rows = await prisma.$queryRaw<{ now: Date }[]>`SELECT CURRENT_TIMESTAMP AS now`;
  return rows[0]?.now || new Date();
}

const publicNewsWhere = (now: Date, extra: Prisma.newsWhereInput = {}): Prisma.newsWhereInput => ({
  status: ContentStatus.PUBLISHED,
  visibility: 'PUBLIC',
  deleted_at: null,
  AND: [{ OR: [{ published_at: null }, { published_at: { lte: now } }] }],
  ...extra,
});

// ============================================================================
// MAIN COMPONENT DATA FETCHERS
// ============================================================================

async function fetchMainComponentData(type: string, config: any): Promise<any> {
  try {
    const componentConfig = config || {};
    const now = await getDatabaseNow();
    switch (type) {
      case 'news_highlight':
      case 'news_featured': {
        const featuredCount = componentConfig.featured_count || 1;
        const gridCount = componentConfig.grid_count || 4;
        const totalCount = featuredCount + gridCount;
        const source = componentConfig.source || componentConfig.data_source || 'cms_highlights';
        const selectedNewsIds = getConfiguredNewsIds(componentConfig);
        const orderBy = getNewsOrderBy(componentConfig.order);

        if (source === 'selected_news' && selectedNewsIds.length > 0) {
          const selectedNews = await prisma.news.findMany({
            where: publicNewsWhere(now, {
              id: { in: selectedNewsIds },
            }),
            include: { news_categories: true },
          });

          return splitFeaturedNews(orderNewsByConfiguredIds(selectedNews, selectedNewsIds), featuredCount, gridCount);
        }

        const highlights = await prisma.news_highlights.findMany({
          include: { news: { include: { news_categories: true } } },
          where: { news: { is: publicNewsWhere(now) } },
          orderBy: { position: 'asc' },
          take: totalCount,
        });
        const fallbackNews = await prisma.news.findMany({
          where: publicNewsWhere(now),
          include: { news_categories: true },
          orderBy,
          take: totalCount,
        });
        const highlightedNews = highlights.map((h: any) => h.news);
        const sortedHighlightedNews = ['latest', 'oldest', 'alphabetical'].includes(componentConfig.order)
          ? [...highlightedNews].sort((a: any, b: any) => {
              if (componentConfig.order === 'alphabetical') {
                return String(a.title_en || '').localeCompare(String(b.title_en || ''));
              }
              const left = new Date(a.news_date || a.created_at || 0).getTime();
              const right = new Date(b.news_date || b.created_at || 0).getTime();
              return componentConfig.order === 'oldest' ? left - right : right - left;
            })
          : highlightedNews;
        const newsItems = sortedHighlightedNews.length > 0 ? sortedHighlightedNews : fallbackNews;
        return splitFeaturedNews(newsItems, featuredCount, gridCount);
      }
      case 'news_list': {
        const maxData = componentConfig.max_data || 12;
        const where: any = {
          ...publicNewsWhere(now),
          ...(componentConfig.category_id ? { category_id: componentConfig.category_id } : {}),
        };
        const [newsItems, total] = await Promise.all([
          prisma.news.findMany({
            where,
            include: { news_categories: true },
            orderBy: getNewsOrderBy(componentConfig.order),
            take: maxData,
          }),
          prisma.news.count({ where }),
        ]);
        const categories = await prisma.news_categories.findMany({
          where: { is_active: true, deleted_at: null },
          orderBy: { position: 'asc' },
        });
        return {
          news: newsItems,
          categories,
          total,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(total / maxData),
            totalItems: total,
            itemsPerPage: maxData,
          },
        };
      }
      case 'news_teaser': {
        const maxData = componentConfig.limit || componentConfig.max_data || 6;
        const categorySlug = componentConfig.categorySlug || componentConfig.category_slug || componentConfig.category;
        const categoryId = componentConfig.category_id || componentConfig.categoryId;

        const categoryWhere: any = {
          is_active: true,
          deleted_at: null,
        };

        if (categoryId) {
          categoryWhere.id = categoryId;
        } else if (categorySlug) {
          categoryWhere.slug = categorySlug;
        }

        const category = categoryId || categorySlug
          ? await prisma.news_categories.findFirst({ where: categoryWhere })
          : null;

        if ((categoryId || categorySlug) && !category) {
          return { news: [], category: null };
        }

        const where: any = {
          ...publicNewsWhere(now),
          ...(category ? { category_id: category.id } : {}),
        };

        const newsItems = await prisma.news.findMany({
          where,
          include: { news_categories: true },
          orderBy: getNewsOrderBy(componentConfig.order),
          take: maxData,
        });

        return {
          news: newsItems,
          category,
        };
      }
      case 'career_highlight': {
        const maxDisplay = componentConfig.max_display || 6;
        const careers = await prisma.careerContent.findMany({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: maxDisplay,
        });
        return { careers };
      }
      case 'career_list': {
        const perPage = componentConfig.per_page || 10;
        const careers = await prisma.careerContent.findMany({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: perPage,
        });
        return { careers, total: careers.length };
      }
      case 'management_list': {
        const managements = await prisma.management.findMany({
          where: { is_active: true, deleted_at: null },
          include: { managementCategory: true },
          orderBy: { order: 'asc' },
        });
        const categories = await prisma.managementCategory.findMany({
          where: { is_active: true, deleted_at: null },
          orderBy: { position: 'asc' },
        });
        return { managements, categories };
      }
      case 'announcement_list': {
        const announcements = await prisma.announcements.findMany({
          where: { status: 'PUBLISHED', deleted_at: null },
          include: { announcement_sections: { include: { announcement_types: true } } },
          orderBy: { created_at: 'desc' },
          take: componentConfig.per_page || 10,
        });
        const types = await prisma.announcementType.findMany({
          where: { isActive: true, deletedAt: null },
          orderBy: { position: 'asc' },
        });
        return { announcements, types };
      }
      case 'report_list': {
        const reportTypes = await prisma.reportType.findMany({
          where: { isActive: true, deletedAt: null },
          include: {
            report_sections: {
              where: { isActive: true, deletedAt: null },
              include: {
                reports: {
                  where: { status: 'PUBLISHED', deleted_at: null },
                  orderBy: { year: 'desc' },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        });
        return { reportTypes };
      }
      case 'awards_list': {
        const normalizedOrder = String(componentConfig?.order || componentConfig?.sort_order || 'latest').toLowerCase();
        const issueDateOrder = normalizedOrder === 'oldest' ? 'asc' : 'desc';

        const awards = await prisma.award.findMany({
          where: { isActive: true, deletedAt: null },
          orderBy: [{ issueDate: issueDateOrder }, { year: issueDateOrder }, { position: 'asc' }],
        });
        return { awards };
      }
      case 'awards_marquee': {
        const awardIds = Array.isArray(componentConfig.award_ids || componentConfig.awardIds)
          ? componentConfig.award_ids || componentConfig.awardIds
          : [];
        if (awardIds.length === 0) return { awards: [] };

        const awards = await prisma.award.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            id: { in: awardIds },
          },
          orderBy: [{ position: 'asc' }, { year: 'desc' }],
        });

        const orderedAwards = awardIds
          .map((id: string) => awards.find((award: any) => String(award.id) === String(id)))
          .filter(Boolean);

        return { awards: orderedAwards };
      }
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching data for ${type}:`, error);
    return null;
  }
}

// ============================================================================
// AVAILABLE COMPONENTS ENDPOINT
// ============================================================================

/**
 * GET /api/v1/available-components
 * Returns list of all available component types with defaults
 */
export const getAvailableComponents = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    res.json({
      success: true,
      data: ALL_COMPONENT_TYPES.map((ct) => ({
        type: ct.type,
        name: ct.name,
        description: ct.description,
        icon: ct.icon,
        category: ct.category,
        defaultData: ct.defaultData,
      })),
    });
  } catch (error) {
    console.error('Error fetching available components:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ============================================================================
// PUBLIC PAGE ENDPOINTS
// ============================================================================

/**
 * Get published page by slug (public access)
 * Supports nested slugs (e.g., "about/management") via wildcard param
 */
export const getPublicPageBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Support both :slug and catch-all *slug (0 param) for nested paths
    const slug = normalizePublicPageSlug(req.params.slug || req.params[0] || '');

    const page = await prisma.page.findFirst({
      where: {
        slug,
        status: PageStatus.PUBLISHED,
        deletedAt: null,
      },
      select: pageRenderSelect,
    });

    if (!page) {
      res.status(404).json({
        success: false,
        message: 'Page not found',
      });
      return;
    }

    // For MAIN components, fetch additional data
    const componentsWithData = await Promise.all(
      page.components.map(async (c: any) => {
        const base = {
          id: c.id,
          type: c.type,
          data: c.data,
          order: c.order,
          isVisible: c.isVisible,
        };

        if (isMainComponent(c.type)) {
          const mainData = await fetchMainComponentData(c.type, c.data);
          return { ...base, mainData: toJsonSafeValue(mainData) };
        }

        return base;
      })
    );

    res.json({
      success: true,
      data: {
        id: page.id,
        title: page.title,
        titleEn: page.titleEn,
        titleId: page.titleId,
        slug: page.slug,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords,
        metaThumbnail: page.metaThumbnail,
        ogImage: page.ogImage,
        product: page.product,
        promo: page.promo,
        source: page.source,
        noindex: page.noindex,
        nofollow: page.nofollow,
        showNavbar: page.showNavbar,
        showFooter: page.showFooter,
        status: page.status,
        template: page.template,
        publishedAt: page.publishedAt,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        components: componentsWithData,
      },
    });
  } catch (error) {
    console.error('Error fetching public page:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get page preview by slug (with secret)
 */
export const getPagePreview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const slug = normalizePublicPageSlug(req.params.slug || req.params[0] || '');
    const { secret } = req.query;

    // Validate secret
    if (secret !== process.env.PREVIEW_SECRET) {
      res.status(401).json({
        success: false,
        message: 'Invalid preview secret',
      });
      return;
    }

    const page = await prisma.page.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      select: pageRenderSelect,
    });

    if (!page) {
      res.status(404).json({
        success: false,
        message: 'Page not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...page,
        components: page.components.map((c: any) => ({
          id: c.id,
          type: c.type,
          data: c.data,
          order: c.order,
          isVisible: c.isVisible,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching page preview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get all published page slugs (for SSG)
 */
export const getPublishedSlugs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const pages = await prisma.page.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching published slugs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Trigger page revalidation
 */
export const triggerRevalidation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!page) {
      res.status(404).json({
        success: false,
        message: 'Page not found',
      });
      return;
    }

    // Call Next.js revalidation API
    const nextjsUrl = process.env.NEXTJS_URL || 'http://localhost:3000';
    const revalidateSecret = process.env.REVALIDATE_SECRET;

    if (!revalidateSecret) {
      res.status(500).json({
        success: false,
        message: 'Revalidation secret not configured',
      });
      return;
    }

    const response = await fetch(
      `${nextjsUrl}/api/revalidate?secret=${revalidateSecret}&path=/page/${page.slug}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error('Revalidation failed');
    }

    res.json({
      success: true,
      message: 'Page revalidation triggered',
      data: { slug: page.slug },
    });
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger revalidation',
    });
  }
};
