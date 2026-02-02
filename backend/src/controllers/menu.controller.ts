import { Request, Response, NextFunction } from 'express';
import menuService from '../services/menu.service';
import { AppError } from '../types/error.types';
import { MenuType, MenuPosition } from '@prisma/client';

// Helper function to convert BigInt to Number recursively
function convertBigIntToNumber(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertBigIntToNumber(item));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        converted[key] = convertBigIntToNumber(obj[key]);
      }
    }
    return converted;
  }
  
  return obj;
}

export class MenuController {
  // Get all menus (tree structure) - for CMS
  async getMenus(req: Request, res: Response, next: NextFunction) {
    try {
      const { position } = req.query;
      
      const menus = await menuService.getMenuTree(
        position ? (position as MenuPosition) : undefined
      );
      
      res.json({
        success: true,
        data: convertBigIntToNumber(menus),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get flat list of all menus - for CMS table view
  async getAllMenusFlat(req: Request, res: Response, next: NextFunction) {
    try {
      const { position } = req.query;
      
      const menus = await menuService.getAllMenus(
        position ? (position as MenuPosition) : undefined
      );
      
      res.json({
        success: true,
        data: convertBigIntToNumber(menus),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get active menus for public (frontend)
  async getPublicMenus(req: Request, res: Response, next: NextFunction) {
    try {
      const { position } = req.query;
      
      const menus = await menuService.getActiveMenuTree(
        position ? (position as MenuPosition) : undefined
      );
      
      res.json({
        success: true,
        data: convertBigIntToNumber(menus),
      });
    } catch (error) {
      next(error);
    }
  }

  // Get menus by position (header/footer)
  async getMenusByPosition(req: Request, res: Response, next: NextFunction) {
    try {
      const { position } = req.params;
      const { activeOnly } = req.query;

      if (!position || !['header', 'footer', 'both'].includes(position.toLowerCase())) {
        throw new AppError('Valid position is required (header/footer/both)', 400);
      }

      const menuPosition = position.toUpperCase() as MenuPosition;
      const menus = await menuService.getMenusByPosition(
        menuPosition, 
        activeOnly === 'true'
      );
      
      res.json({
        success: true,
        data: convertBigIntToNumber(menus),
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
      
      const menuId = BigInt(id);
      const menu = await menuService.getMenuById(menuId);
      
      res.json({
        success: true,
        data: convertBigIntToNumber(menu),
      });
    } catch (error) {
      next(error);
    }
  }

  // Create menu
  async createMenu(req: Request, res: Response, next: NextFunction) {
    try {
      const userEmail = (req as any).user?.email;
      
      const { 
        parentId,
        sectionTitle,
        sectionOrder,
        title, 
        translations,
        slug, 
        url, 
        icon,
        image,
        description,
        badge,
        position,
        type, 
        order, 
        isActive,
        openNewTab,
        cssClass
      } = req.body;

      // Validation
      if (!title) {
        throw new AppError('Title is required', 400);
      }

      if (!position || !Object.values(MenuPosition).includes(position)) {
        throw new AppError('Valid position is required (HEADER/FOOTER/BOTH)', 400);
      }

      if (!type || !Object.values(MenuType).includes(type)) {
        throw new AppError('Valid type is required (LINK/DROPDOWN/MEGA)', 400);
      }

      const menu = await menuService.createMenu({
        parentId: parentId ? BigInt(parentId) : undefined,
        sectionTitle,
        sectionOrder,
        title,
        translations,
        slug,
        url,
        icon,
        image,
        description,
        badge,
        position,
        type,
        order,
        isActive,
        openNewTab,
        cssClass,
      }, userEmail);

      res.status(201).json({
        success: true,
        message: 'Menu created successfully',
        data: convertBigIntToNumber(menu),
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
      
      const userEmail = (req as any).user?.email;
      const menuId = BigInt(id);
      
      const { 
        parentId,
        sectionTitle,
        sectionOrder,
        title, 
        translations,
        slug, 
        url, 
        icon,
        image,
        description,
        badge,
        position,
        type, 
        order, 
        isActive,
        openNewTab,
        cssClass
      } = req.body;

      const menu = await menuService.updateMenu(menuId, {
        parentId: parentId !== undefined ? (parentId ? BigInt(parentId) : null) : undefined,
        sectionTitle,
        sectionOrder,
        title,
        translations,
        slug,
        url,
        icon,
        image,
        description,
        badge,
        position,
        type,
        order,
        isActive,
        openNewTab,
        cssClass,
      }, userEmail);

      res.json({
        success: true,
        message: 'Menu updated successfully',
        data: convertBigIntToNumber(menu),
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
      
      const menuId = BigInt(id);
      const result = await menuService.deleteMenu(menuId);
      
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

      const menuIds = ids.map(id => BigInt(id));
      const result = await menuService.deleteMultipleMenus(menuIds);
      
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

      const menuId = BigInt(id);
      const menu = await menuService.toggleMenuStatus(menuId);
      
      res.json({
        success: true,
        message: 'Menu status updated successfully',
        data: convertBigIntToNumber(menu),
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

      // Convert IDs to BigInt
      const bigIntUpdates = updates.map(update => ({
        id: BigInt(update.id),
        order: update.order,
        parentId: update.parentId ? BigInt(update.parentId) : null,
      }));

      const result = await menuService.updateMenuOrder(bigIntUpdates);
      
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
