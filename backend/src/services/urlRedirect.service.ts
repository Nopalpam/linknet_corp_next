import { PrismaClient, UrlRedirect } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * URL Redirect Service
 * Handles all URL redirect operations
 */
export class UrlRedirectService {
  /**
   * Get all URL redirects with pagination
   */
  static async getAllRedirects(params: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: UrlRedirect[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { fromUrl: { contains: search, mode: 'insensitive' } },
        { toUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get redirects and total count
    const [redirects, total] = await Promise.all([
      prisma.urlRedirect.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.urlRedirect.count({ where }),
    ]);

    return {
      data: redirects,
      total,
      page,
      limit,
    };
  }

  /**
   * Get single redirect by ID
   */
  static async getRedirectById(id: string): Promise<UrlRedirect | null> {
    return prisma.urlRedirect.findUnique({
      where: { id },
    });
  }

  /**
   * Get redirect by fromUrl (for public use)
   */
  static async getRedirectByFromUrl(fromUrl: string): Promise<UrlRedirect | null> {
    return prisma.urlRedirect.findFirst({
      where: {
        fromUrl,
        isActive: true,
        deletedAt: null,
      },
    });
  }

  /**
   * Create new redirect
   */
  static async createRedirect(data: {
    fromUrl: string;
    toUrl: string;
    statusCode?: number;
    isActive?: boolean;
  }): Promise<UrlRedirect> {
    // Check if fromUrl already exists
    const existing = await prisma.urlRedirect.findFirst({
      where: {
        fromUrl: data.fromUrl,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new Error('Redirect with this source URL already exists');
    }

    return prisma.urlRedirect.create({
      data: {
        fromUrl: data.fromUrl,
        toUrl: data.toUrl,
        statusCode: data.statusCode || 301,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  /**
   * Update redirect
   */
  static async updateRedirect(
    id: string,
    data: {
      fromUrl?: string;
      toUrl?: string;
      statusCode?: number;
      isActive?: boolean;
    }
  ): Promise<UrlRedirect> {
    // Check if redirect exists
    const existing = await prisma.urlRedirect.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Redirect not found');
    }

    // Check for duplicate fromUrl if it's being changed
    if (data.fromUrl && data.fromUrl !== existing.fromUrl) {
      const duplicate = await prisma.urlRedirect.findFirst({
        where: {
          fromUrl: data.fromUrl,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new Error('Another redirect with this source URL already exists');
      }
    }

    return prisma.urlRedirect.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete redirect (soft delete)
   */
  static async deleteRedirect(id: string): Promise<UrlRedirect> {
    const existing = await prisma.urlRedirect.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Redirect not found');
    }

    return prisma.urlRedirect.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Bulk delete redirects
   */
  static async bulkDeleteRedirects(ids: string[]): Promise<number> {
    const result = await prisma.urlRedirect.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Increment hit counter
   */
  static async incrementHits(id: string): Promise<void> {
    await prisma.urlRedirect.update({
      where: { id },
      data: {
        hits: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Toggle active status
   */
  static async toggleActive(id: string): Promise<UrlRedirect> {
    const existing = await prisma.urlRedirect.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Redirect not found');
    }

    return prisma.urlRedirect.update({
      where: { id },
      data: {
        isActive: !existing.isActive,
      },
    });
  }
}
