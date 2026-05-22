"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { isSessionExpiredError } from "@/lib/sessionExpired";
import { contactService, ContactSubmissionListItem } from "@/services/contact.service";
import ContactDataTable from "./components/ContactDataTable";
import ContactDetailModal from "./components/ContactDetailModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import BulkDeleteModal from "@/components/BulkDeleteModal";

export type ContactStatus = "NEW" | "READ";

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  inquiryTypeLabel: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  company?: string;
  role?: string;
  inquiryType?: ContactSubmissionListItem["inquiryType"];
}

const INQUIRY_TYPE_LABEL: Record<ContactSubmissionListItem["inquiryType"], string> = {
  BUSINESS: "Business Inquiry",
  SUPPORT: "Technical Support",
  CAREER: "Career",
  OTHERS: "Others",
};

const mapSubmissionToContactData = (submission: ContactSubmissionListItem): ContactData => ({
  id: submission.id,
  name: `${submission.firstName} ${submission.lastName}`.trim(),
  email: submission.email,
  phone: submission.phone || "-",
  inquiryTypeLabel: INQUIRY_TYPE_LABEL[submission.inquiryType],
  subject: submission.subject || "-",
  message: submission.message,
  status: submission.status,
  createdAt: submission.submittedAt,
  company: submission.company,
  role: submission.role,
  inquiryType: submission.inquiryType,
});

const CONTACT_FETCH_LIMIT = 100;

type ExportRow = Record<string, string>;

const escapeCsvCell = (value: unknown): string => {
  const normalized = String(value ?? "");
  const escaped = normalized.replace(/"/g, '""');
  return /[",\r\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const buildCsv = (rows: ExportRow[]): string => {
  const headers = Object.keys(rows[0] ?? {});
  const lines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvCell(row[header])).join(",")),
  ];

  return `\uFEFF${lines.join("\r\n")}`;
};

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

