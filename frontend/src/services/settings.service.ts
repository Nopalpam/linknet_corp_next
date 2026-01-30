/**
 * Settings Service
 * Handles all API calls related to Site Settings
 */

import { BaseService } from './base.service';

export interface Setting {
  id: string;
  key: string;
  value: string;
  group: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingData {
  key: string;
  value: string;
  group: string;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingData extends CreateSettingData {
  id?: string;
}

class SettingsService extends BaseService {
  /**
   * Get public settings
   */
  async getPublicSettings(): Promise<{ data: Record<string, string> }> {
    return this.fetchWithAuth(this.getApiUrl('/public'));
  }

  /**
   * Get all settings (CMS)
   */
  async getAllSettings(group?: string): Promise<{ data: Setting[] }> {
    const url = group 
      ? `${this.getApiUrl('/cms/settings')}?group=${group}`
      : this.getApiUrl('/cms/settings');
    
    const response = await this.fetchWithAuth(url);
    
    // Backend bisa mengembalikan grouped object atau array
    if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
      // Jika grouped, flatten ke array
      const allSettings: Setting[] = [];
      Object.values(response.data).forEach((group: any) => {
        if (Array.isArray(group)) {
          allSettings.push(...group);
        }
      });
      return { data: allSettings };
    }
    
    // Jika sudah array, return langsung
    return response;
  }

  /**
   * Get single setting by ID
   */
  async getSettingById(id: string): Promise<{ data: Setting }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/settings/${id}`));
  }

  /**
   * Get setting by key
   */
  async getSettingByKey(key: string): Promise<{ data: Setting }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/settings/key/${key}`));
  }

  /**
   * Create new setting
   */
  async createSetting(data: CreateSettingData): Promise<{ data: Setting; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/settings'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing setting
   */
  async updateSetting(id: string, data: UpdateSettingData): Promise<{ data: Setting; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/settings/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete setting
   */
  async deleteSetting(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/settings/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Bulk update settings
   */
  async bulkUpdateSettings(settings: { key: string; value: string }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/settings/bulk-update'), {
      method: 'POST',
      body: JSON.stringify({ settings }),
    });
  }
}

export const settingsService = new SettingsService();
