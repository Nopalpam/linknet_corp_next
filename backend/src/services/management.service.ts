import { PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';
import { 
  CreateManagementDTO, 
  UpdateManagementDTO, 
  ManagementQueryParams,
  ManagementCategoryDTO 
} from '../types/management.types';

const prisma = new PrismaClient();

/**
 * Management Service
 * Handles business logic for Management CRUD operations
 */
export class ManagementService {
  /**
   * Get all managements with pagination and filters
   */
  async getManagements(params: ManagementQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      categoryId,
      isActive,
      sortBy = 'order',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Execute queries
    const [managements, total] = await Promise.all([
      prisma.management.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const managements = await prisma.management.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return managements;
  }

  /**
   * Get managements grouped by category (Public)
   */
  async getManagementsByCategory() {
    const categories = await prisma.managementCategory.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        managements: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    });

    return categories;
  }

  /**
   * Get single management by ID
   */
  async getManagementById(id: string) {
    const management = await prisma.management.findUnique({
      where: { id },
      include: {
        category: {
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

    return management;
  }

  /**
   * Create new management
   */
  async createManagement(data: CreateManagementDTO) {
    // Validate category exists
    const category = await prisma.managementCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existing = await prisma.management.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Management with similar name already exists', 400);
    }

    // Get max order if not provided
    let order = data.order ?? 0;
    if (order === 0) {
      const maxOrder = await prisma.management.aggregate({
        where: { categoryId: data.categoryId },
        _max: { order: true },
      });
      order = (maxOrder._max?.order || 0) + 1;
    }

    // Create management
    const management = await prisma.management.create({
      data: {
        ...data,
        slug,
        order,
        isActive: data.isActive ?? true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return management;
  }

  /**
   * Update management
   */
  async updateManagement(id: string, data: UpdateManagementDTO) {
    // Check if management exists
    const existing = await prisma.management.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Management not found', 404);
    }

    // Validate category if provided
    if (data.categoryId) {
      const category = await prisma.managementCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // Generate new slug if name is updated
    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug exists
      const slugExists = await prisma.management.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (slugExists) {
        throw new AppError('Management with similar name already exists', 400);
      }
    }

    // Update management
    const management = await prisma.management.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return management;
  }

  /**
   * Delete management (soft delete)
   */
  async deleteManagement(id: string) {
    const existing = await prisma.management.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Management not found', 404);
    }

    await prisma.management.update({
      where: { id },
      data: { deletedAt: new Date() },
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

    await prisma.management.updateMany({
      where: { id: { in: ids } },
      data: { deletedAt: new Date() },
    });

    return { message: `${ids.length} managements deleted successfully` };
  }

  /**
   * Update managements order
   */
  async updateManagementsOrder(updates: { id: string; order: number }[]) {
    await Promise.all(
      updates.map(({ id, order }) =>
        prisma.management.update({
          where: { id },
          data: { order },
        })
      )
    );

    return { message: 'Order updated successfully' };
  }

  // ============================================
  // MANAGEMENT CATEGORY METHODS
  // ============================================

  /**
   * Get all management categories
   */
  async getCategories() {
    const categories = await prisma.managementCategory.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: { managements: true },
        },
      },
      orderBy: { position: 'asc' },
    });

    return categories;
  }

  /**
   * Get single category by ID
   */
  async getCategoryById(id: string) {
    const category = await prisma.managementCategory.findUnique({
      where: { id },
      include: {
        managements: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  /**
   * Create new category
   */
  async createCategory(data: ManagementCategoryDTO) {
    // Generate slug
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists
    const existing = await prisma.managementCategory.findUnique({
      where: { slug },
    });
    if (existing) {
      throw new AppError('Category with similar name already exists', 400);
    }

    // Get max position if not provided
    let position = data.position ?? 0;
    if (position === 0) {
      const maxPosition = await prisma.managementCategory.aggregate({
        _max: { position: true },
      });
      position = (maxPosition._max?.position || 0) + 1;
    }

    const category = await prisma.managementCategory.create({
      data: {
        ...data,
        slug,
        position,
        isActive: data.isActive ?? true,
      },
    });

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id: string, data: Partial<ManagementCategoryDTO>) {
    const existing = await prisma.managementCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new AppError('Category not found', 404);
    }

    // Generate new slug if name is updated
    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const slugExists = await prisma.managementCategory.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });
      if (slugExists) {
        throw new AppError('Category with similar name already exists', 400);
      }
    }

    const category = await prisma.managementCategory.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });

    return category;
  }

  /**
   * Delete category (soft delete)
   */
  async deleteCategory(id: string) {
    const existing = await prisma.managementCategory.findUnique({
      where: { id },
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
        'Cannot delete category with existing managements',
        400
      );
    }

    await prisma.managementCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Category deleted successfully' };
  }
}

export default new ManagementService();
