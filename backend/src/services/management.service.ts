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
 * Helper: serialize BigInt fields to string for JSON responses
 */
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (Array.isArray(obj)) return obj.map(serializeBigInt);
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = serializeBigInt(obj[key]);
    }
    return result;
  }
  return obj;
}

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
 * Handles business logic for Management CRUD operations
 * Compatible with MySQL legacy structure
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
      dataStatus,
      sortBy = 'dataOrder',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { positionEn: { contains: search, mode: 'insensitive' } },
        { positionId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    if (dataStatus !== undefined) {
      where.dataStatus = dataStatus;
    }

    // Map sortBy to correct field names
    const sortField = sortBy === 'data_order' ? 'dataOrder' : sortBy;

    const [managements, total] = await Promise.all([
      prisma.management.findMany({
        where,
        include: {
          managementCategory: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortField]: sortOrder },
      }),
      prisma.management.count({ where }),
    ]);

    return {
      data: serializeBigInt(managements),
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
    const where: any = {
      dataStatus: 1,
    };

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    const managements = await prisma.management.findMany({
      where,
      include: {
        managementCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { dataOrder: 'asc' },
    });

    return serializeBigInt(managements);
  }

  /**
   * Get managements grouped by category (Public)
   */
  async getManagementsByCategory() {
    const categories = await prisma.managementCategory.findMany({
      where: {
        status: 1,
      },
      include: {
        managements: {
          where: {
            dataStatus: 1,
          },
          orderBy: { dataOrder: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return serializeBigInt(categories);
  }

  /**
   * Get single management by ID
   */
  async getManagementById(id: string) {
    const management = await prisma.management.findUnique({
      where: { id: BigInt(id) },
      include: {
        managementCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!management) {
      throw new AppError('Management not found', 404);
    }

    return serializeBigInt(management);
  }

  /**
   * Create new management
   */
  async createManagement(data: CreateManagementDTO) {
    // Validate category exists if categoryId provided
    if (data.categoryId) {
      const category = await prisma.managementCategory.findUnique({
        where: { id: BigInt(data.categoryId as any) },
      });
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // Get max data_order if not provided
    let dataOrder = data.dataOrder ?? null;
    if (dataOrder === null || dataOrder === undefined) {
      const maxOrder = await prisma.management.aggregate({
        where: data.categoryId ? { categoryId: BigInt(data.categoryId as any) } : {},
        _max: { dataOrder: true },
      });
      dataOrder = (maxOrder._max?.dataOrder || 0) + 1;
    }

    const management = await prisma.management.create({
      data: {
        name: data.name,
        positionEn: data.positionEn || null,
        positionId: data.positionId || null,
        category: data.category || null,
        categoryId: data.categoryId ? BigInt(data.categoryId as any) : null,
        photo: data.photo || null,
        bioEn: data.bioEn || null,
        bioId: data.bioId || null,
        dataOrder,
        dataStatus: data.dataStatus ?? 1,
        createdBy: data.createdBy || null,
      },
      include: {
        managementCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return serializeBigInt(management);
  }

  /**
   * Update management
   */
  async updateManagement(id: string, data: UpdateManagementDTO) {
    const existing = await prisma.management.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new AppError('Management not found', 404);
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await prisma.managementCategory.findUnique({
        where: { id: BigInt(data.categoryId as any) },
      });
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.positionEn !== undefined) updateData.positionEn = data.positionEn;
    if (data.positionId !== undefined) updateData.positionId = data.positionId;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ? BigInt(data.categoryId as any) : null;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.bioEn !== undefined) updateData.bioEn = data.bioEn;
    if (data.bioId !== undefined) updateData.bioId = data.bioId;
    if (data.dataOrder !== undefined) updateData.dataOrder = data.dataOrder;
    if (data.dataStatus !== undefined) updateData.dataStatus = data.dataStatus;
    if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

    const management = await prisma.management.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        managementCategory: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return serializeBigInt(management);
  }

  /**
   * Delete management (hard delete to match MySQL behavior)
   */
  async deleteManagement(id: string) {
    const existing = await prisma.management.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new AppError('Management not found', 404);
    }

    await prisma.management.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Management deleted successfully' };
  }

  /**
   * Bulk delete managements
   */
  async bulkDeleteManagements(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new AppError('No IDs provided', 400);
    }

    await prisma.management.deleteMany({
      where: { id: { in: ids.map((id) => BigInt(id)) } },
    });

    return { message: `${ids.length} managements deleted successfully` };
  }

  /**
   * Update managements data_order (for drag & drop sorting)
   */
  async updateManagementsOrder(updates: { id: string; dataOrder: number }[]) {
    await Promise.all(
      updates.map(({ id, dataOrder }) =>
        prisma.management.update({
          where: { id: BigInt(id) },
          data: { dataOrder },
        })
      )
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
    // If no params, return all ordered by order
    if (!params || (!params.page && !params.limit)) {
      const categories = await prisma.managementCategory.findMany({
        where: params?.status !== undefined ? { status: params.status } : {},
        include: {
          _count: {
            select: { managements: true },
          },
        },
        orderBy: { order: 'asc' },
      });
      return serializeBigInt(categories);
    }

    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'order',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status !== undefined) {
      where.status = status;
    }

    const [categories, total] = await Promise.all([
      prisma.managementCategory.findMany({
        where,
        include: {
          _count: {
            select: { managements: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.managementCategory.count({ where }),
    ]);

    return {
      data: serializeBigInt(categories),
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
    const category = await prisma.managementCategory.findUnique({
      where: { id: BigInt(id) },
      include: {
        managements: {
          orderBy: { dataOrder: 'asc' },
        },
        _count: {
          select: { managements: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return serializeBigInt(category);
  }

  /**
   * Create new category
   */
  async createCategory(data: CreateManagementCategoryDTO) {
    // Generate slug from name
    const slug = data.slug || generateSlug(data.name);

    // Check if slug exists
    const existing = await prisma.managementCategory.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError('Category with similar name already exists', 400);
    }

    // Get max order if not provided
    let order = data.order ?? null;
    if (order === null || order === undefined) {
      const maxOrder = await prisma.managementCategory.aggregate({
        _max: { order: true },
      });
      order = (maxOrder._max?.order || 0) + 1;
    }

    const category = await prisma.managementCategory.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        order,
        status: data.status ?? 1,
        createdBy: data.createdBy || null,
      },
      include: {
        _count: {
          select: { managements: true },
        },
      },
    });

    return serializeBigInt(category);
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: UpdateManagementCategoryDTO) {
    const existing = await prisma.managementCategory.findUnique({
      where: { id: BigInt(id) },
    });
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    // Generate new slug if name is updated
    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = data.slug || generateSlug(data.name);

      const slugExists = await prisma.managementCategory.findFirst({
        where: {
          slug,
          id: { not: BigInt(id) },
        },
      });
      if (slugExists) {
        throw new AppError('Category with similar name already exists', 400);
      }
    }

    const updateData: any = { slug };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.order !== undefined) updateData.order = data.order;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.updatedBy !== undefined) updateData.updatedBy = data.updatedBy;

    const category = await prisma.managementCategory.update({
      where: { id: BigInt(id) },
      data: updateData,
      include: {
        _count: {
          select: { managements: true },
        },
      },
    });

    return serializeBigInt(category);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    const existing = await prisma.managementCategory.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: { managements: true },
        },
      },
    });

    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    if (existing._count.managements > 0) {
      throw new AppError(
        'Cannot delete category with existing managements. Delete all management data first.',
        400
      );
    }

    await prisma.managementCategory.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Category deleted successfully' };
  }

  /**
   * Update categories order (for drag & drop sorting)
   */
  async updateCategoriesOrder(updates: { id: string; order: number }[]) {
    await Promise.all(
      updates.map(({ id, order }) =>
        prisma.managementCategory.update({
          where: { id: BigInt(id) },
          data: { order },
        })
      )
    );

    return { message: 'Category order updated successfully' };
  }
}

export default new ManagementService();
