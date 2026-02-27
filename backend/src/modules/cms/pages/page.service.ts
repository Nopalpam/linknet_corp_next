import { PrismaClient, PageStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';
import {
  CreatePageDto,
  UpdatePageDto,
  PageQueryParams,
  PageListResponse,
  PageDetail,
} from './page.types';
import { ValidationError as BadRequestError, NotFoundError } from '../../../types/error.types';

/**
 * @deprecated This service is NOT loaded by server.ts.
 * The active page service is: backend/src/services/page.service.ts
 * The active routes are: backend/src/routes/cms/page.routes.ts
 * 
 * This module exists as a reference but is NOT integrated into the application.
 * All page/component operations go through:
 * - backend/src/services/page.service.ts (page CRUD + savePageComponents)
 * - backend/src/services/component.service.ts (individual component CRUD)
 */

export class PageService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generate unique slug from title
   */
  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const baseSlug = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.page.findFirst({
        where: {
          slug,
          id: excludeId ? { not: excludeId } : undefined,
          deletedAt: null,
        },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Validate slug uniqueness
   */
  private async validateSlugUnique(slug: string, excludeId?: string): Promise<void> {
    const existing = await this.prisma.page.findFirst({
      where: {
        slug,
        id: excludeId ? { not: excludeId } : undefined,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new BadRequestError(`Slug "${slug}" is already in use`);
    }
  }

  /**
   * Get pages list with pagination and filters
   */
  async getPages(params: PageQueryParams, _userId?: string): Promise<PageListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      template,
      createdById,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PageWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (template) {
      where.template = template;
    }

    if (createdById) {
      where.createdById = createdById;
    }

    // Get total count
    const total = await this.prisma.page.count({ where });

    // Get pages
    const pages = await this.prisma.page.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            components: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      data: pages.map((page) => ({
        ...page,
        componentCount: page._count.components,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get page by ID
   */
  async getPageById(id: string): Promise<PageDetail> {
    const page = await this.prisma.page.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        ogImage: true,
        status: true,
        publishedAt: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!page) {
      throw new NotFoundError('Page not found');
    }

    return page;
  }

  /**
   * Create new page
   */
  async createPage(data: CreatePageDto, userId: string): Promise<PageDetail> {
    // Generate or validate slug
    let slug = data.slug;
    if (!slug) {
      slug = await this.generateUniqueSlug(data.title);
    } else {
      await this.validateSlugUnique(slug);
    }

    // Set published_at if status is PUBLISHED
    const publishedAt = data.status === PageStatus.PUBLISHED ? new Date() : null;

    const page = await this.prisma.page.create({
      data: {
        title: data.title,
        slug,
        template: data.template,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        ogImage: data.ogImage,
        status: data.status || PageStatus.DRAFT,
        publishedAt,
        createdById: userId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        ogImage: true,
        status: true,
        publishedAt: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return page;
  }

  /**
   * Update page
   */
  async updatePage(id: string, data: UpdatePageDto): Promise<PageDetail> {
    // Check if page exists
    const existingPage = await this.prisma.page.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingPage) {
      throw new NotFoundError('Page not found');
    }

    // Validate slug if changed
    if (data.slug && data.slug !== existingPage.slug) {
      await this.validateSlugUnique(data.slug, id);
    }

    // Handle status change to PUBLISHED
    let publishedAt = existingPage.publishedAt;
    if (data.status === PageStatus.PUBLISHED && existingPage.status !== PageStatus.PUBLISHED) {
      publishedAt = new Date();
    } else if (data.status === PageStatus.DRAFT) {
      publishedAt = null;
    }

    const page = await this.prisma.page.update({
      where: { id },
      data: {
        ...data,
        publishedAt,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        template: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        ogImage: true,
        status: true,
        publishedAt: true,
        createdById: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return page;
  }

  /**
   * Delete page (soft delete)
   */
  async deletePage(id: string): Promise<void> {
    // Check if page exists
    const existingPage = await this.prisma.page.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingPage) {
      throw new NotFoundError('Page not found');
    }

    // Soft delete page and all components (cascade)
    await this.prisma.page.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Note: For URL redirects, you might want to implement a separate redirects table
    // and create a redirect from the old slug to homepage here
  }
}
