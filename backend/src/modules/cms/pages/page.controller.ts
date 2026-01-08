import { Request, Response, NextFunction } from 'express';
import { PageService } from './page.service';
import prisma from '../../../config/database';
import {
  createPageSchema,
  updatePageSchema,
  pageQuerySchema,
  CreatePageInput,
  UpdatePageInput,
  PageQueryInput,
} from './page.validation';
import { asyncHandler } from '../../../middleware/asyncHandler';
import { requirePermission } from '../../../middleware/rbac';
import { ZodError } from 'zod';
import { BadRequestError } from '../../../utils/errors';

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
      const result = await pageService.getPages(query, req.user?.id);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError('Invalid query parameters', error.errors);
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
    const page = await pageService.getPageById(id);

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
      const page = await pageService.createPage(data, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Page created successfully',
        data: page,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError('Invalid page data', error.errors);
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
      const data: UpdatePageInput = updatePageSchema.parse(req.body);
      const page = await pageService.updatePage(id, data);

      res.json({
        success: true,
        message: 'Page updated successfully',
        data: page,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError('Invalid page data', error.errors);
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
    await pageService.deletePage(id);

    res.json({
      success: true,
      message: 'Page deleted successfully',
    });
  }),
];
