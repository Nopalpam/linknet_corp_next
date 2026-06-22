"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  reportService,
  ReportSection,
  ReportType,
  ReportItem,
  OrderUpdate,
} from "@/services/report.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import BulkDeleteModal from "@/components/BulkDeleteModal";
import SectionFormModal from "./components/SectionFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import ManageSectionItemsModal from "./components/ManageSectionItemsModal";

export default function ReportSectionsPage() {
  const toast = useToast();

  // Data state
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTypeId, setFilterTypeId] = useState<string>("");
  const [sortBy, setSortBy] = useState("sortOrder");
  const [sortOrderDir, setSortOrderDir] = useState<"asc" | "desc">("asc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ReportSection | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch report types for dropdown (only List type)
  const fetchReportTypes = useCallback(async () => {
    try {
      const response = await reportService.getReportTypesList("List");
      setReportTypes(response.data || []);
    } catch {
      setReportTypes([]);
    }
  }, []);

  // Fetch sections
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await reportService.getReportSections({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchQuery || undefined,
        reportTypeId: filterTypeId || undefined,
        sortBy,
        sortOrder: sortOrderDir,
      });
      setSections(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch sections");
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, searchQuery, filterTypeId, sortBy, sortOrderDir, toast]);

  useEffect(() => {
    fetchReportTypes();
  }, [fetchReportTypes]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Handlers
  const handleCreate = () => {
    setFormMode("create");
    setSelectedSection(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: ReportSection) => {
    setFormMode("edit");
    setSelectedSection(item);
    setIsFormModalOpen(true);
  };

  const handleDelete = (item: ReportSection) => {
    setSelectedSection(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (item: ReportSection) => {
    try {
      const response = await reportService.toggleReportSectionStatus(item.id);
      toast.success(response.message);
      fetchSections();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleManageItems = (item: ReportSection) => {
    setSelectedSection(item);
    setIsItemsModalOpen(true);
  };

  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(message || "Section saved");
      fetchSections();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSection) return;
    try {
      await reportService.deleteReportSection(selectedSection.id);
      toast.success("Section deleted successfully");
      setIsDeleteModalOpen(false);
      fetchSections();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete section");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await reportService.deleteMultipleReportSections(selectedIds);
      toast.success(`${selectedIds.length} sections deleted`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchSections();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete sections");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === sections.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sections.map((i) => i.id));
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

  // Columns
  const columns: TableColumn<ReportSection>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
          {item.reportYear && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              ({item.reportYear})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "reportType",
      label: "Report Type",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.reportType?.name || "—"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (item) => (
        <span className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {item.description || "—"}
        </span>
      ),
    },
    {
      key: "ctaEnabled",
      label: "CTA",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            item.ctaEnabled
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
          }`}
        >
          {item.ctaEnabled ? "Yes" : "No"}
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
      key: "sortOrder",
      label: "Order",
      sortable: true,
      width: "w-20",
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
      <PageBreadCrumb pageTitle="Report Sections" />

      {/* Toolbar */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search sections..."
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

            {/* Report type filter */}
            <select
              value={filterTypeId}
              onChange={(e) => {
                setFilterTypeId(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Report Types</option>
              {reportTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
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
            + Add Section
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <DataTable
          columns={columns}
          data={sections}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedIds.length === sections.length && sections.length > 0}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrderDir}
          getItemId={(item) => item.id}
          emptyMessage="No report sections found"
          actions={(item) => (
            <>
              {/* Manage Items */}
              <button
                onClick={() => handleManageItems(item)}
                className="rounded p-1 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                title="Manage Items"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>

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
        {!loading && sections.length > 0 && (
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
      <SectionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        section={selectedSection}
        reportTypes={reportTypes}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedSection?.title || ""}
        itemType="report section"
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedIds.length}
        itemName="report sections"
      />

      {selectedSection && (
        <ManageSectionItemsModal
          isOpen={isItemsModalOpen}
          onClose={() => setIsItemsModalOpen(false)}
          section={selectedSection}
          onUpdate={fetchSections}
        />
      )}
    </div>
  );
}
