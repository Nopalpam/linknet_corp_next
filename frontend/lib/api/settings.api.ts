import apiClient from '../api-client';

export type SettingValue = string | number | boolean | Record<string, unknown> | unknown[];

export interface Setting {
  id: string;
  key: string;
  value: SettingValue;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'IMAGE' | 'SELECT';
  group: string;
  label: string;
  description?: string;
  isPublic: boolean;
  isSystem: boolean;
  options?: {
    options: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface GroupedSettings {
  [group: string]: Setting[];
}

export interface CreateSettingData {
  key: string;
  value: SettingValue;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'IMAGE' | 'SELECT';
  group: string;
  label: string;
  description?: string;
  isPublic?: boolean;
  options?: Record<string, unknown>;
}

export interface UpdateSettingData {
  value?: SettingValue;
  type?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' | 'IMAGE' | 'SELECT';
  group?: string;
  label?: string;
  description?: string;
  isPublic?: boolean;
  options?: Record<string, unknown>;
}

export interface BulkUpdateSettings {
  settings: Array<{
    key: string;
    value: SettingValue;
  }>;
}

/**
 * Settings API
 */
export const settingsApi = {
  /**
   * Get all settings grouped by group
   */
  async getAllSettings(): Promise<GroupedSettings> {
    const response = await apiClient.get<{ success: boolean; data: GroupedSettings }>(
      '/cms/settings'
    );
    return response.data;
  },

  /**
   * Get settings by group
   */
  async getSettingsByGroup(group: string): Promise<Setting[]> {
    const response = await apiClient.get<{ success: boolean; data: Setting[] }>(
      `/cms/settings?group=${group}`
    );
    return response.data;
  },

  /**
   * Get public settings
   */
  async getPublicSettings(): Promise<Record<string, SettingValue>> {
    const response = await apiClient.get<{ success: boolean; data: Record<string, SettingValue> }>(
      '/settings/public'
    );
    return response.data;
  },

  /**
   * Get all available groups
   */
  async getGroups(): Promise<string[]> {
    const response = await apiClient.get<{ success: boolean; data: string[] }>(
      '/cms/settings/groups'
    );
    return response.data;
  },

  /**
   * Get single setting by key
   */
  async getSettingByKey(key: string): Promise<Setting> {
    const response = await apiClient.get<{ success: boolean; data: Setting }>(
      `/cms/settings/${key}`
    );
    return response.data;
  },

  /**
   * Create new setting
   */
  async createSetting(data: CreateSettingData): Promise<Setting> {
    const response = await apiClient.post<{ success: boolean; data: Setting; message: string }>(
      '/cms/settings',
      data
    );
    return response.data;
  },

  /**
   * Update single setting
   */
  async updateSetting(id: string, data: UpdateSettingData): Promise<Setting> {
    const response = await apiClient.put<{ success: boolean; data: Setting; message: string }>(
      `/cms/settings/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Bulk update settings
   */
  async updateGroupSettings(data: BulkUpdateSettings): Promise<Setting[]> {
    const response = await apiClient.post<{ success: boolean; data: Setting[]; message: string }>(
      '/cms/settings/update-group',
      data
    );
    return response.data;
  },

  /**
   * Delete setting
   */
  async deleteSetting(id: string): Promise<void> {
    await apiClient.delete<{ success: boolean; message: string }>(`/cms/settings/${id}`);
  },

  /**
   * Clear settings cache
   */
  async clearCache(): Promise<void> {
    await apiClient.post<{ success: boolean; message: string }>('/cms/settings/clear-cache');
  },
};

export default settingsApi;
