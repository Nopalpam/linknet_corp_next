"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  managementService,
  Management,
  ManagementCategory,
} from "@/services/management.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import ManagementFormModal from "./components/ManagementFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import BulkDeleteModal from "@/components/BulkDeleteModal";

export default function ManagementPage() {
  const toast = useToast();
  const [managements, setManagements] = useState<Management[]>([]);
  const [categories, setCategories] = useState<ManagementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedManagement, setSelectedManagement] = useState<Management | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await managementService.getCategories();
      setCategories(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  // Fetch managements with pagination
  const fetchManagements = useCallback(
    async (page = currentPage) => {
      try {
        setLoading(true);
        const response = await managementService.getManagements({
          page,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          categoryId: filterCategory || undefined,
          isActive: filterStatus === "ALL" ? undefined : filterStatus === "ACTIVE",
        });

        setManagements(response.data || []);
        setCurrentPage(response.pagination.currentPage);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      } catch (err: any) {
        const errorMsg = err.message || "Failed to fetch managements";
        toast.error(errorMsg);
        setManagements([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, searchQuery, filterCategory, filterStatus, toast]
  );

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchManagements(1);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterCategory, filterStatus, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchManagements(page);
  };

  // Handle create
  const handleCreate = () => {
    setFormMode("create");
    setSelectedManagement(null);
    setIsFormModalOpen(true);
  };

  // Handle edit
  const handleEdit = (management: Management) => {
    setFormMode("edit");
    setSelectedManagement(management);
    setIsFormModalOpen(true);
  };

  // Handle delete
  const handleDelete = (management: Management) => {
    setSelectedManagement(management);
    setIsDeleteModalOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select items to delete");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(
        message ||
          (formMode === "create"
            ? "Management berhasil ditambahkan"
            : "Management berhasil diperbarui")
      );
      await fetchManagements(currentPage);
      setSelectedIds([]);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedManagement) return;

    try {
      await managementService.delete(selectedManagement.id);
      toast.success("Management berhasil dihapus");
      setIsDeleteModalOpen(false);
      await fetchManagements(currentPage);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus management");
    }
  };

  // Handle bulk delete confirm
  const handleBulkDeleteConfirm = async () => {
    try {
      await managementService.bulkDelete(selectedIds);
      toast.success(`${selectedIds.length} management berhasil dihapus`);
      setIsBulkDeleteModalOpen(false);
      await fetchManagements(currentPage);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus management");
    }
  };

  // Handle select
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Handle select all
  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(ids.length === selectedIds.length ? [] : ids);
  };

  // Table columns
  const columns: TableColumn<Management>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={item.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {item.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {item.position}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (item) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {item.category.name}
        </span>
      ),
    },
    {
      key: "email",
      label: "Contact",
      render: (item) => (
        <div className="text-sm">
          {item.email && (
            <div className="text-gray-900 dark:text-white">{item.email}</div>
          )}
          {item.phone && (
            <div className="text-gray-500 dark:text-gray-400">{item.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: "order",
      label: "Order",
      render: (item) => (
        <span className="text-gray-600 dark:text-gray-400">{item.order}</span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  // Action buttons
  const renderActions = (item: Management) => (
    <>
      <button
        onClick={() => handleEdit(item)}
        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        title="Edit"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        onClick={() => handleDelete(item)}
        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        title="Delete"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Management" />

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage company management team members
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete ({selectedIds.length})
              </button>
            )}
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Management
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, position, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Category:
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={managements}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={
            selectedIds.length === managements.length && managements.length > 0
          }
          actions={renderActions}
          getItemId={(item) => item.id}
          emptyMessage="No management members found"
        />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-6">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onLimitChange={(limit: number) => {
                setItemsPerPage(limit);
                setCurrentPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ManagementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        management={selectedManagement}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        managementName={selectedManagement?.name || ""}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        itemCount={selectedIds.length}
        itemName="management"
      />
    </div>
  );
}
