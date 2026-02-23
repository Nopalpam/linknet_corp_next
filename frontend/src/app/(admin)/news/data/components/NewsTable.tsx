"use client";

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
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.dataStatus === 1
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}
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
