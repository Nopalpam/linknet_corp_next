"use client";

import React from "react";
import { Career } from "@/services/career.service";

interface Props {
  careers: Career[];
  loading: boolean;
  selectedIds: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onEdit: (career: Career) => void;
  onDelete: (career: Career) => void;
  onToggleStatus: (career: Career) => void;
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
  if (sortBy !== field) {
    return (
      <svg className="w-3 h-3 text-gray-400 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  return sortOrder === "asc" ? (
    <svg className="w-3 h-3 text-brand-500 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3 h-3 text-brand-500 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function StatusBadge({ status, expiryDate }: { status: string; expiryDate: string | null }) {
  const isExpired = status === "active" && expiryDate && new Date(expiryDate) <= new Date();

  if (isExpired) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">
        Expired
      </span>
    );
  }

  const styles: Record<string, string> = {
    active: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    inactive: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
    scheduled: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.inactive}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

export default function CareerTable({
  careers,
  loading,
  selectedIds,
  sortBy,
  sortOrder,
  onSort,
  onSelectAll,
  onSelectOne,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) {
  const allSelected = careers.length > 0 && selectedIds.length === careers.length;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-3"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading careers...</p>
        </div>
      </div>
    );
  }

  if (careers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12">
        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-sm">No career positions found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500"
                />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-brand-500"
                onClick={() => onSort("position")}
              >
                Position <SortIcon field="position" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-brand-500"
                onClick={() => onSort("division")}
              >
                Division <SortIcon field="division" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-brand-500"
                onClick={() => onSort("type")}
              >
                Type <SortIcon field="type" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-brand-500"
                onClick={() => onSort("location")}
              >
                Location <SortIcon field="location" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-brand-500"
                onClick={() => onSort("status")}
              >
                Status <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th
                className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-300 cursor-pointer select-none hover:text-brand-500"
                onClick={() => onSort("created_at")}
              >
                Created <SortIcon field="created_at" sortBy={sortBy} sortOrder={sortOrder} />
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {careers.map((career) => (
              <tr
                key={career.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(career.id)}
                    onChange={(e) => onSelectOne(career.id, e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                    {career.position}
                  </div>
                  {career.slug && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
                      /{career.slug}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {career.division || "-"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {career.type || "-"}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {career.location || "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={career.status} expiryDate={career.expiryDate} />
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">
                  {formatDate(career.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Edit */}
                    <button
                      onClick={() => onEdit(career)}
                      className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => onToggleStatus(career)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        career.status === "active"
                          ? "text-green-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          : "text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                      title={career.status === "active" ? "Deactivate" : "Activate"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(career)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
}
