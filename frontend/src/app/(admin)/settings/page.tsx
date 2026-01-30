"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { settingsService } from "@/services";

interface Setting {
  id: string;
  key: string;
  value: any;
  type?: string;
  group: string;
  label?: string;
  description?: string;
  isPublic: boolean;
  options?: any;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});

  // Fetch settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getAllSettings();
      setSettings(response.data || []);
    } catch (error: any) {
      setError(error.message || "Gagal mengambil pengaturan");
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleValueChange = (settingId: string, settingKey: string, newValue: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [settingId]: { key: settingKey, value: newValue },
    }));
  };

  // Save settings
  const handleSave = async () => {
    if (Object.keys(editedValues).length === 0) {
      setSuccess("Tidak ada perubahan untuk disimpan");
      setTimeout(() => setSuccess(null), 3000);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Save each edited setting
      const savePromises = Object.entries(editedValues).map(([id, data]) => {
        const setting = settings.find((s) => s.id === id);
        return settingsService.updateSetting(id, {
          key: data.key,
          value: data.value,
          group: setting?.group || "general",
        });
      });

      await Promise.all(savePromises);

      setSuccess("Pengaturan berhasil disimpan");
      setEditedValues({});
      
      // Refresh settings
      await fetchSettings();

      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal menyimpan pengaturan");
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  // Render input based on setting type
  const renderInput = (setting: Setting) => {
    const currentValue =
      editedValues[setting.id]?.value ?? setting.value;
    const type = setting.type || "STRING";

    switch (type) {
      case "BOOLEAN":
        return (
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={currentValue === true}
                onChange={(e) =>
                  handleValueChange(setting.id, setting.key, e.target.checked)
                }
                className="sr-only"
              />
              <div
                className={`block w-14 h-8 rounded-full transition ${
                  currentValue === true ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${
                  currentValue === true ? "translate-x-6" : ""
                }`}
              ></div>
            </div>
          </label>
        );

      case "NUMBER":
        return (
          <input
            type="number"
            value={currentValue}
            onChange={(e) =>
              handleValueChange(setting.id, setting.key, Number(e.target.value))
            }
            className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
        );

      case "SELECT":
        return (
          <select
            value={currentValue}
            onChange={(e) =>
              handleValueChange(setting.id, setting.key, e.target.value)
            }
            className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          >
            {setting.options?.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "IMAGE":
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={currentValue}
              onChange={(e) =>
                handleValueChange(setting.id, setting.key, e.target.value)
              }
              placeholder="Image URL"
              className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
            {currentValue && (
              <div className="relative h-20 w-32">
                <Image
                  src={currentValue}
                  alt="Preview"
                  fill
                  className="rounded border border-stroke object-cover dark:border-strokedark"
                />
              </div>
            )}
          </div>
        );

      case "JSON":
        return (
          <textarea
            value={
              typeof currentValue === "string"
                ? currentValue
                : JSON.stringify(currentValue, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                handleValueChange(setting.id, setting.key, parsed);
              } catch {
                // Keep as string if invalid JSON
                handleValueChange(setting.id, setting.key, e.target.value);
              }
            }}
            rows={4}
            className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 font-mono text-sm"
          />
        );

      default: // STRING
        return (
          <input
            type="text"
            value={currentValue}
            onChange={(e) =>
              handleValueChange(setting.id, setting.key, e.target.value)
            }
            className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
        );
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Settings" />
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Settings" />

      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              System Settings
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure system-wide settings
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || Object.keys(editedValues).length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 rounded-lg bg-success/10 border border-success/20 p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-medium text-success">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto text-success hover:text-success/80"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-danger">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-danger hover:text-danger/80"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Settings Groups */}
        <div className="space-y-8">
          {settings.length > 0 ? (
            // Group settings by group
            Object.entries(
              settings.reduce((acc, setting) => {
                const group = setting.group || "General";
                if (!acc[group]) acc[group] = [];
                acc[group].push(setting);
                return acc;
              }, {} as Record<string, Setting[]>)
            ).map(([group, groupSettings]) => (
              <div key={group}>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4 pb-2 border-b border-stroke dark:border-strokedark">
                  {group}
                </h3>

                <div className="grid gap-6 md:grid-cols-2">
                  {groupSettings.map((setting) => (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <label className="text-sm font-medium text-black dark:text-white">
                            {setting.label || setting.key}
                          </label>
                          {setting.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        {setting.isPublic && (
                          <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Public
                          </span>
                        )}
                      </div>
                      {renderInput(setting)}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                No settings configured
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
