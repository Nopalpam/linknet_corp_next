"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { getFormSubmissionStatusMeta } from "@/lib/formSubmissionStatus";
import {
  FormSubmission,
  FormSubmissionDatePreset,
  formModuleService,
} from "@/services/formModule.service";

interface SubmissionsTabProps {
  formModuleId: string;
}

function formatDate(v: string) {
  return new Date(v).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSubmissionValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

const NEEDS_FIELD_CANDIDATES = [
  'needs',
  'Choose_your_Needs__c',
  'needType',
  'typePartnership',
  'consultationType',
  'selectedNeeds',
  'businessNeed',
  'bandwidthNeed',
] as const;

const COMPANY_FIELD_CANDIDATES = [
  'companyName',
  'company_name',
  'Company',
  'company',
  'Company Name',
] as const;

function resolveSubmissionFieldValue(
  submission: FormSubmission,
  candidates: readonly string[]
): string {
  const normalizedCandidates = candidates.map((candidate) => candidate.toLowerCase());

  const getTokenMatch = (text: string, candidate: string) => {
    const safe = candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(^|[^a-z0-9_])${safe}($|[^a-z0-9_])`);
    return regex.test(text);
  };

  const match = submission.values?.find((value) => {
    const fieldPath = value.fieldPath.toLowerCase();
    const fieldKey = value.fieldKey?.toLowerCase() ?? "";

    return normalizedCandidates.some((candidate) => {
      if (fieldPath === candidate || fieldKey === candidate) {
        return true;
      }

      if (getTokenMatch(fieldPath, candidate) || getTokenMatch(fieldKey, candidate)) {
        return true;
      }

      return false;
    });
  });

  if (!match) {
    return "—";
  }

  return formatSubmissionValue(match.displayValue ?? match.rawValue ?? match.value);
}

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

function DatePickerField({ label, value, onChange, min, max }: DatePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = `submissions-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Browser may block showPicker without a direct user gesture.
    }
  };

  return (
    <div className="flex flex-col gap-1" onClick={openPicker}>
      <label
        htmlFor={id}
        className="text-xs font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
        onClick={openPicker}
      >
        {label}
      </label>

      <input
        id={id}
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        placeholder="YYYY-MM-DD"
        onChange={(event) => onChange(event.target.value)}
        onFocus={openPicker}
        style={{ position: 'relative', zIndex: 2 }}
        className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

export default function SubmissionsTab({ formModuleId }: SubmissionsTabProps) {
  const toast = useToast();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [formChannelOptions, setFormChannelOptions] = useState<string[]>([]);
  const [sourceOptions, setSourceOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedFormChannel, setSelectedFormChannel] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [datePreset, setDatePreset] = useState<"" | FormSubmissionDatePreset>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (datePreset !== "custom") {
      setDateFrom("");
      setDateTo("");
    }
  }, [datePreset]);

  const buildQueryParams = useCallback(() => {
    if (datePreset === "custom" && (!dateFrom || !dateTo)) {
      return null;
    }

    return {
      limit: 20,
      email: debouncedSearch || undefined,
      formChannel: selectedFormChannel || undefined,
      source: selectedSource || undefined,
      datePreset: datePreset || undefined,
      dateFrom: datePreset === "custom" ? dateFrom : undefined,
      dateTo: datePreset === "custom" ? dateTo : undefined,
      sortBy: "receivedAt" as const,
      sortOrder: "desc" as const,
    };
  }, [dateFrom, datePreset, dateTo, debouncedSearch, selectedFormChannel, selectedSource]);

  const fetchSubmissions = useCallback(async () => {
    const queryParams = buildQueryParams();

    if (!queryParams) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await formModuleService.listSubmissions(formModuleId, queryParams);
      setSubmissions(res.data);
      setFormChannelOptions(res.filters?.formChannels ?? []);
      setSourceOptions(res.filters?.sources ?? []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load submissions");
      setSubmissions([]);
      setFormChannelOptions([]);
      setSourceOptions([]);
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, formModuleId, toast]);

  const handleExport = useCallback(async (format: "csv" | "xlsx") => {
    const queryParams = buildQueryParams();

    if (!queryParams) {
      toast.error("Select both start and end date to export a custom range");
      return;
    }

    try {
      setExporting(true);
      setExportMenuOpen(false);
      const { blob, filename } = await formModuleService.exportSubmissions(
        formModuleId,
        queryParams,
        format
      );
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      toast.error(error.message || "Failed to export submissions");
    } finally {
      setExporting(false);
    }
  }, [buildQueryParams, formModuleId, toast]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedFormChannel("");
    setSelectedSource("");
    setDatePreset("");
    setDateFrom("");
    setDateTo("");
  };

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Search by Email
            </label>
            <input
              type="text"
              placeholder="email@company.com"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-72 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Form Channel
            </label>
            <select
              value={selectedFormChannel}
              onChange={(e) => setSelectedFormChannel(e.target.value)}
              disabled={formChannelOptions.length === 0}
              className="h-9 min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All channels</option>
              {formChannelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Source
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              disabled={sourceOptions.length === 0}
              className="h-9 min-w-[220px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All sources</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Filter by Date
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as "" | FormSubmissionDatePreset)}
              className="h-9 min-w-[180px] rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {datePreset === "custom" && (
            <>
              <DatePickerField
                label="Start Date"
                value={dateFrom}
                onChange={setDateFrom}
                max={dateTo || undefined}
              />

              <DatePickerField
                label="End Date"
                value={dateTo}
                onChange={setDateTo}
                min={dateFrom || undefined}
              />
            </>
          )}

          <div className="ml-auto flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
            <div className="relative">
            <button
              type="button"
              onClick={() => setExportMenuOpen((open) => !open)}
              disabled={exporting}
              className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {exporting ? "Exporting…" : "Export Submissions"}
            </button>
              {exportMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => handleExport("csv")}
                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Export as CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("xlsx")}
                    className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Export as XLSX
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {datePreset === "custom" && (!dateFrom || !dateTo) && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Select both dates to apply the custom range filter.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : submissions.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          No submissions found.
        </p>
      ) : (
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
                Needs
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Company
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Product
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Promo
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Source
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Form Channel
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                URL
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Received
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Detail
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {submissions.map((sub) => {
              const statusMeta = getFormSubmissionStatusMeta(sub.status);
              const needsValue = resolveSubmissionFieldValue(sub, NEEDS_FIELD_CANDIDATES);
              const companyValue = resolveSubmissionFieldValue(sub, COMPANY_FIELD_CANDIDATES);
              const sourceValue = sub.sourceWebsite || sub.sourcePath || "-";

              return (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {sub.primaryName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sub.primaryEmail ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {needsValue}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {companyValue}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sub.product || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sub.promoWebsite || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sourceValue === "â€”" ? sub.sourceWebsite || sub.sourcePath || "â€”" : sourceValue}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sub.formChannel || "â€”"}
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sub.pageWebsite || sub.sourcePath || "—"}
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
                    <Link
                      href={`/form-submissions/${formModuleId}/${sub.id}?returnTo=${encodeURIComponent(`/form-modules/${formModuleId}?tab=submissions`)}`}
                      className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