function DatePickerField({ label, value, onChange, min, max }: DatePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const id = `contact-data-bank-${label.replace(/\s+/g, "-").toLowerCase()}`;

  const openPicker = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Browser may block showPicker without a direct user gesture.
    }
  }, []);

  return (
    <div className="flex flex-col gap-1" onClick={openPicker}>
      <label
        htmlFor={id}
        className="block cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300"
        onClick={openPicker}
      >
        {label}
      </label>
      <input
        id={id}
        ref={inputRef}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        onFocus={openPicker}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

export default function ContactDataBankPage() {
  const toast = useToast();
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMessagesThisMonth, setTotalMessagesThisMonth] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedInquiryType, setSelectedInquiryType] = useState<"" | ContactSubmissionListItem["inquiryType"]>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactService.getAllContactSubmissions({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
        inquiryType: selectedInquiryType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      const nextContacts = response.data.submissions.map(mapSubmissionToContactData);

      setContacts(nextContacts);
      setTotalMessagesThisMonth(response.data.stats.totalThisMonth);
      setTotalItems(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages || 1);
      setSelectedIds((currentIds) => currentIds.filter((id) => nextContacts.some((contact) => contact.id === id)));
    } catch (err: any) {
      if (isSessionExpiredError(err)) {
        return;
      }

      toast.error(err?.message || "Gagal memuat data Contact Us");
      setContacts([]);
      setTotalMessagesThisMonth(0);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateFrom, dateTo, debouncedSearchQuery, itemsPerPage, selectedInquiryType, toast]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, dateFrom, dateTo, itemsPerPage, selectedInquiryType]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: totalItems,
      totalThisMonth: totalMessagesThisMonth,
    };
  }, [totalItems, totalMessagesThisMonth]);

  // Handle view detail
  const handleView = (contact: ContactData) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  // Handle delete single
  const handleDelete = (contact: ContactData) => {
    setSelectedContact(contact);
    setIsDeleteModalOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleteModalOpen(true);
  };

  // Handle delete confirm (mockup - just show success)
  const handleDeleteConfirm = async () => {
    if (!selectedContact) {
      return;
    }

    await contactService.deleteContactSubmission(selectedContact.id);
    setContacts((currentContacts) =>
      currentContacts.filter((contact) => contact.id !== selectedContact.id)
    );
    setSelectedIds((currentIds) => currentIds.filter((id) => id !== selectedContact.id));
    setIsDeleteModalOpen(false);
    setSelectedContact(null);
    toast.success("Pesan Contact Us berhasil dihapus");
  };

  const handleBulkDeleteConfirm = async () => {
    const idsToDelete = [...selectedIds];
    if (idsToDelete.length === 0) {
      return;
    }

    await contactService.bulkDeleteContactSubmissions(idsToDelete);
    setContacts((currentContacts) =>
      currentContacts.filter((contact) => !idsToDelete.includes(contact.id))
    );
    setIsBulkDeleteModalOpen(false);
    setSelectedIds([]);
    toast.success(`${idsToDelete.length} pesan Contact Us berhasil dihapus`);
  };

  const downloadBlob = useCallback((blob: Blob, filename: string) => {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }, []);

  const buildExportRows = useCallback((rows: ContactData[]): ExportRow[] => {
    return rows.map((contact) => ({
      Name: contact.name,
      Email: contact.email,
      Phone: contact.phone || "-",
      Company: contact.company || "-",
      Role: contact.role || "-",
      "Inquiry Type": contact.inquiryType ? INQUIRY_TYPE_LABEL[contact.inquiryType] : "-",
      Subject: contact.subject,
      Message: contact.message,
      "Submitted At": new Date(contact.createdAt).toLocaleString("id-ID"),
    }));
  }, []);

  const fetchExportRows = useCallback(async (scope: "all" | "filtered") => {
    const submissions: ContactSubmissionListItem[] = [];
    let exportPage = 1;
    let exportTotalPages = 1;

    do {
      const response = await contactService.getAllContactSubmissions({
        page: exportPage,
        limit: CONTACT_FETCH_LIMIT,
        search: scope === "filtered" ? debouncedSearchQuery || undefined : undefined,
        inquiryType: scope === "filtered" ? selectedInquiryType || undefined : undefined,
        dateFrom: scope === "filtered" ? dateFrom || undefined : undefined,
        dateTo: scope === "filtered" ? dateTo || undefined : undefined,
      });

      submissions.push(...response.data.submissions);
      exportTotalPages = response.data.pagination.totalPages || 1;
      exportPage += 1;
    } while (exportPage <= exportTotalPages);

    return submissions.map(mapSubmissionToContactData);
  }, [dateFrom, dateTo, debouncedSearchQuery, selectedInquiryType]);

  const handleExport = useCallback(async (format: "csv" | "xlsx", scope: "all" | "filtered") => {
    const sourceRows = await fetchExportRows(scope);

    if (sourceRows.length === 0) {
      toast.error("Tidak ada data Contact Us untuk diekspor");
      return;
    }

    try {
      setExporting(true);
      setExportMenuOpen(false);

      const exportRows = buildExportRows(sourceRows);
      const timestamp = new Date().toISOString().slice(0, 10);
      const scopeLabel = scope === "all" ? "all" : "filtered";

      if (format === "csv") {
        const csv = buildCsv(exportRows);
        downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `contact-us-${scopeLabel}-${timestamp}.csv`);
        return;
      }

      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Contact Us");
      const headers = Object.keys(exportRows[0] ?? {});

      workbook.creator = "LinkNet CMS";
      workbook.created = new Date();
      worksheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.min(Math.max(header.length + 8, 16), 48),
      }));
      worksheet.addRows(exportRows);
      worksheet.getRow(1).font = { bold: true };

      const fileBuffer = await workbook.xlsx.writeBuffer();
      downloadBlob(
        new Blob([fileBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `contact-us-${scopeLabel}-${timestamp}.xlsx`
      );
    } catch (error: any) {
      toast.error(error?.message || "Gagal mengekspor data Contact Us");
    } finally {
      setExporting(false);
    }
  }, [buildExportRows, downloadBlob, fetchExportRows, toast]);

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedInquiryType("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = Boolean(searchQuery || selectedInquiryType || dateFrom || dateTo);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Contact Us Data Bank" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Messages
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {statistics.total}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Messages in This Month */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Messages in this Month
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.totalThisMonth}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Contact Messages
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Kelola dan lihat pesan dari formulir kontak
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4"
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
                
                <div className="relative">
                  <button
                    onClick={() => setExportMenuOpen((open) => !open)}
                    disabled={exporting}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {exporting ? "Exporting..." : "Export Data"}
                  </button>
                  {exportMenuOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <button
                        type="button"
                        onClick={() => handleExport("csv", "all")}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Export All as CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport("xlsx", "all")}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Export All as XLSX
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport("csv", "filtered")}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Export Filtered as CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport("xlsx", "filtered")}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Export Filtered as XLSX
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-4">
            {/* Row 1: Search + Inquiry Type */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, email, atau subjek..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Inquiry Type
                </label>
                <select
                  value={selectedInquiryType}
                  onChange={(event) => setSelectedInquiryType(event.target.value as "" | ContactSubmissionListItem["inquiryType"])}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">All Inquiry Types</option>
                  <option value="BUSINESS">{INQUIRY_TYPE_LABEL.BUSINESS}</option>
                  <option value="SUPPORT">{INQUIRY_TYPE_LABEL.SUPPORT}</option>
                  <option value="CAREER">{INQUIRY_TYPE_LABEL.CAREER}</option>
                  <option value="OTHERS">{INQUIRY_TYPE_LABEL.OTHERS}</option>
                </select>
              </div>
            </div>

            {/* Row 2: Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date From */}
              <div>
                <DatePickerField
                  label="Date From"
                  value={dateFrom}
                  onChange={setDateFrom}
                  max={dateTo || undefined}
                />
                {dateFrom && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Dari: {new Date(dateFrom).toLocaleDateString("id-ID", { 
                      day: "numeric", 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </p>
                )}
              </div>

              {/* Date To */}
              <div>
                <DatePickerField
                  label="Date To"
                  value={dateTo}
                  onChange={setDateTo}
                  min={dateFrom || undefined}
                />
                {dateTo && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Sampai: {new Date(dateTo).toLocaleDateString("id-ID", { 
                      day: "numeric", 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </p>
                )}
              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={handleClearFilters}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info Banner */}
          {(Boolean(debouncedSearchQuery || dateFrom || dateTo) || totalItems > contacts.length) && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-blue-800 dark:text-blue-300">
                  Menampilkan {contacts.length} dari {totalItems} pesan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Table - Wrapped in overflow container */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-10 text-sm text-gray-500 dark:text-gray-400">
              Memuat data Contact Us...
            </div>
          ) : (
            <ContactDataTable
              data={contacts}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onView={handleView}
              onDelete={handleDelete}
            />
          )}
        </div>

        {!loading && (
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onLimitChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Modals */}
      {isDetailModalOpen && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedContact(null);
          }}
        />
      )}

      {isDeleteModalOpen && selectedContact && (
        <DeleteConfirmModal
          contactName={selectedContact.name}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setIsDeleteModalOpen(false);
            setSelectedContact(null);
          }}
        />
      )}

      {isBulkDeleteModalOpen && (
        <BulkDeleteModal
          isOpen={isBulkDeleteModalOpen}
          itemCount={selectedIds.length}
          itemName="contact messages"
          onConfirm={handleBulkDeleteConfirm}
          onClose={() => setIsBulkDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
