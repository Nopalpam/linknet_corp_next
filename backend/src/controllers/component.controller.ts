import { Request, Response, NextFunction } from 'express';
import { ComponentService } from '@services/component.service';
import { AppError } from '@/middleware/error.middleware';

export class ComponentController {
  /**
   * GET /api/cms/pages/:pageId/components
   * Get all components for a page
   */
  static async getPageComponents(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageId } = req.params;
      const { includeHidden } = req.query;

      const components = await ComponentService.getPageComponents({
        pageId,
        includeHidden: includeHidden === 'true',
      });

      res.json({
        success: true,
        data: components,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cms/pages/components/:id
   * Get single component by ID
   */
  static async getComponentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const component = await ComponentService.getComponentById(id);

      res.json({
        success: true,
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/pages/:pageId/components
   * Create new component
   */
  static async createComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageId } = req.params;
      const { componentType, componentData, order, isVisible } = req.body;

      if (!componentType) {
        throw new AppError('Component type is required', 400);
      }

      if (!componentData) {
        throw new AppError('Component data is required', 400);
      }

      const component = await ComponentService.createComponent({
        pageId,
        componentType,
        componentData,
        order,
        isVisible,
      });

      res.status(201).json({
        success: true,
        message: 'Component created successfully',
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cms/pages/components/:id
   * Update component
   */
  static async updateComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { componentType, componentData, order, isVisible } = req.body;

      const component = await ComponentService.updateComponent(id, {
        componentType,
        componentData,
        order,
        isVisible,
      });

      res.json({
        success: true,
        message: 'Component updated successfully',
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cms/pages/components/:id
   * Delete component
   */
  static async deleteComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await ComponentService.deleteComponent(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/pages/:pageId/components/reorder
   * Reorder components
   */
  static async reorderComponents(req: Request, res: Response, next: NextFunction) {
    try {
      const { pageId } = req.params;
      const { components } = req.body;

      if (!Array.isArray(components)) {
        throw new AppError('Components must be an array', 400);
      }

      const result = await ComponentService.reorderComponents(pageId, { components });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/pages/components/:id/toggle-visibility
   * Toggle component visibility
   */
  static async toggleVisibility(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const component = await ComponentService.toggleVisibility(id);

      res.json({
        success: true,
        message: 'Component visibility toggled successfully',
        data: component,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cms/pages/components/:id/preview
   * Generate component preview HTML
   */
  static async previewComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const component = await ComponentService.getComponentById(id);
      
      const html = ComponentService.generatePreview(component.type, component.data);

      res.json({
        success: true,
        data: {
          html,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cms/pages/component-types
   * Get available component types with schemas
   */
  static async getComponentTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const types = ComponentService.getComponentTypes();

      res.json({
        success: true,
        data: types,
      });
    } catch (error) {
      next(error);
    }
  }
}
