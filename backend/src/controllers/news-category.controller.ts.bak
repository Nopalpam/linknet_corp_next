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
      const { page, limit, search, isActive, sortBy, sortOrder } = req.query;

      const params: CategoryQueryParams = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
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
        throw new AppError('Category ID is required', 400);
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
      const { nameEn, nameId, description, position, isActive } = req.body;

      // Validation
      if (!nameEn || nameEn.trim() === '') {
        throw new AppError('Name (English) is required', 400);
      }

      const data: CreateCategoryData = {
        nameEn: nameEn.trim(),
        nameId: nameId?.trim(),
        description: description?.trim(),
        position,
        isActive,
      };

      const category = await newsCategoryService.createCategory(data, req.user!.id);

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
      const { nameEn, nameId, description, position, isActive } = req.body;

      if (!id) {
        throw new AppError('Category ID is required', 400);
      }

      // Validation
      if (nameEn !== undefined && nameEn.trim() === '') {
        throw new AppError('Name (English) cannot be empty', 400);
      }

      const data: UpdateCategoryData = {
        ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
        ...(nameId !== undefined && { nameId: nameId?.trim() }),
        ...(description !== undefined && { description: description?.trim() }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
      };

      const category = await newsCategoryService.updateCategory(id, data, req.user!.id);

      res.json({
        success: true,
        message: 'Category updated successfully',
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
        throw new AppError('Category ID is required', 400);
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

  // Update category order (CMS)
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
