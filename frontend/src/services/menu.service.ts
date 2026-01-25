/**
 * Menu Management Service
 * Handles all API calls related to Menu CRUD operations
 */

import { BaseService } from './base.service';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  parentId?: string;
  children?: MenuItem[];
  isActive: boolean;
  openInNewTab?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemData {
  label: string;
  url: string;
  order?: number;
  parentId?: string;
  isActive?: boolean;
  openInNewTab?: boolean;
}

export interface UpdateMenuItemData extends CreateMenuItemData {
  id?: string;
}

class MenuService extends BaseService {
  /**
   * Get public menus (hierarchical structure)
   */
  async getPublicMenus(): Promise<{ data: MenuItem[] }> {
    return this.fetchWithAuth(this.getApiUrl('/menu'));
  }

  /**
   * Get all menus (CMS - flat list)
   */
  async getAllMenus(): Promise<{ data: MenuItem[] }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu'));
  }

  /**
   * Get single menu item by ID
   */
  async getMenuById(id: string): Promise<{ data: MenuItem }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/menu/${id}`));
  }

  /**
   * Create new menu item
   */
  async createMenuItem(data: CreateMenuItemData): Promise<{ data: MenuItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing menu item
   */
  async updateMenuItem(id: string, data: UpdateMenuItemData): Promise<{ data: MenuItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/menu/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/menu/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Update menu items order
   */
  async updateMenuOrder(updates: { id: string; order: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu/update-order'), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
}

export const menuService = new MenuService();
