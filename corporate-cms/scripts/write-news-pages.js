// Write all frontend news pages for CMS
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'src', 'app', '(admin)', 'news');

// ==================================
// 1. CATEGORY PAGE
// ==================================
const categoryPage = `"use client";

import React, { useState, useEffect, useCallback } from "react";
import { newsCategoryService, NewsCategory } from "@/services/news.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import NewsCategoryTable from "./components/NewsCategoryTable";
import NewsCategoryFormModal from "./components/NewsCategoryFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function NewsCategoryPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        sortBy: "dataOrder",
        sortOrder: "asc",
      };

      if (filterStatus === "ACTIVE") params.dataStatus = 1;
      else if (filterStatus === "INACTIVE") params.dataStatus = 0;

      const response = await newsCategoryService.getPaginated(params);

      setCategories(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch categories";
      setError(errorMsg);
      setCategories([]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleCreate = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (category: NewsCategory) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDelete = (category: NewsCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (category: NewsCategory) => {
    try {
      await newsCategoryService.toggleStatus(category.id);
      toast.success("Status updated");
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(
        message || (formMode === "create" ? "Category created successfully" : "Category updated successfully")
      );
      await fetchCategories();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    try {
      await newsCategoryService.delete(selectedCategory.id);
      toast.success("Category deleted successfully");
      setIsDeleteModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="News Category" />

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              News Category
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage news categories ({totalItems} total)
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <NewsCategoryTable
          categories={categories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <NewsCategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        category={selectedCategory}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={selectedCategory?.categoryName || ""}
      />
    </div>
  );
}
`;

// ==================================
// 2. CATEGORY TABLE COMPONENT
// ==================================
const categoryTable = `"use client";

import React from "react";
import { NewsCategory } from "@/services/news.service";

interface NewsCategoryTableProps {
  categories: NewsCategory[];
  loading: boolean;
  onEdit: (category: NewsCategory) => void;
  onDelete: (category: NewsCategory) => void;
  onToggleStatus: (category: NewsCategory) => void;
}

export default function NewsCategoryTable({
  categories,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
}: NewsCategoryTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <svg className="mb-4 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium">No categories found</p>
        <p className="text-sm">Create a new category to get started</p>
      </div>
    );
  }

  const statusLabel = (s: number) => {
    if (s === 2) return { text: "Reserved", cls: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" };
    if (s === 1) return { text: "Active", cls: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
    return { text: "Inactive", cls: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-700">
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Order</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Category Name</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Slug</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">News Count</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map((category) => {
            const st = statusLabel(category.dataStatus);
            const isReserved = category.dataStatus === 2;
            return (
              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {category.dataOrder ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.categoryName}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    {category.slug}
                  </code>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {category._count?.news || 0}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium \${st.cls}\`}>
                    {st.text}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    {!isReserved && (
                      <button
                        onClick={() => onToggleStatus(category)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-800"
                        title={category.dataStatus === 1 ? "Deactivate" : "Activate"}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(category)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {!isReserved && (
                      <button
                        onClick={() => onDelete(category)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
                        title="Delete"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
`;

// ==================================
// 3. CATEGORY FORM MODAL
// ==================================
const categoryFormModal = `"use client";

import React, { useState, useEffect } from "react";
import { newsCategoryService, NewsCategory, CreateNewsCategoryData } from "@/services/news.service";

interface NewsCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  category: NewsCategory | null;
}

export default function NewsCategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  category,
}: NewsCategoryFormModalProps) {
  const [formData, setFormData] = useState<CreateNewsCategoryData>({
    categoryName: "",
    slug: "",
    dataOrder: 0,
    dataStatus: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && category) {
        setFormData({
          categoryName: category.categoryName,
          slug: category.slug || "",
          dataOrder: category.dataOrder || 0,
          dataStatus: category.dataStatus,
        });
      } else {
        setFormData({
          categoryName: "",
          slug: "",
          dataOrder: 0,
          dataStatus: 1,
        });
      }
      setError(null);
    }
  }, [isOpen, mode, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === "create") {
        await newsCategoryService.create(formData as any);
      } else if (category) {
        await newsCategoryService.update(category.id, formData as any);
      }
      onSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to save category");
      onSuccess(false, err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Add Category" : "Edit Category"}
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Enter category name"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Slug (auto-generated if empty)
            </label>
            <input
              type="text"
              value={formData.slug || ""}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="e.g. my-category"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Order
              </label>
              <input
                type="number"
                value={formData.dataOrder || 0}
                onChange={(e) => setFormData({ ...formData, dataOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                min={0}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                value={formData.dataStatus ?? 1}
                onChange={(e) => setFormData({ ...formData, dataStatus: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
`;

