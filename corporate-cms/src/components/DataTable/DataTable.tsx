"use client";

import React from "react";
import Image from "next/image";

/**
 * Column definition for DataTable
 */
export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

/**
 * DataTable Row Props
 */
interface DataTableRowProps<T> {
  item: T;
  columns: TableColumn<T>[];
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  actions?: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
}

/**
 * DataTable Row Component
 */
export function DataTableRow<T>({
  item,
  columns,
  selectable,
  selected,
  onSelect,
  actions,
  getItemId,
}: DataTableRowProps<T>) {
  const id = getItemId(item);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
      {/* Checkbox column */}
      {selectable && (
        <td className="px-4 py-4 w-12">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect?.(id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
        </td>
      )}

      {/* Data columns */}
      {columns.map((column) => (
        <td
          key={column.key}
          className={`px-4 py-4 text-gray-900 dark:text-white ${column.width || ''}`}
        >
          {column.render ? column.render(item) : String((item as any)[column.key] || '-')}
        </td>
      ))}

      {/* Actions column */}
      {actions && (
        <td className="px-4 py-4 w-32">
          <div className="flex items-center justify-center gap-2">
            {actions(item)}
          </div>
        </td>
      )}
    </tr>
  );
}

/**
 * DataTable Props
 */
interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  isAllSelected?: boolean;
  actions?: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
  emptyMessage?: string;
  onSort?: (key: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Reusable DataTable Component
 * Supports sorting, selection, custom rendering, and actions
 * 
 * @example
 * <DataTable
 *   columns={columns}
 *   data={awards}
 *   loading={loading}
 *   selectable
 *   selectedIds={selectedIds}
 *   onSelect={handleSelect}
 *   actions={(item) => <ActionButtons item={item} />}
 *   getItemId={(item) => item.id}
 * />
 */
export function DataTable<T>({
  columns,
  data,
  loading = false,
  selectable = false,
  selectedIds = [],
  onSelect,
  onSelectAll,
  isAllSelected = false,
  actions,
  getItemId,
  emptyMessage = 'No data found',
  onSort,
  sortBy,
  sortOrder,
}: DataTableProps<T>) {
  const allIds = data.map(getItemId);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500">
          <svg
            className="h-5 w-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Loading data...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500">
        <svg
          className="h-16 w-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-lg font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {/* Checkbox column header */}
            {selectable && (
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => onSelectAll?.(allIds)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </th>
            )}

            {/* Column headers */}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                } ${column.width || ''}`}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && sortBy === column.key && (
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        sortOrder === 'desc' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  )}
                </div>
              </th>
            ))}

            {/* Actions column header */}
            {actions && (
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 w-32">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
          {data.map((item) => (
            <DataTableRow
              key={getItemId(item)}
              item={item}
              columns={columns}
              selectable={selectable}
              selected={selectedIds.includes(getItemId(item))}
              onSelect={onSelect}
              actions={actions}
              getItemId={getItemId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
