import { PrismaClient, PageStatus, PageTemplate } from '@prisma/client';
import { AppError } from '../types/error.types';

const prisma = new PrismaClient();

export class PageService {
  /**
   * Get all pages
   */
  async getAllPages() {
    return await prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { components: true } }
      }
    });
  }

  /**
   * Get page by ID with components
   */
  async getPageById(id: string) {
    const page = await prisma.page.findUnique({
      where: { id },
      include: {
        components: {
          orderBy: { order: 'asc' }
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    if (!page) throw new AppError('Page not found', 404);
    return page;
  }

  /**
   * Get page by Slug for public rendering
   */
  async getPageBySlug(slug: string) {
    const page = await prisma.page.findUnique({
      where: { slug },
      include: {
        components: {
          where: { isVisible: true },
          orderBy: { order: 'asc' }
        }
      }
    });
    return page;
  }

  /**
   * Create new page
   */
  async createPage(userId: string, data: any) {
    // Validate slug uniqueness
    const existing = await prisma.page.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError('Slug already exists', 400);

    return await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        status: data.status || PageStatus.DRAFT,
        template: data.template || PageTemplate.DEFAULT,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        createdById: userId
      }
    });
  }

  /**
   * Update page metadata
   */
  async updatePage(id: string, data: any) {
    // Check slug uniqueness if changed
    if (data.slug) {
        const existing = await prisma.page.findUnique({ where: { slug: data.slug } });
        if (existing && existing.id !== id) throw new AppError('Slug already exists', 400);
    }

    return await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        status: data.status,
        template: data.template,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        updatedAt: new Date()
      }
    });
  }

  /**
   * Delete page
   */
  async deletePage(id: string) {
    return await prisma.page.delete({ where: { id } });
  }

  /**
   * Save page components (Replace All Strategy)
   * 
   * Maps to legacy page_components table structure:
   * - component_type → type
   * - component_data → data (JSONB in PostgreSQL)
   * - sort_order → order (derived from array index)
   * - is_visible → isVisible
   * 
   * Uses a transactional delete-all + create-many approach
   * to ensure atomic replacement of all components.
   */
  async savePageComponents(pageId: string, components: any[]) {
    // Verify page exists
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) throw new AppError('Page not found', 404);

    console.log('📦 Saving page components:', {
      pageId,
      componentCount: components?.length || 0,
      components: JSON.stringify(components, null, 2)
    });

    return await prisma.$transaction(async (tx) => {
        // Delete existing components for this page
        await tx.pageComponent.deleteMany({ where: { pageId } });

        // Insert new components with correct sort_order
        if (components && components.length > 0) {
            const componentsToCreate = components.map((c, index) => ({
                pageId,
                type: c.type,
                // component_data: store all props including nested children as JSON
                data: c.data || c.props || {},
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
             include: { 
               components: { orderBy: { order: 'asc' } },
               createdBy: { select: { id: true, firstName: true, lastName: true } }
             }
        });

        console.log('✅ Components saved successfully:', result?.components?.length || 0);
        
        return result;
    });
  }
}
