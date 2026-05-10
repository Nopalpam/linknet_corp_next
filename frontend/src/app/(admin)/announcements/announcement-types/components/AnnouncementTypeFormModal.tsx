"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import {
  announcementService,
  AnnouncementType,
  CreateAnnouncementTypeData,
} from "@/services/announcement.service";
import { useToast } from "@/context/ToastContext";

interface AnnouncementTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  announcementType?: AnnouncementType | null;
}

const DEFAULT_ANNOUNCEMENT_TYPE_FORM: CreateAnnouncementTypeData = {
  name: "",
  type: "List",
  sortOrder: 0,
  isActive: true,
};

function normalizeAnnouncementTypeForm(announcementType?: AnnouncementType | null): CreateAnnouncementTypeData {
  return {
    name: announcementType?.name ?? "",
    type: announcementType?.type === "Grid" ? "Grid" : "List",
    sortOrder: Number(announcementType?.sortOrder ?? 0),
    isActive: announcementType?.isActive ?? true,
  };
}

export default function AnnouncementTypeFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  announcementType,
}: AnnouncementTypeFormModalProps) {
  const toast = useToast();
  const [formData, setFormData] = useState<CreateAnnouncementTypeData>(DEFAULT_ANNOUNCEMENT_TYPE_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && announcementType) {
        setFormData(normalizeAnnouncementTypeForm(announcementType));
      } else {
        setFormData(DEFAULT_ANNOUNCEMENT_TYPE_FORM);
      }
    }
  }, [isOpen, mode, announcementType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type: inputType } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        inputType === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "sortOrder"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        setLoading(false);
        return;
      }

      if (mode === "create") {
        const response = await announcementService.createAnnouncementType(formData);
        onSubmit(true, response.message || "Announcement type created successfully");
      } else if (mode === "edit" && announcementType) {
        const response = await announcementService.updateAnnouncementType(
          announcementType.id,
          formData
        );
        onSubmit(true, response.message || "Announcement type updated successfully");
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create Announcement Type" : "Edit Announcement Type"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "create"
              ? "Add a new announcement type (e.g., GMS Announcement, Emiten Announcement)"
              : "Update the announcement type details"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name ?? ""}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="e.g., GMS Announcement"
            />
          </div>

          {/* Type */}
          <div>
            <label
              htmlFor="type"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Display Type <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type ?? "List"}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="Grid">Grid</option>
              <option value="List">List</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Grid: Items assigned directly to this type. List: Items organized
              through sections.
            </p>
          </div>

          {/* Sort Order */}
          <div>
            <label
              htmlFor="sortOrder"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Sort Order
            </label>
            <input
              type="number"
              id="sortOrder"
              name="sortOrder"
              value={formData.sortOrder ?? 0}
              onChange={handleChange}
              min={0}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Active
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : mode === "create" ? (
                "Create"
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
