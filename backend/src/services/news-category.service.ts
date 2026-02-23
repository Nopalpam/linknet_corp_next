import { PrismaClient, Prisma } from '@prisma/client';
import { AppError } from '../types/error.types';
import slugify from 'slugify';

const prisma = new PrismaClient();

// ================== INTERFACES ==================

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  dataStatus?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCategoryData {
  categoryName: string;
  slug?: string;
  dataOrder?: number;
  dataStatus?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {}

// ================== BIGINT SERIALIZER ==================

function serializeCategory(cat: any) {
  if (!cat) return cat;
  return {
    ...cat,
    id: cat.id !== undefined ? Number(cat.id) : cat.id,
    dataOrder: cat.dataOrder !== undefined ? (cat.dataOrder !== null ? Number(cat.dataOrder) : null) : undefined,
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
      dataStatus,
      sortBy = 'dataOrder',
      sortOrder = 'asc',
    } = params;

    const skip = (page - 1) * limit;

    const where: Prisma.NewsCategoryWhereInput = {};

    if (dataStatus !== undefined) {
      where.dataStatus = dataStatus;
    }

    if (search) {
      where.OR = [
        { categoryName: { contains: search, mode: 'insensitive' } },
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
    const categories = await prisma.newsCategory.findMany({
      where: {
        dataStatus: { in: [1, 2] },
      },
      orderBy: { dataOrder: 'asc' },
    });

    return serializeCategories(categories);
  }

  // Get single category by ID
  async getCategoryById(id: number) {
    const category = await prisma.newsCategory.findUnique({
      where: { id: BigInt(id) },
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
    const category = await prisma.newsCategory.findFirst({
      where: { slug, dataStatus: { in: [1, 2] } },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    return serializeCategory(category);
  }

  // Create category
  async createCategory(data: CreateCategoryData, userEmail: string) {
    const baseSlug = data.slug || slugify(data.categoryName, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.newsCategory.findFirst({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let dataOrder = data.dataOrder ?? null;
    if (dataOrder === null) {
      const maxOrder = await prisma.newsCategory.aggregate({
        _max: { dataOrder: true },
      });
      dataOrder = (maxOrder._max?.dataOrder || 0) + 1;
    }

    const now = new Date();
    const category = await prisma.newsCategory.create({
      data: {
        categoryName: data.categoryName,
        slug,
        dataOrder,
        dataStatus: data.dataStatus ?? 1,
        createdBy: userEmail,
        createdAt: now,
        updatedAt: now,
      },
    });

    return serializeCategory(category);
  }

  // Update category
  async updateCategory(id: number, data: UpdateCategoryData, userEmail: string) {
    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    if (Number(existingCategory.id) === 1 && data.categoryName && data.categoryName !== existingCategory.categoryName) {
      throw new AppError('Cannot rename the Uncategorized category', 400);
    }

    let slug = existingCategory.slug;
    if (data.categoryName && data.categoryName !== existingCategory.categoryName) {
      const baseSlug = data.slug || slugify(data.categoryName, { lower: true, strict: true });
      slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.newsCategory.findFirst({
          where: { slug, id: { not: BigInt(id) } },
        });
        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const category = await prisma.newsCategory.update({
      where: { id: BigInt(id) },
      data: {
        ...(data.categoryName !== undefined && { categoryName: data.categoryName, slug }),
        ...(data.dataOrder !== undefined && { dataOrder: data.dataOrder }),
        ...(data.dataStatus !== undefined && { dataStatus: data.dataStatus }),
        updatedBy: userEmail,
        updatedAt: new Date(),
      },
    });

    return serializeCategory(category);
  }

  // Toggle status
  async toggleStatus(id: number, userEmail: string) {
    const category = await prisma.newsCategory.findUnique({
      where: { id: BigInt(id) },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    if (Number(category.id) === 1) {
      throw new AppError('Cannot change status of Uncategorized category', 400);
    }

    const newStatus = category.dataStatus === 1 ? 0 : 1;

    const updated = await prisma.newsCategory.update({
      where: { id: BigInt(id) },
      data: {
        dataStatus: newStatus,
        updatedBy: userEmail,
        updatedAt: new Date(),
      },
    });

    return serializeCategory(updated);
  }

  // Delete category (reassign content to Uncategorized id=1)
  async deleteCategory(id: number) {
    if (id === 1) {
      throw new AppError('Cannot delete the default Uncategorized category', 400);
    }

    const existingCategory = await prisma.newsCategory.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    await prisma.newsContent.updateMany({
      where: { idCategory: BigInt(id) },
      data: { idCategory: BigInt(1) },
    });

    await prisma.newsCategory.delete({
      where: { id: BigInt(id) },
    });
  }

  // Bulk delete categories
  async bulkDeleteCategories(ids: number[]) {
    const validIds = ids.filter((id) => id !== 1);

    if (validIds.length === 0) {
      throw new AppError('No valid categories to delete (Uncategorized cannot be deleted)', 400);
    }

    await prisma.newsContent.updateMany({
      where: { idCategory: { in: validIds.map((id) => BigInt(id)) } },
      data: { idCategory: BigInt(1) },
    });

    await prisma.newsCategory.deleteMany({
      where: { id: { in: validIds.map((id) => BigInt(id)) } },
    });

    return { deleted: validIds.length };
  }

  // Update category order (reorder)
  async updateCategoryOrder(updates: { id: number; order: number }[]) {
    await prisma.$transaction(
      updates.map((update) =>
        prisma.newsCategory.update({
          where: { id: BigInt(update.id) },
          data: { dataOrder: update.order, updatedAt: new Date() },
        })
      )
    );
  }
}

export default new NewsCategoryService();
