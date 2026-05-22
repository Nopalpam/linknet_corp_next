import { Request, Response, NextFunction } from 'express';
import { MapCoverageService } from '../services/mapCoverage.service';

export class MapCoverageController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MapCoverageService.getAll({
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        status: req.query.status as 'ACTIVE' | 'INACTIVE' | undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await MapCoverageService.getById(req.params.id as string);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const item = await MapCoverageService.create(req.body, userId);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const item = await MapCoverageService.update(req.params.id as string, req.body, userId);
      res.json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const result = await MapCoverageService.delete(req.params.id as string, userId);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
