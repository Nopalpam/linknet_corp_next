import { Request, Response } from 'express';
import { PageService } from './page.service';
import prisma from '../../../config/database';
import {
  createPageSchema,
  updatePageSchema,
  pageQuerySchema,
  CreatePageInput,
} from './page.validation';
import { asyncHandler } from '../../../middleware/errorHandler.middleware';
import { requirePermission } from '../../../middleware/rbac.middleware';
import { AuthRequest } from '../../../middleware/auth.middleware';
import { ZodError } from 'zod';
import { ValidationError } from '../../../types/error.types';

const pageService = new PageService(prisma);

/**
 * GET /api/cms/pages
 * Get pages list with pagination and filters
 */
export const getPages = [
  requirePermission('pages_read'),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const query = pageQuerySchema.parse(req.query);
      const result = await pageService.getPages(query, (req as AuthRequest).user?.id);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid query parameters');
      }
      throw error;
    }
  }),
];

/**
 * GET /api/cms/pages/:id
 * Get page by ID
 */
export const getPageById = [
  requirePermission('pages_read'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = await pageService.getPageById(id!);

    res.json({
      success: true,
      data: page,
    });
  }),
];

/**
 * POST /api/cms/pages
 * Create new page
 */
export const createPage = [
  requirePermission('pages_create'),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const data: CreatePageInput = createPageSchema.parse(req.body);
      const page = await pageService.createPage(data, (req as AuthRequest).user!.id);

      res.status(201).json({
        success: true,
        message: 'Page created successfully',
        data: page,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid page data');
      }
      throw error;
    }
  }),
];

/**
 * PUT /api/cms/pages/:id
 * Update page
 */
export const updatePage = [
  requirePermission('pages_update'),
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = updatePageSchema.parse(req.body);
      const page = await pageService.updatePage(id!, data as any);

      res.json({
        success: true,
        message: 'Page updated successfully',
        data: page,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Invalid page data');
      }
      throw error;
    }
  }),
];

/**
 * DELETE /api/cms/pages/:id
 * Delete page (soft delete)
 */
export const deletePage = [
  requirePermission('pages_delete'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await pageService.deletePage(id!);

    res.json({
      success: true,
      message: 'Page deleted successfully',
    });
  }),
];
