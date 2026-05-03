import prisma from '@config/database';
import { AppError } from '../types/error.types';
import { ALL_COMPONENT_TYPES } from '../constants/componentDefaults';

export interface ComponentVisibilityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  businessUnit?: string;
}

export interface CreateComponentVisibilityDTO {
  componentKey: string;
  componentName: string;
  status?: 'ACTIVE' | 'INACTIVE';
  businessUnit?: string;
}

export interface UpdateComponentVisibilityDTO {
  componentName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  businessUnit?: string;
}

export class ComponentVisibilityService {
  /**
   * Get all component visibility entries with pagination
   */
  static async getAll(params: ComponentVisibilityQueryParams) {
    const {
      page = 1,
      limit = 100,
      search,
      status,
      businessUnit,
    } = params;

    const where: any = {};
    if (search) {
      where.OR = [
        { componentKey: { contains: search, mode: 'insensitive' } },
        { componentName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (businessUnit) where.businessUnit = businessUnit;

    const [total, data] = await Promise.all([
      prisma.componentVisibility.count({ where }),
      prisma.componentVisibility.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { componentKey: 'asc' },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get active component keys (for filtering Page Builder)
   */
  static async getActiveComponentKeys(): Promise<Set<string>> {
    const inactiveEntries = await prisma.componentVisibility.findMany({
      where: { status: 'INACTIVE' },
      select: { componentKey: true },
    });
    // Returns keys that are explicitly INACTIVE (rest default to ACTIVE)
    return new Set(inactiveEntries.map((e) => e.componentKey));
  }

  /**
   * Get single entry by ID
   */
  static async getById(id: string) {
    const entry = await prisma.componentVisibility.findUnique({ where: { id } });
    if (!entry) throw new AppError('Component visibility entry not found', 404);
    return entry;
  }

  /**
   * Get single entry by component key
   */
  static async getByKey(componentKey: string) {
    return prisma.componentVisibility.findUnique({ where: { componentKey } });
  }

  /**
   * Create a new component visibility entry
   */
  static async create(data: CreateComponentVisibilityDTO) {
    const existing = await prisma.componentVisibility.findUnique({
      where: { componentKey: data.componentKey },
    });
    if (existing) {
      throw new AppError(
        `Component visibility entry for '${data.componentKey}' already exists`,
        409
      );
    }
    return prisma.componentVisibility.create({ data });
  }

  /**
   * Update an entry
   */
  static async update(id: string, data: UpdateComponentVisibilityDTO) {
    await this.getById(id);
    return prisma.componentVisibility.update({ where: { id }, data });
  }

  /**
   * Toggle status ACTIVE ↔ INACTIVE
   */
  static async toggleStatus(id: string) {
    const entry = await this.getById(id);
    const newStatus = entry.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return prisma.componentVisibility.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  /**
   * Delete an entry (resets that component to default ACTIVE)
   */
  static async delete(id: string) {
    await this.getById(id);
    await prisma.componentVisibility.delete({ where: { id } });
    return { message: 'Component visibility entry deleted' };
  }

  /**
   * Bulk toggle status for multiple entries
   */
  static async bulkToggle(ids: string[], status: 'ACTIVE' | 'INACTIVE') {
    const result = await prisma.componentVisibility.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return { updated: result.count };
  }

  /**
   * Sync registry into the visibility table (upsert all known components).
   * Existing rows are NOT overwritten — only new ones are inserted with ACTIVE.
   */
  static async syncFromRegistry() {
    const existingKeys = new Set(
      (await prisma.componentVisibility.findMany({ select: { componentKey: true } }))
        .map((e) => e.componentKey)
    );

    const toInsert = ALL_COMPONENT_TYPES.filter(
      (ct) => !existingKeys.has(ct.type)
    ).map((ct) => ({
      componentKey: ct.type,
      componentName: ct.name,
      status: 'ACTIVE' as const,
    }));

    if (toInsert.length > 0) {
      await prisma.componentVisibility.createMany({ data: toInsert });
    }

    return { synced: toInsert.length };
  }
}
