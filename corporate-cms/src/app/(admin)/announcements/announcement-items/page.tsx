"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  announcementService,
  AnnouncementItem,
  AnnouncementType,
  AnnouncementSection,
} from "@/services/announcement.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import BulkDeleteModal from "@/components/BulkDeleteModal";
import ItemFormModal from "./components/ItemFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function AnnouncementItemsPage() {
  const toast = useToast();

  // Data state
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [announcementTypes, setAnnouncementTypes] = useState<AnnouncementType[]>([]);
  const [sections, setSections] = useState<AnnouncementSection[]>([]);
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
  const [filterSectionId, setFilterSectionId] = useState<string>("");
  const [filterDataType, setFilterDataType] = useState<string>("");
  const [filterAuditStatus, setFilterAuditStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState("sortOrder");
  const [sortOrderDir, setSortOrderDir] = useState<"asc" | "desc">("asc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnnouncementItem | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch all announcement types
  const fetchAnnouncementTypes = useCallback(async () => {
    try {
      const response = await announcementService.getAnnouncementTypesList();
      setAnnouncementTypes(response.data || []);
    } catch {
      setAnnouncementTypes([]);
    }
  }, []);

  // Fetch sections when announcement type changes
  const fetchSections = useCallback(async (typeId: string) => {
    if (!typeId) {
      setSections([]);
      return;
    }
    try {
      const response = await announcementService.getAnnouncementSectionsList(typeId);
      setSections(response.data || []);
    } catch {
      setSections([]);
    }
  }, []);

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncementItems({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchQuery || undefined,
        announcementTypeId: filterTypeId || undefined,
        announcementSectionId: filterSectionId || undefined,
        dataType: filterDataType || undefined,
        auditStatus: filterAuditStatus || undefined,
        sortBy,
        sortOrder: sortOrderDir,
      });
      setItems(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    searchQuery,
    filterTypeId,
    filterSectionId,
    filterDataType,
    filterAuditStatus,
    sortBy,
    sortOrderDir,
    toast,
  ]);

  useEffect(() => {
    fetchAnnouncementTypes();
  }, [fetchAnnouncementTypes]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchSections(filterTypeId);
    setFilterSectionId("");
  }, [filterTypeId, fetchSections]);

  // Handlers
  const handleCreate = () => {
    setFormMode("create");
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item: AnnouncementItem) => {
    setFormMode("edit");
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleDelete = (item: AnnouncementItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (item: AnnouncementItem) => {
    try {
      const response = await announcementService.toggleAnnouncementItemStatus(item.id);
      toast.success(response.message);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(message || "Item saved");
      fetchItems();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      await announcementService.deleteAnnouncementItem(selectedItem.id);
      toast.success("Item deleted successfully");
      setIsDeleteModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    try {
      await announcementService.deleteMultipleAnnouncementItems(selectedIds);
      toast.success(`${selectedIds.length} items deleted`);
      setSelectedIds([]);
      setIsBulkDeleteModalOpen(false);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete items");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
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
  const columns: TableColumn<AnnouncementItem>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.coverImage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.coverImage}
              alt={item.title}
              className="h-12 w-9 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <span className="font-medium text-gray-900 dark:text-white block truncate">
              {item.title}
            </span>
            {item.subDescription && (
              <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                {item.subDescription}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "announcementType",
      label: "Announcement Type",
      render: (item) => (
        <div className="text-sm">
          <span className="text-gray-700 dark:text-gray-300">
            {item.announcementType?.name || "—"}
          </span>
          {item.announcementType?.type && (
            <span
              className={`ml-1 inline-flex items-center rounded px-1.5 py-0.5 text-xs ${
                item.announcementType.type === "Grid"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
              }`}
            >
              {item.announcementType.type}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "announcementSection",
      label: "Section",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.announcementSection?.title || "—"}
        </span>
      ),
    },
    {
      key: "dataType",
      label: "Data Type",
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.dataType || "—"}
        </span>
      ),
    },
    {
      key: "auditStatus",
      label: "Audit",
      render: (item) => {
        if (!item.auditStatus) return <span className="text-gray-400">—</span>;
        const colors: Record<string, string> = {
          Audited: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
          Unaudited: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
          "Limited Review": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              colors[item.auditStatus] || ""
            }`}
          >
            {item.auditStatus}
          </span>
        );
      },
    },
    {
      key: "sortOrder",
      label: "Order",
      sortable: true,
      width: "w-16",
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
      <PageBreadCrumb pageTitle="Announcement Items" />

      {/* Toolbar */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="h-10 w-56 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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

            {/* Announcement Type filter */}
            <select
              value={filterTypeId}
              onChange={(e) => {
                setFilterTypeId(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              {announcementTypes.map((at) => (
                <option key={at.id} value={at.id}>
                  {at.name} ({at.type})
                </option>
              ))}
            </select>

            {/* Section filter (cascading) */}
            {sections.length > 0 && (
              <select
                value={filterSectionId}
                onChange={(e) => {
                  setFilterSectionId(e.target.value);
                  setPagination((prev) => ({ ...prev, currentPage: 1 }));
                }}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} {s.announcementYear ? `(${s.announcementYear})` : ""}
                  </option>
                ))}
              </select>
            )}

            {/* Data Type filter */}
            <select
              value={filterDataType}
              onChange={(e) => {
                setFilterDataType(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Data Types</option>
              <option value="Consolidated">Consolidated</option>
              <option value="Interim">Interim</option>
            </select>

            {/* Audit Status filter */}
            <select
              value={filterAuditStatus}
              onChange={(e) => {
                setFilterAuditStatus(e.target.value);
                setPagination((prev) => ({ ...prev, currentPage: 1 }));
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Audit Status</option>
              <option value="Audited">Audited</option>
              <option value="Unaudited">Unaudited</option>
              <option value="Limited Review">Limited Review</option>
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
            + Add Item
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <DataTable
          columns={columns}
          data={items}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={selectedIds.length === items.length && items.length > 0}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrderDir}
          getItemId={(item) => item.id}
          emptyMessage="No announcement items found"
          actions={(item) => (
            <>
              {/* PDF Link */}
              {item.pdfFile && (
                <a
                  href={item.pdfFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                  title="View PDF"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </a>
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
        {!loading && items.length > 0 && (
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
      <ItemFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
        item={selectedItem}
        announcementTypes={announcementTypes}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.title || ""}
        itemType="announcement item"
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedIds.length}
        itemName="announcement items"
      />
    </div>
  );
}
