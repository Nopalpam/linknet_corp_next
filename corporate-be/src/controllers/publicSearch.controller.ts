import { NextFunction, Request, Response } from 'express';
import { PublicSearchService } from '../services/publicSearch.service';
import { AppError } from '../types/error.types';

export class PublicSearchController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      if (query.length < 2) {
        throw new AppError('Search query must contain at least 2 characters', 400);
      }

      const locale = req.query.locale === 'id' ? 'id' : 'en';
      const parsedLimit = typeof req.query.limit === 'string'
        ? Number.parseInt(req.query.limit, 10)
        : 10;
      const limit = Number.isFinite(parsedLimit) ? parsedLimit : 10;
      const results = await PublicSearchService.search(query, locale, limit);

      res.json({
        success: true,
        data: results,
        meta: { query, count: results.length },
      });
    } catch (error) {
      next(error);
    }
  }
}
