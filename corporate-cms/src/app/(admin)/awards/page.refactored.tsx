"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Award } from "@/services/awards.service.new";
import { useCrudTable } from "@/hooks/useCrudTable";
import { useBulkActions } from "@/hooks/useBulkActions";
import { awardsServiceNew } from "@/services/awards.service.new";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTableHeader } from "@/components/DataTable/DataTableHeader";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import AwardFormModal from "./components/AwardFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import BulkDeleteModal from "@/components/BulkDeleteModal";

/**
 * Awards Page - Refactored with Reusable Components
 * This page demonstrates the reusable CRUD pattern:
 * - Server-side pagination via useCrudTable
 * - Debounced search (500ms)
 * - Bulk delete with checkbox selection
 * - Reusable DataTable, Header, and Pagination components
 * 
 * To create a new CRUD module (e.g., Report, News):
 * 1. Create service extending BaseCrudService
 * 2. Define columns configuration
 * 3. Copy this page structure
 * 4. Replace service and column config
 * 5. Done! No need to rewrite CRUD logic
 */
export default function AwardsPageRefactored() {
  // CRUD Table Hook - handles pagination, search, sorting
  const {
    data: awards,
    loading,
    error,
    pagination,
    searchQuery,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSearch,
    handleSort,
    handleLimitChange,
    refetch,
  } = useCrudTable<Award>({
    fetchFunction: awardsServiceNew.getPaginated.bind(awardsServiceNew),
    initialLimit: 10,
    debounceDelay: 500, // 500ms debounce
  });

  // Bulk Actions Hook - handles checkbox selection
  const {
    selectedIds,
    selectedCount,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  } = useBulkActions<string>();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Additional filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  /**
   * Column Configuration
   * Define how each column should be displayed
   */
  const columns: TableColumn<Award>[] = [
    {
      key: 'title',
      label: 'Award',
      sortable: true,
      render: (award) => (
        <div className="flex items-center gap-3">
          {award.image && (
            <div className="relative h-10 w-10 flex-shrink-0">
              <Image
                src={award.image}
                alt={award.title}
                fill
                className="rounded object-cover"
              />
            </div>
          )}
          <div>
            <div className="font-medium">{award.title}</div>
            {award.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                {award.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'year',
      label: 'Year',
      sortable: true,
      width: 'w-24',
    },
    {
      key: 'issuer',
      label: 'Issuer',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: 'w-32',
      render: (award) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            award.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {award.status}
        </span>
      ),
    },
  ];

  /**
   * Action Buttons for each row
   */
  const renderActions = (award: Award) => (
    <>
      <button
        onClick={() => handleEdit(award)}
        className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        title="Edit"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        onClick={() => handleDelete(award)}
        className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        title="Delete"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  // CRUD Handlers
  const handleCreate = () => {
    setFormMode('create');
    setSelectedAward(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (award: Award) => {
    setFormMode('edit');
    setSelectedAward(award);
    setIsFormModalOpen(true);
  };

  const handleDelete = (award: Award) => {
    setSelectedAward(award);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async () => {
    setIsFormModalOpen(false);
    await refetch();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAward) return;

    try {
      await awardsServiceNew.delete(selectedAward.id);
      setIsDeleteModalOpen(false);
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to delete award');
    }
  };

  // Bulk Delete Handlers
  const handleBulkDeleteClick = () => {
    setIsBulkDeleteModalOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await awardsServiceNew.bulkDelete(selectedIds);
      clearSelection();
      setIsBulkDeleteModalOpen(false);
      await refetch();
    } catch (err: any) {
      alert(err.message || 'Failed to delete awards');
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Awards Management" />

      {/* Main Card */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        {/* Header with Search and Filters */}
        <DataTableHeader
          title="Awards Management"
          description="Manage all awards and achievements"
          searchQuery={searchQuery}
          onSearch={handleSearch}
          searchPlaceholder="Search by title, issuer, or year..."
          onAdd={handleCreate}
          addButtonText="Add Award"
          selectedCount={selectedCount}
          onBulkDelete={handleBulkDeleteClick}
          onClearSelection={clearSelection}
          additionalFilters={
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Status:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          }
        />

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Data Table */}
        <div className="mt-6">
          <DataTable
            columns={columns}
            data={awards}
            loading={loading}
            selectable
            selectedIds={selectedIds}
            onSelect={toggleSelect}
            onSelectAll={() => toggleSelectAll(awards.map((a) => a.id))}
            isAllSelected={isAllSelected(awards.map((a) => a.id))}
            actions={renderActions}
            getItemId={(award) => award.id}
            emptyMessage="No awards found. Start by creating your first award."
            onSort={handleSort}
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </div>

        {/* Pagination */}
        <DataTablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Modals */}
      <AwardFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        award={selectedAward}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        awardTitle={selectedAward?.title || ''}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        itemCount={selectedCount}
        itemName="awards"
      />
    </div>
  );
}
