"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  careerService,
  Career,
  CareerStats,
  CareerListParams,
} from "@/services/career.service";
import { useToast } from "@/context/ToastContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CareerStatsCards from "./components/CareerStatsCards";
import CareerTable from "./components/CareerTable";
import CareerFilters from "./components/CareerFilters";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import BulkDeleteModal from "./components/BulkDeleteModal";

export default function CareersPage() {
  const toast = useToast();
  const router = useRouter();

  // Data states
  const [careers, setCareers] = useState<Career[]>([]);
  const [stats, setStats] = useState<CareerStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDivision, setFilterDivision] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [careerToDelete, setCareerToDelete] = useState<Career | null>(null);

  // Fetch careers
  const fetchCareers = useCallback(async () => {
    try {
      setLoading(true);
      const params: CareerListParams = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterType) params.type = filterType;
      if (filterLocation) params.location = filterLocation;
      if (filterDivision) params.division = filterDivision;

      const response = await careerService.getAdminCareers(params);
      setCareers(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch careers");
      setCareers([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filterStatus, filterType, filterLocation, filterDivision, sortBy, sortOrder, toast]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await careerService.getStats();
      setStats(response.data);
    } catch {
      // Stats fetch failure is non-critical
    }
  }, []);

  useEffect(() => {
    fetchCareers();
    fetchStats();
  }, [fetchCareers, fetchStats]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterType, filterLocation, filterDivision]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Handle delete
  const handleDelete = (career: Career) => {
    setCareerToDelete(career);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!careerToDelete) return;
    try {
      await careerService.deleteCareer(careerToDelete.id);
      toast.success("Career position deleted successfully");
      setDeleteModalOpen(false);
      setCareerToDelete(null);
      fetchCareers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete career");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select at least one career position");
      return;
    }
    setBulkDeleteModalOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const result = await careerService.bulkDeleteCareers(selectedIds);
      toast.success(result.message);
      setBulkDeleteModalOpen(false);
      setSelectedIds([]);
      fetchCareers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete careers");
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (career: Career) => {
    try {
      const result = await careerService.toggleStatus(career.id);
      toast.success(result.message);
      fetchCareers();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  // Handle select
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(careers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterType("");
    setFilterLocation("");
    setFilterDivision("");
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Career Management" />

      {/* Statistics Cards */}
      <CareerStatsCards stats={stats} />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/careers/create")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Career
          </button>

          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {total} positions
        </div>
      </div>

      {/* Filters */}
      <CareerFilters
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterType={filterType}
        onTypeChange={setFilterType}
        filterLocation={filterLocation}
        onLocationChange={setFilterLocation}
        filterDivision={filterDivision}
        onDivisionChange={setFilterDivision}
        onClearFilters={handleClearFilters}
      />

      {/* Table */}
      <CareerTable
        careers={careers}
        loading={loading}
        selectedIds={selectedIds}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEdit={(career: Career) => router.push(`/careers/${career.id}/edit`)}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    page === pageNum
                      ? "bg-brand-500 text-white"
                      : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Career Position"
        message={`Are you sure you want to delete "${careerToDelete?.position}"? This action cannot be undone.`}
      />

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={confirmBulkDelete}
        count={selectedIds.length}
      />
    </>
  );
}
