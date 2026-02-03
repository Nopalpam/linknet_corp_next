"use client";

import React, { useState, useMemo } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ContactDataTable from "./components/ContactDataTable";
import ContactDetailModal from "./components/ContactDetailModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import BulkDeleteModal from "@/components/BulkDeleteModal";

export type ContactStatus = "NEW" | "READ" | "REPLIED";

export interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

// Mock data untuk demo
const mockContactData: ContactData[] = [
  {
    id: "1",
    name: "Ahmad Rizki",
    email: "ahmad.rizki@example.com",
    phone: "+62 812-3456-7890",
    subject: "Pertanyaan tentang Layanan Fiber",
    message: "Halo, saya ingin menanyakan tentang paket fiber untuk area Jakarta Selatan. Apakah sudah tersedia? Berapa biaya instalasi dan biaya bulanannya? Terima kasih.",
    status: "NEW",
    createdAt: "2024-02-03T10:30:00Z",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.com",
    phone: "+62 813-9876-5432",
    subject: "Kendala Koneksi Internet",
    message: "Selamat siang, saya mengalami masalah koneksi internet yang sering putus sejak kemarin. Mohon bantuan untuk pengecekan. Nomor pelanggan: 12345678.",
    status: "READ",
    createdAt: "2024-02-02T14:15:00Z",
  },
  {
    id: "3",
    name: "Budi Santoso",
    email: "budi.santoso@example.com",
    phone: "+62 821-1111-2222",
    subject: "Inquiry Corporate Package",
    message: "Dear Linknet Team, we are interested in corporate internet package for our office with 50 employees. Please send us the details and pricing. Best regards.",
    status: "REPLIED",
    createdAt: "2024-02-01T09:00:00Z",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    email: "dewi.lestari@example.com",
    phone: "+62 856-4444-5555",
    subject: "Request Upgrade Paket",
    message: "Halo, saya ingin upgrade paket internet dari 30 Mbps ke 100 Mbps. Bagaimana prosedurnya dan apakah ada biaya tambahan?",
    status: "NEW",
    createdAt: "2024-01-31T16:45:00Z",
  },
  {
    id: "5",
    name: "Eko Prasetyo",
    email: "eko.prasetyo@example.com",
    phone: "+62 878-7777-8888",
    subject: "Komplain Tagihan",
    message: "Saya menerima tagihan yang tidak sesuai dengan paket yang saya gunakan. Mohon dilakukan pengecekan ulang. Tagihan bulan ini Rp 750.000 padahal paket saya Rp 500.000.",
    status: "READ",
    createdAt: "2024-01-30T11:20:00Z",
  },
  {
    id: "6",
    name: "Fitri Handayani",
    email: "fitri.handayani@example.com",
    phone: "+62 811-2222-3333",
    subject: "Permintaan Pemasangan Baru",
    message: "Saya ingin memasang internet Linknet di rumah baru saya di Tangerang. Mohon informasi ketersediaan dan jadwal pemasangan. Alamat lengkap terlampir.",
    status: "REPLIED",
    createdAt: "2024-01-29T13:50:00Z",
  },
  {
    id: "7",
    name: "Gunawan Wijaya",
    email: "gunawan.wijaya@example.com",
    phone: "+62 812-5555-6666",
    subject: "Request Technical Support",
    message: "Good morning, I'm experiencing slow internet speed since yesterday. My current package is 50 Mbps but I'm only getting 10-15 Mbps. Please help check.",
    status: "NEW",
    createdAt: "2024-01-28T08:30:00Z",
  },
  {
    id: "8",
    name: "Hani Kartika",
    email: "hani.kartika@example.com",
    phone: "+62 857-8888-9999",
    subject: "Pertanyaan Promo",
    message: "Halo, apakah saat ini ada promo untuk pelanggan baru? Saya tertarik dengan paket 100 Mbps. Mohon info lengkapnya. Terima kasih.",
    status: "READ",
    createdAt: "2024-01-27T15:10:00Z",
  },
  {
    id: "9",
    name: "Indra Kusuma",
    email: "indra.kusuma@example.com",
    phone: "+62 822-3333-4444",
    subject: "Permintaan Invoice",
    message: "Mohon dikirimkan invoice pembayaran untuk bulan Januari 2024. Email invoice belum saya terima. Nomor pelanggan: 87654321.",
    status: "REPLIED",
    createdAt: "2024-01-26T10:00:00Z",
  },
  {
    id: "10",
    name: "Jessica Tamara",
    email: "jessica.tamara@example.com",
    phone: "+62 813-5555-7777",
    subject: "Komplain Kualitas Layanan",
    message: "Internet sering down pada jam kerja (09:00-17:00). Sudah menghubungi customer service beberapa kali tapi masalah belum teratasi. Mohon tindak lanjut segera.",
    status: "NEW",
    createdAt: "2024-01-25T09:30:00Z",
  },
  {
    id: "11",
    name: "Kurniawan Putra",
    email: "kurniawan.putra@example.com",
    phone: "+62 856-9999-1111",
    subject: "Info Paket Business",
    message: "Saya tertarik dengan paket bisnis untuk usaha saya. Mohon informasi mengenai dedicated bandwidth dan SLA yang ditawarkan. Terima kasih.",
    status: "READ",
    createdAt: "2024-01-24T14:20:00Z",
  },
  {
    id: "12",
    name: "Linda Wijayanti",
    email: "linda.wijayanti@example.com",
    phone: "+62 821-4444-5555",
    subject: "Permintaan Pindah Alamat",
    message: "Saya akan pindah rumah dalam 2 minggu ke depan. Bagaimana prosedur untuk pindah alamat pemasangan internet? Apakah ada biaya tambahan?",
    status: "REPLIED",
    createdAt: "2024-01-23T16:00:00Z",
  },
];

