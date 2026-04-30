import { Request, Response } from 'express';
import { PrismaClient, PageStatus } from '@prisma/client';
import { isMainComponent, ALL_COMPONENT_TYPES } from '../constants/componentDefaults';

const prisma = new PrismaClient();

// ============================================================================
// MAIN COMPONENT DATA FETCHERS
// ============================================================================

async function fetchMainComponentData(type: string, config: any): Promise<any> {
  try {
    switch (type) {
      case 'news_highlight': {
        const featuredCount = config.featured_count || 1;
        const gridCount = config.grid_count || 4;
        const highlights = await prisma.news_highlights.findMany({
          include: { news: { include: { news_categories: true } } },
          orderBy: { position: 'asc' },
          take: featuredCount,
        });
        const latest = await prisma.news.findMany({
          where: { status: 'PUBLISHED', deleted_at: null },
          include: { news_categories: true },
          orderBy: { news_date: 'desc' },
          take: gridCount,
        });
        return { featured: highlights.map((h: any) => h.news), grid: latest };
      }
      case 'news_list': {
        const maxData = config.max_data || 12;
        const where: any = {
          status: 'PUBLISHED',
          deleted_at: null,
          ...(config.category_id ? { category_id: config.category_id } : {}),
        };
        const [newsItems, total] = await Promise.all([
          prisma.news.findMany({
            where,
            include: { news_categories: true },
            orderBy: { news_date: 'desc' },
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
      case 'career_highlight': {
        const maxDisplay = config.max_display || 6;
        const careers = await prisma.careerContent.findMany({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: maxDisplay,
        });
        return { careers };
      }
      case 'career_list': {
        const perPage = config.per_page || 10;
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
          take: config.per_page || 10,
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
        const awards = await prisma.award.findMany({
          where: { isActive: true, deletedAt: null },
          orderBy: [{ year: 'desc' }, { position: 'asc' }],
        });
        return { awards };
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
    const slug = req.params.slug || req.params[0] || '';

    const page = await prisma.page.findFirst({
      where: {
        slug,
        status: PageStatus.PUBLISHED,
      },
      include: {
        components: {
          where: {
            isVisible: true,
          },
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            type: true,
            data: true,
            order: true,
          },
        },
      },
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
        };

        if (isMainComponent(c.type)) {
          const mainData = await fetchMainComponentData(c.type, c.data);
          return { ...base, mainData };
        }

        return base;
      })
    );

    res.json({
      success: true,
      data: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords,
        ogImage: page.ogImage,
        product: page.product,
        promo: page.promo,
        source: page.source,
        noindex: page.noindex,
        nofollow: page.nofollow,
        status: page.status,
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
    const { slug } = req.params;
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
      },
      include: {
        components: {
          orderBy: {
            order: 'asc',
          },
          select: {
            id: true,
            type: true,
            data: true,
            order: true,
            isVisible: true,
          },
        },
      },
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
