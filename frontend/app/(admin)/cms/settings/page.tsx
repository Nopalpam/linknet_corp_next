'use client';

import { useState, useEffect } from 'react';
import { settingsApi, GroupedSettings, SettingValue } from '@/lib/api/settings.api';
import SettingInput from '@/components/settings/SettingInput';

// Simple toast utility
const toast = {
  success: (message: string) => alert(message),
  error: (message: string) => alert(message),
};

export default function SettingsPage() {
  const [groupedSettings, setGroupedSettings] = useState<GroupedSettings>({});
  const [activeTab, setActiveTab] = useState<string>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changedValues, setChangedValues] = useState<Record<string, SettingValue>>({});

  // Available groups
  const groups = [
    { key: 'general', label: 'General' },
    { key: 'contact', label: 'Contact' },
    { key: 'seo', label: 'SEO' },
    { key: 'email', label: 'Email' },
    { key: 'features', label: 'Features' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getAllSettings();
      setGroupedSettings(data);

      // Set first available group as active
      const firstGroup = Object.keys(data)[0];
      if (firstGroup) {
        setActiveTab(firstGroup);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: SettingValue) => {
    setChangedValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare settings array for bulk update
      const settingsToUpdate = Object.entries(changedValues).map(([key, value]) => ({
        key,
        value,
      }));

      if (settingsToUpdate.length === 0) {
        toast.error('No changes to save');
        return;
      }

      await settingsApi.updateGroupSettings({ settings: settingsToUpdate });
      toast.success('Settings saved successfully');
      setChangedValues({});
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await settingsApi.clearCache();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const currentSettings = groupedSettings[activeTab] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <div className="flex gap-2">
          <button
            onClick={handleClearCache}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear Cache
          </button>
          <button
            onClick={handleSave}
            disabled={saving || Object.keys(changedValues).length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {groups.map((group) => {
            const isActive = activeTab === group.key;
            const groupSettings = groupedSettings[group.key];
            const hasSettings = groupSettings && groupSettings.length > 0;

            return (
              <button
                key={group.key}
                onClick={() => setActiveTab(group.key)}
                disabled={!hasSettings}
                className={`
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  ${!hasSettings ? 'opacity-50 cursor-not-allowed' : ''}
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                `}
              >
                {group.label}
                {hasSettings && groupSettings && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({groupSettings.length})
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Form */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-6">
          {currentSettings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No settings available for this group</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentSettings.map((setting) => (
                <SettingInput
                  key={setting.id}
                  setting={setting}
                  value={changedValues[setting.key] ?? setting.value}
                  onChange={(value: SettingValue) => handleValueChange(setting.key, value)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Changed Settings Indicator */}
      {Object.keys(changedValues).length > 0 && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 shadow-lg">
          <p className="text-sm text-yellow-800">
            {Object.keys(changedValues).length} unsaved change(s)
          </p>
        </div>
      )}
    </div>
  );
}
