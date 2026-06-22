import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import newsCategoryService, {
  CategoryQueryParams,
  CreateCategoryData,
  UpdateCategoryData,
} from '../services/news-category.service';
import { AppError } from '../types/error.types';

export class NewsCategoryController {
  // ================== CMS ENDPOINTS ==================

  // Get all categories with pagination (CMS)
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, is_active, sortBy, sortOrder } = req.query;

      const params: CategoryQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        is_active: is_active !== undefined ? is_active === 'true' : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await newsCategoryService.getCategories(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all active categories (for dropdowns)
  async getActiveCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await newsCategoryService.getActiveCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single category by ID (CMS)
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Category ID', 400);
      }

      const category = await newsCategoryService.getCategoryById(id);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create category (CMS)
  async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name_en, name_id, slug, description, position, is_active } = req.body;

      if (!name_en || name_en.trim() === '') {
        throw new AppError('Category name is required', 400);
      }

      const data: CreateCategoryData = {
        name_en: name_en.trim(),
        name_id: name_id?.trim(),
        slug: slug?.trim(),
        description: description?.trim(),
        position: position !== undefined ? parseInt(position, 10) : undefined,
        is_active: is_active !== undefined ? Boolean(is_active) : undefined,
      };

      const userId = req.user?.id || 'system';
      const category = await newsCategoryService.createCategory(data, userId);

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update category (CMS)
  async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Category ID', 400);
      }

      const { name_en, name_id, slug, description, position, is_active } = req.body;

      if (name_en !== undefined && name_en.trim() === '') {
        throw new AppError('Category name cannot be empty', 400);
      }

      const data: UpdateCategoryData = {
        ...(name_en !== undefined && { name_en: name_en.trim() }),
        ...(name_id !== undefined && { name_id: name_id?.trim() }),
        ...(slug !== undefined && { slug: slug?.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(position !== undefined && { position: parseInt(position, 10) }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      };

      const userId = req.user?.id || 'system';
      const category = await newsCategoryService.updateCategory(id, data, userId);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle status (CMS)
  async toggleStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Category ID', 400);
      }

      const userId = req.user?.id || 'system';
      const category = await newsCategoryService.toggleStatus(id, userId);

      res.json({
        success: true,
        message: 'Category status toggled successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete category (CMS)
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new AppError('Invalid Category ID', 400);
      }

      await newsCategoryService.deleteCategory(id);

      res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk delete categories (CMS)
  async bulkDeleteCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await newsCategoryService.bulkDeleteCategories(ids);

      res.json({
        success: true,
        message: 'Categories deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Reorder categories (CMS)
  async updateCategoryOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates array is required', 400);
      }

      await newsCategoryService.updateCategoryOrder(updates);

      res.json({
        success: true,
        message: 'Category order updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ================== PUBLIC ENDPOINTS ==================

  // Get category by slug (Public)
  async getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      if (!slug) {
        throw new AppError('Slug is required', 400);
      }

      const category = await newsCategoryService.getCategoryBySlug(slug);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewsCategoryController();
