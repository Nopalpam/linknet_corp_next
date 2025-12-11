import apiClient from '../api-client';
import { Menu, MenuFormData, MenuOrderUpdate } from '@/types/menu.types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const menuApi = {
  // Get all menus (CMS)
  getMenus: async (): Promise<Menu[]> => {
    const response = await apiClient.get('/cms/menu') as { data: ApiResponse<Menu[]> };
    return response.data.data;
  },

  // Get active menus (public)
  getPublicMenus: async (): Promise<Menu[]> => {
    const response = await apiClient.get('/menu') as { data: ApiResponse<Menu[]> };
    return response.data.data;
  },

  // Get single menu by ID
  getMenuById: async (id: string): Promise<Menu> => {
    const response = await apiClient.get(`/cms/menu/${id}`) as { data: ApiResponse<Menu> };
    return response.data.data;
  },

  // Create menu
  createMenu: async (data: MenuFormData): Promise<Menu> => {
    const response = await apiClient.post('/cms/menu', data) as { data: ApiResponse<Menu> };
    return response.data.data;
  },

  // Update menu
  updateMenu: async (id: string, data: Partial<MenuFormData>): Promise<Menu> => {
    const response = await apiClient.put(`/cms/menu/${id}`, data) as { data: ApiResponse<Menu> };
    return response.data.data;
  },

  // Delete menu
  deleteMenu: async (id: string): Promise<void> => {
    await apiClient.delete(`/cms/menu/${id}`);
  },

  // Bulk delete menus
  deleteMultipleMenus: async (ids: string[]): Promise<void> => {
    await apiClient.post('/cms/menu/destroy-multiple', { ids });
  },

  // Toggle menu status
  toggleMenuStatus: async (id: string): Promise<Menu> => {
    const response = await apiClient.post('/cms/menu/toggle-status', { id }) as { data: ApiResponse<Menu> };
    return response.data.data;
  },

  // Update menu order (drag-drop)
  updateMenuOrder: async (updates: MenuOrderUpdate[]): Promise<void> => {
    await apiClient.post('/cms/menu/update-order', { updates });
  },
};
