import React from "react";
import { Modal } from "@/components/ui/modal";
import { ContactData } from "../page";

interface ContactDetailModalProps {
  contact: ContactData;
  onClose: () => void;
}

export default function ContactDetailModal({ contact, onClose }: ContactDetailModalProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      NEW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      READ: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      REPLIED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return styles[status as keyof typeof styles] || styles.NEW;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal isOpen={true} onClose={onClose} className="max-w-3xl">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Contact Message Details
        </h3>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-4 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {/* Status Badge */}
        <div>
          <span
            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
              contact.status
            )}`}
          >
            {contact.status}
          </span>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Name
            </label>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <p className="text-gray-900 dark:text-white font-medium">
                {contact.name}
              </p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email
            </label>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
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
              <a
                href={`mailto:${contact.email}`}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                {contact.email}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Phone
            </label>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                href={`tel:${contact.phone}`}
                className="text-brand-600 dark:text-brand-400 hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Date Received
            </label>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-900 dark:text-white">
                {formatDate(contact.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Subject
          </label>
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            <p className="text-gray-900 dark:text-white font-medium">
              {contact.subject}
            </p>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Message
          </label>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
              {contact.message}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
        {/* <button className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors inline-flex items-center gap-2">
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Reply via Email
        </button> */}
      </div>
    </Modal>
  );
}
