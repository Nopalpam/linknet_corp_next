"use client";

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

  const statusLabel = (isActive: boolean) => {
    if (isActive) return { text: "Active", cls: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" };
    return { text: "Inactive", cls: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" };
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-700">
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Order</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Category Name (EN)</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Category Name (ID)</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Slug</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">News Count</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map((category) => {
            const st = statusLabel(category.is_active);
            return (
              <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {category.position ?? "-"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name_en}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {category.name_id || "-"}
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
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                    {st.text}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleStatus(category)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-800"
                      title={category.is_active ? "Deactivate" : "Activate"}
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>

                    <button
                      onClick={() => onEdit(category)}
                      className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                      title="Edit"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(category)}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
