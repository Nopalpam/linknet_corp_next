import { ContentStatus, PrismaClient } from '@prisma/client';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();
const db = prisma as any;

type SolutionStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type CategoryType = 'INDUSTRY' | 'BUSINESS_SCALE' | 'BUSINESS_NEED';

interface SolutionQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SolutionStatus | 'ALL';
  categoryId?: string;
  industryId?: string;
  businessScaleId?: string;
  businessNeedIds?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface SolutionPayload {
  title: string;
  titleId?: string;
  titleEn?: string;
  slug?: string;
  description?: string;
  descriptionId?: string;
  descriptionEn?: string;
  image?: string;
  bannerImage?: string;
  ctaList?: any[];
  sortOrder?: number;
  status?: SolutionStatus;
  categoryIds?: string[];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizePositiveInt(value: any, fallback: number, max = 100) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

function normalizeStatus(value: any, fallback: SolutionStatus = 'DRAFT'): SolutionStatus {
  return ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(value) ? value : fallback;
}

function parseIdList(value: any): string[] {
  const unique = (items: string[]) => Array.from(new Set(items));
  if (Array.isArray(value)) {
    return unique(value.map((item) => String(item).trim()).filter(Boolean));
  }
  if (typeof value === 'string') {
    return unique(value.split(',').map((item) => item.trim()).filter(Boolean));
  }
  return [];
}

function getOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'asc') {
  const normalized = (sortBy || 'sort_order').toLowerCase();
  if (normalized === 'title' || normalized === 'alphabetical') return [{ title: 'asc' }, { sortOrder: 'asc' }];
  if (normalized === 'latest' || normalized === 'created_at') return [{ createdAt: 'desc' }, { sortOrder: 'asc' }];
  if (normalized === 'updated_at') return [{ updatedAt: sortOrder }, { sortOrder: 'asc' }];
  return [{ sortOrder: sortOrder }, { title: 'asc' }];
}

function mapSolution(solution: any) {
  const categories = (solution.categories || [])
    .map((relation: any) => relation.category)
    .filter(Boolean);

  return {
    ...solution,
    categories,
    industries: categories.filter((category: any) => category.type === 'INDUSTRY'),
    businessScales: categories.filter((category: any) => category.type === 'BUSINESS_SCALE'),
    businessNeeds: categories.filter((category: any) => category.type === 'BUSINESS_NEED'),
  };
}

function buildCategoryFilter(categoryIds: string[]) {
  if (categoryIds.length === 0) return {};

  return {
    AND: categoryIds.map((categoryId) => ({
      categories: {
        some: {
          categoryId,
          category: { isActive: true, deletedAt: null },
        },
      },
    })),
  };
}

async function ensureUniqueSlug(slugBase: string, ignoreId?: string) {
  let slug = slugBase || 'solution';
  let suffix = 1;

  while (
    await db.dataBankSolution.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(ignoreId ? { id: { not: ignoreId } } : {}),
      },
      select: { id: true },
    })
  ) {
    suffix += 1;
    slug = `${slugBase}-${suffix}`;
  }

  return slug;
}

