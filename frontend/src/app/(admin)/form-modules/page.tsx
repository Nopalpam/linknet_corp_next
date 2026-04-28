"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import {
  BusinessUnit,
  FormCategory,
  FormModule,
  FormModuleStatus,
  formModuleService,
} from "@/services/formModule.service";
import FormModulesTable from "./components/FormModulesTable";

const BU_OPTIONS: { label: string; value: string }[] = [
  { label: "All BU", value: "" },
  { label: "Enterprise", value: "ENTERPRISE" },
  { label: "Fiber", value: "FIBER" },
  { label: "Media", value: "MEDIA" },
];

const CATEGORY_OPTIONS: { label: string; value: string }[] = [
  { label: "All Categories", value: "" },
  { label: "Registration", value: "REGISTRATION" },
  { label: "Inquiry", value: "INQUIRY" },
  { label: "Partnership", value: "PARTNERSHIP" },
  { label: "Recommendation", value: "RECOMMENDATION" },
  { label: "Event", value: "EVENT" },
];

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Status", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Archived", value: "ARCHIVED" },
];

const ITEMS_PER_PAGE = 15;

export default function FormModulesPage() {
  const toast = useToast();

  const [modules, setModules] = useState<FormModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterBU, setFilterBU] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await formModuleService.listFormModules({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
        businessUnit: (filterBU as BusinessUnit) || undefined,
        category: (filterCategory as FormCategory) || undefined,
        status: (filterStatus as FormModuleStatus) || undefined,
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
  }, [currentPage, searchQuery, filterBU, filterCategory, filterStatus, toast]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterBU, filterCategory, filterStatus]);

  const handleToggleStatus = async (mod: FormModule) => {
    const nextMap: Record<FormModuleStatus, FormModuleStatus> = {
      DRAFT: "ACTIVE",
      ACTIVE: "ARCHIVED",
      ARCHIVED: "ARCHIVED",
    };
    const next = nextMap[mod.status];
    if (next === mod.status) return;

    try {
      setTogglingId(mod.id);
      await formModuleService.updateFormModuleStatus(mod.id, next);
      toast.success(`"${mod.name}" moved to ${next.charAt(0) + next.slice(1).toLowerCase()}`);
      await fetchModules();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <PageBreadCrumb pageTitle="Form Modules" />

      {/* Filters Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search name or slug…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />

        {/* BU filter */}
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

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          {totalItems} module{totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <FormModulesTable
          modules={modules}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          togglingId={togglingId}
        />
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