export default function ContactDataBankPage() {
  const [contacts] = useState<ContactData[]>(mockContactData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ContactStatus | "ALL">("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modal states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null);

  // Filter contacts based on search and status
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.subject.toLowerCase().includes(query);

      const matchesStatus = filterStatus === "ALL" || contact.status === filterStatus;

      // Date filter
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const contactDate = new Date(contact.createdAt);
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && contactDate >= fromDate;
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && contactDate <= toDate;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [contacts, searchQuery, filterStatus, dateFrom, dateTo]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: contacts.length,
      new: contacts.filter((c) => c.status === "NEW").length,
      read: contacts.filter((c) => c.status === "READ").length,
      replied: contacts.filter((c) => c.status === "REPLIED").length,
    };
  }, [contacts]);

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
  const handleDeleteConfirm = () => {
    // In real implementation, call API here
    console.log("Delete contact:", selectedContact?.id);
    setIsDeleteModalOpen(false);
    setSelectedContact(null);
    // Show success toast (would be implemented)
  };

  // Handle bulk delete confirm (mockup)
  const handleBulkDeleteConfirm = async () => {
    // In real implementation, call API here
    console.log("Bulk delete contacts:", selectedIds);
    setIsBulkDeleteModalOpen(false);
    setSelectedIds([]);
    // Show success toast (would be implemented)
  };

  // Handle export (mockup)
  const handleExport = () => {
    console.log("Exporting contacts...");
    // In real implementation, generate and download CSV/Excel
    alert("Export feature will be implemented with backend integration");
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterStatus("ALL");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchQuery || filterStatus !== "ALL" || dateFrom || dateTo;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Contact Us Data Bank" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* New Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                New Messages
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.new}
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

        {/* Read Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Read Messages
              </p>
              <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {statistics.read}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Replied Messages */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Replied Messages
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {statistics.replied}
              </p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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
                
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap"
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
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 space-y-4">
            {/* Row 1: Search and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ContactStatus | "ALL")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="NEW">New</option>
                  <option value="READ">Read</option>
                  <option value="REPLIED">Replied</option>
                </select>
              </div>
            </div>

            {/* Row 2: Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  max={dateTo || undefined}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  min={dateFrom || undefined}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
          {filteredContacts.length !== contacts.length && (
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
                  Menampilkan {filteredContacts.length} dari {contacts.length} pesan
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Table - Wrapped in overflow container */}
        <div className="overflow-x-auto">
          <ContactDataTable
            data={filteredContacts}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>
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
