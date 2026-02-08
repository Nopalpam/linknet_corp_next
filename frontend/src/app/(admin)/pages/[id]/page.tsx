"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { pagesService, Page, UpdatePageData } from "@/services/pages.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import PageBuilderModal from "../components/PageBuilderModal";
import ComponentPreview from "../components/PageBuilder/ComponentPreview";

export default function EditPagePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const pageId = params.id as string;

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const [formData, setFormData] = useState<UpdatePageData>({
    title: "",
    slug: "",
    status: "DRAFT",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Track component count from loaded page
  const [componentCount, setComponentCount] = useState(0);

  // Fetch page data
  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        const response = await pagesService.getPageById(pageId);
        setPage(response.data);
        setFormData({
          title: response.data.title,
          slug: response.data.slug,
          status: response.data.status,
          metaTitle: response.data.metaTitle || "",
          metaDescription: response.data.metaDescription || "",
          metaKeywords: response.data.metaKeywords || "",
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
                          {page.components.slice(0, 5).map((comp, index) => (
                            <div
                              key={comp.id}
                              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <ComponentPreview 
                                type={comp.type} 
                                data={typeof comp.data === 'string' ? JSON.parse(comp.data) : comp.data}
                              />
                            </div>
                          ))}
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
          setIsBuilderOpen(false);
          // Refresh page data to update component count and preview
          pagesService.getPageById(pageId).then((response) => {
            setPage(response.data);
            setComponentCount(response.data.components?.length || 0);
          }).catch((error) => {
            console.error('Failed to refresh page data:', error);
          });
        }}
        pageId={pageId}
      />
    </>
  );
}
