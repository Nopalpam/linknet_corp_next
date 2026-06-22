"use client";

import React, { useState, useEffect, useCallback } from "react";
import { awardsService, Award } from "@/services/awards.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import AwardsTable from "./components/AwardsTable";
import AwardFormModal from "./components/AwardFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function AwardsPage() {
  const toast = useToast();
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAward, setSelectedAward] = useState<Award | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Fetch awards
  const fetchAwards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await awardsService.getAllAwards(
        filterStatus === 'ALL' ? undefined : filterStatus
      );
      setAwards(response.data || []);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch awards';
      setError(errorMsg);
      setAwards([]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, toast]);

  useEffect(() => {
    fetchAwards();
  }, [fetchAwards]);

  // Filter awards based on search query
  const filteredAwards = awards.filter((award) => {
    const query = searchQuery.toLowerCase();
    return (
      award.title.toLowerCase().includes(query) ||
      award.issuer.toLowerCase().includes(query) ||
      award.year.toString().includes(query)
    );
  });

  // Handle create
  const handleCreate = () => {
    setFormMode('create');
    setSelectedAward(null);
    setIsFormModalOpen(true);
  };

  // Handle edit
  const handleEdit = (award: Award) => {
    setFormMode('edit');
    setSelectedAward(award);
    setIsFormModalOpen(true);
  };

  // Handle delete
  const handleDelete = (award: Award) => {
    setSelectedAward(award);
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(message || (formMode === 'create' ? 'Award berhasil ditambahkan' : 'Award berhasil diperbarui'));
      await fetchAwards();
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedAward) return;

    try {
      await awardsService.deleteAward(selectedAward.id);
      toast.success('Award berhasil dihapus');
      setIsDeleteModalOpen(false);
      await fetchAwards();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus award');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Awards Management" />

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Awards Management
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage all awards and achievements
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
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
            Add Award
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, issuer, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        <AwardsTable
          awards={filteredAwards}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Form Modal */}
      <AwardFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        award={selectedAward}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        awardTitle={selectedAward?.title || ''}
      />
    </div>
  );
}
