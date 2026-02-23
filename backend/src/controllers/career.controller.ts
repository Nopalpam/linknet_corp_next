/**
 * Career Controller
 * Handles HTTP requests for career CMS module
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import careerService from '../services/career.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class CareerController {
  // ============================================
  // ADMIN Endpoints
  // ============================================

  /**
   * GET /api/v1/cms/careers
   * List careers with filter & pagination
   */
  async getAdminCareers(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const result = await careerService.getAdminCareers({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        status: req.query.status as string,
        type: req.query.type as string,
        location: req.query.location as string,
        division: req.query.division as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
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
   * GET /api/v1/cms/careers/stats
   * Get career statistics
   */
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await careerService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/cms/careers/:id
   * Get career detail by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const career = await careerService.getById(req.params.id!);

      res.json({
        success: true,
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cms/careers
   * Create new career position
   */
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const userEmail = req.user?.email || 'system';

      const career = await careerService.create(req.body, userEmail);

      res.status(201).json({
        success: true,
        message: 'Career position created successfully',
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/cms/careers/:id
   * Update career position
   */
  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const userEmail = req.user?.email || 'system';

      const career = await careerService.update(req.params.id!, req.body, userEmail);

      res.json({
        success: true,
        message: 'Career position updated successfully',
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/cms/careers/:id
   * Delete single career position
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const result = await careerService.delete(req.params.id!);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cms/careers/bulk-delete
   * Delete multiple career positions
   */
  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const { ids } = req.body;
      const result = await careerService.bulkDelete(ids);

      res.json({
        success: true,
        message: result.message,
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/cms/careers/:id/toggle-status
   * Toggle career status (active ↔ inactive)
   */
  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const userEmail = req.user?.email || 'system';
      const career = await careerService.toggleStatus(req.params.id!, userEmail);

      res.json({
        success: true,
        message: `Career position status changed to ${career.status}`,
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // PUBLIC Endpoints
  // ============================================

  /**
   * GET /api/v1/careers
   * List published careers (public)
   */
  async getPublicCareers(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const result = await careerService.getPublicCareers({
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        type: req.query.type as string,
        location: req.query.location as string,
        division: req.query.division as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
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
   * GET /api/v1/careers/:slug
   * Get career by slug (public - published only)
   */
  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ success: false, errors: errors.array() });
        return;
      }

      const career = await careerService.getBySlug(req.params.slug!);

      res.json({
        success: true,
        data: career,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/careers/filters
   * Get filter options for public career listing
   */
  async getFilterOptions(_req: Request, res: Response, next: NextFunction) {
    try {
      const filters = await careerService.getFilterOptions();

      res.json({
        success: true,
        data: filters,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CareerController();
