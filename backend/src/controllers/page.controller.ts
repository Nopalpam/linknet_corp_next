import { Request, Response, NextFunction } from 'express';
import { PageService } from '@services/page.service';
import { AppError } from '@/middleware/error.middleware';
import { PageStatus, PageTemplate } from '@prisma/client';

export class PageController {
  /**
   * GET /api/cms/pages
   * Get pages dengan pagination, filter, dan search
   */
  static async getPages(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page,
        limit,
        search,
        status,
        template,
        createdBy,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await PageService.getPages({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        search: search as string,
        status: status as PageStatus,
        template: template as PageTemplate,
        createdBy: createdBy as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cms/pages/:id
   * Get page detail by ID
   */
  static async getPageById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = await PageService.getPageById(id);

      res.json({
        success: true,
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/pages
   * Create new page
   */
  static async createPage(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const {
        title,
        slug,
        template,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogImage,
        status,
      } = req.body;

      // Validation
      if (!title || title.trim().length === 0) {
        throw new AppError('Title is required', 400);
      }

      const page = await PageService.createPage({
        title: title.trim(),
        slug: slug?.trim(),
        template,
        metaTitle: metaTitle?.trim(),
        metaDescription: metaDescription?.trim(),
        metaKeywords: metaKeywords?.trim(),
        ogImage: ogImage?.trim(),
        status,
        createdById: userId,
      });

      res.status(201).json({
        success: true,
        message: 'Page created successfully',
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cms/pages/:id
   * Update page
   */
  static async updatePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        title,
        slug,
        template,
        metaTitle,
        metaDescription,
        metaKeywords,
        ogImage,
        status,
      } = req.body;

      const page = await PageService.updatePage(id, {
        title: title?.trim(),
        slug: slug?.trim(),
        template,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        metaKeywords: metaKeywords?.trim() || null,
        ogImage: ogImage?.trim() || null,
        status,
      });

      res.json({
        success: true,
        message: 'Page updated successfully',
        data: page,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cms/pages/:id
   * Delete page (soft delete)
   */
  static async deletePage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await PageService.deletePage(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cms/pages/check-slug/:slug
   * Check slug availability
   */
  static async checkSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const { excludeId } = req.query;

      const result = await PageService.checkSlugAvailability(
        slug,
        excludeId as string
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}
