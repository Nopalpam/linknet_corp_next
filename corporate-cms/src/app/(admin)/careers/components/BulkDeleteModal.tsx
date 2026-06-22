"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}

export default function BulkDeleteModal({ isOpen, onClose, onConfirm, count }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
          Bulk Delete Confirmation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{count}</strong> career position(s)? This action cannot be undone.
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete {count} Position(s)
          </button>
        </div>
      </div>
    </Modal>
  );
}
