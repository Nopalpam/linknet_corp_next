"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import {
  managementService,
  Management,
  CreateManagementData,
} from "@/services/management.service";

interface ManagementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  management: Management | null;
  categoryId: string;
  categoryName: string;
}

export default function ManagementFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  management,
  categoryId,
  categoryName,
}: ManagementFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    positionEn: "",
    positionId: "",
    category: "",
    photo: "",
    bioEn: "",
    bioId: "",
    dataStatus: 1,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (mode === "edit" && management) {
      setFormData({
        name: management.name || "",
        positionEn: management.positionEn || "",
        positionId: management.positionId || "",
        category: management.category || "",
        photo: management.photo || "",
        bioEn: management.bioEn || "",
        bioId: management.bioId || "",
        dataStatus: management.dataStatus ?? 1,
      });
    } else {
      setFormData({
        name: "",
        positionEn: "",
        positionId: "",
        category: "",
        photo: "",
        bioEn: "",
        bioId: "",
        dataStatus: 1,
      });
    }
    setErrors({});
  }, [mode, management, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: CreateManagementData = {
        name: formData.name.trim(),
        positionEn: formData.positionEn.trim() || undefined,
        positionId: formData.positionId.trim() || undefined,
        category: formData.category.trim() || undefined,
        categoryId,
        photo: formData.photo.trim() || undefined,
        bioEn: formData.bioEn.trim() || undefined,
        bioId: formData.bioId.trim() || undefined,
        dataStatus: formData.dataStatus,
      };

      if (mode === "create") {
        await managementService.createManagement(payload);
        onSuccess(true, "Data berhasil ditambahkan");
      } else if (management) {
        await managementService.updateManagement(management.id, payload);
        onSuccess(true, "Data berhasil diperbarui");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to save data";
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="max-h-[85vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === "create" ? "Add New Member" : "Edit Member"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Category: <span className="font-medium">{categoryName}</span>
          </p>
        </div>

        {/* Error */}
        {errors.submit && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {errors.submit}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-gray-800 dark:text-white ${
                  errors.name
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700"
                }`}
                placeholder="Full name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Position EN */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Position (English)
              </label>
              <input
                type="text"
                value={formData.positionEn}
                onChange={(e) =>
                  setFormData({ ...formData, positionEn: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g. Chief Executive Officer"
              />
            </div>

            {/* Position ID */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Position (Indonesian)
              </label>
              <input
                type="text"
                value={formData.positionId}
                onChange={(e) =>
                  setFormData({ ...formData, positionId: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g. Direktur Utama"
              />
            </div>

            {/* Category Label (varchar from MySQL) */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category Label
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Optional text label"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Photo URL
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) =>
                  setFormData({ ...formData, photo: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {/* Bio EN */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio (English)
            </label>
            <textarea
              value={formData.bioEn}
              onChange={(e) =>
                setFormData({ ...formData, bioEn: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Brief biography in English..."
            />
          </div>

          {/* Bio ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio (Indonesian)
            </label>
            <textarea
              value={formData.bioId}
              onChange={(e) =>
                setFormData({ ...formData, bioId: e.target.value })
              }
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Brief biography in Indonesian..."
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={formData.dataStatus}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dataStatus: parseInt(e.target.value),
                })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading && (
                <svg
                  className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {mode === "create" ? "Create Member" : "Update Member"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
