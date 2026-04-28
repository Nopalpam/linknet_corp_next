"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import {
  BusinessUnit,
  FormModule,
  FormModuleStatus,
  formModuleService,
} from "@/services/formModule.service";

const BU_OPTIONS: { label: string; value: string }[] = [
  { label: "All BU", value: "" },
  { label: "Enterprise", value: "ENTERPRISE" },
  { label: "Fiber", value: "FIBER" },
  { label: "Media", value: "MEDIA" },
];

const BU_STYLES: Record<BusinessUnit, string> = {
  ENTERPRISE: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  FIBER: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  MEDIA: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
};

const STATUS_STYLES: Record<FormModuleStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const ITEMS_PER_PAGE = 20;

export default function FormSubmissionsOverviewPage() {
  const toast = useToast();

  const [modules, setModules] = useState<FormModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBU, setFilterBU] = useState<string>("");

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await formModuleService.listFormModules({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        businessUnit: (filterBU as BusinessUnit) || undefined,
        sortBy: "updatedAt",
        sortOrder: "desc",
      });
      setModules(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.total);
    } catch (err: any) {
      toast.error(err.message || "Failed to load form modules");
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterBU, toast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBU]);

  return (
    <div>
      <PageBreadCrumb pageTitle="Form Submissions Overview" />

      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Select a form module below to view its submissions.
      </p>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search form name or slug…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
        <select
          value={filterBU}
          onChange={(e) => setFilterBU(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {BU_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {totalItems} form{totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : modules.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <p className="text-lg font-medium">No form modules found</p>
            <p className="text-sm">Adjust filters or seed form data first</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                  <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Form Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    BU
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Submissions
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {modules.map((mod) => (
                  <tr
                    key={mod.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {mod.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        /{mod.slug}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BU_STYLES[mod.businessUnit]}`}
                      >
                        {mod.businessUnit.charAt(0) +
                          mod.businessUnit.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[mod.status]}`}
                      >
                        {mod.status.charAt(0) + mod.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {mod._count?.submissions ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/form-modules/${mod.id}?tab=submissions`}
                        className="rounded px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        View Submissions
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
