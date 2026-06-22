"use client";

import React from "react";

/**
 * DataTable Header Props
 */
interface DataTableHeaderProps {
  title: string;
  description?: string;
  searchQuery?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  onAdd?: () => void;
  addButtonText?: string;
  additionalFilters?: React.ReactNode;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
}

/**
 * Reusable DataTable Header Component
 * Includes title, search, add button, and bulk actions
 * 
 * @example
 * <DataTableHeader
 *   title="Awards Management"
 *   description="Manage all awards"
 *   searchQuery={searchQuery}
 *   onSearch={handleSearch}
 *   onAdd={handleAdd}
 *   selectedCount={selectedIds.length}
 *   onBulkDelete={handleBulkDelete}
 * />
 */
export function DataTableHeader({
  title,
  description,
  searchQuery = '',
  onSearch,
  searchPlaceholder = 'Search...',
  onAdd,
  addButtonText = 'Add New',
  additionalFilters,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
}: DataTableHeaderProps) {
  return (
    <div className="space-y-4">
      {/* Title and Add Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {addButtonText}
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search Input */}
        {onSearch && (
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
          </div>
        )}

        {/* Additional Filters */}
        {additionalFilters}
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-300">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{selectedCount}</span>
            <span>item{selectedCount > 1 ? 's' : ''} selected</span>
          </div>

          <div className="flex items-center gap-2">
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
              >
                Clear Selection
              </button>
            )}

            {onBulkDelete && (
              <button
                onClick={onBulkDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Selected
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
