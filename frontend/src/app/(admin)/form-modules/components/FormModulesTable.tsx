"use client";

import React from "react";
import Link from "next/link";
import {
  BusinessUnit,
  FormCategory,
  FormModule,
  FormModuleStatus,
} from "@/services/formModule.service";

interface FormModulesTableProps {
  modules: FormModule[];
  loading: boolean;
  onToggleStatus: (module: FormModule) => void;
  togglingId: string | null;
}

const BU_LABEL: Record<BusinessUnit, string> = {
  ENTERPRISE: "Enterprise",
  FIBER: "Fiber",
  MEDIA: "Media",
};

const CATEGORY_LABEL: Record<FormCategory, string> = {
  REGISTRATION: "Registration",
  INQUIRY: "Inquiry",
  PARTNERSHIP: "Partnership",
  RECOMMENDATION: "Recommendation",
  EVENT: "Event",
};

const STATUS_NEXT: Record<FormModuleStatus, FormModuleStatus | null> = {
  DRAFT: "ACTIVE",
  ACTIVE: "ARCHIVED",
  ARCHIVED: null,
};

const STATUS_STYLES: Record<FormModuleStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const BU_STYLES: Record<BusinessUnit, string> = {
  ENTERPRISE: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  FIBER: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  MEDIA: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FormModulesTable({
  modules,
  loading,
  onToggleStatus,
  togglingId,
}: FormModulesTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No form modules found</p>
        <p className="text-sm">Adjust filters or seed form data first</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-700">
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              Name
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              BU
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              Category
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              Status
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              Submissions
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              Updated At
            </th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {modules.map((mod) => {
            const nextStatus = STATUS_NEXT[mod.status];
            return (
              <tr key={mod.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {/* Name */}
                <td className="max-w-xs px-4 py-3">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {mod.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">/{mod.slug}</p>
                </td>

                {/* BU */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      BU_STYLES[mod.businessUnit]
                    }`}
                  >
                    {BU_LABEL[mod.businessUnit]}
                  </span>
                </td>

                {/* Category */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {CATEGORY_LABEL[mod.category]}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[mod.status]
                    }`}
                  >
                    {mod.status.charAt(0) + mod.status.slice(1).toLowerCase()}
                  </span>
                </td>

                {/* Submissions Count */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {mod._count?.submissions ?? "—"}
                </td>

                {/* Updated At */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(mod.updatedAt)}
                </td>

                {/* Actions */}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/form-modules/${mod.id}`}
                      className="rounded px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    >
                      View
                    </Link>
                    {nextStatus && (
                      <button
                        disabled={togglingId === mod.id}
                        onClick={() => onToggleStatus(mod)}
                        className="rounded px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        {togglingId === mod.id
                          ? "Saving…"
                          : `→ ${nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}`}
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
