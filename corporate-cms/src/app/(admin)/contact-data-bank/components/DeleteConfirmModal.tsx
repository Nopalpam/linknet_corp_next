import React from "react";
import { Modal } from "@/components/ui/modal";

interface DeleteConfirmModalProps {
  contactName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  contactName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal isOpen={true} onClose={onCancel} className="max-w-md" showCloseButton={false}>
      <div className="p-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2">
          Hapus Pesan Kontak
        </h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
          Apakah Anda yakin ingin menghapus pesan dari{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {contactName}
          </span>
          ? Tindakan ini tidak dapat dibatalkan.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
