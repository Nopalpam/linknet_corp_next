"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { logActivityService, settingsService } from "@/services";
import MediaPickerButton from "@/components/media/MediaPickerButton";

const CKEditorWrapper = dynamic(() => import("@/components/ui/ckeditor/CKEditorWrapper"), {
  ssr: false,
});

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

type ArrayFieldConfig = {
  addLabel: string;
  emptyItem: Record<string, string>;
  fields: Array<{ key: string; label: string; type?: string; options?: string[] }>;
};

type LogCleanupMode = "olderThan" | "range" | "all";

const SOCIAL_ICON_OPTIONS = [
  "facebook",
  "instagram",
  "linkedin",
  "threads",
  "tiktok",
  "twitter-x",
  "whatsapp",
  "youtube",
];

const TAB_CONFIGS = [
  {
    id: "general_branding",
    label: "General",
    description: "Identitas utama website, branding, alamat kantor, slogan, dan konten company profile yang dipakai lintas halaman.",
    groups: ["general_branding", "general"],
  },
  {
    id: "contact",
    label: "Contact",
    description: "Single source of truth untuk kontak publik, nomor telepon/WhatsApp, dan social media yang tampil di website.",
    groups: ["contact"],
  },
  {
    id: "navbar",
    label: "Navbar",
    description: "Atur label dan URL CTA utama di navbar website publik.",
    groups: ["navbar"],
  },
  {
    id: "seo",
    label: "SEO",
    description: "Default metadata untuk halaman yang belum punya SEO sendiri, termasuk tracking ID dan fallback thumbnail.",
    groups: ["seo", "analytics"],
  },
  {
    id: "features",
    label: "Features",
    description: "Toggle fitur global yang memengaruhi perilaku CMS dan website.",
    groups: ["features"],
  },
  {
    id: "cookies",
    label: "Cookies",
    description: "Konfigurasi popup cookies, teks persetujuan, ikon, dan link informasi kebijakan.",
    groups: ["cookies"],
  },
  {
    id: "email",
    label: "Email",
    description: "Konfigurasi sender sistem dan SMTP. Email publik tetap dikelola dari tab Contact.",
    groups: ["email"],
  },
  {
    id: "footer",
    label: "Footer",
    description: "Konten khusus footer dan closing sentence. Logo, alamat, kontak, dan social media memakai data dari General/Contact.",
    groups: ["footer"],
  },
  {
    id: "pages",
    label: "Pages",
    description: "Pengaturan preview URL untuk halaman yang dibuat melalui Page Builder.",
    groups: ["pages"],
  },
  {
    id: "maintenance",
    label: "Maintenance",
    description: "Cleanup data operasional CMS seperti activity log agar database tetap ringan.",
    groups: [],
  },
];

const ARRAY_FIELD_CONFIG: Record<string, ArrayFieldConfig> = {
  "contact.socials": {
    addLabel: "Add Social",
    emptyItem: { icon: "", label: "", url: "" },
    fields: [
      { key: "icon", label: "Icon", type: "select", options: SOCIAL_ICON_OPTIONS },
      { key: "label", label: "Label" },
      { key: "url", label: "Link" },
    ],
  },
  "contact.phone_numbers": {
    addLabel: "Add Phone Number",
    emptyItem: { type: "phone", label: "", number: "" },
    fields: [
      { key: "type", label: "Type", type: "select", options: ["phone", "whatsapp"] },
      { key: "label", label: "Label" },
      { key: "number", label: "Number" },
    ],
  },
  "general_branding.media_contacts.items": {
    addLabel: "Add Contact",
    emptyItem: { name: "", role: "", email: "", phone: "" },
    fields: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "email", label: "Email", type: "email" },
      { key: "phone", label: "Phone" },
    ],
  },
};

const WIDE_KEYS = new Set([
  "general_branding.about.content",
  "general_branding.media_contacts.items",
  "contact.socials",
  "contact.phone_numbers",
  "navbar.cta.contact.show",
  "navbar.cta.consult.show",
  "cookies.description",
]);

