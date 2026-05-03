import { PrismaClient, Setting, SettingType } from '@prisma/client';
import { redisClient, isRedisAvailable } from '../config/redis';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Cache configuration
 */
const CACHE_KEY_PREFIX = 'settings:';
const CACHE_KEY_ALL = `${CACHE_KEY_PREFIX}all`;
const CACHE_KEY_PUBLIC = `${CACHE_KEY_PREFIX}public`;
const CACHE_KEY_GROUP = (group: string) => `${CACHE_KEY_PREFIX}group:${group}`;

/**
 * Encryption configuration
 */
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_IV_LENGTH = 16;

/**
 * Sensitive setting keys that should be encrypted
 */
const SENSITIVE_KEYS = ['smtp_password', 'email.smtp.password'];

/**
 * Settings Service
 * Handles all settings operations with Redis caching and encryption
 */
export class SettingsService {
  /**
   * Encrypt sensitive data
   */
  private static encrypt(text: string): string {
    const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
    const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data
   */
  private static decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2 || !parts[0] || !parts[1]) return encryptedText;

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      const key = Buffer.from(ENCRYPTION_KEY, 'hex').slice(0, 32);
      const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
      const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
      return decrypted;
    } catch (error) {
      return encryptedText;
    }
  }

  /**
   * Check if a setting key is sensitive
   */
  private static isSensitiveKey(key: string): boolean {
    return SENSITIVE_KEYS.includes(key);
  }

  /**
   * Process setting value before storage (encrypt if sensitive)
   */
  private static processValueForStorage(key: string, value: any): any {
    if (this.isSensitiveKey(key) && typeof value === 'string' && value) {
      return this.encrypt(value);
    }
    return value;
  }

  /**
   * Process setting value after retrieval (decrypt if sensitive)
   */
  private static processValueAfterRetrieval(key: string, value: any): any {
    if (this.isSensitiveKey(key) && typeof value === 'string' && value) {
      return this.decrypt(value);
    }
    return value;
  }

  /**
   * Clear all settings cache
   */
  private static async clearCache(): Promise<void> {
    try {
      if (!(await isRedisAvailable())) return;

      const keys = await redisClient.keys(`${CACHE_KEY_PREFIX}*`);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Error clearing settings cache:', error);
    }
  }

  /**
   * Get all settings with caching
   */
  static async getAllSettings(): Promise<Setting[]> {
    try {
      // Try to get from cache
      if (await isRedisAvailable()) {
        const cached = await redisClient.get(CACHE_KEY_ALL);
        if (cached) {
          const settings = JSON.parse(cached);
          // Decrypt sensitive values
          return settings.map((setting: Setting) => ({
            ...setting,
            value: this.processValueAfterRetrieval(setting.key, setting.value),
          }));
        }
      }

      // Get from database
      const settings = await prisma.setting.findMany({
        orderBy: [{ group: 'asc' }, { label: 'asc' }],
      });

      // Cache the result (with encrypted values)
      if (await isRedisAvailable()) {
        await redisClient.set(CACHE_KEY_ALL, JSON.stringify(settings));
      }

      // Return with decrypted values
      return settings.map((setting) => ({
        ...setting,
        value: this.processValueAfterRetrieval(setting.key, setting.value),
      }));
    } catch (error) {
      console.error('Error getting all settings:', error);
      throw error;
    }
  }

  /**
   * Get public settings (for frontend)
   */
  static async getPublicSettings(): Promise<Setting[]> {
    try {
      // Try to get from cache
      if (await isRedisAvailable()) {
        const cached = await redisClient.get(CACHE_KEY_PUBLIC);
        if (cached) {
          const settings = JSON.parse(cached);
          if (Array.isArray(settings) && settings.some((setting: Setting) => setting.key === 'general_branding.site.timezone' || setting.key === 'timezone')) {
            return settings;
          }
        }
      }

      // Get from database
      const settings = await prisma.setting.findMany({
        where: { isPublic: true },
        orderBy: [{ group: 'asc' }, { label: 'asc' }],
      });

      // Cache the result
      if (await isRedisAvailable()) {
        await redisClient.set(CACHE_KEY_PUBLIC, JSON.stringify(settings));
      }

      return settings;
    } catch (error) {
      console.error('Error getting public settings:', error);
      throw error;
    }
  }

  /**
   * Get settings by group
   */
  static async getSettingsByGroup(group: string): Promise<Setting[]> {
    try {
      // Try to get from cache
      if (await isRedisAvailable()) {
        const cached = await redisClient.get(CACHE_KEY_GROUP(group));
        if (cached) {
          const settings = JSON.parse(cached);
          return settings.map((setting: Setting) => ({
            ...setting,
            value: this.processValueAfterRetrieval(setting.key, setting.value),
          }));
        }
      }

      // Get from database
      const settings = await prisma.setting.findMany({
        where: { group },
        orderBy: { label: 'asc' },
      });

      // Cache the result (with encrypted values)
      if (await isRedisAvailable()) {
        await redisClient.set(CACHE_KEY_GROUP(group), JSON.stringify(settings));
      }

      // Return with decrypted values
      return settings.map((setting) => ({
        ...setting,
        value: this.processValueAfterRetrieval(setting.key, setting.value),
      }));
    } catch (error) {
      console.error(`Error getting settings for group ${group}:`, error);
      throw error;
    }
  }

  /**
   * Get single setting by key
   */
  static async getSetting(key: string): Promise<Setting | null> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key },
      });

      if (!setting) return null;

      return {
        ...setting,
        value: this.processValueAfterRetrieval(setting.key, setting.value),
      };
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get setting value by key (helper method)
   */
  static async getSettingValue(key: string): Promise<any> {
    const setting = await this.getSetting(key);
    return setting ? setting.value : null;
  }

  /**
   * Get settings grouped by group name
   */
  static async getSettingsGrouped(): Promise<Record<string, Setting[]>> {
    try {
      const allSettings = await this.getAllSettings();
      const grouped: Record<string, Setting[]> = {};

      allSettings.forEach((setting) => {
        if (!grouped[setting.group]) {
          grouped[setting.group] = [];
        }
        const groupArray = grouped[setting.group];
        if (groupArray) {
          groupArray.push(setting);
        }
      });

      return grouped;
    } catch (error) {
      console.error('Error getting grouped settings:', error);
      throw error;
    }
  }

  /**
   * Create new setting
   */
  static async createSetting(data: {
    key: string;
    value: any;
    type: SettingType;
    group: string;
    label: string;
    description?: string;
    isPublic?: boolean;
    isSystem?: boolean;
    options?: any;
  }): Promise<Setting> {
    try {
      // Process value (encrypt if sensitive)
      const processedValue = this.processValueForStorage(data.key, data.value);

      const setting = await prisma.setting.create({
        data: {
          ...data,
          value: processedValue,
          isPublic: data.isPublic ?? false,
          isSystem: data.isSystem ?? false,
        },
      });

      // Clear cache
      await this.clearCache();

      return {
        ...setting,
        value: this.processValueAfterRetrieval(setting.key, setting.value),
      };
    } catch (error) {
      console.error('Error creating setting:', error);
      throw error;
    }
  }

  /**
   * Update setting
   */
  static async updateSetting(
    id: string,
    data: {
      value?: any;
      type?: SettingType;
      group?: string;
      label?: string;
      description?: string;
      isPublic?: boolean;
      options?: any;
    }
  ): Promise<Setting> {
    try {
      // Get current setting to check key
      const currentSetting = await prisma.setting.findUnique({
        where: { id },
      });

      if (!currentSetting) {
        throw new Error('Setting not found');
      }

      // Process value (encrypt if sensitive)
      const processedData = { ...data };
      if (data.value !== undefined) {
        processedData.value = this.processValueForStorage(
          currentSetting.key,
          data.value
        );
      }

      const setting = await prisma.setting.update({
        where: { id },
        data: processedData,
      });

      // Clear cache
      await this.clearCache();

      return {
        ...setting,
        value: this.processValueAfterRetrieval(setting.key, setting.value),
      };
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  }

  /**
   * Update multiple settings (bulk update)
   */
  static async updateMultipleSettings(
    settings: Array<{ key: string; value: any }>
  ): Promise<Setting[]> {
    try {
      const updatedSettings: Setting[] = [];

      for (const { key, value } of settings) {
        const setting = await prisma.setting.findUnique({
          where: { key },
        });

        if (setting) {
          const processedValue = this.processValueForStorage(key, value);
          const updated = await prisma.setting.update({
            where: { key },
            data: { value: processedValue },
          });
          updatedSettings.push({
            ...updated,
            value: this.processValueAfterRetrieval(updated.key, updated.value),
          });
        }
      }

      // Clear cache
      await this.clearCache();

      return updatedSettings;
    } catch (error) {
      console.error('Error updating multiple settings:', error);
      throw error;
    }
  }

  /**
   * Delete setting
   */
  static async deleteSetting(id: string): Promise<Setting> {
    try {
      // Check if setting is system setting
      const setting = await prisma.setting.findUnique({
        where: { id },
      });

      if (!setting) {
        throw new Error('Setting not found');
      }

      if (setting.isSystem) {
        throw new Error('Cannot delete system setting');
      }

      const deleted = await prisma.setting.delete({
        where: { id },
      });

      // Clear cache
      await this.clearCache();

      return deleted;
    } catch (error) {
      console.error('Error deleting setting:', error);
      throw error;
    }
  }

  /**
   * Get all available groups
   */
  static async getGroups(): Promise<string[]> {
    try {
      const settings = await prisma.setting.findMany({
        select: { group: true },
        distinct: ['group'],
        orderBy: { group: 'asc' },
      });

      return settings.map((s) => s.group);
    } catch (error) {
      console.error('Error getting groups:', error);
      throw error;
    }
  }
}

export default SettingsService;
