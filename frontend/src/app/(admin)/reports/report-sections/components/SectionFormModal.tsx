"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import {
  reportService,
  ReportSection,
  ReportType,
  CreateReportSectionData,
} from "@/services/report.service";
import { useToast } from "@/context/ToastContext";

interface SectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  section?: ReportSection | null;
  reportTypes: ReportType[];
}

export default function SectionFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  section,
  reportTypes,
}: SectionFormModalProps) {
  const toast = useToast();
  const [formData, setFormData] = useState<CreateReportSectionData>({
    reportTypeId: "",
    title: "",
    description: "",
    reportYear: new Date().getFullYear(),
    ctaEnabled: false,
    ctaText: "",
    ctaUrl: "",
    sortOrder: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && section) {
        setFormData({
          reportTypeId: section.reportTypeId || "",
          title: section.title || "",
          description: section.description || "",
          reportYear: section.reportYear || new Date().getFullYear(),
          ctaEnabled: section.ctaEnabled ?? false,
          ctaText: section.ctaText || "",
          ctaUrl: section.ctaUrl || "",
          sortOrder: Number(section.sortOrder ?? 0),
          isActive: section.isActive ?? true,
        });
      } else {
        setFormData({
          reportTypeId: reportTypes.length > 0 ? reportTypes[0].id : "",
          title: "",
          description: "",
          reportYear: new Date().getFullYear(),
          ctaEnabled: false,
          ctaText: "",
          ctaUrl: "",
          sortOrder: 0,
          isActive: true,
        });
      }
    }
  }, [isOpen, mode, section, reportTypes]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type: inputType } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        inputType === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "sortOrder" || name === "reportYear"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.reportTypeId) {
        toast.error("Report Type is required");
        setLoading(false);
        return;
      }
      if (!formData.title.trim()) {
        toast.error("Title is required");
        setLoading(false);
        return;
      }

      if (mode === "create") {
        const response = await reportService.createReportSection(formData);
        onSubmit(true, response.message || "Section created successfully");
      } else if (mode === "edit" && section) {
        const response = await reportService.updateReportSection(section.id, formData);
        onSubmit(true, response.message || "Section updated successfully");
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
      className="max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create Section" : "Edit Section"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "create"
              ? "Add a new section to a report type"
              : "Update the section details"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Report Type */}
          <div>
            <label
              htmlFor="reportTypeId"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Report Type <span className="text-red-500">*</span>
            </label>
            <select
              id="reportTypeId"
              name="reportTypeId"
              value={formData.reportTypeId || ""}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select Report Type</option>
              {reportTypes.map((rt) => (
                <option key={rt.id} value={rt.id}>
                  {rt.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only List-type report types are shown.
            </p>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="e.g., Q1 2024"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Optional description"
            />
          </div>

          {/* Report Year */}
          <div>
            <label
              htmlFor="reportYear"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Report Year
            </label>
            <input
              type="number"
              id="reportYear"
              name="reportYear"
              value={formData.reportYear ?? new Date().getFullYear()}
              onChange={handleChange}
              min={2000}
              max={2099}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* CTA Enabled */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="ctaEnabled"
              name="ctaEnabled"
              checked={formData.ctaEnabled ?? false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="ctaEnabled"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Enable CTA (Call to Action)
            </label>
          </div>

          {/* CTA Fields (shown only when enabled) */}
          {formData.ctaEnabled && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div>
                <label
                  htmlFor="ctaText"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  CTA Text
                </label>
                <input
                  type="text"
                  id="ctaText"
                  name="ctaText"
                  value={formData.ctaText || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="e.g., Download Report"
                />
              </div>
              <div>
                <label
                  htmlFor="ctaUrl"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  CTA URL
                </label>
                <input
                  type="url"
                  id="ctaUrl"
                  name="ctaUrl"
                  value={formData.ctaUrl || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

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
