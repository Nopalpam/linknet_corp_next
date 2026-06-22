import { Prisma, PageStatus, PageTemplate } from '@prisma/client';
import prisma from '@config/database';
import { AppError } from '../types/error.types';
import { syncComponentInstance, validateComponentInstance } from '../pageBuilder/migrationEngine';
import { ComponentVisibilityService } from './componentVisibility.service';

const pageListSelect = {
  id: true,
  title: true,
  titleEn: true,
  titleId: true,
  slug: true,
  template: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  metaThumbnail: true,
  ogImage: true,
  product: true,
  promo: true,
  source: true,
  noindex: true,
  nofollow: true,
  showNavbar: true,
  showFooter: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: { id: true, firstName: true, lastName: true } },
  updatedBy: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
  _count: { select: { components: true } },
} satisfies Prisma.PageSelect;

const pageDetailSelect = {
  ...pageListSelect,
  components: {
    orderBy: { order: 'asc' },
    select: {
      id: true,
      pageId: true,
      type: true,
      data: true,
      order: true,
      isVisible: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} satisfies Prisma.PageSelect;

const normalizePageResponse = <T extends Record<string, unknown>>(page: T) => page;

const withRuntimeSyncedComponents = <T extends { components?: any[] }>(page: T): T => {
  if (!Array.isArray(page.components)) return page;

  return {
    ...page,
    components: page.components.map((component) => {
      const syncResult = syncComponentInstance(component.type, component.data);
      const validation = validateComponentInstance(component.type, syncResult.instance);

      return {
        ...component,
        data: syncResult.instance,
        schemaStatus: {
          currentVersion: syncResult.originalVersion,
          targetVersion: syncResult.latestVersion,
          isOutdated: syncResult.wasOutdated,
          changed: syncResult.changed,
          operations: syncResult.logs.flatMap((entry) => (
            entry.operations.length > 0 ? entry.operations : [entry.description]
          )).concat(syncResult.schemaDiffs),
          errors: [...syncResult.errors, ...validation.errors],
          warnings: validation.warnings,
        },
      };
    }),
  };
};

const withoutInactiveComponents = <T extends { components?: any[] }>(
  page: T,
  inactiveKeys: Set<string>
): T => {
  if (!Array.isArray(page.components) || inactiveKeys.size === 0) return page;

  return {
    ...page,
    components: page.components.filter((component) => !inactiveKeys.has(component.type)),
  };
};

const parsePageStatus = (status?: string): PageStatus | undefined => {
  if (!status) return undefined;
  return Object.values(PageStatus).includes(status as PageStatus)
    ? (status as PageStatus)
    : undefined;
};

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export class PageService {
  /**
   * Get all pages
   */
  async getAllPages(params: { status?: string; search?: string } = {}) {
    const where: Prisma.PageWhereInput = {
      deletedAt: null,
    };
    const status = parsePageStatus(params.status);

    if (status) {
      where.status = status;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: pageListSelect,
    });

    return pages.map(normalizePageResponse);
  }

  /**
   * Get page by ID with components
   */
  async getPageById(id: string) {
    const page = await prisma.page.findFirst({
      where: { id, deletedAt: null },
      select: pageDetailSelect,
    });
    if (!page) throw new AppError('Page not found', 404);
    const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();
    return normalizePageResponse(withRuntimeSyncedComponents(withoutInactiveComponents(page, inactiveKeys)));
  }

  async getPageHistory(id: string, page = 1, perPage = 10) {
    const pageRecord = await prisma.page.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!pageRecord) throw new AppError('Page not found', 404);

    const where = {
      module: 'pages',
      recordId: id,
      deletedAt: null,
    };

    const safePerPage = Math.min(Math.max(perPage, 1), 100);
    const safePage = Math.max(page, 1);

    const [total, data] = await Promise.all([
      prisma.logActivity.count({ where }),
      prisma.logActivity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePerPage,
        take: safePerPage,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: safePage,
        perPage: safePerPage,
        totalPages: Math.ceil(total / safePerPage),
      },
    };
  }

  async checkSlugAvailability(slug: string, excludeId?: string) {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) throw new AppError('Slug is required', 400);

    const existing = await prisma.page.findFirst({
      where: {
        slug: normalizedSlug,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true, slug: true },
    });

    return {
      slug: normalizedSlug,
      available: !existing,
    };
  }

  /**
   * Get page by Slug for public rendering
   */
  async getPageBySlug(slug: string) {
    const page = await prisma.page.findFirst({
      where: { slug, deletedAt: null },
      select: {
        id: true,
        title: true,
        titleEn: true,
        titleId: true,
        slug: true,
        template: true,
        metaTitle: true,
        metaDescription: true,
        metaKeywords: true,
        metaThumbnail: true,
        ogImage: true,
        product: true,
        promo: true,
        source: true,
        noindex: true,
        nofollow: true,
        showNavbar: true,
        showFooter: true,
        status: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        components: {
          where: { isVisible: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            pageId: true,
            type: true,
            data: true,
            order: true,
            isVisible: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      }
    });
    if (!page) return page;
    const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();
    return withRuntimeSyncedComponents(withoutInactiveComponents(page, inactiveKeys));
  }

  /**
   * Create new page
   */
  async createPage(userId: string, data: any) {
    // Validate slug uniqueness
    const existing = await prisma.page.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });
    if (existing) throw new AppError('Slug already exists', 400);

    return await prisma.page.create({
      data: {
        title: data.title,
        titleEn: data.titleEn ?? data.title,
        titleId: data.titleId,
        slug: data.slug,
        status: data.status || PageStatus.DRAFT,
        template: data.template || PageTemplate.DEFAULT,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        metaThumbnail: data.metaThumbnail,
        ogImage: data.ogImage,
        product: data.product,
        promo: data.promo,
        source: data.source,
        noindex: data.noindex ?? false,
        nofollow: data.nofollow ?? false,
        showNavbar: data.showNavbar ?? true,
        showFooter: data.showFooter ?? true,
        publishedAt: data.status === PageStatus.PUBLISHED ? new Date() : null,
        createdById: userId,
      },
      select: pageListSelect,
    });
  }

  /**
   * Update page metadata
   */
  async updatePage(id: string, data: any, userId?: string) {
    // Check slug uniqueness if changed
    if (data.slug) {
        const existing = await prisma.page.findUnique({
          where: { slug: data.slug },
          select: { id: true },
        });
        if (existing && existing.id !== id) throw new AppError('Slug already exists', 400);
    }

    const updatedPage = await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        titleEn: data.titleEn,
        titleId: data.titleId,
        slug: data.slug,
        status: data.status,
        template: data.template,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        metaThumbnail: data.metaThumbnail,
        ogImage: data.ogImage,
        product: data.product,
        promo: data.promo,
        source: data.source,
        noindex: data.noindex,
        nofollow: data.nofollow,
        showNavbar: data.showNavbar,
        showFooter: data.showFooter,
        publishedAt: data.status === PageStatus.PUBLISHED ? new Date() : data.status === PageStatus.DRAFT ? null : undefined,
        updatedById: userId,
        updatedAt: new Date()
      },
      select: pageDetailSelect,
    });

    const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();
    return normalizePageResponse(withRuntimeSyncedComponents(withoutInactiveComponents(updatedPage, inactiveKeys)));
  }

  /**
   * Delete page
   */
  async deletePage(id: string) {
    return await prisma.page.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Save page components.
   * 
   * Maps to legacy page_components table structure:
   * - component_type → type
   * - component_data → data (JSONB in PostgreSQL)
   * - sort_order → order (derived from array index)
   * - is_visible → isVisible
   * 
   * Active components are replaced atomically. Existing inactive component
   * records are preserved for backward compatibility and data safety.
   */
  async savePageComponents(pageId: string, components: any[], userId?: string) {
    // Verify page exists
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true },
    });
    if (!page) throw new AppError('Page not found', 404);

    console.log('📦 Saving page components:', {
      pageId,
      componentCount: components?.length || 0,
      components: JSON.stringify(components, null, 2)
    });

    const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();
    const submittedInactiveTypes = Array.from(new Set(
      (components || [])
        .map((component) => component?.type)
        .filter((type) => type && inactiveKeys.has(type))
    ));

    if (submittedInactiveTypes.length > 0) {
      throw new AppError(
        `Inactive components cannot be saved: ${submittedInactiveTypes.join(', ')}`,
        400
      );
    }

    return await prisma.$transaction(async (tx) => {
        // Replace only active components. Inactive records stay stored but hidden.
        await tx.pageComponent.deleteMany({
          where: {
            pageId,
            ...(inactiveKeys.size > 0 ? { type: { notIn: Array.from(inactiveKeys) } } : {}),
          },
        });

        // Insert new components with correct sort_order
        if (components && components.length > 0) {
            const componentsToCreate = components.map((c, index) => ({
                pageId,
                type: c.type,
                // component_data: store all props in the schema-versioned envelope
                data: syncComponentInstance(c.type, c.data || c.props || {}, {
                  persistAudit: true,
                  syncedBy: userId || 'system',
                }).instance as any,
                // sort_order: derived from array position
                order: index,
                isVisible: c.isVisible ?? true
            }));

            console.log('💾 Creating components in DB:', JSON.stringify(componentsToCreate, null, 2));

            await tx.pageComponent.createMany({
                data: componentsToCreate
            });
        }
        
        // Return updated page with components
        const result = await tx.page.findUnique({
             where: { id: pageId },
             select: pageDetailSelect,
        });

        console.log('✅ Components saved successfully:', result?.components?.length || 0);
        
        return result
          ? normalizePageResponse(withRuntimeSyncedComponents(withoutInactiveComponents(result, inactiveKeys)))
          : result;
    });
  }
}
