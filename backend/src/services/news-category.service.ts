import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';

const prisma = new PrismaClient();

// ================== INTERFACES ==================

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryData {
  nameEn: string;
  nameId?: string;
  description?: string;
  position?: number;
  isActive?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// ================== NEWS CATEGORY SERVICE ==================

export class NewsCategoryService {
  // Get categories with pagination
  async getCategories(params: CategoryQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'position',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.NewsCategoryWhereInput = {
      deletedAt: null,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: 'insensitive' } },
        { nameId: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.newsCategory.findMany({
        where,
        include: {
          _count: {
            select: { news: true },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.newsCategory.count({ where }),
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

  // Get all active categories (for dropdowns, public)
  async getActiveCategories() {
    const categories = await prisma.newsCategory.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
      orderBy: { position: 'asc' },
    });

    return categories;
  }

  // Get single category by ID
  async getCategoryById(id: string) {
    const category = await prisma.newsCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category || category.deletedAt) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    const category = await prisma.newsCategory.findUnique({
      where: { slug },
    });

    if (!category || category.deletedAt || !category.isActive) {
      throw new AppError('Category not found', 404);
    }

    return category;
  }

  // Create category
  async createCategory(data: CreateCategoryData, userId: string) {
    // Generate slug
    const baseSlug = slugify(data.nameEn, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.newsCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Get max position if not provided
    let position = data.position ?? 0;
    if (position === 0) {
      const maxPosition = await prisma.newsCategory.aggregate({
        _max: { position: true },
      });
      position = (maxPosition._max?.position || 0) + 1;
    }

    const category = await prisma.newsCategory.create({
      data: {
        nameEn: data.nameEn,
        nameId: data.nameId,
        slug,
        description: data.description,
        position,
        isActive: data.isActive ?? true,
        createdById: userId,
      },
    });

    return category;
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryData, userId: string) {
    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id },
    });

    if (!existingCategory || existingCategory.deletedAt) {
      throw new AppError('Category not found', 404);
    }

    // Update slug if name changes
    let slug = existingCategory.slug;
    if (data.nameEn && data.nameEn !== existingCategory.nameEn) {
      const baseSlug = slugify(data.nameEn, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.newsCategory.findFirst({
          where: { slug, id: { not: id } },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const category = await prisma.newsCategory.update({
      where: { id },
      data: {
        ...(data.nameEn !== undefined && { nameEn: data.nameEn, slug }),
        ...(data.nameId !== undefined && { nameId: data.nameId }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedById: userId,
      },
    });

    return category;
  }

  // Delete category (soft delete)
  async deleteCategory(id: string) {
    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!existingCategory || existingCategory.deletedAt) {
      throw new AppError('Category not found', 404);
    }

    // Check if category has news
    if (existingCategory._count.news > 0) {
      throw new AppError(
        'Cannot delete category with existing news. Please move or delete the news first.',
        400
      );
    }

    await prisma.newsCategory.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Update category order
  async updateCategoryOrder(updates: { id: string; position: number }[]) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.newsCategory.update({
          where: { id: update.id },
          data: { position: update.position },
        })
      )
    );
  }
}

export default new NewsCategoryService();
