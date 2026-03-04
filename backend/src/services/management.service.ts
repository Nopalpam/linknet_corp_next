import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import {
  CreateManagementDTO,
  UpdateManagementDTO,
  ManagementQueryParams,
  CreateManagementCategoryDTO,
  UpdateManagementCategoryDTO,
  ManagementCategoryQueryParams,
} from '../types/management.types';

const prisma = new PrismaClient();

/**
 * Helper: generate slug from string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Management Service
 * Uses actual DB schema:
 *   management_categories: id(text), name, slug, description, position(int), is_active(bool), created_at, updated_at, deleted_at
 *   managements: id(text), category_id(text), name, slug, position(text), description, photo, email, phone, linkedin, order(int), is_active(bool), created_at, updated_at, deleted_at
 */
export class ManagementService {
  // ============================================
  // MANAGEMENT (DATA) METHODS
  // ============================================

  /**
   * Get all managements with pagination and filters
   */
  async getManagements(params: ManagementQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      is_active,
      sortBy = 'order',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = { deleted_at: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (is_active !== undefined) where.is_active = is_active;

    const validSortFields = ['order', 'name', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'order';

    const [managements, total] = await Promise.all([
      prisma.management.findMany({
        where,
        include: { managementCategory: { select: { id: true, name: true, slug: true } } },
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
      }),
      prisma.management.count({ where }),
    ]);

    return {
      data: managements,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get active managements (Public)
   */
  async getActiveManagements(categoryId?: string) {
    const where: any = { is_active: true, deleted_at: null };
    if (categoryId) where.categoryId = categoryId;
    return prisma.management.findMany({
      where,
      include: { managementCategory: { select: { id: true, name: true, slug: true } } },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Get managements grouped by category (Public)
   */
  async getManagementsByCategory() {
    return prisma.managementCategory.findMany({
      where: { is_active: true, deleted_at: null },
      include: {
        managements: { where: { is_active: true, deleted_at: null }, orderBy: { order: 'asc' } },
      },
      orderBy: { position: 'asc' },
    });
  }

  /**
   * Get single management by ID
   */
  async getManagementById(id: string) {
    const management = await prisma.management.findFirst({
      where: { id, deleted_at: null },
      include: { managementCategory: { select: { id: true, name: true, slug: true } } },
    });
    if (!management) throw new AppError('Management not found', 404);
    return management;
  }

  /**
   * Create new management
   */
  async createManagement(data: CreateManagementDTO) {
    const category = await prisma.managementCategory.findFirst({
      where: { id: data.categoryId, deleted_at: null },
    });
    if (!category) throw new AppError('Category not found', 404);

    const baseSlug = data.slug || generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.management.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    let order = data.order;
    if (order === undefined || order === null) {
      const maxOrder = await prisma.management.aggregate({
        where: { categoryId: data.categoryId, deleted_at: null },
        _max: { order: true },
      });
      order = (maxOrder._max?.order ?? 0) + 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { randomUUID } = require('crypto');
    return prisma.management.create({
      data: {
        id: randomUUID(),
        categoryId: data.categoryId,
        name: data.name,
        slug,
        position: data.position || '',
        description: data.description || null,
        photo: data.photo || null,
        email: data.email || null,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        order,
        is_active: data.is_active ?? true,
      },
      include: { managementCategory: { select: { id: true, name: true, slug: true } } },
    });
  }

  /**
   * Update management
   */
  async updateManagement(id: string, data: UpdateManagementDTO) {
    const existing = await prisma.management.findFirst({ where: { id, deleted_at: null } });
    if (!existing) throw new AppError('Management not found', 404);

    if (data.categoryId) {
      const cat = await prisma.managementCategory.findFirst({ where: { id: data.categoryId, deleted_at: null } });
      if (!cat) throw new AppError('Category not found', 404);
    }

    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      const baseSlug = data.slug || generateSlug(data.name);
      slug = baseSlug;
      let counter = 1;
      while (await prisma.management.findFirst({ where: { slug, id: { not: id } } })) {
        slug = `${baseSlug}-${counter++}`;
      }
    }

    return prisma.management.update({
      where: { id },
      data: {
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.name !== undefined && { name: data.name, slug }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.photo !== undefined && { photo: data.photo }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
      include: { managementCategory: { select: { id: true, name: true, slug: true } } },
    });
  }

  /**
   * Delete management (hard delete to match MySQL behavior)
   */
  async deleteManagement(id: string) {
    const existing = await prisma.management.findFirst({ where: { id, deleted_at: null } });
    if (!existing) throw new AppError('Management not found', 404);
    await prisma.management.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Management deleted successfully' };
  }

  /**
   * Bulk delete managements
   */
  async bulkDeleteManagements(ids: string[]) {
    if (!ids?.length) throw new AppError('No IDs provided', 400);
    await prisma.management.updateMany({ where: { id: { in: ids } }, data: { deleted_at: new Date() } });
    return { message: `${ids.length} managements deleted successfully` };
  }

  /**
   * Update managements data_order (for drag & drop sorting)
   */
  async updateManagementsOrder(updates: { id: string; order: number }[]) {
    await Promise.all(
      updates.map(({ id, order }) => prisma.management.update({ where: { id }, data: { order } }))
    );
    return { message: 'Order updated successfully' };
  }

  // ============================================
  // MANAGEMENT CATEGORY METHODS
  // ============================================

  /**
   * Get all management categories with optional pagination
   */
  async getCategories(params?: ManagementCategoryQueryParams) {
    const where: any = { deleted_at: null };
    if (params?.is_active !== undefined) where.is_active = params.is_active;
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (!params || (!params.page && !params.limit)) {
      return prisma.managementCategory.findMany({
        where,
        include: { _count: { select: { managements: true } } },
        orderBy: { position: 'asc' },
      });
    }

    const { page = 1, limit = 10, sortBy = 'position', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;
    const validSortFields = ['position', 'name', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'position';

    const [categories, total] = await Promise.all([
      prisma.managementCategory.findMany({
        where,
        include: { _count: { select: { managements: true } } },
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
      }),
      prisma.managementCategory.count({ where }),
    ]);

    return {
      data: categories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.managementCategory.findFirst({
      where: { id, deleted_at: null },
      include: {
        managements: { where: { deleted_at: null }, orderBy: { order: 'asc' } },
        _count: { select: { managements: true } },
      },
    });
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateManagementCategoryDTO) {
    const slug = data.slug || generateSlug(data.name);
    const existing = await prisma.managementCategory.findUnique({ where: { slug } });
    if (existing) throw new AppError('Category with similar name already exists', 400);

    let position = data.position;
    if (position === undefined || position === null) {
      const maxPos = await prisma.managementCategory.aggregate({
        where: { deleted_at: null },
        _max: { position: true },
      });
      position = (maxPos._max?.position ?? 0) + 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { randomUUID } = require('crypto');
    return prisma.managementCategory.create({
      data: {
        id: randomUUID(),
        name: data.name,
        slug,
        description: data.description || null,
        position,
        is_active: data.is_active ?? true,
      },
      include: { _count: { select: { managements: true } } },
    });
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateManagementCategoryDTO) {
    const existing = await prisma.managementCategory.findFirst({ where: { id, deleted_at: null } });
    if (!existing) throw new AppError('Category not found', 404);

    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = data.slug || generateSlug(data.name);
      const slugExists = await prisma.managementCategory.findFirst({ where: { slug, id: { not: id }, deleted_at: null } });
      if (slugExists) throw new AppError('Category with similar name already exists', 400);
    }

    return prisma.managementCategory.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
      },
      include: { _count: { select: { managements: true } } },
    });
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    const existing = await prisma.managementCategory.findFirst({
      where: { id, deleted_at: null },
      include: { _count: { select: { managements: { where: { deleted_at: null } } } } },
    });
    if (!existing) throw new AppError('Category not found', 404);
    if (existing._count.managements > 0) {
      throw new AppError('Cannot delete category with existing members. Delete all members first.', 400);
    }
    await prisma.managementCategory.update({ where: { id }, data: { deleted_at: new Date() } });
    return { message: 'Category deleted successfully' };
  }

  /**
   * Update categories order (for drag & drop sorting)
   */
  async updateCategoriesOrder(updates: { id: string; order: number }[]) {
    await Promise.all(
      updates.map(({ id, order }) =>
        prisma.managementCategory.update({ where: { id }, data: { position: order } })
      )
    );
    return { message: 'Category order updated successfully' };
  }
}

export default new ManagementService();
