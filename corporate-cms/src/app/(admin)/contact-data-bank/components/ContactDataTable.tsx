import React from "react";
import { ContactData } from "../page";

interface ContactDataTableProps {
  data: ContactData[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onView: (contact: ContactData) => void;
  onDelete: (contact: ContactData) => void;
}

const ContactDataTable: React.FC<ContactDataTableProps> = ({
  data,
  selectedIds,
  onSelectionChange,
  onView,
  onDelete,
}) => {
  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < data.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((item) => item.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          Tidak ada data
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Belum ada pesan kontak yang masuk
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="w-full table-fixed min-w-[640px]">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="w-10 px-3 py-3">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isIndeterminate;
                  }
                }}
                onChange={handleSelectAll}
                className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </th>
            <th className="w-[28%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Pengirim
            </th>
            <th className="w-[16%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Inquiry Type
            </th>
            <th className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Subject
            </th>
            <th className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Tanggal
            </th>
            <th className="w-[16%] px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {data.map((contact) => (
            <tr
              key={contact.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-3 py-4 align-top">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(contact.id)}
                  onChange={() => handleSelectOne(contact.id)}
                  className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </td>
              <td className="px-3 py-4 align-top">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {contact.name}
                </div>
                <div className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                  {contact.email}
                </div>
                <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {contact.phone || "-"}
                </div>
              </td>
              <td className="px-3 py-4 align-top">
                <div className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {contact.inquiryTypeLabel}
                </div>
              </td>
              <td className="px-3 py-4 align-top">
                <div className="truncate text-sm text-gray-900 dark:text-white">
                  {contact.subject}
                </div>
              </td>
              <td className="px-3 py-4 align-top whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(contact.createdAt)}
                </div>
              </td>
              <td className="px-3 py-4 align-top whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onView(contact)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white transition-colors hover:bg-brand-700"
                    title="View Details"
                    aria-label={`View ${contact.name}`}
                  >
                    <svg
                      className="h-4 w-4"
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
                  </button>
                  <button
                    onClick={() => onDelete(contact)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white transition-colors hover:bg-red-700"
                    title="Delete"
                    aria-label={`Delete ${contact.name}`}
                  >
                    <svg
                      className="h-4 w-4"
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactDataTable;