const DEPRECATED_KEYS = new Set([
  "contact.address",
  "contact.phone",
  "features.comments",
  "features.registration",
  "cookies.more_info.label",
  "footer_logo",
  "footer_address",
  "footer_email",
  "footer_phone",
  "footer_socials",
  "general_branding.about.title",
  "general_branding.media_contacts.title",
]);

const BILINGUAL_KEYS = new Set([
  "general_branding.site.title",
  "general_branding.site.title_suffix",
  "general_branding.site.description",
  "general_branding.about.content",
  "navbar.cta.contact.label",
  "navbar.cta.consult.label",
  "seo.meta_title",
  "seo.meta_description",
  "cookies.title",
  "cookies.description",
  "cookies.accept_label",
  "cookies.more_info.title",
  "footer.closingSentence_default.title",
  "footer.closingSentence_default.description",
]);

const FIELD_ORDER: Record<string, number> = {
  "general_branding.site.title": 10,
  "general_branding.site.title_suffix": 20,
  "general_branding.site.description": 30,
  "general_branding.site.address": 40,
  "general_branding.site.slogan": 50,
  "general_branding.site.timezone": 60,
  "general_branding.site.date_format": 70,
  "default_locale": 80,
  "general_branding.branding.logo": 100,
  "general_branding.branding.favicon": 110,
  "general_branding.about.content": 210,
  "general_branding.media_contacts.items": 310,
  "contact.email": 10,
  "contact.phone_numbers": 20,
  "contact.socials": 30,
  "navbar.cta.contact.show": 10,
  "navbar.cta.contact.label": 20,
  "navbar.cta.contact.url": 30,
  "navbar.cta.consult.show": 40,
  "navbar.cta.consult.label": 50,
  "navbar.cta.consult.url": 60,
  "analytics.google_analytics_id": 10,
  "seo.meta_title": 20,
  "seo.meta_description": 30,
  "seo.meta_keywords": 40,
  "seo.thumbnail": 50,
  "features.two_factor_auth": 10,
  "features.mfa_provider": 20,
  "features.maintenance_mode": 30,
  "cookies.enabled": 10,
  "cookies.title": 20,
  "cookies.description": 30,
  "cookies.accept_label": 40,
  "cookies.icon": 50,
  "cookies.more_info.title": 60,
  "cookies.more_info.url": 70,
  "email.from.name": 10,
  "email.from.email": 20,
  "email.smtp.host": 100,
  "email.smtp.port": 110,
  "email.smtp.username": 120,
  "email.smtp.password": 130,
  "footer.copyright": 10,
  "footer.closingSentence_default.overline": 100,
  "footer.closingSentence_default.title": 110,
  "footer.closingSentence_default.description": 120,
  "pages.preview.base_url": 10,
  "pages.preview.path_template": 20,
};

const EMAIL_SETTING_FALLBACKS: Record<string, string | number> = {
  "email.smtp.host": "email-smtp.ap-southeast-1.amazonaws.com",
  "email.smtp.port": 587,
  "email.smtp.username": "",
  "email.from.email": "noreply@linknet.id",
  "email.from.name": "LinkNet Corp",
};

const LEGACY_EMAIL_SETTING_DEFAULTS: Record<string, string> = {
  "email.smtp.host": "smtp.gmail.com",
  "email.from.email": "noreply@linknet.co.id",
  "email.from.name": "LinkNet Corporation",
};

