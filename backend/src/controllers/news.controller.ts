import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import newsService, { NewsQueryParams, CreateNewsData, UpdateNewsData } from '../services/news.service';
import { AppError } from '../types/error.types';
import { ContentStatus } from '@prisma/client';

export class NewsController {
  // ================== CMS ENDPOINTS ==================

  // Get all news with pagination (CMS)
  async getNews(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, status, categoryId, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        status: status as ContentStatus,
        categoryId: categoryId as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsService.getNews(params, req.user?.id);

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
        throw new AppError('News ID is required', 400);
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
        thumbnail,
        excerptEn,
        excerptId,
        contentEn,
        contentId,
        newsLink,
        categoryId,
        metaKeywords,
        customCss,
        customJs,
        status,
      } = req.body;

      // Validation
      if (!titleEn || titleEn.trim() === '') {
        throw new AppError('Title (English) is required', 400);
      }
      if (!contentEn || contentEn.trim() === '') {
        throw new AppError('Content (English) is required', 400);
      }
      if (!categoryId) {
        throw new AppError('Category is required', 400);
      }
      if (!newsDate) {
        throw new AppError('News date is required', 400);
      }

      const data: CreateNewsData = {
        titleEn: titleEn.trim(),
        titleId: titleId?.trim(),
        newsDate,
        thumbnail,
        excerptEn: excerptEn?.trim(),
        excerptId: excerptId?.trim(),
        contentEn: contentEn.trim(),
        contentId: contentId?.trim(),
        newsLink: newsLink?.trim(),
        categoryId,
        metaKeywords: metaKeywords?.trim(),
        customCss: customCss?.trim(),
        customJs: customJs?.trim(),
        status,
      };

      const news = await newsService.createNews(data, req.user!.id);

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
      const {
        titleEn,
        titleId,
        newsDate,
        thumbnail,
        excerptEn,
        excerptId,
        contentEn,
        contentId,
        newsLink,
        categoryId,
        metaKeywords,
        customCss,
        customJs,
        status,
      } = req.body;

      if (!id) {
        throw new AppError('News ID is required', 400);
      }

      // Validation
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
        ...(thumbnail !== undefined && { thumbnail }),
        ...(excerptEn !== undefined && { excerptEn: excerptEn?.trim() }),
        ...(excerptId !== undefined && { excerptId: excerptId?.trim() }),
        ...(contentEn !== undefined && { contentEn: contentEn.trim() }),
        ...(contentId !== undefined && { contentId: contentId?.trim() }),
        ...(newsLink !== undefined && { newsLink: newsLink?.trim() }),
        ...(categoryId !== undefined && { categoryId }),
        ...(metaKeywords !== undefined && { metaKeywords: metaKeywords?.trim() }),
        ...(customCss !== undefined && { customCss: customCss?.trim() }),
        ...(customJs !== undefined && { customJs: customJs?.trim() }),
        ...(status !== undefined && { status }),
      };

      const news = await newsService.updateNews(id, data, req.user!.id);

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
        throw new AppError('News ID is required', 400);
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
      const { page, limit, categoryId, sortBy, sortOrder } = req.query;

      const params: NewsQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        categoryId: categoryId as string,
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

  // Set highlight (CMS)
  async setHighlight(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { newsId, position } = req.body;

      if (!newsId) {
        throw new AppError('News ID is required', 400);
      }
      if (position === undefined || position < 0) {
        throw new AppError('Valid position is required', 400);
      }

      const highlight = await newsService.setHighlight(newsId, position, req.user!.id);

      res.json({
        success: true,
        message: 'Highlight set successfully',
        data: highlight,
      });
    } catch (error) {
      next(error);
    }
  }

  // Remove highlight (CMS)
  async removeHighlight(req: Request, res: Response, next: NextFunction) {
    try {
      const { newsId } = req.params;

      if (!newsId) {
        throw new AppError('News ID is required', 400);
      }

      await newsService.removeHighlight(newsId);

      res.json({
        success: true,
        message: 'Highlight removed successfully',
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

      await newsService.reorderHighlights(updates, req.user!.id);

      res.json({
        success: true,
        message: 'Highlights reordered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsController();
