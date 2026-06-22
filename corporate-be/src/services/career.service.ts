/**
 * Career Service
 * Handles all business logic for career positions CRUD
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();

// ============================================
// Types
// ============================================

export interface CareerData {
  position: string;
  division?: string;
  type?: string;
  linkJob?: string;
  location?: string;
  description?: string;
  descriptionId?: string;
  requirements?: string;
  requirementsId?: string;
  status?: string;
  expiryDate?: string | null;
}

export interface CareerListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  location?: string;
  division?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CareerStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  published: number;
  scheduled: number;
}

// ============================================
// Helper: Generate unique slug
// ============================================
async function generateUniqueSlug(position: string, excludeId?: bigint): Promise<string> {
  // Base slug: lowercase, replace non-alphanumeric with dash, trim dashes
  let baseSlug = position
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!baseSlug) {
    baseSlug = 'career-position';
  }

  // Check if slug is unique (case-insensitive)
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const existing = await prisma.$queryRaw<{ id: bigint }[]>`
      SELECT id FROM career_content 
      WHERE LOWER(slug) = LOWER(${slug})
      ${excludeId ? Prisma.sql`AND id != ${excludeId}` : Prisma.empty}
      LIMIT 1
    `;

    if (existing.length === 0) {
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

// ============================================
// Helper: Build published scope WHERE clause
// ============================================
function publishedWhere(): any {
  return {
    status: 'active',
    OR: [
      { expiryDate: null },
      { expiryDate: { gt: new Date() } },
    ],
  };
}

// ============================================
// Service Class
// ============================================

export class CareerService {
  /**
   * Get career list with filtering, search & pagination (ADMIN)
   */
  async getAdminCareers(params: CareerListParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      location,
      division,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.position = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = { equals: type, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (division) {
      where.division = { contains: division, mode: 'insensitive' };
    }

    // Map sortBy to Prisma field names
    const sortFieldMap: Record<string, string> = {
      position: 'position',
      division: 'division',
      type: 'type',
      location: 'location',
      status: 'status',
      created_at: 'createdAt',
      updated_at: 'updatedAt',
      expiry_date: 'expiryDate',
    };

    const orderField = sortFieldMap[sortBy] || 'createdAt';
    const orderBy: any = { [orderField]: sortOrder };

    const [careers, total] = await Promise.all([
      prisma.careerContent.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.careerContent.count({ where }),
    ]);

    // Serialize BigInt to string for JSON
    const serialized = careers.map((c: any) => ({
      ...c,
      id: c.id.toString(),
    }));

    return {
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get career statistics (ADMIN)
   */
  async getStats(): Promise<CareerStats> {
    const now = new Date();

    const [total, active, inactive, scheduled, expired, published] = await Promise.all([
      prisma.careerContent.count(),
      prisma.careerContent.count({ where: { status: 'active' } }),
      prisma.careerContent.count({ where: { status: 'inactive' } }),
      prisma.careerContent.count({ where: { status: 'scheduled' } }),
      prisma.careerContent.count({
        where: {
          status: 'active',
          expiryDate: { lte: now },
          NOT: { expiryDate: null },
        },
      }),
      prisma.careerContent.count({
        where: publishedWhere(),
      }),
    ]);

    return { total, active, inactive, expired, published, scheduled };
  }

  /**
   * Get career by ID (ADMIN)
   */
  async getById(id: string) {
    const career = await prisma.careerContent.findUnique({
      where: { id: BigInt(id) },
    });

    if (!career) {
      throw new AppError('Career position not found', 404);
    }

    return {
      ...career,
      id: career.id.toString(),
    };
  }

  /**
   * Create new career position
   */
  async create(data: CareerData, userEmail: string) {
    const slug = await generateUniqueSlug(data.position);

    const career = await prisma.careerContent.create({
      data: {
        position: data.position.trim(),
        slug,
        division: data.division?.trim() || null,
        type: data.type?.trim() || null,
        linkJob: data.linkJob?.trim() || null,
        location: data.location?.trim() || null,
        description: data.description || null,
        descriptionId: data.descriptionId || null,
        requirements: data.requirements || null,
        requirementsId: data.requirementsId || null,
        status: data.status || 'active',
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userEmail,
        updatedBy: userEmail,
      },
    });

    return {
      ...career,
      id: career.id.toString(),
    };
  }

  /**
   * Update career position
   */
  async update(id: string, data: CareerData, userEmail: string) {
    const bigId = BigInt(id);

    // Check existence
    const existing = await prisma.careerContent.findUnique({
      where: { id: bigId },
    });

    if (!existing) {
      throw new AppError('Career position not found', 404);
    }

    // Re-generate slug if position changed
    let slug = existing.slug;
    if (data.position && data.position.trim() !== existing.position) {
      slug = await generateUniqueSlug(data.position, bigId);
    }

    const career = await prisma.careerContent.update({
      where: { id: bigId },
      data: {
        position: data.position?.trim() ?? existing.position,
        slug,
        division: data.division !== undefined ? (data.division?.trim() || null) : existing.division,
        type: data.type !== undefined ? (data.type?.trim() || null) : existing.type,
        linkJob: data.linkJob !== undefined ? (data.linkJob?.trim() || null) : existing.linkJob,
        location: data.location !== undefined ? (data.location?.trim() || null) : existing.location,
        description: data.description !== undefined ? data.description : existing.description,
        descriptionId: data.descriptionId !== undefined ? data.descriptionId : existing.descriptionId,
        requirements: data.requirements !== undefined ? data.requirements : existing.requirements,
        requirementsId: data.requirementsId !== undefined ? data.requirementsId : existing.requirementsId,
        status: data.status ?? existing.status,
        expiryDate: data.expiryDate !== undefined
          ? (data.expiryDate ? new Date(data.expiryDate) : null)
          : existing.expiryDate,
        updatedAt: new Date(),
        updatedBy: userEmail,
      },
    });

    return {
      ...career,
      id: career.id.toString(),
    };
  }

  /**
   * Delete career position
   */
  async delete(id: string) {
    const bigId = BigInt(id);

    const existing = await prisma.careerContent.findUnique({
      where: { id: bigId },
    });

    if (!existing) {
      throw new AppError('Career position not found', 404);
    }

    await prisma.careerContent.delete({
      where: { id: bigId },
    });

    return { message: 'Career position deleted successfully' };
  }

  /**
   * Bulk delete career positions
   */
  async bulkDelete(ids: string[]) {
    const bigIds = ids.map((id) => BigInt(id));

    const result = await prisma.careerContent.deleteMany({
      where: { id: { in: bigIds } },
    });

    return {
      message: `${result.count} career position(s) deleted successfully`,
      deletedCount: result.count,
    };
  }

  /**
   * Toggle career status (active ↔ inactive)
   */
  async toggleStatus(id: string, userEmail: string) {
    const bigId = BigInt(id);

    const existing = await prisma.careerContent.findUnique({
      where: { id: bigId },
    });

    if (!existing) {
      throw new AppError('Career position not found', 404);
    }

    const newStatus = existing.status === 'active' ? 'inactive' : 'active';

    const career = await prisma.careerContent.update({
      where: { id: bigId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
        updatedBy: userEmail,
      },
    });

    return {
      ...career,
      id: career.id.toString(),
    };
  }

  // ============================================
  // PUBLIC Endpoints
  // ============================================

  /**
   * Get published careers (PUBLIC)
   */
  async getPublicCareers(params: CareerListParams) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      location,
      division,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Base where: published scope
    const where: any = {
      ...publishedWhere(),
    };

    if (search) {
      where.position = { contains: search, mode: 'insensitive' };
    }

    if (type) {
      where.type = { equals: type, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (division) {
      where.division = { contains: division, mode: 'insensitive' };
    }

    const sortFieldMap: Record<string, string> = {
      position: 'position',
      created_at: 'createdAt',
      type: 'type',
      location: 'location',
    };

    const orderField = sortFieldMap[sortBy] || 'createdAt';
    const orderBy: any = { [orderField]: sortOrder };

    const [careers, total] = await Promise.all([
      prisma.careerContent.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          position: true,
          slug: true,
          division: true,
          type: true,
          linkJob: true,
          location: true,
          description: true,
          descriptionId: true,
          requirements: true,
          requirementsId: true,
          expiryDate: true,
          createdAt: true,
        },
      }),
      prisma.careerContent.count({ where }),
    ]);

    const serialized = careers.map((c: any) => ({
      ...c,
      id: c.id.toString(),
    }));

    return {
      data: serialized,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get career by slug (PUBLIC - published only)
   */
  async getBySlug(slug: string) {
    // Use raw query for case-insensitive slug match
    const careers = await prisma.$queryRaw<any[]>`
      SELECT * FROM career_content
      WHERE LOWER(slug) = LOWER(${slug})
        AND status = 'active'
        AND (expiry_date IS NULL OR expiry_date > NOW())
      LIMIT 1
    `;

    if (!careers || careers.length === 0) {
      throw new AppError('Career position not found', 404);
    }

    const career = careers[0];

    return {
      id: career.id.toString(),
      position: career.position,
      slug: career.slug,
      division: career.division,
      type: career.type,
      linkJob: career.link_job,
      location: career.location,
      description: career.description,
      descriptionId: career.description_id,
      requirements: career.requirements,
      requirementsId: career.requirements_id,
      expiryDate: career.expiry_date,
      createdAt: career.created_at,
    };
  }

  /**
   * Get distinct values for filters (PUBLIC)
   */
  async getFilterOptions() {
    const where = publishedWhere();

    const [locations, types, divisions] = await Promise.all([
      prisma.careerContent.findMany({
        where: { ...where, location: { not: null } },
        select: { location: true },
        distinct: ['location'],
        orderBy: { location: 'asc' },
      }),
      prisma.careerContent.findMany({
        where: { ...where, type: { not: null } },
        select: { type: true },
        distinct: ['type'],
        orderBy: { type: 'asc' },
      }),
      prisma.careerContent.findMany({
        where: { ...where, division: { not: null } },
        select: { division: true },
        distinct: ['division'],
        orderBy: { division: 'asc' },
      }),
    ]);

    return {
      locations: locations.map((l: any) => l.location).filter(Boolean),
      types: types.map((t: any) => t.type).filter(Boolean),
      divisions: divisions.map((d: any) => d.division).filter(Boolean),
    };
  }
}

export default new CareerService();
