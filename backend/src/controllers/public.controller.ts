import { Request, Response } from 'express';
import { PrismaClient, PageStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get published page by slug (public access)
 */
export const getPublicPageBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

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
            component_type: true,
            component_data: true,
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

    res.json({
      success: true,
      data: {
        ...page,
        components: page.components.map((c) => ({
          id: c.id,
          type: c.component_type,
          data: c.component_data,
          order: c.order,
        })),
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
            component_type: true,
            component_data: true,
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
        components: page.components.map((c) => ({
          id: c.id,
          type: c.component_type,
          data: c.component_data,
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
  req: Request,
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
