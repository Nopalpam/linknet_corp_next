"use client";

import React, { useState, useEffect } from "react";
import { newsService, News, NewsCategory, CreateNewsData, UpdateNewsData } from "@/services/news.service";

interface NewsFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  news: News | null;
  categories: NewsCategory[];
}

export default function NewsFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  news,
  categories,
}: NewsFormModalProps) {
  const [formData, setFormData] = useState<CreateNewsData>({
    title_en: "",
    title_id: "",
    news_date: new Date().toISOString().split("T")[0],
    news_thumbnail: "",
    excerpt_en: "",
    excerpt_id: "",
    content_en: "",
    content_id: "",
    category_id: undefined,
    meta_keywords: "",
    custom_css: "",
    custom_js: "",
    status: "PUBLISHED",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "id">("en");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && news) {
        setFormData({
          title_en: news.title_en || "",
          title_id: news.title_id || "",
          news_date: news.news_date ? news.news_date.split("T")[0] : new Date().toISOString().split("T")[0],
          news_thumbnail: news.news_thumbnail || "",
          excerpt_en: news.excerpt_en || "",
          excerpt_id: news.excerpt_id || "",
          content_en: news.content_en || "",
          content_id: news.content_id || "",
          category_id: news.category_id || undefined,
          meta_keywords: news.meta_keywords || "",
          custom_css: news.custom_css || "",
          custom_js: news.custom_js || "",
          status: news.status ?? "PUBLISHED",
        });
      } else {
        setFormData({
          title_en: "",
          title_id: "",
          news_date: new Date().toISOString().split("T")[0],
          news_thumbnail: "",
          excerpt_en: "",
          excerpt_id: "",
          content_en: "",
          content_id: "",
          category_id: undefined,
          meta_keywords: "",
          custom_css: "",
          custom_js: "",
          status: "PUBLISHED",
        });
      }
      setError(null);
      setActiveTab("en");
    }
  }, [isOpen, mode, news]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_en.trim()) {
      setError("Title (English) is required");
      return;
    }
    if (!formData.content_en.trim()) {
      setError("Content (English) is required");
      return;
    }
    if (!formData.news_date) {
      setError("News date is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        await newsService.createNews(formData);
      } else if (news) {
        const updateData: UpdateNewsData = { ...formData };
        await newsService.updateNews(news.id, updateData);
      }
      onSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to save news");
      onSuccess(false, err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10" onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Add News" : "Edit News"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Date, Category, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                News Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
              value={formData.news_date}
              onChange={(e) => setFormData({ ...formData, news_date: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={formData.category_id || ""}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value || undefined })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- No Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name_en}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={formData.status ?? "PUBLISHED"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          {/* EN / ID Language Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "en"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("id")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "id"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              Indonesian
            </button>
          </div>

          {/* Content fields per language */}
          {activeTab === "en" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Title (EN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter English title"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt (EN)</label>
                <textarea
                  value={formData.excerpt_en || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Short summary..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content (EN) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter English content (supports HTML)"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Title (ID)</label>
                <input
                  type="text"
                  value={formData.title_id || ""}
                  onChange={(e) => setFormData({ ...formData, title_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter Indonesian title"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt (ID)</label>
                <textarea
                  value={formData.excerpt_id || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt_id: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Ringkasan singkat..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Content (ID)</label>
                <textarea
                  value={formData.content_id || ""}
                  onChange={(e) => setFormData({ ...formData, content_id: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Masukkan konten bahasa Indonesia (HTML)"
                />
              </div>
            </div>
          )}

          {/* Thumbnail */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail URL</label>
            <input
              type="text"
              value={formData.news_thumbnail || ""}
              onChange={(e) => setFormData({ ...formData, news_thumbnail: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="https://..."
            />
          </div>

          {/* Meta & Custom */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keyword</label>
            <input
              type="text"
              value={formData.meta_keywords || ""}
              onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="keyword1, keyword2"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
