"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  componentVisibilityService,
  ComponentVisibilityEntry,
  ComponentSchemaSyncResult,
} from "@/services/componentVisibility.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: "ACTIVE" | "INACTIVE" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        status === "ACTIVE"
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  entry: ComponentVisibilityEntry;
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ entry, onClose, onSaved }: EditModalProps) {
  const toast = useToast();
  const [componentName, setComponentName] = useState(entry.componentName);
  const [businessUnit, setBusinessUnit] = useState(entry.businessUnit ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await componentVisibilityService.update(entry.id, {
        componentName: componentName.trim(),
        businessUnit: businessUnit.trim() || undefined,
      });
      toast.success("Component visibility updated");
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Component
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Component Key
            </label>
            <input
              readOnly
              value={entry.componentKey}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <input
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Business Unit <span className="text-gray-400">(optional)</span>
            </label>
            <select
              value={businessUnit}
              onChange={(e) => setBusinessUnit(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All / No filter</option>
              <option value="ENTERPRISE">Enterprise</option>
              <option value="FIBER">Fiber</option>
              <option value="MEDIA">Media</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComponentVisibilityPage() {
  const toast = useToast();

  const [entries, setEntries] = useState<ComponentVisibilityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [filterBU, setFilterBU] = useState("");
  const [editingEntry, setEditingEntry] = useState<ComponentVisibilityEntry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);
  const [schemaSyncing, setSchemaSyncing] = useState(false);
  const [schemaPreview, setSchemaPreview] = useState<ComponentSchemaSyncResult | null>(null);
  const [bulkWorking, setBulkWorking] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEntries = useCallback(async (page = currentPage, limit = perPage) => {
    try {
      setLoading(true);
      const res = await componentVisibilityService.getAll({
        page,
        limit,
        search: search || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        businessUnit: filterBU || undefined,
      });
      setEntries(res.data || []);
      if (res.meta) {
        setTotalPages(res.meta.totalPages);
        setTotalItems(res.meta.total);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load component visibility data");
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterBU, currentPage, perPage, toast]);

  // Reset to page 1 when filters/search/perPage change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterBU, perPage]);

  useEffect(() => {
    fetchEntries(currentPage, perPage);
  }, [fetchEntries]);

  // ── Sync ──────────────────────────────────────────────────────────────────

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await componentVisibilityService.syncFromRegistry();
      toast.success(`Synced ${res.synced} new component(s) from registry`);
      await fetchEntries();
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  }

  async function handleDryRunSchemaSync() {
    setSchemaSyncing(true);
    try {
      const res = await componentVisibilityService.dryRunSchemaSync();
      setSchemaPreview(res.data);
      toast.success(`Preview ready: ${res.data.outdatedComponents} outdated component(s)`);
    } catch (err: any) {
      toast.error(err.message || "Schema preview failed");
    } finally {
      setSchemaSyncing(false);
    }
  }

  async function handleSyncAllSchemas() {
    setSchemaSyncing(true);
    try {
      const res = await componentVisibilityService.syncAllSchemas();
      setSchemaPreview(res.data);
      toast.success(`Synced ${res.data.changedComponents} component(s) to latest schema`);
      await fetchEntries();
    } catch (err: any) {
      toast.error(err.message || "Schema sync failed");
    } finally {
      setSchemaSyncing(false);
    }
  }

  // ── Toggle single ─────────────────────────────────────────────────────────

  async function handleToggle(entry: ComponentVisibilityEntry) {
    try {
      await componentVisibilityService.toggleStatus(entry.id);
      toast.success(
        `${entry.componentName} is now ${entry.status === "ACTIVE" ? "inactive" : "active"}`
      );
      await fetchEntries();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  }

  // ── Bulk toggle ───────────────────────────────────────────────────────────

  async function handleBulkStatus(status: "ACTIVE" | "INACTIVE") {
    if (selectedIds.size === 0) return;
    setBulkWorking(true);
    try {
      const res = await componentVisibilityService.bulkToggle(
        Array.from(selectedIds),
        status
      );
      toast.success(`Updated ${res.updated} component(s) to ${status}`);
      setSelectedIds(new Set());
      await fetchEntries();
    } catch (err: any) {
      toast.error(err.message || "Bulk update failed");
    } finally {
      setBulkWorking(false);
    }
  }

  // ── Select all visible ────────────────────────────────────────────────────

  function toggleSelectAll() {
    if (selectedIds.size === entries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entries.map((e) => e.id)));
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────

  const activeCount = entries.filter((e) => e.status === "ACTIVE").length;
  const inactiveCount = entries.filter((e) => e.status === "INACTIVE").length;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function renderPageNumbers() {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("…");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Management Data Components" />

      {/* Header */}
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Management Data Components
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Control component visibility in Page Builder. INACTIVE components
              are hidden from the component selector.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDryRunSchemaSync}
              disabled={schemaSyncing}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            >
              Preview Schema Sync
            </button>
            <button
              onClick={handleSyncAllSchemas}
              disabled={schemaSyncing}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {schemaSyncing ? "Syncing..." : "Sync All Components"}
            </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg
              className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {syncing ? "Syncing…" : "Sync from Registry"}
          </button>
        </div>

        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Components", value: totalItems, color: "blue" },
            { label: "Active", value: activeCount, color: "green" },
            { label: "Inactive", value: inactiveCount, color: "red" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`rounded-lg border p-4 ${
                color === "blue"
                  ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                  : color === "green"
                  ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                  : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
              }`}
            >
              <p
                className={`text-2xl font-bold ${
                  color === "blue"
                    ? "text-blue-700 dark:text-blue-400"
                    : color === "green"
                    ? "text-green-700 dark:text-green-400"
                    : "text-red-700 dark:text-red-400"
                }`}
              >
                {value}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {schemaPreview && (
          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  Component Schema Sync Preview
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {schemaPreview.totalComponents} components scanned across {schemaPreview.totalPages} pages.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white px-3 py-1 font-medium text-blue-700 dark:bg-gray-900 dark:text-blue-300">
                  Outdated: {schemaPreview.outdatedComponents}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-medium text-blue-700 dark:bg-gray-900 dark:text-blue-300">
                  Changed: {schemaPreview.changedComponents}
                </span>
                <span className="rounded-full bg-white px-3 py-1 font-medium text-blue-700 dark:bg-gray-900 dark:text-blue-300">
                  Failed: {schemaPreview.failedComponents}
                </span>
              </div>
            </div>
            {schemaPreview.impacts.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-md bg-white text-xs dark:bg-gray-950">
                {schemaPreview.impacts.slice(0, 12).map((impact) => (
                  <div key={impact.componentId} className="border-b border-gray-100 px-3 py-2 last:border-b-0 dark:border-gray-800">
                    <span className="font-mono text-blue-700 dark:text-blue-300">{impact.componentType}</span>
                    <span className="text-gray-500 dark:text-gray-400"> on {impact.pageTitle || impact.pageSlug}</span>
                    <span className="ml-2 text-gray-400">v{impact.currentVersion} -&gt; v{impact.targetVersion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search component name or key…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
          <select
            value={filterBU}
            onChange={(e) => setFilterBU(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All Business Units</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="FIBER">Fiber</option>
            <option value="MEDIA">Media</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-2.5 dark:bg-blue-900/20">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedIds.size} selected
            </span>
            <button
              onClick={() => handleBulkStatus("ACTIVE")}
              disabled={bulkWorking}
              className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              Enable All
            </button>
            <button
              onClick={() => handleBulkStatus("INACTIVE")}
              disabled={bulkWorking}
              className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              Disable All
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="ml-auto text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <svg
              className="h-6 w-6 animate-spin text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-gray-400">
            <p className="font-medium">No components found</p>
            <p className="text-sm">
              Click &quot;Sync from Registry&quot; to populate from the component registry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === entries.length && entries.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Component Key
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Display Name
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Business Unit
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Visibility in Page Builder
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Created At
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Updated At
                  </th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(entry.id)}
                        onChange={() => toggleSelect(entry.id)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {entry.componentKey}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">
                      {entry.componentName}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {entry.businessUnit || (
                        <span className="text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-4 py-3">
                      {/* Toggle switch */}
                      <button
                        onClick={() => handleToggle(entry)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          entry.status === "ACTIVE"
                            ? "bg-green-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                        title={
                          entry.status === "ACTIVE"
                            ? "Click to hide from Page Builder"
                            : "Click to show in Page Builder"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            entry.status === "ACTIVE"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {entry.status === "ACTIVE" ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(entry.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingEntry(entry)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        title="Edit"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-700 dark:text-gray-200">{startItem}–{endItem}</span> of{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">{totalItems}</span> components
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ‹
              </button>
              {renderPageNumbers().map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium ${
                      p === currentPage
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                ›
              </button>
            </div>
          </div>
        )}

        {/* Info box */}
        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <p className="font-medium">How it works</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">
            <li>
              Components marked as <strong>INACTIVE</strong> are hidden from the
              Page Builder selector, canvas load, and public rendering.
            </li>
            <li>
              Components <strong>not in this table</strong> default to ACTIVE.
              Use &quot;Sync from Registry&quot; to populate all known components.
            </li>
            <li>
              Changes take effect immediately for any new Page Builder session.
            </li>
            <li>
              Existing inactive component records stay in the database, but they
              cannot be added or saved again until reactivated.
            </li>
          </ul>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEntry && (
        <EditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={async () => {
            setEditingEntry(null);
            await fetchEntries();
          }}
        />
      )}
    </div>
  );
}
