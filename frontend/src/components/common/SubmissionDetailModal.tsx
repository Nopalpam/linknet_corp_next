"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  canRetryFormSubmission,
  getFormSubmissionStatusMeta,
} from "@/lib/formSubmissionStatus";
import {
  FormDispatchLog,
  FormField,
  FormSubmission,
  FormSubmissionValue,
  formModuleService,
} from "@/services/formModule.service";

interface SubmissionDetailModalProps {
  formModuleId: string;
  submissionId: string;
  onClose: () => void;
}

const DISPATCH_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  SUCCESS: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  SKIPPED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

function formatDate(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatFileSize(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function SubmissionDetailModal({
  formModuleId,
  submissionId,
  onClose,
}: SubmissionDetailModalProps) {
  const [submission, setSubmission] = useState<FormSubmission | null>(null);
  const [moduleFields, setModuleFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const formatSubmissionValue = (value?: FormSubmissionValue | null) => {
    if (!value) return "—";
    if (value.displayValue !== null && value.displayValue !== undefined && value.displayValue !== "") {
      return value.displayValue;
    }
    if (value.rawValue !== null && value.rawValue !== undefined && value.rawValue !== "") {
      return value.rawValue;
    }
    if (value.value === null || value.value === undefined || value.value === "") {
      return "—";
    }
    if (typeof value.value === "object") {
      try {
        return JSON.stringify(value.value);
      } catch {
        return String(value.value);
      }
    }

    return String(value.value);
  };

  const findValueByField = (field: FormField) => {
    if (!submission?.values) return undefined;
    return submission.values.find(
      (value) =>
        value.fieldPath === field.fieldPath ||
        (!!field.key && value.fieldKey === field.key) ||
        (!!field.key && value.fieldKey?.toLowerCase() === field.key.toLowerCase()) ||
        value.fieldPath === field.path
    );
  };

  const fetchSubmission = useCallback(async () => {
    try {
      setLoading(true);
      const [submissionData, moduleData] = await Promise.all([
        formModuleService.getSubmissionById(formModuleId, submissionId),
        formModuleService.getFormModuleById(formModuleId),
      ]);
      setSubmission(submissionData);
      setModuleFields(moduleData.fields ?? []);
    } catch {
      setSubmission(null);
      setModuleFields([]);
    } finally {
      setLoading(false);
    }
  }, [formModuleId, submissionId]);

  useEffect(() => {
    fetchSubmission();
  }, [fetchSubmission]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleRetry = async () => {
    if (!submission) return;
    try {
      setRetrying(true);
      await formModuleService.retrySubmissionDispatch(formModuleId, submissionId);
      await fetchSubmission();
    } catch {
      // Retry failed silently — user can try again
    } finally {
      setRetrying(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const statusMeta = submission ? getFormSubmissionStatusMeta(submission.status) : null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm"
    >
      <div className="relative mt-10 w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Submission Detail
          </h2>
          <div className="flex items-center gap-2">
            {submission && canRetryFormSubmission(submission.status) && (
                <button
                  disabled={retrying}
                  onClick={handleRetry}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {retrying ? "Retrying…" : "Retry Dispatch"}
                </button>
              )}
            <button
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal body */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        ) : !submission ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            Submission not found.
          </p>
        ) : (
          <div className="space-y-5 px-5 py-5">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-800/40 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID</p>
                <p className="truncate font-mono text-xs text-gray-700 dark:text-gray-300">
                  {submission.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                {statusMeta && (
                  <>
                    <span
                      title={statusMeta.description}
                      className={`mt-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {statusMeta.description}
                    </p>
                  </>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">BU</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {submission.businessUnit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {submission.primaryName ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {submission.primaryEmail ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Received At</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {formatDate(submission.receivedAt)}
                </p>
              </div>
            </div>

            {/* Field Values */}
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Field Values
              </h3>
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/60">
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Field
                      </th>
                      <th className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {moduleFields.length > 0 ? (
                      moduleFields
                        .slice()
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((field) => {
                          const value = findValueByField(field);
                          return (
                            <tr key={field.id}>
                              <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                                {field.label || field.path}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                {formatSubmissionValue(value)}
                              </td>
                            </tr>
                          );
                        })
                    ) : submission.values && submission.values.length > 0 ? (
                      submission.values.map((v) => (
                        <tr key={v.id}>
                          <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                            {v.fieldPath}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                            {formatSubmissionValue(v)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400" colSpan={2}>
                          No field values available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {submission.values && submission.values.length > 0 && moduleFields.length > 0 && (
              <section>
                {submission.values.some(
                  (value) =>
                    !moduleFields.some(
                      (field) =>
                        field.fieldPath === value.fieldPath ||
                        (!!field.key && field.key === value.fieldKey) ||
                        value.fieldPath === field.path
                    )
                ) && (
                  <>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Extra Submission Values
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/60">
                            <th className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                              Field
                            </th>
                            <th className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {submission.values
                            .filter(
                              (value) =>
                                !moduleFields.some(
                                  (field) =>
                                    field.fieldPath === value.fieldPath ||
                                    (!!field.key && field.key === value.fieldKey) ||
                                    value.fieldPath === field.path
                                )
                            )
                            .map((value) => (
                              <tr key={value.id}>
                                <td className="px-4 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                                  {value.fieldPath}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                  {formatSubmissionValue(value)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Groups (repeaters) */}
            {submission.groups && submission.groups.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Groups / Participants
                </h3>
                <div className="space-y-3">
                  {submission.groups.map((grp) => (
                    <div
                      key={grp.id}
                      className="rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800/40">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {grp.label ?? grp.groupKey} #{grp.sortOrder + 1}
                        </span>
                      </div>
                      <table className="w-full table-auto">
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {grp.values.map((v) => (
                            <tr key={v.id}>
                              <td className="px-4 py-2 font-mono text-xs text-gray-500 dark:text-gray-500">
                                {v.fieldPath}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">
                                {v.displayValue ?? v.rawValue ?? (v.value !== undefined ? String(v.value) : "—")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Files */}
            {submission.files && submission.files.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Uploaded Files
                </h3>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-700 dark:bg-gray-800/60">
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">Field</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">File</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">Size</th>
                        <th className="px-4 py-2 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {submission.files.map((f) => (
                        <tr key={f.id}>
                          <td className="px-4 py-2 font-mono text-xs text-gray-500">{f.fieldPath}</td>
                          <td className="px-4 py-2 text-sm">
                            {f.url ? (
                              <a
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                              >
                                {f.originalName ?? "Download"}
                              </a>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400">
                                {f.originalName ?? "—"}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs text-gray-500">{formatFileSize(f.size)}</td>
                          <td className="px-4 py-2 text-xs text-gray-500">{f.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Dispatch Logs */}
            {submission.dispatchLogs && submission.dispatchLogs.length > 0 && (
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Dispatch Logs
                </h3>
                <div className="space-y-2">
                  {submission.dispatchLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              DISPATCH_STATUS_STYLES[log.status] ?? ""
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {log.provider}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {log.attemptCount} attempt{log.attemptCount !== 1 ? "s" : ""} ·{" "}
                          {formatDate(log.dispatchedAt)}
                        </span>
                      </div>
                      {log.errorMessage && (
                        <p className="mt-1.5 rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                          {log.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