const FIELD_SECTIONS: Record<string, string> = {
  "general_branding.site.title": "Website",
  "general_branding.site.title_suffix": "Website",
  "general_branding.site.description": "Website",
  "general_branding.site.address": "Website",
  "general_branding.site.slogan": "Website",
  "general_branding.site.timezone": "Localization",
  "general_branding.site.date_format": "Localization",
  "default_locale": "Localization",
  "general_branding.branding.logo": "Branding",
  "general_branding.branding.favicon": "Branding",
  "general_branding.about.content": "About",
  "general_branding.media_contacts.items": "Media Contacts",
  "navbar.cta.contact.show": "Contact CTA",
  "navbar.cta.contact.label": "Contact CTA",
  "navbar.cta.contact.url": "Contact CTA",
  "navbar.cta.consult.show": "Consult CTA",
  "navbar.cta.consult.label": "Consult CTA",
  "navbar.cta.consult.url": "Consult CTA",
  "email.from.name": "Sender",
  "email.from.email": "Sender",
  "email.smtp.host": "SMTP",
  "email.smtp.port": "SMTP",
  "email.smtp.username": "SMTP",
  "email.smtp.password": "SMTP",
  "features.two_factor_auth": "CMS MFA",
  "features.mfa_provider": "CMS MFA",
  "features.maintenance_mode": "Website",
  "footer.copyright": "Footer Content",
  "footer.closingSentence_default.overline": "Closing Sentence",
  "footer.closingSentence_default.title": "Closing Sentence",
  "footer.closingSentence_default.description": "Closing Sentence",
};

const isMediaArrayField = (field: ArrayFieldConfig["fields"][number]) => {
  const key = field.key.toLowerCase();
  const label = field.label.toLowerCase();
  return /image|thumbnail|icon|logo|favicon|cover|banner|photo|poster/.test(key) || /image|thumbnail|icon|logo|favicon|cover|banner|photo|poster/.test(label);
};

const isMediaSetting = (setting: Setting) => {
  const key = setting.key.toLowerCase();
  const label = (setting.label || "").toLowerCase();
  return /image|thumbnail|icon|logo|favicon|cover|banner|photo|poster/.test(key) || /image|thumbnail|icon|logo|favicon|cover|banner|photo|poster/.test(label);
};

const SettingsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, { key: string; value: any }>>({});
  const [activeGroup, setActiveGroup] = useState("");
  const [logCleanupMode, setLogCleanupMode] = useState<LogCleanupMode>("olderThan");
  const [logDaysToKeep, setLogDaysToKeep] = useState(90);
  const [logDateFrom, setLogDateFrom] = useState("");
  const [logDateTo, setLogDateTo] = useState("");
  const [confirmLogCleanupOpen, setConfirmLogCleanupOpen] = useState(false);
  const [logCleanupPending, setLogCleanupPending] = useState(false);
  const [logCleanupSummary, setLogCleanupSummary] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testEmailPending, setTestEmailPending] = useState(false);
  const [testEmailStatus, setTestEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    const savedTab = typeof window !== "undefined" ? window.localStorage.getItem("settings.activeTab") : "";
    setActiveGroup(tabFromUrl || savedTab || "general_branding");
  }, [searchParams]);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getAllSettings();
      setSettings(response.data || []);
    } catch (error: any) {
      setError(error.message || "Gagal mengambil pengaturan");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (group: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", group);
    setActiveGroup(group);
    window.localStorage.setItem("settings.activeTab", group);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleValueChange = (settingId: string, settingKey: string, newValue: any) => {
    setEditedValues((prev) => ({
      ...prev,
      [settingId]: { key: settingKey, value: newValue },
    }));
  };

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
      await Promise.all(
        Object.entries(editedValues).map(([id, data]) => {
          const setting = settings.find((item) => item.id === id);
          return settingsService.updateSetting(id, {
            key: data.key,
            value: data.value,
            group: setting?.group || "general_branding",
          });
        })
      );

      setSuccess("Pengaturan berhasil disimpan");
      setEditedValues({});
      await fetchSettings();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const email = testEmail.trim();

    setError(null);
    setSuccess(null);
    setTestEmailStatus(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setTestEmailStatus({ type: "error", message: "Email tujuan tidak valid" });
      return;
    }

    setTestEmailPending(true);

    try {
      const response = await settingsService.sendTestEmail(email);
      setTestEmailStatus({
        type: "success",
        message: response.message || `Test email berhasil dikirim ke ${email}`,
      });
    } catch (error: any) {
      setTestEmailStatus({
        type: "error",
        message: error.message || "Gagal mengirim test email",
      });
    } finally {
      setTestEmailPending(false);
    }
  };

  const openLogCleanupConfirm = () => {
    setError(null);
    setSuccess(null);

    if (logCleanupMode === "olderThan" && (!Number.isFinite(logDaysToKeep) || logDaysToKeep <= 0)) {
      setError("Days to keep harus lebih dari 0");
      return;
    }

    if (logCleanupMode === "range" && !logDateFrom && !logDateTo) {
      setError("Pilih minimal start date atau end date untuk delete by range");
      return;
    }

    setConfirmLogCleanupOpen(true);
  };

  const confirmLogCleanup = async () => {
    setLogCleanupPending(true);
    setError(null);
    setSuccess(null);
    setLogCleanupSummary(null);

    try {
      const response =
        logCleanupMode === "olderThan"
          ? await logActivityService.cleanupOldLogs(logDaysToKeep)
          : await logActivityService.deleteActivityLogs(
              logCleanupMode === "all"
                ? { mode: "all" }
                : { mode: "range", dateFrom: logDateFrom || undefined, dateTo: logDateTo || undefined }
            );

      const deletedCount = (response as any).data?.deletedCount ?? (response as any).deletedCount ?? 0;
      const summary = `Log activity cleanup selesai. ${deletedCount} log dihapus.`;
      setLogCleanupSummary(summary);
      setSuccess(summary);
      setConfirmLogCleanupOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal menghapus log activity");
    } finally {
      setLogCleanupPending(false);
    }
  };

  const groupedSettings = useMemo(() => {
    const grouped = settings.filter((setting) => !DEPRECATED_KEYS.has(setting.key)).reduce((acc, setting) => {
      const group = setting.group || setting.key.split(".")[0] || "general";
      if (!acc[group]) acc[group] = [];
      acc[group].push(setting);
      return acc;
    }, {} as Record<string, Setting[]>);

    Object.values(grouped).forEach((items) => items.sort(sortSettings));

    return grouped;
  }, [settings]);

  const groupEntries = useMemo(() => {
    return TAB_CONFIGS.map((tab) => [
      tab.id,
      tab.groups.flatMap((group) => groupedSettings[group] || []).sort(sortSettings),
    ] as [string, Setting[]]).filter(([group, tabSettings]) => group === "maintenance" || tabSettings.length > 0);
  }, [groupedSettings]);

  useEffect(() => {
    if (!loading && groupEntries.length > 0 && !groupEntries.some(([group]) => group === activeGroup)) {
      setActiveGroup(groupEntries[0][0]);
    }
  }, [activeGroup, groupEntries, loading]);

  const activeTabConfig = TAB_CONFIGS.find((tab) => tab.id === activeGroup);
  const activeSettings =
    activeTabConfig?.groups.flatMap((group) => groupedSettings[group] || []).sort(sortSettings) || [];

  function sortSettings(a: Setting, b: Setting) {
    const orderA = FIELD_ORDER[a.key] ?? 999;
    const orderB = FIELD_ORDER[b.key] ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.label || a.key).localeCompare(b.label || b.key);
  }

  const getGroupLabel = (group: string) =>
    group.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const getFieldLabel = (setting: Setting) => {
    if (setting.label) return setting.label;
    const key = setting.key.split(".").slice(-2).join(" ");
    return getGroupLabel(key);
  };

  const resolveSettingInputValue = (setting: Setting) => {
    const editedValue = editedValues[setting.id]?.value;
    if (editedValue !== undefined) return editedValue;

    if (setting.key === "email.smtp.password") return setting.value ?? "";

    const fallback = EMAIL_SETTING_FALLBACKS[setting.key];
    const legacyDefault = LEGACY_EMAIL_SETTING_DEFAULTS[setting.key];
    const currentValue = setting.value;

    if (
      fallback !== undefined &&
      (currentValue === undefined ||
        currentValue === null ||
        currentValue === "" ||
        (typeof currentValue === "string" && currentValue.trim() === legacyDefault))
    ) {
      return fallback;
    }

    return currentValue;
  };

  const isWideSetting = (setting: Setting) =>
    WIDE_KEYS.has(setting.key) ||
    setting.type === "JSON" ||
    String(editedValues[setting.id]?.value ?? setting.value ?? "").length > 120;

  const groupedActiveSettings = useMemo(() => {
    return activeSettings.reduce((acc, setting) => {
      const section = FIELD_SECTIONS[setting.key] || "";
      if (!acc[section]) acc[section] = [];
      acc[section].push(setting);
      return acc;
    }, {} as Record<string, Setting[]>);
  }, [activeSettings]);

  const renderArrayEditor = (setting: Setting, config: ArrayFieldConfig) => {
    const currentValue = editedValues[setting.id]?.value ?? setting.value;
    const items = Array.isArray(currentValue) ? currentValue : [];

    const updateItem = (index: number, field: string, value: string) => {
      const next = items.map((item: any, itemIndex: number) =>
        itemIndex === index ? { ...item, [field]: value } : item
      );
      handleValueChange(setting.id, setting.key, next);
    };

    return (
      <div className="space-y-4">
        {items.map((item: any, index: number) => (
          <div key={index} className="rounded-lg border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-black dark:text-white">Item {index + 1}</p>
              <button
                type="button"
                onClick={() => handleValueChange(setting.id, setting.key, items.filter((_: any, itemIndex: number) => itemIndex !== index))}
                className="text-sm font-medium text-danger hover:text-danger/80"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {config.fields.map((field) => (
                <label key={field.key} className="space-y-1">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{field.label}</span>
                  {field.type === "select" ? (
                    <select
                      value={item?.[field.key] || ""}
                      onChange={(event) => updateItem(index, field.key, event.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                    >
                      <option value="">Select {field.label.toLowerCase()}</option>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>{getGroupLabel(option)}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type={field.type || "text"}
                        value={item?.[field.key] || ""}
                        onChange={(event) => updateItem(index, field.key, event.target.value)}
                        className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                      />
                      {isMediaArrayField(field) && (
                        <MediaPickerButton
                          kind="image"
                          label="Choose from File Manager"
                          title={`Choose ${field.label}`}
                          onSelect={(url) => updateItem(index, field.key, url)}
                        />
                      )}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleValueChange(setting.id, setting.key, [...items, { ...config.emptyItem }])}
          className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
        >
          {config.addLabel}
        </button>
      </div>
    );
  };

  const getLocalizedValueObject = (value: any) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return {
        en: value.en ?? "",
        id: value.id ?? "",
      };
    }

    return {
      en: value ?? "",
      id: value ?? "",
    };
  };

  const updateLocalizedValue = (setting: Setting, locale: "en" | "id", value: string) => {
    const currentValue = editedValues[setting.id]?.value ?? setting.value;
    const localized = getLocalizedValueObject(currentValue);
    handleValueChange(setting.id, setting.key, {
      ...localized,
      [locale]: value,
    });
  };

  const renderBilingualInput = (setting: Setting) => {
    const currentValue = editedValues[setting.id]?.value ?? setting.value;
    const localized = getLocalizedValueObject(currentValue);
    const isRichText = setting.key === "cookies.description" || setting.key === "general_branding.about.content";
    const isLongText = setting.key.includes("description");

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {(["en", "id"] as const).map((locale) => (
          <div key={locale} className="space-y-2">
            <span className="inline-flex rounded bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {locale === "en" ? "English" : "Bahasa Indonesia"}
            </span>
            {isRichText ? (
              <CKEditorWrapper
                value={localized[locale] || ""}
                onChange={(value) => updateLocalizedValue(setting, locale, value)}
                minHeight={setting.key === "general_branding.about.content" ? "220px" : "140px"}
              />
            ) : isLongText ? (
              <textarea
                value={localized[locale] || ""}
                onChange={(event) => updateLocalizedValue(setting, locale, event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
              />
            ) : (
              <input
                type="text"
                value={localized[locale] || ""}
                onChange={(event) => updateLocalizedValue(setting, locale, event.target.value)}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInput = (setting: Setting) => {
    const currentValue = resolveSettingInputValue(setting);
    const type = setting.type || "STRING";
    const arrayConfig = ARRAY_FIELD_CONFIG[setting.key];

    if (arrayConfig) return renderArrayEditor(setting, arrayConfig);
    if (BILINGUAL_KEYS.has(setting.key)) return renderBilingualInput(setting);

    if (setting.key === "general_branding.about.content" || setting.key === "cookies.description") {
      return (
        <CKEditorWrapper
          value={currentValue || ""}
          onChange={(value) => handleValueChange(setting.id, setting.key, value)}
          minHeight={setting.key === "cookies.description" ? "140px" : "220px"}
        />
      );
    }

    switch (type) {
      case "BOOLEAN":
        return (
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={currentValue === true}
              onChange={(event) => handleValueChange(setting.id, setting.key, event.target.checked)}
              className="sr-only"
            />
            <span className={`relative h-8 w-14 rounded-full transition ${currentValue === true ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}>
              <span className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${currentValue === true ? "translate-x-6" : ""}`} />
            </span>
          </label>
        );
      case "NUMBER":
        return (
          <input
            type="number"
            value={currentValue ?? ""}
            onChange={(event) => handleValueChange(setting.id, setting.key, Number(event.target.value))}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
        );
      case "SELECT":
        return (
          <select
            value={currentValue ?? ""}
            onChange={(event) => handleValueChange(setting.id, setting.key, event.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          >
            {setting.options?.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case "IMAGE":
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={currentValue || ""}
              onChange={(event) => handleValueChange(setting.id, setting.key, event.target.value)}
              placeholder="Image URL"
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
            <MediaPickerButton
              kind="image"
              title={`Choose ${getFieldLabel(setting)}`}
              onSelect={(url) => handleValueChange(setting.id, setting.key, url)}
            />
            {currentValue && (
              <div className="relative h-20 w-32 overflow-hidden rounded border border-stroke dark:border-strokedark">
                <Image src={currentValue} alt="Preview" fill className="object-contain" />
              </div>
            )}
          </div>
        );
      case "JSON":
        return (
          <textarea
            value={typeof currentValue === "string" ? currentValue : JSON.stringify(currentValue, null, 2)}
            onChange={(event) => {
              try {
                handleValueChange(setting.id, setting.key, JSON.parse(event.target.value));
              } catch {
                handleValueChange(setting.id, setting.key, event.target.value);
              }
            }}
            rows={5}
            className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 font-mono text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
          />
        );
      default:
        return (
          <div className="space-y-2">
            <input
              type={setting.key.includes("password") ? "password" : setting.key.includes("email") ? "email" : "text"}
              value={currentValue ?? ""}
              onChange={(event) => handleValueChange(setting.id, setting.key, event.target.value)}
              autoComplete={setting.key.includes("password") ? "new-password" : undefined}
              className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
            {isMediaSetting(setting) && (
              <MediaPickerButton
                kind="image"
                title={`Choose ${getFieldLabel(setting)}`}
                onSelect={(url) => handleValueChange(setting.id, setting.key, url)}
              />
            )}
          </div>
        );
    }
  };

  const renderEmailTestPanel = () => (
    <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold text-black dark:text-white">Test Email</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Kirim email percobaan memakai konfigurasi SMTP aktif.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          value={testEmail}
          onChange={(event) => setTestEmail(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !testEmailPending) {
              event.preventDefault();
              handleSendTestEmail();
            }
          }}
          placeholder="email@domain.com"
          className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
        />
        <button
          type="button"
          onClick={handleSendTestEmail}
          disabled={testEmailPending}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 md:w-36"
        >
          {testEmailPending ? "Mengirim..." : "Kirim Email"}
        </button>
      </div>

      {testEmailStatus && (
        <div className={`mt-4 rounded-lg border p-3 text-sm font-medium ${
          testEmailStatus.type === "success"
            ? "border-success/20 bg-success/10 text-success"
            : "border-danger/20 bg-danger/10 text-danger"
        }`}>
          {testEmailStatus.message}
        </div>
      )}
    </div>
  );

  const renderMaintenancePanel = () => (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30">
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-semibold text-black dark:text-white">Log Activity Cleanup</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Soft-delete log activity yang sudah tidak dibutuhkan. Data tidak disentuh sampai admin mengonfirmasi.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="rounded-lg border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="logCleanupMode"
                value="olderThan"
                checked={logCleanupMode === "olderThan"}
                onChange={() => setLogCleanupMode("olderThan")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-black dark:text-white">Delete older logs</p>
                <p className="mt-1 text-xs text-gray-500">Hapus log lebih lama dari jumlah hari tertentu.</p>
              </div>
            </div>
          </label>
          <label className="rounded-lg border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="logCleanupMode"
                value="range"
                checked={logCleanupMode === "range"}
                onChange={() => setLogCleanupMode("range")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-black dark:text-white">Delete by date range</p>
                <p className="mt-1 text-xs text-gray-500">Hapus log berdasarkan tanggal awal dan/atau akhir.</p>
              </div>
            </div>
          </label>
          <label className="rounded-lg border border-danger/30 bg-danger/5 p-4 dark:border-danger/40">
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="logCleanupMode"
                value="all"
                checked={logCleanupMode === "all"}
                onChange={() => setLogCleanupMode("all")}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-danger">Delete all logs</p>
                <p className="mt-1 text-xs text-gray-500">Hapus semua activity log aktif dengan soft delete.</p>
              </div>
            </div>
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {logCleanupMode === "olderThan" && (
            <label className="space-y-2">
              <span className="text-sm font-medium text-black dark:text-white">Days to keep</span>
              <input
                type="number"
                min={1}
                value={logDaysToKeep}
                onChange={(event) => setLogDaysToKeep(Number(event.target.value))}
                className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
              />
            </label>
          )}

          {logCleanupMode === "range" && (
            <>
              <label className="space-y-2">
                <span className="text-sm font-medium text-black dark:text-white">Start date</span>
                <input
                  type="date"
                  value={logDateFrom}
                  onChange={(event) => setLogDateFrom(event.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-black dark:text-white">End date</span>
                <input
                  type="date"
                  value={logDateTo}
                  onChange={(event) => setLogDateTo(event.target.value)}
                  className="w-full rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
              </label>
            </>
          )}
        </div>

        {logCleanupSummary && (
          <div className="mt-4 rounded-lg border border-success/20 bg-success/10 p-3 text-sm font-medium text-success">
            {logCleanupSummary}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Semua proses menggunakan soft delete agar cleanup tetap aman.
          </p>
          <button
            type="button"
            onClick={openLogCleanupConfirm}
            disabled={logCleanupPending}
            className="inline-flex items-center justify-center rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logCleanupPending ? "Deleting..." : "Delete Log Activity"}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Settings" />
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-center py-12">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Settings" />

      <div className="space-y-6">
        <div className="rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-black dark:text-white">System Settings</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Kelola konfigurasi website berdasarkan section.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || Object.keys(editedValues).length === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] md:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {success && (
          <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-medium text-success">
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger/10 p-4 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        {groupEntries.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-lg border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark">
                <select
                  value={activeGroup}
                  onChange={(event) => handleTabChange(event.target.value)}
                  className="mb-3 w-full rounded-lg border border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 lg:hidden"
                >
                  {groupEntries.map(([group]) => (
                    <option key={group} value={group}>{TAB_CONFIGS.find((tab) => tab.id === group)?.label || getGroupLabel(group)}</option>
                  ))}
                </select>

                <nav className="hidden gap-1 overflow-x-auto lg:flex lg:flex-col lg:overflow-visible">
                  {groupEntries.map(([group, groupSettings]) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => handleTabChange(group)}
                      className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                        activeGroup === group
                          ? "border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/30"
                          : "border-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      <span>{TAB_CONFIGS.find((tab) => tab.id === group)?.label || getGroupLabel(group)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        activeGroup === group ? "bg-primary text-black" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      }`}>{groupSettings.length}</span>
                    </button>
                  ))}
                </nav>

                <nav className="flex gap-2 overflow-x-auto lg:hidden">
                  {groupEntries.map(([group]) => (
                    <button
                      key={group}
                      type="button"
                      onClick={() => handleTabChange(group)}
                      className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activeGroup === group
                          ? "border border-primary bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {TAB_CONFIGS.find((tab) => tab.id === group)?.label || getGroupLabel(group)}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <section className="min-w-0 rounded-lg border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark md:p-6">
              <div className="mb-5 border-b border-stroke pb-4 dark:border-strokedark">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {activeTabConfig?.label || getGroupLabel(activeGroup)}
                </h3>
                <p className="mt-1 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
                  {activeTabConfig?.description}
                </p>
                <p className="mt-2 text-xs text-gray-400">
                  {activeGroup === "maintenance"
                    ? "Maintenance tools"
                    : `${activeSettings.length} setting${activeSettings.length === 1 ? "" : "s"}`}
                </p>
              </div>

              {activeGroup === "maintenance" ? (
                renderMaintenancePanel()
              ) : (
                <div className="space-y-8">
                  {activeGroup === "email" && renderEmailTestPanel()}

                  {Object.entries(groupedActiveSettings).map(([section, sectionSettings]) => (
                    <div key={section || "default"} className="space-y-4">
                      {section && (
                        <div className="border-b border-gray-100 pb-2 dark:border-gray-800">
                          <h4 className="text-sm font-semibold text-black dark:text-white">{section}</h4>
                        </div>
                      )}
                      <div className="grid gap-6 md:grid-cols-2">
                        {sectionSettings.map((setting) => (
                          <div
                            key={setting.id}
                            className={`space-y-2 rounded-lg border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-900/30 ${
                              isWideSetting(setting) ? "md:col-span-2" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <label className="text-sm font-medium text-black dark:text-white">{getFieldLabel(setting)}</label>
                                <p className="mt-0.5 break-words text-xs text-gray-400">{setting.key}</p>
                                {setting.description && (
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{setting.description}</p>
                                )}
                              </div>
                              {setting.isPublic && (
                                <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Public</span>
                              )}
                            </div>
                            {renderInput(setting)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="rounded-lg border border-stroke bg-white py-12 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-gray-400">No settings configured</p>
          </div>
        )}
      </div>

      {confirmLogCleanupOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h3 className="text-lg font-semibold text-black dark:text-white">Confirm Log Cleanup</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              This action will soft-delete matching activity logs. Continue?
            </p>
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {logCleanupMode === "olderThan" && `Delete logs older than ${logDaysToKeep} day(s).`}
              {logCleanupMode === "range" && `Delete logs from ${logDateFrom || "the beginning"} to ${logDateTo || "now"}.`}
              {logCleanupMode === "all" && "Delete all active activity logs."}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmLogCleanupOpen(false)}
                disabled={logCleanupPending}
                className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-strokedark dark:text-gray-300 dark:hover:bg-white/[0.03]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogCleanup}
                disabled={logCleanupPending}
                className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logCleanupPending ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;
