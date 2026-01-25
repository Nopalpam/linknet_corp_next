import { Request, Response, NextFunction } from 'express';
import managementService from '../services/management.service';
import { AppError } from '../types/error.types';
import { ManagementQueryParams } from '../types/management.types';

/**
 * Management Controller
 * Handles HTTP requests for Management CRUD operations
 */
export class ManagementController {
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
        isActive:
          req.query.isActive !== undefined
            ? req.query.isActive === 'true'
            : undefined,
        sortBy: (req.query.sortBy as string) || 'order',
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
      const managements = await managementService.getActiveManagements(
        categoryId
      );

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
  async getManagementsByCategory(
    _req: Request,
    res: Response,
    next: NextFunction
  ) {
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
        categoryId,
        name,
        position,
        description,
        photo,
        email,
        phone,
        linkedin,
        order,
        isActive,
      } = req.body;

      // Validation
      if (!categoryId || categoryId.trim() === '') {
        throw new AppError('Category is required', 400);
      }
      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }
      if (!position || position.trim() === '') {
        throw new AppError('Position is required', 400);
      }

      const management = await managementService.createManagement({
        categoryId: categoryId.trim(),
        name: name.trim(),
        position: position.trim(),
        description: description?.trim(),
        photo,
        email: email?.trim(),
        phone: phone?.trim(),
        linkedin: linkedin?.trim(),
        order,
        isActive,
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
        categoryId,
        name,
        position,
        description,
        photo,
        email,
        phone,
        linkedin,
        order,
        isActive,
      } = req.body;

      if (!id) {
        throw new AppError('Management ID is required', 400);
      }

      // Trim string values if provided
      const updateData: any = {};
      if (categoryId !== undefined) updateData.categoryId = categoryId.trim();
      if (name !== undefined) updateData.name = name.trim();
      if (position !== undefined) updateData.position = position.trim();
      if (description !== undefined)
        updateData.description = description?.trim();
      if (photo !== undefined) updateData.photo = photo;
      if (email !== undefined) updateData.email = email?.trim();
      if (phone !== undefined) updateData.phone = phone?.trim();
      if (linkedin !== undefined) updateData.linkedin = linkedin?.trim();
      if (order !== undefined) updateData.order = order;
      if (isActive !== undefined) updateData.isActive = isActive;

      const management = await managementService.updateManagement(
        id,
        updateData
      );

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
   * Update managements order
   * POST /cms/managements/update-order
   */
  async updateManagementsOrder(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
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
   * GET /cms/management-categories
   */
  async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await managementService.getCategories();

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single category by ID
   * GET /cms/management-categories/:id
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
   * POST /cms/management-categories
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, position, isActive } = req.body;

      if (!name || name.trim() === '') {
        throw new AppError('Name is required', 400);
      }

      const category = await managementService.createCategory({
        name: name.trim(),
        description: description?.trim(),
        position,
        isActive,
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
   * PUT /cms/management-categories/:id
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, position, isActive } = req.body;

      if (!id) {
        throw new AppError('Category ID is required', 400);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined)
        updateData.description = description?.trim();
      if (position !== undefined) updateData.position = position;
      if (isActive !== undefined) updateData.isActive = isActive;

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
   * DELETE /cms/management-categories/:id
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
}

export default new ManagementController();
