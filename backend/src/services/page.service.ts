import prisma from '@config/database';
import { Prisma, PageStatus, PageTemplate } from '@prisma/client';
import { AppError } from '../types/error.types';
import { generateUniquePageSlug, isValidSlug } from '@utils/slug.util';

export interface CreatePageDTO {
  title: string;
  slug?: string;
  template?: PageTemplate;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  status?: PageStatus;
  createdById: string;
}

export interface UpdatePageDTO {
  title?: string;
  slug?: string;
  template?: PageTemplate;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  status?: PageStatus;
}

export interface GetPagesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PageStatus;
  template?: PageTemplate;
  createdBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class PageService {
  /**
   * Get pages dengan pagination, filter, dan search
   */
  static async getPages(query: GetPagesQuery) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      template,
      createdBy,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PageWhereInput = {
      deletedAt: null,
      ...(status && { status }),
      ...(template && { template }),
      ...(createdBy && { createdById: createdBy }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Get pages with component count
    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: { components: true },
          },
        },
      }),
      prisma.page.count({ where }),
    ]);

    return {
      data: pages.map((page: any) => ({
        ...page,
        componentCount: page._count.components,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single page by ID
   */
  static async getPageById(id: string) {
    const page = await prisma.page.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: { components: true },
        },
      },
    });

    if (!page) {
      throw new AppError('Page not found', 404);
    }

    return {
      ...page,
      componentCount: page._count.components,
      _count: undefined,
    };
  }

  /**
   * Create new page
   */
  static async createPage(data: CreatePageDTO) {
    // Generate or validate slug
    let slug = data.slug;
    if (slug) {
      // Validate custom slug
      if (!isValidSlug(slug)) {
        throw new AppError(
          'Invalid slug format. Only lowercase letters, numbers, and dashes are allowed',
          400
        );
      }
      // Ensure unique
      slug = await generateUniquePageSlug(slug);
    } else {
      // Auto-generate from title
      slug = await generateUniquePageSlug(data.title);
    }

    // Create page
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug,
        template: data.template || PageTemplate.DEFAULT,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogImage: data.ogImage,
        status: data.status || PageStatus.DRAFT,
        publishedAt: data.status === PageStatus.PUBLISHED ? new Date() : null,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return page;
  }

  /**
   * Update page
   */
  static async updatePage(id: string, data: UpdatePageDTO) {
    // Check if page exists
    const existingPage = await prisma.page.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingPage) {
      throw new AppError('Page not found', 404);
    }

    // Handle slug update
    let slug = data.slug;
    if (slug && slug !== existingPage.slug) {
      // Validate custom slug
      if (!isValidSlug(slug)) {
        throw new AppError(
          'Invalid slug format. Only lowercase letters, numbers, and dashes are allowed',
          400
        );
      }
      // Ensure unique
      slug = await generateUniquePageSlug(slug, id);
    }

    // Handle status change
    let publishedAt = existingPage.publishedAt;
    if (data.status === PageStatus.PUBLISHED && existingPage.status !== PageStatus.PUBLISHED) {
      publishedAt = new Date();
    } else if (data.status === PageStatus.DRAFT) {
      publishedAt = null;
    }

    // Update page
    const page = await prisma.page.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(slug && { slug }),
        ...(data.template && { template: data.template }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.status && { status: data.status, publishedAt }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return page;
  }

  /**
   * Delete page (soft delete)
   */
  static async deletePage(id: string) {
    // Check if page exists
    const page = await prisma.page.findFirst({
      where: { id, deletedAt: null },
    });

    if (!page) {
      throw new AppError('Page not found', 404);
    }

    // Soft delete page dan components (cascade via Prisma)
    await prisma.page.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // TODO: Create URL redirect dari old slug ke homepage untuk avoid 404
    // Ini bisa dihandle di separate redirect service

    return { message: 'Page deleted successfully' };
  }

  /**
   * Check if slug is available
   */
  static async checkSlugAvailability(slug: string, excludePageId?: string) {
    if (!isValidSlug(slug)) {
      return {
        available: false,
        message: 'Invalid slug format. Only lowercase letters, numbers, and dashes are allowed',
      };
    }

    const existing = await prisma.page.findFirst({
      where: {
        slug,
        ...(excludePageId && { id: { not: excludePageId } }),
        deletedAt: null,
      },
    });

    return {
      available: !existing,
      message: existing ? 'Slug already exists' : 'Slug is available',
    };
  }
}
