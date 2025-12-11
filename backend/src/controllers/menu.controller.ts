import { Request, Response, NextFunction } from 'express';
import menuService from '../services/menu.service';
import { AppError } from '../types/error.types';
import { MenuLinkType } from '@prisma/client';

export class MenuController {
  // Get all menus (tree structure)
  async getMenus(_req: Request, res: Response, next: NextFunction) {
    try {
      const menus = await menuService.getMenuTree();
      
      res.json({
        success: true,
        data: menus,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get active menus for public (frontend)
  async getPublicMenus(_req: Request, res: Response, next: NextFunction) {
    try {
      const menus = await menuService.getActiveMenuTree();
      
      res.json({
        success: true,
        data: menus,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get single menu by ID
  async getMenuById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Menu ID is required', 400);
      const menu = await menuService.getMenuById(id);
      
      res.json({
        success: true,
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create menu
  async createMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, slug, url, type, pageId, target, icon, parentId, order, status } = req.body;

      // Validation
      if (!title) {
        throw new AppError('Title is required', 400);
      }

      if (!type || !Object.values(MenuLinkType).includes(type)) {
        throw new AppError('Valid type is required', 400);
      }

      const menu = await menuService.createMenu({
        title,
        slug,
        url,
        type,
        pageId,
        target,
        icon,
        parentId,
        order,
        status,
      });

      res.status(201).json({
        success: true,
        message: 'Menu created successfully',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update menu
  async updateMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Menu ID is required', 400);
      const { title, slug, url, type, pageId, target, icon, parentId, order, status } = req.body;

      const menu = await menuService.updateMenu(id, {
        title,
        slug,
        url,
        type,
        pageId,
        target,
        icon,
        parentId,
        order,
        status,
      });

      res.json({
        success: true,
        message: 'Menu updated successfully',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete menu
  async deleteMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new AppError('Menu ID is required', 400);
      const result = await menuService.deleteMenu(id);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Bulk delete menus
  async deleteMultipleMenus(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new AppError('Menu IDs are required', 400);
      }

      const result = await menuService.deleteMultipleMenus(ids);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Toggle menu status
  async toggleMenuStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.body;

      if (!id) {
        throw new AppError('Menu ID is required', 400);
      }

      const menu = await menuService.toggleMenuStatus(id);
      
      res.json({
        success: true,
        message: 'Menu status updated successfully',
        data: menu,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update menu order (drag-drop)
  async updateMenuOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { updates } = req.body;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        throw new AppError('Updates are required', 400);
      }

      // Validate each update
      for (const update of updates) {
        if (!update.id) {
          throw new AppError('Each update must have an id', 400);
        }
        if (update.order === undefined) {
          throw new AppError('Each update must have an order', 400);
        }
      }

      const result = await menuService.updateMenuOrder(updates);
      
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MenuController();
