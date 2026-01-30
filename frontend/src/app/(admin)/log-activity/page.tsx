"use client";

import React, { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { logActivityService, ActivityLog } from "@/services";

const LogActivityPage = () => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Filters
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await logActivityService.getActivityLogs({
        page: currentPage,
        limit: itemsPerPage,
        module: moduleFilter || undefined,
        action: actionFilter || undefined,
      });

      setActivities(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error: any) {
      const errorMsg = error.message || "Gagal mengambil data log aktivitas";
      setError(errorMsg);
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, moduleFilter, actionFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Debounce search - filter on frontend
  const filteredActivities = activities.filter((activity) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.description?.toLowerCase().includes(searchLower) ||
      activity.user?.email?.toLowerCase().includes(searchLower) ||
      activity.ipAddress?.toLowerCase().includes(searchLower)
    );
  });

  // Handle filter change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilterChange();
  }, [moduleFilter, actionFilter]);

  // View detail
  const handleViewDetail = async (id: string) => {
    try {
      const response = await logActivityService.getActivityLogById(id);
      // Show detail in alert
      const detail = `
Module: ${response.data.module}
Action: ${response.data.action}
Description: ${response.data.description}
IP Address: ${response.data.ipAddress || 'N/A'}
User Agent: ${response.data.userAgent || 'N/A'}
      `.trim();
      alert(`Log Detail\n\n${detail}`);
    } catch (error: any) {
      alert(error.message || "Gagal mengambil detail log");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Log Activity" />

      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-black dark:text-white">
            Activity Logs
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View all system activity logs (read-only)
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg bg-danger/10 border border-danger/20 p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-danger flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-danger">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-danger hover:text-danger/80"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by description, user, IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            >
              <option value="">All Modules</option>
              <option value="user">User</option>
              <option value="award">Award</option>
              <option value="management">Management</option>
              <option value="page">Page</option>
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-stroke bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 dark:bg-meta-4 text-left">
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  User
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Module
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Action
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Description
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  IP Address
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Date
                </th>
                <th className="px-4 py-3 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium text-black dark:text-white">
                          {activity.user?.name || "System"}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {activity.user?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {activity.module}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded px-2 py-1 text-xs font-medium ${
                          activity.action === "CREATE"
                            ? "bg-success/10 text-success"
                            : activity.action === "UPDATE"
                            ? "bg-warning/10 text-warning"
                            : activity.action === "DELETE"
                            ? "bg-danger/10 text-danger"
                            : "bg-gray-100 text-gray-600 dark:bg-meta-4 dark:text-gray-300"
                        }`}
                      >
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {activity.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {activity.ipAddress || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(activity.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleViewDetail(activity.id)}
                        className="text-primary hover:text-primary-dark"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
              entries
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`rounded border px-4 py-2 text-sm font-medium ${
                      currentPage === pageNumber
                        ? "border-primary bg-primary text-white"
                        : "border-stroke hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-2 disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:hover:bg-meta-4"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LogActivityPage;
