"use client";

import React, { useCallback, useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import SubmissionDetailModal from "@/components/common/SubmissionDetailModal";
import { useToast } from "@/context/ToastContext";
import { getFormSubmissionStatusMeta } from "@/lib/formSubmissionStatus";
import {
  BusinessUnit,
  FormModule,
  FormSubmission,
  formModuleService,
} from "@/services/formModule.service";

const BU_OPTIONS: BusinessUnit[] = ["ENTERPRISE", "FIBER", "MEDIA"];

const BU_STYLES: Record<string, string> = {
  ENTERPRISE: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FIBER: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  MEDIA: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
};

function formatDate(v: string) {
  return new Date(v).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function FormSubmissionsPage() {
  const toast = useToast();

  // All form modules for filter dropdown
  const [allModules, setAllModules] = useState<FormModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Filters
  const [buFilter, setBuFilter] = useState<BusinessUnit | "">("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Submissions
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Modal
  const [openModal, setOpenModal] = useState<{
    formModuleId: string;
    submissionId: string;
  } | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch all modules once
  useEffect(() => {
    (async () => {
      try {
        setLoadingModules(true);
        const res = await formModuleService.listFormModules({ limit: 200, status: "ACTIVE" });
        setAllModules(res.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load form modules");
      } finally {
        setLoadingModules(false);
      }
    })();
  }, [toast]);

  // Filtered modules for dropdown (by BU)
  const filteredModules = buFilter
    ? allModules.filter((m) => m.businessUnit === buFilter)
    : allModules;

  // Reset selected module when BU filter changes
  useEffect(() => {
    setSelectedModuleId("");
    setSubmissions([]);
  }, [buFilter]);

  // Fetch submissions when module or search changes
  const fetchSubmissions = useCallback(async () => {
    if (!selectedModuleId) {
      setSubmissions([]);
      return;
    }
    try {
      setLoadingSubmissions(true);
      const res = await formModuleService.listSubmissions(selectedModuleId, {
        limit: 50,
        search: debouncedSearch || undefined,
        sortBy: "receivedAt",
        sortOrder: "desc",
      });
      setSubmissions(res.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load submissions");
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  }, [selectedModuleId, debouncedSearch, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const selectedModule = allModules.find((m) => m.id === selectedModuleId) ?? null;

  return (
    <div>
      <PageBreadCrumb pageTitle="Form Submissions" />

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        {/* BU filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Business Unit
          </label>
          <select
            value={buFilter}
            onChange={(e) => setBuFilter(e.target.value as BusinessUnit | "")}
            className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All BU</option>
            {BU_OPTIONS.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))}
          </select>
        </div>

        {/* Form module selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Form Module
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            disabled={loadingModules}
            className="h-9 min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">— Select form module —</option>
            {filteredModules.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.businessUnit}] {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Search Email / Name
          </label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search…"
            disabled={!selectedModuleId}
            className="h-9 w-56 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        {!selectedModuleId ? (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            Select a form module to view submissions.
          </div>
        ) : loadingSubmissions ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            No submissions found.
          </p>
        ) : (
          <>
            {/* Summary row */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {selectedModule && (
                  <span>
                    <span
                      className={`mr-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        BU_STYLES[selectedModule.businessUnit] ?? ""
                      }`}
                    >
                      {selectedModule.businessUnit}
                    </span>
                    {selectedModule.name}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                Showing {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
              </span>
            </div>

            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 text-left dark:border-gray-800">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    BU
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Received At
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {submissions.map((sub) => {
                  const statusMeta = getFormSubmissionStatusMeta(sub.status);

                  return (
                    <tr
                      key={sub.id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      onClick={() =>
                        setOpenModal({ formModuleId: sub.formModuleId, submissionId: sub.id })
                      }
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {sub.primaryName ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {sub.primaryEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            BU_STYLES[sub.businessUnit] ?? ""
                          }`}
                        >
                          {sub.businessUnit}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          title={statusMeta.description}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMeta.className}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(sub.receivedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenModal({ formModuleId: sub.formModuleId, submissionId: sub.id });
                          }}
                          className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Submission Detail Modal */}
      {openModal && (
        <SubmissionDetailModal
          formModuleId={openModal.formModuleId}
          submissionId={openModal.submissionId}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
