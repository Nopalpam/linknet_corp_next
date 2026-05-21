"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  History,
  LayoutTemplate,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { pagesService, Page, PageHistoryLog, UpdatePageData } from "@/services/pages.service";
import { settingsService } from "@/services";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { PageBuilderModal } from "../components/PageBuilderV2";
import { normalizeComponentType, getLocalizedValue } from "../components/PageBuilderV2";
import MediaPathInput from "@/components/media/MediaPathInput";

type ContentTab = "content" | "settings";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

const selectClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const pageId = params.id as string;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState<ContentTab>("content");
  const [historyLogs, setHistoryLogs] = useState<PageHistoryLog[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyActionFilter, setHistoryActionFilter] = useState("ALL");
  const [historySortOrder, setHistorySortOrder] = useState<"newest" | "oldest">("newest");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage, setHistoryPerPage] = useState(10);
  const [componentCount, setComponentCount] = useState(0);
  const [previewBaseUrl, setPreviewBaseUrl] = useState("");
  const [previewPathTemplate, setPreviewPathTemplate] = useState("/pages/{slug}");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const [formData, setFormData] = useState<UpdatePageData>({
    title: "",
    titleEn: "",
    titleId: "",
    slug: "",
    status: "DRAFT",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    metaThumbnail: "",
    product: "",
    promo: "",
    source: "",
    noindex: false,
    nofollow: false,
    showNavbar: true,
    showFooter: true,
  });

  useEffect(() => {
    const fetchPreviewSettings = async () => {
      try {
        const response = await settingsService.getAllSettings("pages");
        const settings = response.data || [];
        const baseUrlSetting = settings.find((s) => s.key === "pages.preview.base_url" || s.key === "page_preview_base_url");
        const pathTemplateSetting = settings.find((s) => s.key === "pages.preview.path_template" || s.key === "page_preview_path_template");
        if (baseUrlSetting?.value) setPreviewBaseUrl(baseUrlSetting.value);
        if (pathTemplateSetting?.value) setPreviewPathTemplate(pathTemplateSetting.value);
      } catch {
        setPreviewBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
      }
    };

    fetchPreviewSettings();
  }, []);

  const fetchHistory = async () => {
    try {
      const historyResponse = await pagesService.getPageHistory(pageId, { page: 1, per_page: 100 });
      setHistoryLogs(historyResponse.data || []);
    } catch {
      setHistoryLogs([]);
    }
  };

  const refreshPage = async () => {
    const response = await pagesService.getPageById(pageId);
    setPage(response.data);
    setComponentCount(response.data.components?.length || 0);
    setFormData({
      title: response.data.title,
      titleEn: response.data.titleEn || response.data.title,
      titleId: response.data.titleId || "",
      slug: response.data.slug,
      status: response.data.status,
      metaTitle: response.data.metaTitle || "",
      metaDescription: response.data.metaDescription || "",
      metaKeywords: response.data.metaKeywords || "",
      metaThumbnail: response.data.metaThumbnail || "",
      product: response.data.product || "",
      promo: response.data.promo || "",
      source: response.data.source || "",
      noindex: response.data.noindex || false,
      nofollow: response.data.nofollow || false,
      showNavbar: response.data.showNavbar ?? true,
      showFooter: response.data.showFooter ?? true,
    });
  };

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        await Promise.all([refreshPage(), fetchHistory()]);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch page");
        router.push("/pages");
      } finally {
        setLoading(false);
      }
    };

    if (pageId) fetchPage();
  }, [pageId, router, toast]);

  const getPagePreviewUrl = (slug: string) => {
    const base = previewBaseUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const path = (previewPathTemplate || "/pages/{slug}").replace("{slug}", slug);
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

  const getUserName = (user?: PageHistoryLog["user"] | Page["updatedBy"] | Page["createdBy"]) => {
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

    return changedFields.length ? changedFields.slice(0, 6).join(", ") : log.description || `${log.action} page`;
  };

  const historyActionOptions = useMemo(
    () => Array.from(new Set(historyLogs.map((log) => log.action).filter(Boolean))).sort(),
    [historyLogs],
  );

  const filteredHistoryLogs = useMemo(() => {
    const search = historySearch.trim().toLowerCase();

    return historyLogs
      .filter((log) => {
        const matchesAction = historyActionFilter === "ALL" || log.action === historyActionFilter;
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

  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyActionFilter, historySortOrder, historyPerPage]);

  const isHistoryFiltered = historySearch.trim() !== "" || historyActionFilter !== "ALL" || historySortOrder !== "newest";
  const historyTotalPages = Math.max(1, Math.ceil(filteredHistoryLogs.length / historyPerPage));
  const historyStartItem = filteredHistoryLogs.length === 0 ? 0 : (historyPage - 1) * historyPerPage + 1;
  const historyEndItem = Math.min(historyPage * historyPerPage, filteredHistoryLogs.length);
  const paginatedHistoryLogs = filteredHistoryLogs.slice((historyPage - 1) * historyPerPage, historyPage * historyPerPage);

  const renderHistoryPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (historyTotalPages <= 7) {
      for (let i = 1; i <= historyTotalPages; i += 1) pages.push(i);
    } else {
      pages.push(1);
      if (historyPage > 3) pages.push("...");
      for (let i = Math.max(2, historyPage - 1); i <= Math.min(historyTotalPages - 1, historyPage + 1); i += 1) pages.push(i);
      if (historyPage < historyTotalPages - 2) pages.push("...");
      pages.push(historyTotalPages);
    }
    return pages;
  };

  const generateSlug = () => {
    const nextSlug = slugify(formData.titleEn || formData.title || "");
    setFormData((current) => ({ ...current, slug: nextSlug }));
    if (nextSlug) void checkSlug(nextSlug);
  };

  const normalizeSlug = () => {
    const nextSlug = slugify(formData.slug || "");
    setFormData((current) => ({ ...current, slug: nextSlug }));
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
      const response = await pagesService.checkSlug(normalized, pageId);
      setFormData((current) => ({ ...current, slug: response.data.slug }));
      setSlugStatus(response.data.available ? "available" : "taken");
    } catch (error: any) {
      setSlugStatus("idle");
      toast.error(error.message || "Failed to check slug");
    }
  };

  const savePage = async () => {
    const titleEn = (formData.titleEn || formData.title || "").trim();

    if (!titleEn) {
      toast.error("Title (EN) is required");
      return;
    }

    if (!formData.slug?.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (slugStatus === "taken") {
      toast.error("Slug is already registered");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        title: titleEn,
        titleEn,
        titleId: formData.titleId?.trim() || undefined,
        slug: slugify(formData.slug || titleEn),
      };
      const response = await pagesService.updatePage(pageId, payload);
      toast.success(response.message || "Page updated successfully");
      setPage(response.data);
      setFormData((prev) => ({ ...prev, ...payload, titleId: payload.titleId || "" }));
      await fetchHistory();
    } catch (error: any) {
      toast.error(error.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    savePage();
  };

  const handleDeletePage = async () => {
    try {
      setDeleting(true);
      const response = await pagesService.deletePage(pageId);
      toast.success(response.message || "Page deleted successfully");
      router.push("/pages");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete page");
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadCrumb pageTitle="Loading..." />
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <p className="text-gray-600 dark:text-gray-400">Loading page...</p>
          </div>
        </div>
      </>
    );
  }

  if (!page) return null;

  return (
    <>
      <PageBreadCrumb pageTitle={`Edit: ${formData.titleEn || page.title}`} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <form onSubmit={handleUpdateSubmit} className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-6 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Page Settings</h2>
            </div>

            <section className="border-b border-gray-200 p-6 dark:border-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-brand-600" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Main Setting</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="titleEn" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title (EN)
                  </label>
                  <input
                    id="titleEn"
                    type="text"
                    value={formData.titleEn || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        titleEn: e.target.value,
                      })
                    }
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="titleId" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title (ID)
                  </label>
                  <input
                    id="titleId"
                    type="text"
                    value={formData.titleId || ""}
                    onChange={(e) => setFormData({ ...formData, titleId: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="slug" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => {
                        setFormData({ ...formData, slug: e.target.value });
                        setSlugStatus("idle");
                      }}
                      onBlur={normalizeSlug}
                      className={inputClass}
                      placeholder="page-slug"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateSlug}
                      className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Generate Slug
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className={slugStatus === "available" ? "text-green-600" : slugStatus === "taken" ? "text-red-600" : ""}>
                      {slugStatus === "checking" && "Checking slug..."}
                      {slugStatus === "available" && "Slug is available"}
                      {slugStatus === "taken" && "Slug is already registered"}
                      {slugStatus === "idle" && "Use lowercase letters, numbers, and hyphens."}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section className="p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-brand-600" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Content</h3>
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("content")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      activeContentTab === "content"
                        ? "bg-white text-brand-700 shadow-sm dark:bg-gray-900 dark:text-brand-300"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Page Content
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveContentTab("settings")}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                      activeContentTab === "settings"
                        ? "bg-white text-brand-700 shadow-sm dark:bg-gray-900 dark:text-brand-300"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    Page Setting
                  </button>
                </div>
              </div>

              {activeContentTab === "content" ? (
                <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">Page Content</h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {componentCount > 0
                          ? `${componentCount} component${componentCount !== 1 ? "s" : ""} connected to this page.`
                          : "No content components yet."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={getPagePreviewUrl(formData.slug || "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        View Page
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsBuilderOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                      >
                        <Pencil className="h-4 w-4" />
                        Open Page Builder
                      </button>
                    </div>
                  </div>

                  {page.components && page.components.length > 0 ? (
                    <div className="space-y-2">
                      {page.components.slice(0, 6).map((component) => {
                        const settings = typeof component.data === "string" ? JSON.parse(component.data) : component.data;
                        const title = settings?.title ? getLocalizedValue(settings.title) : "";
                        return (
                          <div key={component.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium capitalize text-gray-900 dark:text-white">
                                {normalizeComponentType(component.type) || component.type}
                              </p>
                              {title && <p className="truncate text-xs text-gray-500 dark:text-gray-400">{title}</p>}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">#{component.order + 1}</span>
                          </div>
                        );
                      })}
                      {page.components.length > 6 && (
                        <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                          + {page.components.length - 6} more component{page.components.length - 6 !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg bg-gray-50 px-4 py-10 text-center dark:bg-gray-800">
                      <LayoutTemplate className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">No Content Yet</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                    <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">SEO</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="metaTitle" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Meta Title
                        </label>
                        <input
                          id="metaTitle"
                          type="text"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="metaDescription" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Meta Description
                        </label>
                        <textarea
                          id="metaDescription"
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          rows={4}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="metaKeywords" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Meta Keywords
                        </label>
                        <input
                          id="metaKeywords"
                          type="text"
                          value={formData.metaKeywords}
                          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="metaThumbnail" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Meta Thumbnail
                        </label>
                        <MediaPathInput
                          id="metaThumbnail"
                          value={formData.metaThumbnail || ""}
                          onChange={(value) => setFormData({ ...formData, metaThumbnail: value })}
                          inputClassName={inputClass}
                          placeholder="/uploads/seo/thumbnail.jpg"
                          buttonLabel="Choose Meta Thumbnail from File Manager"
                          pickerTitle="Choose Meta Thumbnail"
                        />
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <Checkbox
                          label="noindex"
                          checked={Boolean(formData.noindex)}
                          onChange={(checked) => setFormData({ ...formData, noindex: checked })}
                        />
                        <Checkbox
                          label="nofollow"
                          checked={Boolean(formData.nofollow)}
                          onChange={(checked) => setFormData({ ...formData, nofollow: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
                    <h4 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Page Context</h4>
                    <div className="space-y-4">
                      <TextInput label="Product" id="product" value={formData.product || ""} onChange={(value) => setFormData({ ...formData, product: value })} />
                      <TextInput label="Promo" id="promo" value={formData.promo || ""} onChange={(value) => setFormData({ ...formData, promo: value })} />
                      <TextInput label="Source" id="source" value={formData.source || ""} onChange={(value) => setFormData({ ...formData, source: value })} />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </form>

          <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-6 dark:border-gray-800">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <History className="h-5 w-5 text-brand-600" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pages History</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Table History Logs</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredHistoryLogs.length === 0 ? "No logs" : `Showing ${historyStartItem}-${historyEndItem} of ${filteredHistoryLogs.length}`}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px_auto]">
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search history logs..."
                  className={inputClass}
                />
                <select value={historyActionFilter} onChange={(e) => setHistoryActionFilter(e.target.value)} className={selectClass}>
                  <option value="ALL">All Actions</option>
                  {historyActionOptions.map((action) => (
                    <option key={action} value={action}>
                      {action}
                    </option>
                  ))}
                </select>
                <select value={historySortOrder} onChange={(e) => setHistorySortOrder(e.target.value as "newest" | "oldest")} className={selectClass}>
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
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
                <select value={historyPerPage} onChange={(e) => setHistoryPerPage(Number(e.target.value))} className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["Action", "User", "Date", "Changes"].map((label) => (
                      <th key={label} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                  {historyLogs.length === 0 ? (
                    <HistoryEmptyRow message="No activity logs found for this page yet." />
                  ) : filteredHistoryLogs.length === 0 ? (
                    <HistoryEmptyRow message="No logs match your filters." />
                  ) : (
                    paginatedHistoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getUserName(log.user)}</td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDateTime(log.createdAt)}</td>
                        <td className="min-w-[260px] px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{summarizeChanges(log)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredHistoryLogs.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 dark:border-gray-800 sm:flex-row">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-700 dark:text-gray-200">{historyStartItem}-{historyEndItem}</span> of{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-200">{filteredHistoryLogs.length}</span> logs
                </p>
                <div className="flex items-center gap-1">
                  <PaginationButton disabled={historyPage === 1} onClick={() => setHistoryPage((value) => Math.max(1, value - 1))}>
                    Previous
                  </PaginationButton>
                  {renderHistoryPageNumbers().map((item, index) =>
                    item === "..." ? (
                      <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setHistoryPage(item)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium ${
                          item === historyPage
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <PaginationButton disabled={historyPage === historyTotalPages} onClick={() => setHistoryPage((value) => Math.min(historyTotalPages, value + 1))}>
                    Next
                  </PaginationButton>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Information</h3>
            </div>

            <div className="space-y-5 p-5">
              <InfoBlock title="Created Information">
                <InfoRow label="Created by" value={getUserName(page.createdBy)} />
                <InfoRow label="Created at" value={formatDateTime(page.createdAt)} />
              </InfoBlock>

              <InfoBlock title="Updated Information">
                <InfoRow label="Updated by" value={getUserName(page.updatedBy)} />
                <InfoRow label="Updated at" value={formatDateTime(page.updatedAt)} />
              </InfoBlock>

              <InfoBlock title="Status">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "DRAFT" | "PUBLISHED" })}
                  className={selectClass}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Publish</option>
                </select>
              </InfoBlock>

              <InfoBlock title="Setting">
                <ToggleRow
                  label="Navbar"
                  checked={formData.showNavbar ?? true}
                  onChange={(checked) => setFormData({ ...formData, showNavbar: checked })}
                />
                <ToggleRow
                  label="Footer"
                  checked={formData.showFooter ?? true}
                  onChange={(checked) => setFormData({ ...formData, showFooter: checked })}
                />
              </InfoBlock>

              <div className="space-y-3 border-t border-gray-200 pt-5 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => savePage()}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Updating..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={deleting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePage}
        title={formData.titleEn || page.title}
      />

      <PageBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => {
          setIsBuilderOpen(false);
          refreshPage().catch(() => toast.error("Failed to refresh page data"));
        }}
        pageId={pageId}
      />
    </>
  );
}

function TextInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input id={id} type="text" value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
      />
      {label}
    </label>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
      <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {checked ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
        {label}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
      />
    </label>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
        <Clock className="h-4 w-4 text-brand-600" />
        {title}
      </h4>
      <div className="space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-right font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function HistoryEmptyRow({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
        {message}
      </td>
    </tr>
  );
}

function PaginationButton({ children, disabled, onClick }: { children: React.ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 px-3 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      {children}
    </button>
  );
}
