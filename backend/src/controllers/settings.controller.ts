import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { SettingType } from '@prisma/client';

/**
 * Settings Controller
 * Handles all settings-related HTTP requests
 */
export class SettingsController {
  private static setNestedValue(target: Record<string, any>, path: string, value: any): void {
    const segments = path.split('.');
    let cursor = target;

    segments.forEach((segment, index) => {
      if (index === segments.length - 1) {
        cursor[segment] = value;
        return;
      }

      if (!cursor[segment] || typeof cursor[segment] !== 'object' || Array.isArray(cursor[segment])) {
        cursor[segment] = {};
      }
      cursor = cursor[segment];
    });
  }

  private static normalizePublicSettings(settings: Awaited<ReturnType<typeof SettingsService.getPublicSettings>>): Record<string, any> {
    const settingsMap: Record<string, any> = {};
    const legacyMap: Record<string, string> = {
      site_name: 'general_branding.site.title',
      site_description: 'general_branding.site.description',
      timezone: 'general_branding.site.timezone',
      date_format: 'general_branding.site.date_format',
      site_logo: 'general_branding.branding.logo',
      site_favicon: 'general_branding.branding.favicon',
      contact_address: 'general_branding.site.address',
      contact_email: 'contact.email',
      contact_phone: 'contact.phone_numbers',
      social_media: 'contact.socials',
      from_name: 'email.from.name',
      from_email: 'email.from.email',
      smtp_host: 'email.smtp.host',
      smtp_port: 'email.smtp.port',
      smtp_user: 'email.smtp.username',
      smtp_password: 'email.smtp.password',
      meta_title: 'seo.meta_title',
      meta_description: 'seo.meta_description',
      meta_keywords: 'seo.meta_keywords',
      google_analytics_id: 'analytics.google_analytics_id',
      enable_comments: 'features.comments',
      enable_registration: 'features.registration',
      enable_2fa: 'features.two_factor_auth',
      maintenance_mode: 'features.maintenance_mode',
      cookies_enabled: 'cookies.enabled',
      cookies_title: 'cookies.title',
      cookies_description: 'cookies.description',
      cookies_accept_label: 'cookies.accept_label',
      cookies_icon_url: 'cookies.icon',
      cookies_more_info_label: 'cookies.more_info.label',
      cookies_more_info_url: 'cookies.more_info.url',
      footer_slogan: 'general_branding.site.slogan',
      footer_address: 'general_branding.site.address',
      footer_copyright: 'footer.copyright',
      closing_overline: 'footer.closingSentence_default.overline',
      closing_title: 'footer.closingSentence_default.title',
      closing_description: 'footer.closingSentence_default.description',
      news_about_title: 'general_branding.about.title',
      news_about_content: 'general_branding.about.content',
      news_media_contacts_title: 'general_branding.media_contacts.title',
      news_media_contacts: 'general_branding.media_contacts.items',
      page_preview_base_url: 'pages.preview.base_url',
      page_preview_path_template: 'pages.preview.path_template',
    };

    settings.forEach((setting) => {
      const key = legacyMap[setting.key] || setting.key;
      const value = (setting.key === 'contact_phone' || setting.key === 'contact.phone') && typeof setting.value === 'string'
        ? [{ type: 'phone', label: 'Phone', number: setting.value }]
        : setting.key === 'social_media' && !Array.isArray(setting.value) && typeof setting.value === 'object'
          ? Object.entries(setting.value || {}).map(([platform, url]) => ({ icon: platform, label: platform, url }))
        : setting.key === 'contact.socials' && Array.isArray(setting.value)
          ? setting.value.map((social: any) => ({
              icon: social.icon || social.platform || social.iconName || social.name || '',
              label: social.label || social.platform || social.iconName || social.name || '',
              url: social.url || social.href || '',
            }))
        : setting.key === 'news_media_contacts' && Array.isArray(setting.value)
          ? setting.value.map((contact: any) => ({
              name: contact.name || '',
              role: contact.role || contact.position || '',
              email: contact.email || '',
              phone: contact.phone || '',
            }))
          : setting.value;

      if (key.includes('.')) {
        this.setNestedValue(settingsMap, key, value);
      } else {
        settingsMap[key] = value;
      }
    });

    return settingsMap;
  }

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

      res.json({
        success: true,
        data: this.normalizePublicSettings(settings),
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
