import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import newsService, { NewsQueryParams, CreateNewsData, UpdateNewsData } from '../services/news.service';
import { AppError } from '../types/error.types';

export class NewsController {
  // ================== CMS ENDPOINTS ==================

  // Get all news with pagination (CMS)
  async getNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, dataStatus, idCategory, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        dataStatus: dataStatus !== undefined ? parseInt(dataStatus as string, 10) : undefined,
        idCategory: idCategory ? parseInt(idCategory as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsService.getNews(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single news by ID (CMS)
  async getNewsById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        throw new AppError('Invalid News ID', 400);
      }

      const news = await newsService.getNewsById(id);

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create news (CMS)
  async createNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        titleEn,
        titleId,
        newsDate,
        newsThumbnail,
        excerptEn,
        excerptId,
        contentEn,
        contentId,
        newsLink,
        idCategory,
        metaKeyword,
        customCss,
        customJs,
        dataStatus,
      } = req.body;

      if (!titleEn || titleEn.trim() === '') {
        throw new AppError('Title (English) is required', 400);
      }
      if (!contentEn || contentEn.trim() === '') {
        throw new AppError('Content (English) is required', 400);
      }
      if (!newsDate) {
        throw new AppError('News date is required', 400);
      }

      const data: CreateNewsData = {
        titleEn: titleEn.trim(),
        titleId: titleId?.trim(),
        newsDate,
        newsThumbnail,
        excerptEn: excerptEn?.trim(),
        excerptId: excerptId?.trim(),
        contentEn: contentEn.trim(),
        contentId: contentId?.trim(),
        newsLink: newsLink?.trim(),
        idCategory: idCategory ? parseInt(idCategory, 10) : undefined,
        metaKeyword: metaKeyword?.trim(),
        customCss: customCss?.trim(),
        customJs: customJs?.trim(),
        dataStatus: dataStatus !== undefined ? parseInt(dataStatus, 10) : undefined,
      };

      const userEmail = req.user?.email || 'system@admin.com';
      const news = await newsService.createNews(data, userEmail);

      res.status(201).json({
        success: true,
        message: 'News created successfully',
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update news (CMS)
  async updateNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        throw new AppError('Invalid News ID', 400);
      }

      const {
        titleEn,
        titleId,
        newsDate,
        newsThumbnail,
        excerptEn,
        excerptId,
        contentEn,
        contentId,
        newsLink,
        idCategory,
        metaKeyword,
        customCss,
        customJs,
        dataStatus,
      } = req.body;

      if (titleEn !== undefined && titleEn.trim() === '') {
        throw new AppError('Title (English) cannot be empty', 400);
      }
      if (contentEn !== undefined && contentEn.trim() === '') {
        throw new AppError('Content (English) cannot be empty', 400);
      }

      const data: UpdateNewsData = {
        ...(titleEn !== undefined && { titleEn: titleEn.trim() }),
        ...(titleId !== undefined && { titleId: titleId?.trim() }),
        ...(newsDate !== undefined && { newsDate }),
        ...(newsThumbnail !== undefined && { newsThumbnail }),
        ...(excerptEn !== undefined && { excerptEn: excerptEn?.trim() }),
        ...(excerptId !== undefined && { excerptId: excerptId?.trim() }),
        ...(contentEn !== undefined && { contentEn: contentEn.trim() }),
        ...(contentId !== undefined && { contentId: contentId?.trim() }),
        ...(newsLink !== undefined && { newsLink: newsLink?.trim() }),
        ...(idCategory !== undefined && { idCategory: idCategory ? parseInt(idCategory, 10) : null }),
        ...(metaKeyword !== undefined && { metaKeyword: metaKeyword?.trim() }),
        ...(customCss !== undefined && { customCss: customCss?.trim() }),
        ...(customJs !== undefined && { customJs: customJs?.trim() }),
        ...(dataStatus !== undefined && { dataStatus: parseInt(dataStatus, 10) }),
      };

      const userEmail = req.user?.email || 'system@admin.com';
      const news = await newsService.updateNews(id, data, userEmail);

      res.json({
        success: true,
        message: 'News updated successfully',
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete news (CMS)
  async deleteNews(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        throw new AppError('Invalid News ID', 400);
      }

      await newsService.deleteNews(id);

      res.json({
        success: true,
        message: 'News deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== PUBLIC ENDPOINTS ==================

  // Get active news (Public)
  async getActiveNews(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, idCategory, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        idCategory: idCategory ? parseInt(idCategory as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsService.getActiveNews(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get news by category slug (Public)
  async getNewsByCategorySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { categorySlug } = req.params;
      const { page, limit } = req.query;

      if (!categorySlug) {
        throw new AppError('Category slug is required', 400);
      }

      const result = await newsService.getNewsByCategorySlug(
        categorySlug,
        page ? parseInt(page as string, 10) : 1,
        limit ? parseInt(limit as string, 10) : 12
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get highlighted news (Public)
  async getHighlightedNews(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit } = req.query;
      const news = await newsService.getHighlightedNews(
        limit ? parseInt(limit as string, 10) : 5
      );

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get news by slug (Public)
  async getNewsBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw new AppError('Slug is required', 400);
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const news = await newsService.getNewsBySlug(slug, true, ipAddress, userAgent);

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== HIGHLIGHT MANAGEMENT ==================

  // Get all highlights (CMS)
  async getHighlights(_req: Request, res: Response, next: NextFunction) {
    try {
      const highlights = await newsService.getHighlights();

      res.json({
        success: true,
        data: highlights,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get available news for highlight (CMS)
  async getAvailableForHighlight(_req: Request, res: Response, next: NextFunction) {
    try {
      const news = await newsService.getAvailableForHighlight();

      res.json({
        success: true,
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create highlight (CMS)
  async createHighlight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { idNews } = req.body;

      if (!idNews) {
        throw new AppError('News ID is required', 400);
      }

      const userEmail = req.user?.email || 'system@admin.com';
      const highlight = await newsService.createHighlight(parseInt(idNews, 10), userEmail);

      res.status(201).json({
        success: true,
        message: 'Highlight created successfully',
        data: highlight,
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove highlight (CMS)
  async removeHighlight(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id)) {
        throw new AppError('Invalid Highlight ID', 400);
      }

      await newsService.removeHighlight(id);

      res.json({
        success: true,
        message: 'Highlight removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk remove highlights (CMS)
  async bulkRemoveHighlights(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      await newsService.bulkRemoveHighlights(ids.map((id: any) => parseInt(id, 10)));

      res.json({
        success: true,
        message: 'Highlights removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Reorder highlights (CMS)
  async reorderHighlights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates array is required', 400);
      }

      const userEmail = req.user?.email || 'system@admin.com';
      await newsService.reorderHighlights(updates, userEmail);

      res.json({
        success: true,
        message: 'Highlights reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== NEWS VIEW (Public) ==================

  // Track view (Public, no auth)
  async trackNewsView(req: Request, res: Response, next: NextFunction) {
    try {
      const newsId = parseInt(String(req.params.newsId), 10);
      if (isNaN(newsId)) {
        throw new AppError('Invalid News ID', 400);
      }

      const ipAddress = req.ip || req.socket.remoteAddress || '';
      const userAgent = req.headers['user-agent'] || '';

      await newsService.trackView(newsId, ipAddress, userAgent);

      res.json({
        success: true,
        message: 'View tracked',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsController();