// ==================================
// 4. DELETE CONFIRM MODAL (Category)
// ==================================
const catDeleteModal = `"use client";

import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Category</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>&ldquo;{title}&rdquo;</strong>? News in this category will be moved to &ldquo;Uncategorized&rdquo;.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
`;

// ==================================
// 5. NEWS DATA PAGE
// ==================================
const newsDataPage = `"use client";

import React, { useState, useEffect, useCallback } from "react";
import { newsService, newsCategoryService, News, NewsCategory } from "@/services/news.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import NewsTable from "./components/NewsTable";
import NewsFormModal from "./components/NewsFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function NewsDataPage() {
  const toast = useToast();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch categories for filter/dropdown
  useEffect(() => {
    newsCategoryService
      .getActiveCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch news
  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        sortBy: "newsDate",
        sortOrder: "desc",
      };

      if (filterStatus === "ACTIVE") params.dataStatus = 1;
      else if (filterStatus === "INACTIVE") params.dataStatus = 0;

      if (filterCategory !== "ALL") params.idCategory = parseInt(filterCategory, 10);

      const response = await newsService.getPaginated(params);

      setNewsList(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err: any) {
      const errorMsg = err.message || "Failed to fetch news";
      setError(errorMsg);
      setNewsList([]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus, filterCategory, toast]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterCategory]);

  const handleCreate = () => {
    setFormMode("create");
    setSelectedNews(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (news: News) => {
    setFormMode("edit");
    setSelectedNews(news);
    setIsFormModalOpen(true);
  };

  const handleDelete = (news: News) => {
    setSelectedNews(news);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(message || (formMode === "create" ? "News created" : "News updated"));
      await fetchNews();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedNews) return;
    try {
      await newsService.delete(selectedNews.id);
      toast.success("News deleted successfully");
      setIsDeleteModalOpen(false);
      await fetchNews();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete news");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="News Data" />

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Data</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage news articles ({totalItems} total)
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add News
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.categoryName}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <NewsTable
          news={newsList}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <NewsFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        news={selectedNews}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={selectedNews?.titleEn || ""}
      />
    </div>
  );
}
`;

