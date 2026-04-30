"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { pagesService, Page, PageHistoryLog, UpdatePageData } from "@/services/pages.service";
import { settingsService } from "@/services";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { PageBuilderModal } from "../components/PageBuilderV2";
import { HeroRenderer, PricingRenderer, normalizeComponentType, getLocalizedValue } from "../components/PageBuilderV2";

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const pageId = params.id as string;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState<PageHistoryLog[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyActionFilter, setHistoryActionFilter] = useState("ALL");
  const [historySortOrder, setHistorySortOrder] = useState<"newest" | "oldest">("newest");

  const [formData, setFormData] = useState<UpdatePageData>({
    title: "",
    slug: "",
    status: "DRAFT",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    product: "",
    promo: "",
    source: "",
    noindex: false,
    nofollow: false,
  });

  // Track component count from loaded page
  const [componentCount, setComponentCount] = useState(0);

  // Page preview URL settings (from CMS Settings)
  const [previewBaseUrl, setPreviewBaseUrl] = useState<string>("");
  const [previewPathTemplate, setPreviewPathTemplate] = useState<string>("/pages/{slug}");

  // Fetch page preview settings
  useEffect(() => {
    const fetchPreviewSettings = async () => {
      try {
        const response = await settingsService.getAllSettings("pages");
        const settings = response.data || [];
        const baseUrlSetting = settings.find((s) => s.key === "page_preview_base_url");
        const pathTemplateSetting = settings.find((s) => s.key === "page_preview_path_template");
        if (baseUrlSetting?.value) setPreviewBaseUrl(baseUrlSetting.value);
        if (pathTemplateSetting?.value) setPreviewPathTemplate(pathTemplateSetting.value);
      } catch {
        setPreviewBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
      }
    };
    fetchPreviewSettings();
  }, []);

  const getPagePreviewUrl = (slug: string): string => {
    const base = previewBaseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const pathTemplate = previewPathTemplate || "/pages/{slug}";
    const path = pathTemplate.replace("{slug}", slug);
    return `${base.replace(/\/+$/, "")}${path}`;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserName = (user?: PageHistoryLog["user"] | Page["updatedBy"]) => {
    if (!user) return "System";
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return fullName || user.username || user.email || "System";
  };

  const summarizeChanges = (log: PageHistoryLog) => {
    if (!log.oldData || !log.newData) {
      return log.description || `${log.action} page`;
    }

    const ignored = new Set(["updatedAt", "createdAt", "components", "_count"]);
    const changedFields = Object.keys(log.newData)
      .filter((key) => !ignored.has(key))
      .filter((key) => JSON.stringify(log.oldData?.[key]) !== JSON.stringify(log.newData?.[key]));

    if (changedFields.length === 0) {
      return log.description || `${log.action} page`;
    }

    return changedFields.slice(0, 6).join(", ");
  };

  const historyActionOptions = React.useMemo(
    () => Array.from(new Set(historyLogs.map((log) => log.action).filter(Boolean))).sort(),
    [historyLogs]
  );

  const filteredHistoryLogs = React.useMemo(() => {
    const search = historySearch.trim().toLowerCase();

    return historyLogs
      .filter((log) => {
        const matchesAction =
          historyActionFilter === "ALL" || log.action === historyActionFilter;

        if (!search) return matchesAction;

        const searchableText = [
          log.action,
          getUserName(log.user),
          formatDateTime(log.createdAt),
          summarizeChanges(log),
          log.description || "",
        ]
          .join(" ")
          .toLowerCase();

        return matchesAction && searchableText.includes(search);
      })
      .sort((a, b) => {
        const first = new Date(a.createdAt).getTime();
        const second = new Date(b.createdAt).getTime();
        return historySortOrder === "newest" ? second - first : first - second;
      });
  }, [historyLogs, historySearch, historyActionFilter, historySortOrder]);

  const isHistoryFiltered =
    historySearch.trim() !== "" ||
    historyActionFilter !== "ALL" ||
    historySortOrder !== "newest";

  // Fetch page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const [response, historyResponse] = await Promise.all([
          pagesService.getPageById(pageId),
          pagesService.getPageHistory(pageId).catch(() => ({ data: [] })),
        ]);
        setPage(response.data);
        setHistoryLogs(historyResponse.data || []);
        setFormData({
          title: response.data.title,
          slug: response.data.slug,
          status: response.data.status,
          metaTitle: response.data.metaTitle || "",
          metaDescription: response.data.metaDescription || "",
          metaKeywords: response.data.metaKeywords || "",
          product: response.data.product || "",
          promo: response.data.promo || "",
          source: response.data.source || "",
          noindex: response.data.noindex || false,
          nofollow: response.data.nofollow || false,
        });
        // Track component count from relation
        setComponentCount(response.data.components?.length || 0);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch page");
        router.push("/pages");
      } finally {
        setLoading(false);
      }
    };

    if (pageId) {
      fetchPage();
    }
  }, [pageId, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      setSaving(true);
      const response = await pagesService.updatePage(pageId, formData);
      toast.success(response.message || "Page updated successfully");
      setPage(response.data);
      pagesService.getPageHistory(pageId)
        .then((historyResponse) => setHistoryLogs(historyResponse.data || []))
        .catch(() => setHistoryLogs([]));
    } catch (error: any) {
      toast.error(error.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadCrumb pageTitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
          </div>
        </div>
      </>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <>
      <PageBreadCrumb pageTitle={`Edit: ${page.title}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Page Content
                </h2>
                <div className="flex gap-3">
                  <a
                    href={getPagePreviewUrl(formData.slug || "")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Page
                  </a>
                <button
                  onClick={() => setIsBuilderOpen(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Open Page Builder
                </button>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                      />
                    </svg>
                  </div>
                  {componentCount > 0 ? (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {componentCount} Component{componentCount !== 1 ? 's' : ''}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                        This page has {componentCount} component{componentCount !== 1 ? 's' : ''}.
                        Click &ldquo;Open Page Builder&rdquo; to edit.
                      </p>
                      
                      {/* Component Preview List */}
                      {page.components && page.components.length > 0 && (
                        <div className="mt-6 space-y-2 text-left">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                            Components Preview
                          </h4>
                          {page.components.slice(0, 5).map((comp, index) => {
                            const normalizedType = normalizeComponentType(comp.type);
                            const settings = typeof comp.data === 'string' ? JSON.parse(comp.data) : comp.data;
                            
                            return (
                              <div
                                key={comp.id}
                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                                    {normalizedType || comp.type}
                                  </span>
                                  {settings.title && (
                                    <span className="text-xs text-gray-500 truncate">
                                      - {getLocalizedValue(settings.title)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {page.components.length > 5 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center pt-2">
                              + {page.components.length - 5} more component{page.components.length - 5 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No Content Yet
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Click &ldquo;Open Page Builder&rdquo; to start building your page with
                        drag-and-drop components.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-6 dark:border-gray-800">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Pages History Logs
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Track recent updates, users, and changed fields for this page.
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredHistoryLogs.length} of {historyLogs.length}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_auto]">
                <div className="relative">
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history logs..."
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <select
                  value={historyActionFilter}
                  onChange={(e) => setHistoryActionFilter(e.target.value)}
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="ALL">All Actions</option>
                  {historyActionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>

                <select
                  value={historySortOrder}
                  onChange={(e) =>
                    setHistorySortOrder(e.target.value as "newest" | "oldest")
                  }
                  className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setHistorySearch("");
                    setHistoryActionFilter("ALL");
                    setHistorySortOrder("newest");
                  }}
                  disabled={!isHistoryFiltered}
                  className="h-10 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Changes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {historyLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No activity logs found for this page yet.
                      </td>
                    </tr>
                  ) : filteredHistoryLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No logs match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {getUserName(log.user)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td className="min-w-[260px] px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {summarizeChanges(log)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page Settings - Right */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 sticky top-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Page Settings
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                {/* Meta Title */}
                <div>
                  <label
                    htmlFor="metaTitle"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, metaTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label
                    htmlFor="metaDescription"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaDescription: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                {/* Meta Keywords */}
                <div>
                  <label
                    htmlFor="metaKeywords"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        metaKeywords: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Page Context
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="product"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Product
                      </label>
                      <input
                        type="text"
                        id="product"
                        value={formData.product}
                        onChange={(e) =>
                          setFormData({ ...formData, product: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="promo"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Promo
                      </label>
                      <input
                        type="text"
                        id="promo"
                        value={formData.promo}
                        onChange={(e) =>
                          setFormData({ ...formData, promo: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="source"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Source
                      </label>
                      <input
                        type="text"
                        id="source"
                        value={formData.source}
                        onChange={(e) =>
                          setFormData({ ...formData, source: e.target.value })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                    SEO Robots
                  </h4>
                  <label className="mb-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.noindex)}
                      onChange={(e) =>
                        setFormData({ ...formData, noindex: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    noindex
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.nofollow)}
                      onChange={(e) =>
                        setFormData({ ...formData, nofollow: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    nofollow
                  </label>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <div className="mb-2">
                    <span className="font-semibold">Last Updated:</span>{" "}
                    {formatDateTime(page.updatedAt)}
                  </div>
                  <div>
                    <span className="font-semibold">Updated By:</span>{" "}
                    {getUserName(page.updatedBy)}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {/* Back Button */}
                <button
                  type="button"
                  onClick={() => router.push("/pages")}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Back to Pages
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Page Builder Modal */}
      <PageBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          console.log('🔄 Page Builder closed, refreshing page data...');
          setIsBuilderOpen(false);
          
          // Refresh page data to update component count and preview
          pagesService.getPageById(pageId)
            .then((response) => {
              console.log('✅ Page data refreshed:', {
                componentCount: response.data.components?.length || 0,
                components: response.data.components
              });
              setPage(response.data);
              setComponentCount(response.data.components?.length || 0);
            })
            .catch((error) => {
              console.error('❌ Failed to refresh page data:', error);
              toast.error('Failed to refresh page data');
            });
        }}
        pageId={pageId}
      />
    </>
  );
}
