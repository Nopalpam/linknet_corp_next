import { Request, Response, NextFunction } from 'express';
import { ComponentVisibilityService } from '../services/componentVisibility.service';
import { AppError } from '../types/error.types';

export class ComponentVisibilityController {
  /**
   * GET /api/cms/component-visibility
   * List all entries with pagination/filter
   */
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ComponentVisibilityService.getAll({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
        search: req.query.search as string,
        status: req.query.status as 'ACTIVE' | 'INACTIVE' | undefined,
        businessUnit: req.query.businessUnit as string,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cms/component-visibility/active-keys
   * Returns array of component keys that are INACTIVE (for client-side filtering)
   * Lightweight endpoint used by Page Builder
   */
  static async getInactiveKeys(_req: Request, res: Response, next: NextFunction) {
    try {
      const inactiveKeys = await ComponentVisibilityService.getActiveComponentKeys();
      res.json({ success: true, data: Array.from(inactiveKeys) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cms/component-visibility/:id
   */
  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await ComponentVisibilityService.getById(req.params.id as string);
      res.json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/component-visibility
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { componentKey, componentName, status, businessUnit } = req.body;
      if (!componentKey) throw new AppError('componentKey is required', 400);
      if (!componentName) throw new AppError('componentName is required', 400);

      const entry = await ComponentVisibilityService.create({
        componentKey,
        componentName,
        status,
        businessUnit,
      });
      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cms/component-visibility/:id
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { componentName, status, businessUnit } = req.body;
      const entry = await ComponentVisibilityService.update(req.params.id as string, {
        componentName,
        status,
        businessUnit,
      });
      res.json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cms/component-visibility/:id/toggle
   */
  static async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await ComponentVisibilityService.toggleStatus(req.params.id as string);
      res.json({ success: true, data: entry });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cms/component-visibility/:id
   * ❌ Intentionally disabled — component visibility entries must never be deleted.
   * Use PATCH /:id/toggle or PUT /:id to change status/name instead.
   */
  static async delete(_req: Request, res: Response) {
    res.status(405).json({
      success: false,
      message:
        'Deleting component visibility entries is not allowed. ' +
        'Use toggle or update to change the status or display name.',
    });
  }

  /**
   * POST /api/cms/component-visibility/bulk-toggle
   */
  static async bulkToggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids, status } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError('ids array is required', 400);
      }
      if (!['ACTIVE', 'INACTIVE'].includes(status)) {
        throw new AppError('status must be ACTIVE or INACTIVE', 400);
      }
      const result = await ComponentVisibilityService.bulkToggle(ids, status);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/component-visibility/sync
   * Sync all registry components into the table (upsert new ones)
   */
  static async syncFromRegistry(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ComponentVisibilityService.syncFromRegistry();
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
