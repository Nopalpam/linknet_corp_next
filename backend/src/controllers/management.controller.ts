import { Request, Response, NextFunction } from 'express';
import managementService from '../services/management.service';
import { AppError } from '../types/error.types';
import { ManagementQueryParams, ManagementCategoryQueryParams } from '../types/management.types';

/**
 * Management Controller
 * Handles HTTP requests for Management & ManagementCategory CRUD operations
 * Compatible with MySQL legacy structure
 */
export class ManagementController {
  // ============================================
  // MANAGEMENT (DATA) METHODS
  // ============================================

  /**
   * Get all managements with pagination (CMS)
   * GET /cms/managements
   */
  async getManagements(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ManagementQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        dataStatus:
          req.query.dataStatus !== undefined
            ? parseInt(req.query.dataStatus as string)
            : undefined,
        sortBy: (req.query.sortBy as string) || 'dataOrder',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
      };

      const result = await managementService.getManagements(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active managements (Public)
   * GET /public/managements
   */
  async getActiveManagements(req: Request, res: Response, next: NextFunction) {
    try {
      const categoryId = req.query.categoryId as string;
      const managements = await managementService.getActiveManagements(categoryId);

      res.json({
        success: true,
        data: managements,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get managements grouped by category (Public)
   * GET /public/managements/by-category
   */
  async getManagementsByCategory(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await managementService.getManagementsByCategory();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single management by ID
   * GET /cms/managements/:id
   */
  async getManagementById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Management ID is required', 400);
      }

      const management = await managementService.getManagementById(id);

      res.json({
        success: true,
        data: management,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new management
   * POST /cms/managements
   */
  async createManagement(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        positionEn,
        positionId,
        category,
        categoryId,
        photo,
        bioEn,
        bioId,
        dataOrder,
        dataStatus,
      } = req.body;

      // Validation
      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      // Get username from auth
      const createdBy = (req as any).user?.username || null;

      const management = await managementService.createManagement({
        name: name.trim(),
        positionEn: positionEn?.trim(),
        positionId: positionId?.trim(),
        category: category?.trim(),
        categoryId,
        photo,
        bioEn: bioEn?.trim(),
        bioId: bioId?.trim(),
        dataOrder,
        dataStatus,
        createdBy,
      });

      res.status(201).json({
        success: true,
        data: management,
        message: 'Management created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update management
   * PUT /cms/managements/:id
   */
  async updateManagement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        name,
        positionEn,
        positionId,
        category,
        categoryId,
        photo,
        bioEn,
        bioId,
        dataOrder,
        dataStatus,
      } = req.body;

      if (!id) {
        throw new AppError('Management ID is required', 400);
      }

      const updatedBy = (req as any).user?.username || null;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (positionEn !== undefined) updateData.positionEn = positionEn?.trim();
      if (positionId !== undefined) updateData.positionId = positionId?.trim();
      if (category !== undefined) updateData.category = category?.trim();
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (photo !== undefined) updateData.photo = photo;
      if (bioEn !== undefined) updateData.bioEn = bioEn?.trim();
      if (bioId !== undefined) updateData.bioId = bioId?.trim();
      if (dataOrder !== undefined) updateData.dataOrder = dataOrder;
      if (dataStatus !== undefined) updateData.dataStatus = dataStatus;
      updateData.updatedBy = updatedBy;

      const management = await managementService.updateManagement(id, updateData);

      res.json({
        success: true,
        data: management,
        message: 'Management updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete management
   * DELETE /cms/managements/:id
   */
  async deleteManagement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Management ID is required', 400);
      }

      const result = await managementService.deleteManagement(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk delete managements
   * POST /cms/managements/bulk-delete
   */
  async bulkDeleteManagements(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('IDs array is required', 400);
      }

      const result = await managementService.bulkDeleteManagements(ids);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update managements data_order (drag & drop)
   * POST /cms/managements/update-order
   */
  async updateManagementsOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await managementService.updateManagementsOrder(updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // MANAGEMENT CATEGORY METHODS
  // ============================================

  /**
   * Get all categories
   * GET /cms/managements/categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const params: ManagementCategoryQueryParams = {
        search: req.query.search as string,
        status:
          req.query.status !== undefined
            ? parseInt(req.query.status as string)
            : undefined,
      };

      const categories = await managementService.getCategories(params);

      // If result has pagination, it's paginated response
      if (Array.isArray(categories)) {
        res.json({
          success: true,
          data: categories,
        });
      } else {
        res.json({
          success: true,
          ...categories,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single category by ID
   * GET /cms/managements/categories/:id
   */
  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Category ID is required', 400);
      }

      const category = await managementService.getCategoryById(id);

      res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new category
   * POST /cms/managements/categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, order, status } = req.body;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      const createdBy = (req as any).user?.username || null;

      const category = await managementService.createCategory({
        name: name.trim(),
        description: description?.trim(),
        order,
        status,
        createdBy,
      });

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update category
   * PUT /cms/managements/categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, order, status } = req.body;

      if (!id) {
        throw new AppError('Category ID is required', 400);
      }

      const updatedBy = (req as any).user?.username || null;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description?.trim();
      if (order !== undefined) updateData.order = order;
      if (status !== undefined) updateData.status = status;
      updateData.updatedBy = updatedBy;

      const category = await managementService.updateCategory(id, updateData);

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete category
   * DELETE /cms/managements/categories/:id
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError('Category ID is required', 400);
      }

      const result = await managementService.deleteCategory(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update categories order (drag & drop)
   * POST /cms/managements/categories/update-order
   */
  async updateCategoriesOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates)) {
        throw new AppError('Updates array is required', 400);
      }

      const result = await managementService.updateCategoriesOrder(updates);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ManagementController();
