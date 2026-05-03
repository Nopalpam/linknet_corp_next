"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CKEditorWrapper from "@/components/ui/ckeditor/CKEditorWrapper";
import { newsCategoryService, newsService, CreateNewsData, News, NewsCategory, UpdateNewsData } from "@/services/news.service";
import { settingsService } from "@/services/settings.service";
import { useToast } from "@/context/ToastContext";

type Mode = "create" | "edit";

interface NewsFormPageProps {
  mode: Mode;
  newsId?: string;
}

const emptyForm: CreateNewsData = {
  title_en: "",
  title_id: "",
  slug: "",
  news_date: new Date().toISOString().slice(0, 10),
  news_thumbnail: "",
  excerpt_en: "",
  excerpt_id: "",
  content_en: "",
  content_id: "",
  category_id: undefined,
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  status: "DRAFT",
  visibility: "PUBLIC",
  published_at: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDateTimeInTimeZone(value: Date | string, timeZone: string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function formatDisplayDateTime(value: string | null | undefined, timeZone: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function toDateOnly(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return value.includes("T") ? value.split("T")[0] : value;
}

export default function NewsFormPage({ mode, newsId }: NewsFormPageProps) {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState<CreateNewsData>(emptyForm);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "seo">("main");
  const [contentLocale, setContentLocale] = useState<"en" | "id">("en");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [timezone, setTimezone] = useState("Asia/Jakarta");

  useEffect(() => {
    newsCategoryService
      .getActiveCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    settingsService
      .getPublicSettings()
      .then((res) => {
        const nextTimezone = res.data?.timezone || "Asia/Jakarta";
        if (!cancelled) setTimezone(nextTimezone);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "create") return;
    setFormData((current) => ({
      ...current,
      published_at: current.published_at || formatDateTimeInTimeZone(new Date(), timezone),
      news_date: current.news_date || formatDateTimeInTimeZone(new Date(), timezone).slice(0, 10),
    }));
  }, [mode, timezone]);

  useEffect(() => {
    if (mode !== "edit" || !newsId) return;

    let cancelled = false;
    setLoading(true);
    newsService
      .getById(newsId)
      .then((res) => {
        if (cancelled) return;
        const item = res.data;
        setNews(item);
        setFormData({
          title_en: item.title_en || "",
          title_id: item.title_id || "",
          slug: item.slug || "",
          news_date: toDateOnly(item.news_date),
          news_thumbnail: item.news_thumbnail || "",
          excerpt_en: item.excerpt_en || "",
          excerpt_id: item.excerpt_id || "",
          content_en: item.content_en || "",
          content_id: item.content_id || "",
          category_id: item.category_id || undefined,
          meta_title: item.meta_title || "",
          meta_description: item.meta_description || item.meta_desc || "",
          meta_keywords: item.meta_keywords || "",
          status: item.status || "DRAFT",
          visibility: item.visibility || "PUBLIC",
          published_at: formatDateTimeInTimeZone(item.published_at || item.news_date, timezone),
        });
      })
      .catch((err) => {
        const message = err.message || "Failed to load news";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, newsId, timezone, toast]);

  const pageTitle = mode === "create" ? "Create News" : "Edit News";
  const metaPreview = useMemo(
    () => ({
      title: formData.meta_title?.trim() || formData.title_en.trim(),
      description: formData.meta_description?.trim() || formData.excerpt_en?.trim() || "",
    }),
    [formData]
  );

  const updateField = <K extends keyof CreateNewsData>(key: K, value: CreateNewsData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    if (key === "slug") setSlugStatus("idle");
  };

  const generateSlug = () => {
    const nextSlug = slugify(formData.title_en);
    updateField("slug", nextSlug);
    if (nextSlug) void checkSlug(nextSlug);
  };

  const checkSlug = async (slugValue = formData.slug || "") => {
    const normalized = slugify(slugValue);
    if (!normalized) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    try {
      const res = await newsService.checkSlug(normalized, mode === "edit" ? newsId : undefined);
      setFormData((current) => ({ ...current, slug: res.data.slug }));
      setSlugStatus(res.data.available ? "available" : "taken");
    } catch (err: any) {
      setSlugStatus("idle");
      toast.error(err.message || "Failed to check slug");
    }
  };

  const validate = () => {
    if (!formData.title_en.trim()) return "Title (EN) is required";
    if (!formData.slug?.trim()) return "Slug is required";
    if (slugStatus === "taken") return "Slug is already registered";
    if (!formData.content_en.trim()) return "Content (EN) is required";
    if (!formData.category_id) return "Category is required";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const payload: CreateNewsData | UpdateNewsData = {
      ...formData,
      slug: slugify(formData.slug || formData.title_en),
      meta_title: formData.meta_title?.trim() || formData.title_en.trim(),
      meta_description: formData.meta_description?.trim() || formData.excerpt_en?.trim() || "",
      published_at: formData.published_at || null,
      news_date: formData.published_at ? formData.published_at.slice(0, 10) : formData.news_date,
    };

    try {
      if (mode === "create") {
        const response = await newsService.createNews(payload as CreateNewsData);
        toast.success("News created successfully");
        router.replace(`/cms/news/edit/${response.data.id}`);
      } else if (newsId) {
        const response = await newsService.updateNews(newsId, payload as UpdateNewsData);
        setNews(response.data);
        toast.success("News updated successfully");
        router.refresh();
      }
    } catch (err: any) {
      const message = err.message || "Failed to save news";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!newsId || !news) return;
    if (!window.confirm(`Delete "${news.title_en}"?`)) return;

    try {
      await newsService.delete(newsId);
      toast.success("News deleted successfully");
      router.push("/news/data");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete news");
    }
  };

  if (loading) {
    return <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-900">Loading news...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage multilingual content and SEO data.</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
            {(["main", "seo"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "main" ? "Main Content" : "SEO"}
              </button>
            ))}
          </div>

          {activeTab === "main" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput label="Title (EN)" required value={formData.title_en} onChange={(value) => updateField("title_en", value)} />
                <TextInput label="Title (ID)" value={formData.title_id || ""} onChange={(value) => updateField("title_id", value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2 md:flex-row">
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => updateField("slug", e.target.value)}
                    onBlur={() => checkSlug()}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="article-slug"
                  />
                  <button type="button" onClick={generateSlug} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    Generate Slug
                  </button>
                </div>
                <p className={`mt-1 text-xs ${slugStatus === "available" ? "text-green-600" : slugStatus === "taken" ? "text-red-600" : "text-gray-500"}`}>
                  {slugStatus === "checking" && "Checking slug..."}
                  {slugStatus === "available" && "Slug is available"}
                  {slugStatus === "taken" && "Slug is already registered"}
                  {slugStatus === "idle" && "Use lowercase letters, numbers, and hyphens."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextArea label="Excerpt (EN)" value={formData.excerpt_en || ""} onChange={(value) => updateField("excerpt_en", value)} />
                <TextArea label="Excerpt (ID)" value={formData.excerpt_id || ""} onChange={(value) => updateField("excerpt_id", value)} />
              </div>

              <TextInput label="Thumbnail URL" value={formData.news_thumbnail || ""} onChange={(value) => updateField("news_thumbnail", value)} />

              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {(["en", "id"] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setContentLocale(locale)}
                    className={`px-4 py-2 text-sm font-medium ${
                      contentLocale === locale ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Content ({locale.toUpperCase()})
                  </button>
                ))}
              </div>

              {contentLocale === "en" ? (
                <CKEditorWrapper
                  key="content-editor-en"
                  label="Content (EN)"
                  value={formData.content_en}
                  onChange={(value) => updateField("content_en", value)}
                  minHeight="320px"
                />
              ) : (
                <CKEditorWrapper
                  key="content-editor-id"
                  label="Content (ID)"
                  value={formData.content_id || ""}
                  onChange={(value) => updateField("content_id", value)}
                  minHeight="320px"
                />
              )}
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-5">
              <TextInput label="Meta Title" value={formData.meta_title || ""} onChange={(value) => updateField("meta_title", value)} placeholder={formData.title_en || "Fallback from Title"} />
              <TextArea label="Meta Description" value={formData.meta_description || ""} onChange={(value) => updateField("meta_description", value)} placeholder={formData.excerpt_en || "Fallback from Excerpt"} rows={4} />
              <TextInput label="Meta Keyword" value={formData.meta_keywords || ""} onChange={(value) => updateField("meta_keywords", value)} placeholder="keyword1, keyword2" />
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs font-semibold uppercase text-gray-500">SEO Preview</p>
                <p className="mt-2 text-base font-semibold text-blue-700">{metaPreview.title || "Meta title preview"}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{metaPreview.description || "Meta description preview"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <SideCard title="Setting">
          <SelectInput label="Category" required value={formData.category_id || ""} onChange={(value) => updateField("category_id", value || undefined)}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name_en}</option>
            ))}
          </SelectInput>
          <ReadonlyMeta label="Created" value={news?.created_at ? formatDisplayDateTime(news.created_at, timezone) : "-"} />
          <ReadonlyMeta label="Updated" value={news?.updated_at ? formatDisplayDateTime(news.updated_at, timezone) : "-"} />
        </SideCard>

        <SideCard title="Scheduling & Status">
          <SelectInput label="Status" value={formData.status || "DRAFT"} onChange={(value) => updateField("status", value)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Publish</option>
          </SelectInput>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduling Date & Time</label>
            <input
              type="datetime-local"
              value={formData.published_at || ""}
              onChange={(e) => updateField("published_at", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Timezone: {timezone}</p>
          </div>
          <SelectInput label="Visibility" value={formData.visibility || "PUBLIC"} onChange={(value) => updateField("visibility", value)}>
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
          </SelectInput>
        </SideCard>

        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
          <div className="flex flex-col gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : mode === "create" ? "Submit" : "Update"}
            </button>
            {mode === "edit" && (
              <button type="button" onClick={handleDelete} className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                Delete
              </button>
            )}
            <button type="button" onClick={() => router.push("/news/data")} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TextInput({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function SelectInput({ label, value, onChange, children, required }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        {children}
      </select>
    </div>
  );
}

function ReadonlyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}
