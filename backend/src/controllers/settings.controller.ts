import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { SettingType } from '@prisma/client';

/**
 * Settings Controller
 * Handles all settings-related HTTP requests
 */
export class SettingsController {
  /**
   * GET /api/cms/settings
   * Get all settings (admin only)
   * Query: ?group=general (optional filter by group)
   */
  static async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const { group } = req.query;

      let settings;
      if (group && typeof group === 'string') {
        settings = await SettingsService.getSettingsByGroup(group);
      } else {
        const grouped = await SettingsService.getSettingsGrouped();
        res.json({
          success: true,
          data: grouped,
        });
        return;
      }

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/settings/public
   * Get public settings (no authentication required)
   */
  static async getPublicSettings(_req: Request, res: Response): Promise<void> {
    try {
      const settings = await SettingsService.getPublicSettings();

      // Transform to key-value format for easier frontend consumption
      const settingsMap: Record<string, any> = {};
      settings.forEach((setting) => {
        settingsMap[setting.key] = setting.value;
      });

      res.json({
        success: true,
        data: settingsMap,
      });
    } catch (error) {
      console.error('Error getting public settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve public settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/cms/settings/groups
   * Get all available groups
   */
  static async getGroups(_req: Request, res: Response): Promise<void> {
    try {
      const groups = await SettingsService.getGroups();

      res.json({
        success: true,
        data: groups,
      });
    } catch (error) {
      console.error('Error getting groups:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve groups',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET /api/cms/settings/:key
   * Get single setting by key
   */
  static async getSettingByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;

      if (!key) {
        res.status(400).json({
          success: false,
          message: 'Setting key is required',
        });
        return;
      }

      const setting = await SettingsService.getSetting(key);

      if (!setting) {
        res.status(404).json({
          success: false,
          message: 'Setting not found',
        });
        return;
      }

      res.json({
        success: true,
        data: setting,
      });
    } catch (error) {
      console.error('Error getting setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve setting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/cms/settings
   * Create new setting
   */
  static async createSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key, value, type, group, label, description, isPublic, options } =
        req.body;

      // Validation
      if (!key || !value || !type || !group || !label) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: key, value, type, group, label',
        });
        return;
      }

      // Validate type
      if (!Object.values(SettingType).includes(type)) {
        res.status(400).json({
          success: false,
          message: `Invalid type. Must be one of: ${Object.values(SettingType).join(', ')}`,
        });
        return;
      }

      const setting = await SettingsService.createSetting({
        key,
        value,
        type,
        group,
        label,
        description,
        isPublic,
        isSystem: false, // Custom settings are not system settings
        options,
      });

      res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: setting,
      });
    } catch (error) {
      console.error('Error creating setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create setting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * PUT /api/cms/settings/:id
   * Update single setting
   */
  static async updateSetting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { value, type, group, label, description, isPublic, options } =
        req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Setting ID is required',
        });
        return;
      }

      const setting = await SettingsService.updateSetting(id, {
        value,
        type,
        group,
        label,
        description,
        isPublic,
        options,
      });

      res.json({
        success: true,
        message: 'Setting updated successfully',
        data: setting,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update setting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/cms/settings/update-group
   * Bulk update settings in a group
   */
  static async updateGroupSettings(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings) || settings.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid settings array',
        });
        return;
      }

      // Validate each setting has key and value
      for (const setting of settings) {
        if (!setting.key || setting.value === undefined) {
          res.status(400).json({
            success: false,
            message: 'Each setting must have key and value',
          });
          return;
        }
      }

      const updated = await SettingsService.updateMultipleSettings(settings);

      res.json({
        success: true,
        message: `Updated ${updated.length} settings successfully`,
        data: updated,
      });
    } catch (error) {
      console.error('Error updating group settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * DELETE /api/cms/settings/:id
   * Delete setting (only custom settings)
   */
  static async deleteSetting(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Setting ID is required',
        });
        return;
      }

      await SettingsService.deleteSetting(id);

      res.json({
        success: true,
        message: 'Setting deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting setting:', error);

      if (
        error instanceof Error &&
        error.message === 'Cannot delete system setting'
      ) {
        res.status(403).json({
          success: false,
          message: 'Cannot delete system setting',
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete setting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * POST /api/cms/settings/clear-cache
   * Clear settings cache manually
   */
  static async clearCache(_req: Request, res: Response): Promise<void> {
    try {
      // Trigger cache clear by getting all settings
      await SettingsService.getAllSettings();

      res.json({
        success: true,
        message: 'Settings cache cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default SettingsController;
