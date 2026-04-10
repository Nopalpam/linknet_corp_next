import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import newsService, { NewsQueryParams, CreateNewsData, UpdateNewsData } from '../services/news.service';
import { AppError } from '../types/error.types';

export class NewsController {
  // ================== CMS ENDPOINTS ==================

  // Get all news with pagination (CMS)
  async getNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, category_id, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        status: status as string | undefined,
        category_id: category_id as string | undefined,
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
      const { id } = req.params;
      if (!id) {
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
        title_en,
        title_id,
        news_date,
        news_thumbnail,
        excerpt_en,
        excerpt_id,
        content_en,
        content_id,
        news_link,
        category_id,
        meta_keywords,
        custom_css,
        custom_js,
        status,
      } = req.body;

      if (!title_en || title_en.trim() === '') {
        throw new AppError('Title (English) is required', 400);
      }
      if (!content_en || content_en.trim() === '') {
        throw new AppError('Content (English) is required', 400);
      }
      if (!news_date) {
        throw new AppError('News date is required', 400);
      }

      const data: CreateNewsData = {
        title_en: title_en.trim(),
        title_id: title_id?.trim(),
        news_date,
        news_thumbnail,
        excerpt_en: excerpt_en?.trim(),
        excerpt_id: excerpt_id?.trim(),
        content_en: content_en.trim(),
        content_id: content_id?.trim(),
        news_link: news_link?.trim(),
        category_id: category_id || undefined,
        meta_keywords: meta_keywords?.trim(),
        custom_css: custom_css?.trim(),
        custom_js: custom_js?.trim(),
        status: status || undefined,
      };

      const userId = req.user?.id || 'system';
      const news = await newsService.createNews(data, userId);

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
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid News ID', 400);
      }

      const {
        title_en,
        title_id,
        news_date,
        news_thumbnail,
        excerpt_en,
        excerpt_id,
        content_en,
        content_id,
        news_link,
        category_id,
        meta_keywords,
        custom_css,
        custom_js,
        status,
      } = req.body;

      if (title_en !== undefined && title_en.trim() === '') {
        throw new AppError('Title (English) cannot be empty', 400);
      }
      if (content_en !== undefined && content_en.trim() === '') {
        throw new AppError('Content (English) cannot be empty', 400);
      }

      const data: UpdateNewsData = {
        ...(title_en !== undefined && { title_en: title_en.trim() }),
        ...(title_id !== undefined && { title_id: title_id?.trim() }),
        ...(news_date !== undefined && { news_date }),
        ...(news_thumbnail !== undefined && { news_thumbnail }),
        ...(excerpt_en !== undefined && { excerpt_en: excerpt_en?.trim() }),
        ...(excerpt_id !== undefined && { excerpt_id: excerpt_id?.trim() }),
        ...(content_en !== undefined && { content_en: content_en.trim() }),
        ...(content_id !== undefined && { content_id: content_id?.trim() }),
        ...(news_link !== undefined && { news_link: news_link?.trim() }),
        ...(category_id !== undefined && { category_id: category_id || undefined }),
        ...(meta_keywords !== undefined && { meta_keywords: meta_keywords?.trim() }),
        ...(custom_css !== undefined && { custom_css: custom_css?.trim() }),
        ...(custom_js !== undefined && { custom_js: custom_js?.trim() }),
        ...(status !== undefined && { status }),
      };

      const userId = req.user?.id || 'system';
      const news = await newsService.updateNews(id, data, userId);

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
      const { id } = req.params;
      if (!id) {
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
      const { page, limit, category_id, search, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
        search: search as string | undefined,
        category_id: category_id as string | undefined,
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
      const { news_id } = req.body;

      if (!news_id) {
        throw new AppError('News ID is required', 400);
      }

      const userId = req.user?.id || 'system';
      const highlight = await newsService.createHighlight(news_id, userId);

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
      const { id } = req.params;
      if (!id) {
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

      await newsService.bulkRemoveHighlights(ids);

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

      const userId = req.user?.id || 'system';
      await newsService.reorderHighlights(updates, userId);

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
      const { newsId } = req.params;
      if (!newsId) {
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
