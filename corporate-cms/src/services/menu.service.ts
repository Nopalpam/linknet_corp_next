/**
 * Menu Management Service
 * Handles all API calls related to Menu CRUD operations
 */

import { BaseService } from './base.service';

export type MenuPosition = 'HEADER' | 'FOOTER' | 'BOTH';
export type MenuType = 'LINK' | 'DROPDOWN' | 'MEGA';

export interface MenuItem {
  id: number;
  parentId: number | null;
  sectionTitle: string | null;
  sectionOrder: number;
  title: string;
  translations: Record<string, any> | null;
  slug: string | null;
  url: string | null;
  icon: string | null;
  image: string | null;
  description: string | null;
  badge: string | null;
  position: MenuPosition;
  type: MenuType;
  order: number;
  isActive: boolean;
  openNewTab: boolean;
  cssClass: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  children?: MenuItem[];
  parent?: {
    id: number;
    title: string;
  } | null;
  _count?: {
    children: number;
  };
}

export interface CreateMenuData {
  parentId?: number | null;
  sectionTitle?: string | null;
  sectionOrder?: number;
  title: string;
  translations?: Record<string, any> | null;
  slug?: string | null;
  url?: string | null;
  icon?: string | null;
  image?: string | null;
  description?: string | null;
  badge?: string | null;
  position: MenuPosition;
  type: MenuType;
  order?: number;
  isActive?: boolean;
  openNewTab?: boolean;
  cssClass?: string | null;
}

export interface UpdateMenuData extends Partial<CreateMenuData> {}

export interface MenuOrderUpdate {
  id: number;
  order: number;
  parentId?: number | null;
}

class MenuService extends BaseService {
  /**
   * Get public menus (hierarchical structure)
   */
  async getPublicMenus(position?: MenuPosition): Promise<{ data: MenuItem[] }> {
    const url = position 
      ? this.getApiUrl(`/menu?position=${position}`)
      : this.getApiUrl('/menu');
    return this.fetchWithAuth(url);
  }

  /**
   * Get all menus (CMS - tree structure)
   */
  async getAllMenus(position?: MenuPosition): Promise<{ data: MenuItem[] }> {
    const url = position 
      ? this.getApiUrl(`/cms/menu?position=${position}`)
      : this.getApiUrl('/cms/menu');
    return this.fetchWithAuth(url);
  }

  /**
   * Get all menus (CMS - flat list for table view)
   */
  async getAllMenusFlat(position?: MenuPosition): Promise<{ data: MenuItem[] }> {
    const url = position 
      ? this.getApiUrl(`/cms/menu/flat?position=${position}`)
      : this.getApiUrl('/cms/menu/flat');
    return this.fetchWithAuth(url);
  }

  /**
   * Get menus by position
   */
  async getMenusByPosition(position: MenuPosition, activeOnly: boolean = false): Promise<{ data: MenuItem[] }> {
    const url = this.getApiUrl(`/menu/position/${position.toLowerCase()}?activeOnly=${activeOnly}`);
    return this.fetchWithAuth(url);
  }

  /**
   * Get single menu item by ID
   */
  async getMenuById(id: number): Promise<{ data: MenuItem }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/menu/${id}`));
  }

  /**
   * Create new menu item
   */
  async createMenu(data: CreateMenuData): Promise<{ data: MenuItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing menu item
   */
  async updateMenu(id: number, data: UpdateMenuData): Promise<{ data: MenuItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/menu/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete menu item
   */
  async deleteMenu(id: number): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/menu/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Bulk delete menu items
   */
  async deleteMultipleMenus(ids: number[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Toggle menu status (active/inactive)
   */
  async toggleMenuStatus(id: number): Promise<{ data: MenuItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu/toggle-status'), {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Update menu items order (for drag & drop)
   */
  async updateMenuOrder(updates: MenuOrderUpdate[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/menu/update-order'), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
}

export const menuService = new MenuService();