// ==================================
// 6. NEWS TABLE COMPONENT
// ==================================
const newsTable = `"use client";

import React from "react";
import { News } from "@/services/news.service";

interface NewsTableProps {
  news: News[];
  loading: boolean;
  onEdit: (news: News) => void;
  onDelete: (news: News) => void;
}

export default function NewsTable({ news, loading, onEdit, onDelete }: NewsTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No news found</p>
        <p className="text-sm">Create a new article to get started</p>
      </div>
    );
  }

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-700">
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Title</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Category</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Views</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {news.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="max-w-xs px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.newsThumbnail && (
                    <img
                      src={item.newsThumbnail}
                      alt=""
                      className="h-10 w-10 rounded object-cover"
                    />
                  )}
                  <div className="truncate">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {item.titleEn}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                      /{item.slug}
                    </p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {item.category?.categoryName || "Uncategorized"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(item.newsDate)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {item.viewCount || 0}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span
                  className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium \${
                    item.dataStatus === 1
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }\`}
                >
                  {item.dataStatus === 1 ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;

// ==================================
// 7. NEWS FORM MODAL
// ==================================
const newsFormModal = `"use client";

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
    titleEn: "",
    titleId: "",
    newsDate: new Date().toISOString().split("T")[0],
    newsThumbnail: "",
    excerptEn: "",
    excerptId: "",
    contentEn: "",
    contentId: "",
    newsLink: "",
    idCategory: undefined,
    metaKeyword: "",
    customCss: "",
    customJs: "",
    dataStatus: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"en" | "id">("en");

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && news) {
        setFormData({
          titleEn: news.titleEn || "",
          titleId: news.titleId || "",
          newsDate: news.newsDate ? news.newsDate.split("T")[0] : new Date().toISOString().split("T")[0],
          newsThumbnail: news.newsThumbnail || "",
          excerptEn: news.excerptEn || "",
          excerptId: news.excerptId || "",
          contentEn: news.contentEn || "",
          contentId: news.contentId || "",
          newsLink: news.newsLink || "",
          idCategory: news.idCategory || undefined,
          metaKeyword: news.metaKeyword || "",
          customCss: news.customCss || "",
          customJs: news.customJs || "",
          dataStatus: news.dataStatus ?? 1,
        });
      } else {
        setFormData({
          titleEn: "",
          titleId: "",
          newsDate: new Date().toISOString().split("T")[0],
          newsThumbnail: "",
          excerptEn: "",
          excerptId: "",
          contentEn: "",
          contentId: "",
          newsLink: "",
          idCategory: undefined,
          metaKeyword: "",
          customCss: "",
          customJs: "",
          dataStatus: 1,
        });
      }
      setError(null);
      setActiveTab("en");
    }
  }, [isOpen, mode, news]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titleEn.trim()) {
      setError("Title (English) is required");
      return;
    }
    if (!formData.contentEn.trim()) {
      setError("Content (English) is required");
      return;
    }
    if (!formData.newsDate) {
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
                value={formData.newsDate}
                onChange={(e) => setFormData({ ...formData, newsDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                value={formData.idCategory || ""}
                onChange={(e) => setFormData({ ...formData, idCategory: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- No Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.categoryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={formData.dataStatus ?? 1}
                onChange={(e) => setFormData({ ...formData, dataStatus: parseInt(e.target.value, 10) })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          {/* EN / ID Language Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={\`px-4 py-2 text-sm font-medium \${
                activeTab === "en"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }\`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("id")}
              className={\`px-4 py-2 text-sm font-medium \${
                activeTab === "id"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }\`}
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
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter English title"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt (EN)</label>
                <textarea
                  value={formData.excerptEn || ""}
                  onChange={(e) => setFormData({ ...formData, excerptEn: e.target.value })}
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
                  value={formData.contentEn}
                  onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
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
                  value={formData.titleId || ""}
                  onChange={(e) => setFormData({ ...formData, titleId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter Indonesian title"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt (ID)</label>
                <textarea
                  value={formData.excerptId || ""}
                  onChange={(e) => setFormData({ ...formData, excerptId: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Ringkasan singkat..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Content (ID)</label>
                <textarea
                  value={formData.contentId || ""}
                  onChange={(e) => setFormData({ ...formData, contentId: e.target.value })}
                  rows={10}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Masukkan konten bahasa Indonesia (HTML)"
                />
              </div>
            </div>
          )}

          {/* Thumbnail & Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Thumbnail URL</label>
              <input
                type="text"
                value={formData.newsThumbnail || ""}
                onChange={(e) => setFormData({ ...formData, newsThumbnail: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">News Link</label>
              <input
                type="text"
                value={formData.newsLink || ""}
                onChange={(e) => setFormData({ ...formData, newsLink: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Meta & Custom */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Keyword</label>
            <input
              type="text"
              value={formData.metaKeyword || ""}
              onChange={(e) => setFormData({ ...formData, metaKeyword: e.target.value })}
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
`;

// ==================================
// 8. NEWS DATA DELETE MODAL
// ==================================
const newsDeleteModal = `"use client";

import React from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete News</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This will permanently delete this article and all associated views/highlights.</p>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Are you sure you want to delete <strong>&ldquo;{title}&rdquo;</strong>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
`;

// ==================================
// 9. HIGHLIGHT PAGE
// ==================================
const highlightPage = `"use client";

import React, { useState, useEffect, useCallback } from "react";
import { newsHighlightService, NewsHighlight, News } from "@/services/news.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function NewsHighlightPage() {
  const toast = useToast();
  const [highlights, setHighlights] = useState<NewsHighlight[]>([]);
  const [availableNews, setAvailableNews] = useState<Pick<News, "id" | "titleEn" | "titleId" | "slug" | "newsThumbnail" | "newsDate">[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsId, setSelectedNewsId] = useState<string>("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const fetchHighlights = useCallback(async () => {
    try {
      setLoading(true);
      const [hlRes, availRes] = await Promise.all([
        newsHighlightService.getHighlights(),
        newsHighlightService.getAvailable(),
      ]);
      setHighlights(hlRes.data || []);
      setAvailableNews(availRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch highlights");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const handleAddHighlight = async () => {
    if (!selectedNewsId) return;
    try {
      await newsHighlightService.createHighlight(parseInt(selectedNewsId, 10));
      toast.success("Highlight added");
      setSelectedNewsId("");
      await fetchHighlights();
    } catch (err: any) {
      toast.error(err.message || "Failed to add highlight");
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await newsHighlightService.removeHighlight(id);
      toast.success("Highlight removed");
      await fetchHighlights();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove highlight");
    }
  };

  // Drag & Drop reorder
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newItems = [...highlights];
    const [dragged] = newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, dragged);
    setHighlights(newItems);
    setDraggedIdx(idx);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    // Save new order
    const updates = highlights.map((h, i) => ({ id: h.id, order: i + 1 }));
    try {
      await newsHighlightService.reorderHighlights(updates);
      toast.success("Order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save order");
      await fetchHighlights();
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="News Highlight" />

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Highlights</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage featured news. Drag to reorder. ({highlights.length} items)
          </p>
        </div>

        {/* Add Highlight */}
        <div className="mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add News to Highlight
            </label>
            <select
              value={selectedNewsId}
              onChange={(e) => setSelectedNewsId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- Select News --</option>
              {availableNews.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.titleEn} ({formatDate(n.newsDate)})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddHighlight}
            disabled={!selectedNewsId}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* Highlights List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : highlights.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
            <p>No highlights configured. Add news articles above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {highlights.map((h, idx) => (
              <div
                key={h.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={\`flex items-center gap-4 rounded-lg border p-3 transition-colors \${
                  draggedIdx === idx
                    ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
                } cursor-grab active:cursor-grabbing\`}
              >
                {/* Drag Handle */}
                <div className="text-gray-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z" />
                  </svg>
                </div>

                {/* Position Badge */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {idx + 1}
                </div>

                {/* Thumbnail */}
                {h.news?.newsThumbnail && (
                  <img
                    src={h.news.newsThumbnail}
                    alt=""
                    className="h-12 w-16 rounded object-cover"
                  />
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {h.news?.titleEn || "Unknown News"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {h.news?.newsDate ? formatDate(h.news.newsDate) : ""}
                    {h.news?.dataStatus !== 1 && (
                      <span className="ml-2 text-yellow-600 dark:text-yellow-400">(Inactive)</span>
                    )}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(h.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  title="Remove highlight"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;

// Write all files
const files = {
  [path.join(base, 'category', 'page.tsx')]: categoryPage,
  [path.join(base, 'category', 'components', 'NewsCategoryTable.tsx')]: categoryTable,
  [path.join(base, 'category', 'components', 'NewsCategoryFormModal.tsx')]: categoryFormModal,
  [path.join(base, 'category', 'components', 'DeleteConfirmModal.tsx')]: catDeleteModal,
  [path.join(base, 'data', 'page.tsx')]: newsDataPage,
  [path.join(base, 'data', 'components', 'NewsTable.tsx')]: newsTable,
  [path.join(base, 'data', 'components', 'NewsFormModal.tsx')]: newsFormModal,
  [path.join(base, 'data', 'components', 'DeleteConfirmModal.tsx')]: newsDeleteModal,
  [path.join(base, 'highlight', 'page.tsx')]: highlightPage,
};

for (const [filePath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Written:', path.relative(base, filePath));
}

console.log('\nAll frontend news pages written successfully!');
