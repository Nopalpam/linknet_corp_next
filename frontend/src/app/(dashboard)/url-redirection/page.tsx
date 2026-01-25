"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { urlRedirectionService, UrlRedirect } from "@/services";

interface FormData {
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  isActive: boolean;
}

const UrlRedirectionPage = () => {
  const [urlRedirects, setUrlRedirects] = useState<UrlRedirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fromUrl: "",
    toUrl: "",
    statusCode: 301,
    isActive: true,
  });

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const fetchUrlRedirects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active";
      }

      const response = await urlRedirectionService.getUrlRedirects(params);

      setUrlRedirects(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.totalItems || 0);
    } catch (error: any) {
      setError(error.message || "Gagal mengambil data URL redirection");
      console.error("Error fetching URL redirects:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, statusFilter]);

  useEffect(() => {
    fetchUrlRedirects();
  }, [fetchUrlRedirects]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "statusCode"
          ? parseInt(value)
          : value,
    }));
  };

  // Open modal for create
  const handleCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setFormData({
      fromUrl: "",
      toUrl: "",
      statusCode: 301,
      isActive: true,
    });
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (redirect: UrlRedirect) => {
    setModalMode("edit");
    setEditingId(redirect.id);
    setFormData({
      fromUrl: redirect.fromUrl,
      toUrl: redirect.toUrl,
      statusCode: redirect.statusCode,
      isActive: redirect.isActive,
    });
    setShowModal(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (modalMode === "create") {
        await urlRedirectionService.createUrlRedirect(formData);
        setSuccess("URL Redirection berhasil dibuat");
      } else if (editingId) {
        await urlRedirectionService.updateUrlRedirect(editingId, formData);
        setSuccess("URL Redirection berhasil diperbarui");
      }

      setShowModal(false);
      fetchUrlRedirects();

      // Auto-hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal menyimpan URL redirection");
    }
  };

  // Delete single item
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus URL redirection ini?")) {
      return;
    }

    try {
      await urlRedirectionService.deleteUrlRedirect(id);
      setSuccess("URL Redirection berhasil dihapus");
      fetchUrlRedirects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal menghapus URL redirection");
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("Pilih minimal satu item untuk dihapus");
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} item?`)) {
      return;
    }

    try {
      await urlRedirectionService.bulkDeleteUrlRedirects(selectedIds);
      setSuccess(`${selectedIds.length} URL Redirection berhasil dihapus`);
      setSelectedIds([]);
      setSelectAll(false);
      fetchUrlRedirects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal menghapus URL redirection");
    }
  };

  // Toggle active status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await urlRedirectionService.toggleUrlRedirectStatus(id);
      setSuccess(
        `Status berhasil diubah menjadi ${!currentStatus ? "Aktif" : "Nonaktif"}`
      );
      fetchUrlRedirects();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      setError(error.message || "Gagal mengubah status");
    }
  };

  // Select all checkbox handler
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(urlRedirects.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  // Individual checkbox handler
  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <>
      <PageBreadcrumb pageTitle="URL Redirection Management" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            URL Redirection Management
          </h4>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center justify-center rounded-md bg-danger px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
              >
                <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus ({selectedIds.length})
              </button>
            )}
            <button
              onClick={handleCreate}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90"
            >
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Baru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="Cari source URL..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded border border-stroke bg-gray px-4 py-2 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white sm:w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded border border-stroke bg-gray px-4 py-2 text-black outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            onClick={handleResetFilters}
            className="rounded border border-stroke px-4 py-2 text-black hover:bg-gray dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Reset
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-danger/10 p-4 text-danger">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg bg-success/10 p-4 text-success">
            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Source URL</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Target URL</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Status Code</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Hits</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Status</th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {urlRedirects.length > 0 ? (
                    urlRedirects.map((redirect) => (
                      <tr key={redirect.id} className="border-b border-stroke dark:border-strokedark">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(redirect.id)}
                            onChange={() => handleSelectOne(redirect.id)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-black dark:text-white font-medium">{redirect.fromUrl}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-black dark:text-white">{redirect.toUrl}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                              redirect.statusCode === 301
                                ? "bg-success/10 text-success"
                                : "bg-warning/10 text-warning"
                            }`}
                          >
                            {redirect.statusCode}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-black dark:text-white">{redirect.hits || 0}</p>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleStatus(redirect.id, redirect.isActive)}
                            className={`inline-flex rounded px-3 py-1 text-xs font-medium ${
                              redirect.isActive
                                ? "bg-success/10 text-success hover:bg-success/20"
                                : "bg-danger/10 text-danger hover:bg-danger/20"
                            }`}
                          >
                            {redirect.isActive ? "Aktif" : "Nonaktif"}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(redirect)}
                              className="hover:text-primary"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(redirect.id)}
                              className="hover:text-danger"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                          Tidak ada data URL redirection
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-stroke py-4 dark:border-strokedark sm:flex-row">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black dark:text-white">
                    Menampilkan {urlRedirects.length} dari {total} data
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border border-stroke bg-gray px-2 py-1 text-sm dark:border-strokedark dark:bg-meta-4"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded border border-stroke px-3 py-1 text-sm hover:bg-gray disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-black dark:text-white">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded border border-stroke px-3 py-1 text-sm hover:bg-gray disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                {modalMode === "create" ? "Tambah URL Redirection" : "Edit URL Redirection"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black dark:hover:text-white"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Source URL <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="fromUrl"
                  value={formData.fromUrl}
                  onChange={handleInputChange}
                  placeholder="/old-page"
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Target URL <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="toUrl"
                  value={formData.toUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/new-page"
                  required
                  className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  HTTP Status Code
                </label>
                <select
                  name="statusCode"
                  value={formData.statusCode}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
                >
                  <option value={301}>301 - Permanent Redirect</option>
                  <option value={302}>302 - Temporary Redirect</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="mr-2 cursor-pointer"
                />
                <label className="text-sm font-medium text-black dark:text-white">
                  Aktif
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-stroke pt-4 dark:border-strokedark">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border border-stroke px-4 py-2 text-black hover:bg-gray dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UrlRedirectionPage;
