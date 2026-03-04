import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// ================== INTERFACES ==================

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryData {
  name_en: string;
  name_id?: string;
  slug?: string;
  description?: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// ================== SERIALIZER ==================

function serializeCategory(cat: any) {
  if (!cat) return cat;
  return {
    ...cat,
    _count: cat._count,
  };
}

function serializeCategories(cats: any[]) {
  return cats.map(serializeCategory);
}

// ================== NEWS CATEGORY SERVICE ==================

export class NewsCategoryService {
  // Get categories with pagination
  async getCategories(params: CategoryQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      is_active,
      sortBy = 'position',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.news_categoriesWhereInput = {};

    if (is_active !== undefined) {
      where.is_active = is_active;
    }

    if (search) {
      where.OR = [
        { name_en: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.news_categories.findMany({
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
      prisma.news_categories.count({ where }),
    ]);

    return {
      data: serializeCategories(categories),
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
    const categories = await prisma.news_categories.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      orderBy: { position: 'asc' },
    });

    return serializeCategories(categories);
  }

  // Get single category by ID
  async getCategoryById(id: string) {
    const category = await prisma.news_categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: { news: true },
        },
      },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return serializeCategory(category);
  }

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    const category = await prisma.news_categories.findFirst({
      where: { slug, is_active: true, deleted_at: null },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return serializeCategory(category);
  }

  // Create category
  async createCategory(data: CreateCategoryData, userId: string) {
    const baseSlug = data.slug || slugify(data.name_en, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.news_categories.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let position = data.position ?? null;
    if (position === null) {
      const maxOrder = await prisma.news_categories.aggregate({
        _max: { position: true },
      });
      position = (maxOrder._max?.position || 0) + 1;
    }

    const now = new Date();
    const category = await prisma.news_categories.create({
      data: {
        id: uuidv4(),
        name_en: data.name_en,
        name_id: data.name_id,
        slug,
        description: data.description,
        position,
        is_active: data.is_active ?? true,
        created_by: userId,
        created_at: now,
        updated_at: now,
      },
    });

    return serializeCategory(category);
  }

  // Update category
  async updateCategory(id: string, data: UpdateCategoryData, userId: string) {
    const existingCategory = await prisma.news_categories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    let slug = existingCategory.slug;
    if (data.name_en && data.name_en !== existingCategory.name_en) {
      const baseSlug = data.slug || slugify(data.name_en, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.news_categories.findFirst({
          where: { slug, id: { not: id } },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const category = await prisma.news_categories.update({
      where: { id },
      data: {
        ...(data.name_en !== undefined && { name_en: data.name_en, slug }),
        ...(data.name_id !== undefined && { name_id: data.name_id }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.position !== undefined && { position: data.position }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    return serializeCategory(category);
  }

  // Toggle status
  async toggleStatus(id: string, userId: string) {
    const category = await prisma.news_categories.findUnique({
      where: { id },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const newStatus = !category.is_active;

    const updated = await prisma.news_categories.update({
      where: { id },
      data: {
        is_active: newStatus,
        updated_by: userId,
        updated_at: new Date(),
      },
    });

    return serializeCategory(updated);
  }

  // Delete category (soft delete)
  async deleteCategory(id: string) {
    const existingCategory = await prisma.news_categories.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    await prisma.news_categories.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });
  }

  // Bulk delete categories
  async bulkDeleteCategories(ids: string[]) {
    if (ids.length === 0) {
      throw new AppError('No valid categories to delete', 400);
    }

    await prisma.news_categories.updateMany({
      where: { id: { in: ids } },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });

    return { deleted: ids.length };
  }

  // Update category order (reorder)
  async updateCategoryOrder(updates: { id: string; order: number }[]) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.news_categories.update({
          where: { id: update.id },
          data: { position: update.order, updated_at: new Date() },
        })
      )
    );
  }
}

export default new NewsCategoryService();