export class DataBankSolutionService {
  async getTaxonomies(type?: CategoryType) {
    return db.dataBankSolutionCategory.findMany({
      where: {
        deletedAt: null,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async getSolutions(query: SolutionQuery = {}) {
    const page = normalizePositiveInt(query.page, 1, 10000);
    const limit = normalizePositiveInt(query.limit, 10, 100);
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
    const categoryIds = [
      query.categoryId,
      query.industryId,
      query.businessScaleId,
      ...parseIdList(query.businessNeedIds),
    ].filter(Boolean) as string[];

    const where: any = {
      deletedAt: null,
      ...(query.status && query.status !== 'ALL' ? { status: normalizeStatus(query.status) } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { titleId: { contains: query.search, mode: 'insensitive' } },
              { titleEn: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...buildCategoryFilter(categoryIds),
    };

    const [items, total] = await Promise.all([
      db.dataBankSolution.findMany({
        where,
        include: {
          categories: {
            include: { category: true },
          },
        },
        orderBy: getOrderBy(query.sortBy, sortOrder),
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.dataBankSolution.count({ where }),
    ]);

    return {
      data: items.map(mapSolution),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getPublicSolutions(query: SolutionQuery = {}) {
    return this.getSolutions({
      ...query,
      status: 'PUBLISHED',
      limit: query.limit || 100,
    });
  }

  async getSolutionById(id: string) {
    const solution = await db.dataBankSolution.findFirst({
      where: { id, deletedAt: null },
      include: { categories: { include: { category: true } } },
    });

    if (!solution) throw new AppError('Solution not found', 404);
    return mapSolution(solution);
  }

  async createSolution(data: SolutionPayload, userId?: string) {
    if (!data.title?.trim()) throw new AppError('Title is required', 400);

    const categoryIds = parseIdList(data.categoryIds);
    await this.validateCategories(categoryIds);

    const slugBase = slugify(data.slug || data.title);
    const slug = await ensureUniqueSlug(slugBase);
    const status = normalizeStatus(data.status);

    const maxOrder = await db.dataBankSolution.aggregate({
      _max: { sortOrder: true },
      where: { deletedAt: null },
    });

    const solution = await db.dataBankSolution.create({
      data: {
        title: data.title.trim(),
        titleId: data.titleId || data.title,
        titleEn: data.titleEn || data.title,
        slug,
        description: data.description || '',
        descriptionId: data.descriptionId || data.description || '',
        descriptionEn: data.descriptionEn || data.description || '',
        image: data.image || '',
        bannerImage: data.bannerImage || data.image || '',
        ctaList: Array.isArray(data.ctaList) ? data.ctaList : [],
        sortOrder: Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : (maxOrder._max.sortOrder || 0) + 10,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        createdBy: userId,
        updatedBy: userId,
        categories: {
          create: categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      },
      include: { categories: { include: { category: true } } },
    });

    return mapSolution(solution);
  }

  async updateSolution(id: string, data: Partial<SolutionPayload>, userId?: string) {
    const existing = await this.getSolutionById(id);
    const categoryIds = data.categoryIds !== undefined ? parseIdList(data.categoryIds) : undefined;
    if (categoryIds) await this.validateCategories(categoryIds);

    const title = data.title?.trim();
    const slug = data.slug !== undefined || title
      ? await ensureUniqueSlug(slugify(data.slug || title || existing.title), id)
      : undefined;
    const status = data.status ? normalizeStatus(data.status, existing.status) : undefined;
    const shouldPublish = status === 'PUBLISHED' && existing.status !== 'PUBLISHED';

    const updated = await db.$transaction(async (tx: any) => {
      if (categoryIds) {
        await tx.dataBankSolutionCategoryRelation.deleteMany({ where: { solutionId: id } });
      }

      return tx.dataBankSolution.update({
        where: { id },
        data: {
          ...(title !== undefined ? { title } : {}),
          ...(data.titleId !== undefined ? { titleId: data.titleId } : {}),
          ...(data.titleEn !== undefined ? { titleEn: data.titleEn } : {}),
          ...(slug !== undefined ? { slug } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.descriptionId !== undefined ? { descriptionId: data.descriptionId } : {}),
          ...(data.descriptionEn !== undefined ? { descriptionEn: data.descriptionEn } : {}),
          ...(data.image !== undefined ? { image: data.image } : {}),
          ...(data.bannerImage !== undefined ? { bannerImage: data.bannerImage } : {}),
          ...(data.ctaList !== undefined ? { ctaList: Array.isArray(data.ctaList) ? data.ctaList : [] } : {}),
          ...(data.sortOrder !== undefined ? { sortOrder: Number(data.sortOrder) || 0 } : {}),
          ...(status !== undefined ? { status, publishedAt: shouldPublish ? new Date() : status === 'PUBLISHED' ? existing.publishedAt : null } : {}),
          updatedBy: userId,
          ...(categoryIds ? {
            categories: {
              create: categoryIds.map((categoryId) => ({
                category: { connect: { id: categoryId } },
              })),
            },
          } : {}),
        },
        include: { categories: { include: { category: true } } },
      });
    });

    return mapSolution(updated);
  }

  async deleteSolution(id: string) {
    await this.getSolutionById(id);
    await db.dataBankSolution.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Solution deleted successfully' };
  }

  async setPublishStatus(id: string, published: boolean, userId?: string) {
    await this.getSolutionById(id);
    const solution = await db.dataBankSolution.update({
      where: { id },
      data: {
        status: published ? ContentStatus.PUBLISHED : ContentStatus.DRAFT,
        publishedAt: published ? new Date() : null,
        updatedBy: userId,
      },
      include: { categories: { include: { category: true } } },
    });
    return mapSolution(solution);
  }

  async updateOrder(updates: { id: string; sortOrder: number }[]) {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new AppError('Updates are required', 400);
    }

    await db.$transaction(
      updates.map((item) =>
        db.dataBankSolution.update({
          where: { id: item.id },
          data: { sortOrder: Number(item.sortOrder) || 0 },
        })
      )
    );

    return { message: 'Solution order updated successfully' };
  }

  private async validateCategories(categoryIds: string[]) {
    if (categoryIds.length === 0) return;

    const categories = await db.dataBankSolutionCategory.findMany({
      where: { id: { in: categoryIds }, deletedAt: null, isActive: true },
      select: { id: true },
    });

    if (categories.length !== new Set(categoryIds).size) {
      throw new AppError('One or more categories are invalid', 400);
    }
  }
}

export default new DataBankSolutionService();
