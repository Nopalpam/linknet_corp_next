"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  reportService,
  ReportType,
  ReportSection,
  ReportItem,
  OrderUpdate,
} from "@/services/report.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import BulkDeleteModal from "@/components/BulkDeleteModal";
import ReportTypeFormModal from "./components/ReportTypeFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ManageSectionsModal from "./components/ManageSectionsModal";
import ManageGridItemsModal from "./components/ManageGridItemsModal";

export default function ReportTypesPage() {
  const toast = useToast();

  // Data state
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("");
  const [sortBy, setSortBy] = useState("sortOrder");
  const [sortOrderDir, setSortOrderDir] = useState<"asc" | "desc">("asc");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
  const [isGridItemsModalOpen, setIsGridItemsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch data
  const fetchReportTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportService.getReportTypes({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchQuery || undefined,
        type: filterType || undefined,
        sortBy,
        sortOrder: sortOrderDir,
      });
      setReportTypes(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch report types");
      setReportTypes([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchQuery, filterType, sortBy, sortOrderDir, toast]);

  useEffect(() => {
    fetchReportTypes();
  }, [fetchReportTypes]);

  // Handlers
  const handleCreate = () => {
    setFormMode("create");
    setSelectedReportType(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: ReportType) => {
    setFormMode("edit");
    setSelectedReportType(item);
    setIsFormModalOpen(true);
  };

  const handleDelete = (item: ReportType) => {
    setSelectedReportType(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (item: ReportType) => {
    try {
      const response = await reportService.toggleReportTypeStatus(item.id);
      toast.success(response.message);
      fetchReportTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleManageSections = (item: ReportType) => {
    setSelectedReportType(item);
    setIsSectionsModalOpen(true);
  };

  const handleManageGridItems = (item: ReportType) => {
    setSelectedReportType(item);
    setIsGridItemsModalOpen(true);
  };

  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(message || (formMode === "create" ? "Report type created" : "Report type updated"));
      fetchReportTypes();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReportType) return;
    try {
      await reportService.deleteReportType(selectedReportType.id);
      toast.success("Report type deleted successfully");
      setIsDeleteModalOpen(false);
      fetchReportTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete report type");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await reportService.deleteMultipleReportTypes(selectedIds);
      toast.success(`${selectedIds.length} report types deleted`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchReportTypes();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete report types");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === reportTypes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reportTypes.map((i) => i.id));
    }
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrderDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortOrderDir("asc");
    }
  };

  // Table columns
  const columns: TableColumn<ReportType>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {item.name}
        </span>
      ),
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.type === "Grid"
              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
          }`}
        >
          {item.type}
        </span>
      ),
    },
    {
      key: "sortOrder",
      label: "Order",
      sortable: true,
      width: "w-20",
    },
    {
      key: "sections",
      label: "Sections",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item._count?.reportSections ?? 0}
        </span>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item._count?.reportItems ?? 0}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleStatus(item);
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            item.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              item.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageBreadCrumb pageTitle="Report Types" />

      {/* Toolbar */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search report types..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="h-10 w-64 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="Grid">Grid</option>
              <option value="List">List</option>
            </select>

            {/* Bulk delete */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete ({selectedIds.length})
              </button>
            )}
          </div>

          <button
            onClick={handleCreate}
            className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Report Type
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <DataTable
          columns={columns}
          data={reportTypes}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedIds.length === reportTypes.length && reportTypes.length > 0}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrderDir}
          getItemId={(item) => item.id}
          emptyMessage="No report types found"
          actions={(item) => (
            <>
              {/* Manage sub-items button */}
              {item.type === "List" ? (
                <button
                  onClick={() => handleManageSections(item)}
                  className="rounded p-1 text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                  title="Manage Sections"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => handleManageGridItems(item)}
                  className="rounded p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  title="Manage Grid Items"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
              )}

              {/* Edit */}
              <button
                onClick={() => handleEdit(item)}
                className="rounded p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                title="Edit"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(item)}
                className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title="Delete"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        />

        {/* Pagination */}
        {!loading && reportTypes.length > 0 && (
          <DataTablePagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      <ReportTypeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        reportType={selectedReportType}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedReportType?.name || ""}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedIds.length}
        itemName="report types"
      />

      {selectedReportType && (
        <>
          <ManageSectionsModal
            isOpen={isSectionsModalOpen}
            onClose={() => setIsSectionsModalOpen(false)}
            reportType={selectedReportType}
            onUpdate={fetchReportTypes}
          />

          <ManageGridItemsModal
            isOpen={isGridItemsModalOpen}
            onClose={() => setIsGridItemsModalOpen(false)}
            reportType={selectedReportType}
            onUpdate={fetchReportTypes}
          />
        </>
      )}
    </div>
  );
}
