"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import BulkDeleteModal from "@/components/BulkDeleteModal";
import cookieConsentService, {
  CookieConsentRecord,
  CookieConsentStats,
} from "@/services/cookieConsent.service";

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-4">
        <div className={`rounded-lg p-3 ${colorMap[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TOP LIST COMPONENT
// ============================================
function TopList({
  title,
  items,
  labelKey,
  valueKey,
}: {
  title: string;
  items: Record<string, any>[];
  labelKey: string;
  valueKey: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">{item[labelKey]}</span>
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                {item[valueKey]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ============================================
// MAIN PAGE
// ============================================
export default function CookieConsentsPage() {
  // Data state
  const [consents, setConsents] = useState<CookieConsentRecord[]>([]);
  const [stats, setStats] = useState<CookieConsentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search & sort state
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("consentedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  // Date filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ============================================
  // DATA FETCHING
  // ============================================

  const fetchConsents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cookieConsentService.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
        sortBy,
        sortOrder,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setConsents(result.data || []);
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.totalItems);
      }
    } catch (error) {
      console.error("Failed to fetch cookie consents:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search, sortBy, sortOrder, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const result = await cookieConsentService.getStats();
      setStats(result.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchConsents();
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === consents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(consents.map((c) => c.id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await cookieConsentService.deleteMultiple(selectedIds);
      setSelectedIds([]);
      setShowBulkDelete(false);
      fetchConsents();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await cookieConsentService.delete(id);
      fetchConsents();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleExport = async () => {
    try {
      const result = await cookieConsentService.export({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Download as CSV
      const headers = ["IP Address", "OS", "Browser", "Device", "Consent Date"];
      const rows = result.data.map((item: any) => [
        item.ipAddress,
        item.os || "-",
        item.browser || "-",
        item.device || "-",
        new Date(item.consentedAt).toLocaleString(),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell: string) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cookie-consents-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  // ============================================
  // TABLE COLUMNS
  // ============================================

  const columns: TableColumn<CookieConsentRecord>[] = [
    {
      key: "ipAddress",
      label: "IP Address",
      sortable: true,
      render: (item) => (
        <span className="font-mono text-sm">{item.ipAddress}</span>
      ),
    },
    {
      key: "os",
      label: "Operating System",
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400"></span>
          {item.os || "-"}
        </span>
      ),
    },
    {
      key: "browser",
      label: "Browser",
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400"></span>
          {item.browser || "-"}
        </span>
      ),
    },
    {
      key: "device",
      label: "Device",
      sortable: true,
      render: (item) => {
        const deviceColor =
          item.device === "Desktop"
            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            : item.device === "Mobile"
            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        return (
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${deviceColor}`}>
            {item.device || "-"}
          </span>
        );
      },
    },
    {
      key: "consentedAt",
      label: "Consent Date",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(item.consentedAt).toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  return (
    <div>
      <PageBreadCrumb pageTitle="Cookie Consents" />

      <p className="mb-6 text-gray-600 dark:text-gray-400">
        Monitor and manage cookie consent data from website visitors. This data is collected when users accept the cookie notice on the public website.
      </p>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Consents"
          value={statsLoading ? "..." : stats?.totalConsents ?? 0}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Today"
          value={statsLoading ? "..." : stats?.todayConsents ?? 0}
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Top Browser"
          value={
            statsLoading
              ? "..."
              : stats?.topBrowsers?.[0]?.browser ?? "N/A"
          }
          color="purple"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
          }
        />
        <StatCard
          label="Top OS"
          value={
            statsLoading ? "..." : stats?.topOS?.[0]?.os ?? "N/A"
          }
          color="orange"
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Top Lists */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <TopList
          title="Top Browsers"
          items={stats?.topBrowsers ?? []}
          labelKey="browser"
          valueKey="count"
        />
        <TopList
          title="Top Operating Systems"
          items={stats?.topOS ?? []}
          labelKey="os"
          valueKey="count"
        />
        <TopList
          title="Top Devices"
          items={stats?.topDevices ?? []}
          labelKey="device"
          valueKey="count"
        />
      </div>

      {/* Data Table Section */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Consent Records
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                placeholder="Search IP, OS, browser..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-l-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-r-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
              >
                Search
              </button>
            </form>

            {/* Date Filters */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              title="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              title="End date"
            />

            {/* Export Button */}
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>

            {/* Bulk Delete */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowBulkDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={consents}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={consents.length > 0 && selectedIds.length === consents.length}
          getItemId={(item) => item.id}
          emptyMessage="No cookie consent records found"
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          actions={(item) => (
            <button
              onClick={() => handleDelete(item.id)}
              className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
              title="Delete record"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        />

        {/* Pagination */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onLimitChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex gap-3">
          <svg className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Privacy & Compliance Notice</h3>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
              This data is collected in compliance with privacy regulations (GDPR/PDPA). IP addresses and device information are stored for analytics purposes only. 
              Ensure your Privacy Policy page is up to date and accessible on the public website. 
              Consider implementing periodic data purging for records older than required retention period.
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <BulkDeleteModal
          isOpen={showBulkDelete}
          onClose={() => setShowBulkDelete(false)}
          onConfirm={handleBulkDelete}
          itemCount={selectedIds.length}
          itemName="cookie consent record"
        />
      )}
    </div>
  );
}
