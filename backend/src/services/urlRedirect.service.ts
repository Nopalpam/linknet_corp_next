import { PrismaClient, UrlRedirect } from '@prisma/client';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();
const VALID_REDIRECT_STATUS_CODES = [301, 302, 307, 308];

const getAllowedRedirectHosts = (): string[] =>
  (process.env.ALLOWED_REDIRECT_HOSTS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((host) => {
      try {
        return new URL(host.trim()).hostname.toLowerCase();
      } catch {
        return host.trim().toLowerCase();
      }
    })
    .filter(Boolean);

const validateSourceUrl = (fromUrl: string): string => {
  if (!fromUrl.startsWith('/') || fromUrl.startsWith('//') || /[\r\n]/.test(fromUrl)) {
    throw new AppError('Source URL must be a relative application path', 400, 'VALIDATION_ERROR');
  }

  return fromUrl;
};

const validateTargetUrl = (toUrl: string): string => {
  if (/[\r\n]/.test(toUrl)) {
    throw new AppError('Target URL is invalid', 400, 'VALIDATION_ERROR');
  }

  if (toUrl.startsWith('/') && !toUrl.startsWith('//')) {
    return toUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(toUrl);
  } catch {
    throw new AppError('Target URL is invalid', 400, 'VALIDATION_ERROR');
  }

  if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
    throw new AppError('Target URL protocol is not allowed', 400, 'VALIDATION_ERROR');
  }

  const allowedHosts = getAllowedRedirectHosts();
  if (allowedHosts.length === 0 || !allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
    throw new AppError('Target URL host is not allowed', 400, 'VALIDATION_ERROR');
  }

  return parsedUrl.toString();
};

const validateStatusCode = (statusCode?: number): number => {
  const normalizedStatusCode = statusCode || 301;
  if (!VALID_REDIRECT_STATUS_CODES.includes(normalizedStatusCode)) {
    throw new AppError('Redirect status code is not allowed', 400, 'VALIDATION_ERROR');
  }

  return normalizedStatusCode;
};

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
    const fromUrl = validateSourceUrl(data.fromUrl);
    const toUrl = validateTargetUrl(data.toUrl);
    const statusCode = validateStatusCode(data.statusCode);

    // Check if fromUrl already exists
    const existing = await prisma.urlRedirect.findFirst({
      where: {
        fromUrl,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new Error('Redirect with this source URL already exists');
    }

    return prisma.urlRedirect.create({
      data: {
        fromUrl,
        toUrl,
        statusCode,
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

    const updateData = {
      ...data,
      ...(data.fromUrl && { fromUrl: validateSourceUrl(data.fromUrl) }),
      ...(data.toUrl && { toUrl: validateTargetUrl(data.toUrl) }),
      ...(data.statusCode && { statusCode: validateStatusCode(data.statusCode) }),
    };

    // Check for duplicate fromUrl if it's being changed
    if (updateData.fromUrl && updateData.fromUrl !== existing.fromUrl) {
      const duplicate = await prisma.urlRedirect.findFirst({
        where: {
          fromUrl: updateData.fromUrl,
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
      data: updateData,
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
