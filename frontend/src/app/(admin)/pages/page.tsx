"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { pagesService, Page } from "@/services/pages.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import { getSamplePageJSON } from "@/data/samplePageData";

export default function PagesListPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED">("ALL");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  // Fetch pages with debounce
  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const status = filterStatus === "ALL" ? undefined : filterStatus;
      const response = await pagesService.getAllPages(status);
      
      // Client-side filtering and pagination for now
      let filtered = response.data || [];
      
      // Search filter
      if (searchQuery) {
        filtered = filtered.filter((page) =>
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Pagination
      const total = filtered.length;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginated = filtered.slice(startIndex, endIndex);

      setPages(paginated);
      setTotalItems(total);
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterStatus, currentPage, itemsPerPage, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPages();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPages]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleDelete = (page: Page) => {
    setSelectedPage(page);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPage) return;

    try {
      await pagesService.deletePage(selectedPage.id);
      toast.success("Page deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedPage(null);
      fetchPages();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete page");
    }
  };

  const handleEdit = (page: Page) => {
    router.push(`/pages/${page.id}`);
  };

  const handleCreateSamplePage = async () => {
    try {
      const response = await pagesService.createPage({
        title: 'Sample Linknet Page',
        slug: `sample-page-${Date.now()}`,
        status: 'DRAFT',
        metaTitle: 'Sample Page - Linknet Corporation',
        metaDescription: 'A beautiful sample page with pre-built components showcasing our services',
        metaKeywords: 'linknet, fiber optic, internet, sample',
        components: getSamplePageJSON(),
      });
      
      toast.success("Sample page created! Redirecting to edit...");
      setTimeout(() => {
        router.push(`/pages/${response.data.id}`);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create sample page");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      ARCHIVED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    };
    return badges[status as keyof typeof badges] || badges.DRAFT;
  };

  const columns: TableColumn<Page>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (page) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {page.title}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            /{page.slug}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (page) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
            page.status
          )}`}
        >
          {page.status}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      render: (page) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(page.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (page) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(page)}
            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(page)}
            className="px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageBreadCrumb pageTitle="Pages" />

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Pages Management
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your website pages and content
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreateSamplePage}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Create Sample Page
            </button>
            <Link
              href="/pages/create"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Create Page
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={pages}
          loading={loading}
          emptyMessage="No pages found"
          getItemId={(page) => page.id}
        />

        {/* Pagination */}
        {!loading && totalItems > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPage(null);
        }}
        onConfirm={confirmDelete}
        title={selectedPage?.title || ""}
      />
    </>
  );
}
