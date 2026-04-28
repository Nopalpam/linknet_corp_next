"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getFormSubmissionStatusMeta } from "@/lib/formSubmissionStatus";
import { FormSubmission, formModuleService } from "@/services/formModule.service";

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

export default function SubmissionsTab({ formModuleId }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await formModuleService.listSubmissions(formModuleId, {
        limit: 20,
        search: debouncedSearch || undefined,
        sortBy: "receivedAt",
        sortOrder: "desc",
      });
      setSubmissions(res.data);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [formModuleId, debouncedSearch]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Search bar */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-72 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
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

              return (
                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {sub.primaryName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {sub.primaryEmail ?? "—"}
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
