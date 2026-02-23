"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Career, CareerFormData } from "@/services/career.service";

interface Props {
  initialData?: Career | null;
  onSubmit: (data: CareerFormData) => Promise<void>;
  isSubmitting: boolean;
  mode: "create" | "edit";
}

export default function CareerForm({ initialData, onSubmit, isSubmitting, mode }: Props) {
  const [formData, setFormData] = useState<CareerFormData>(() => {
    if (initialData) {
      return {
        position: initialData.position || "",
        division: initialData.division || "",
        type: initialData.type || "",
        location: initialData.location || "",
        linkJob: initialData.linkJob || "",
        description: initialData.description || "",
        descriptionId: initialData.descriptionId || "",
        requirements: initialData.requirements || "",
        requirementsId: initialData.requirementsId || "",
        status: initialData.status || "active",
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().slice(0, 16)
          : null,
      };
    }
    return {
      position: "",
      division: "",
      type: "",
      location: "",
      linkJob: "",
      description: "",
      descriptionId: "",
      requirements: "",
      requirementsId: "",
      status: "active",
      expiryDate: null,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [langTab, setLangTab] = useState<"en" | "id">("en");

  // Update form when initialData changes (e.g., async load)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setFormData({
        position: initialData.position || "",
        division: initialData.division || "",
        type: initialData.type || "",
        location: initialData.location || "",
        linkJob: initialData.linkJob || "",
        description: initialData.description || "",
        descriptionId: initialData.descriptionId || "",
        requirements: initialData.requirements || "",
        requirementsId: initialData.requirementsId || "",
        status: initialData.status || "active",
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().slice(0, 16)
          : null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.id]);

  // Auto-generate slug preview
  const slugPreview = useMemo(() => {
    return formData.position
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, [formData.position]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.position.trim()) {
      newErrors.position = "Position is required";
    } else if (formData.position.length > 255) {
      newErrors.position = "Position must be at most 255 characters";
    }

    if (!formData.type?.trim()) {
      newErrors.type = "Type is required";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.linkJob && formData.linkJob.length > 500) {
      newErrors.linkJob = "Link job must be at most 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CareerFormData = {
      ...formData,
      expiryDate: formData.expiryDate || null,
    };

    await onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Position */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g. Senior Software Engineer"
              className={`w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.position ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.position && (
              <p className="mt-1 text-xs text-red-500">{errors.position}</p>
            )}
            {slugPreview && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Slug preview: <span className="font-mono">/{slugPreview}</span>
              </p>
            )}
          </div>

          {/* Division */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Division
            </label>
            <input
              type="text"
              name="division"
              value={formData.division || ""}
              onChange={handleChange}
              placeholder="e.g. Technology"
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.type ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <option value="">Select type...</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-xs text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="e.g. Jakarta"
              className={`w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.location ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Link Job */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              External Job Link
            </label>
            <input
              type="url"
              name="linkJob"
              value={formData.linkJob || ""}
              onChange={handleChange}
              placeholder="https://jobs.example.com/..."
              className={`w-full px-4 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                errors.linkJob ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.linkJob && (
              <p className="mt-1 text-xs text-red-500">{errors.linkJob}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status || "active"}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expiry Date
            </label>
            <input
              type="datetime-local"
              name="expiryDate"
              value={formData.expiryDate || ""}
              onChange={handleChange}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Leave empty for no expiration
            </p>
          </div>
        </div>
      </div>

      {/* Description & Requirements Card (Multi-language) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Description & Requirements
        </h3>

        {/* Language Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            type="button"
            onClick={() => setLangTab("en")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              langTab === "en"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            🇬🇧 English
          </button>
          <button
            type="button"
            onClick={() => setLangTab("id")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              langTab === "id"
                ? "border-brand-500 text-brand-500"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            🇮🇩 Indonesia
          </button>
        </div>

        {/* English Tab */}
        {langTab === "en" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description (English)
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={6}
                placeholder="Enter job description in English..."
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Requirements (English)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements || ""}
                onChange={handleChange}
                rows={6}
                placeholder="Enter job requirements in English..."
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
              />
            </div>
          </div>
        )}

        {/* Indonesia Tab */}
        {langTab === "id" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi (Indonesia)
              </label>
              <textarea
                name="descriptionId"
                value={formData.descriptionId || ""}
                onChange={handleChange}
                rows={6}
                placeholder="Masukkan deskripsi pekerjaan dalam Bahasa Indonesia..."
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Persyaratan (Indonesia)
              </label>
              <textarea
                name="requirementsId"
                value={formData.requirementsId || ""}
                onChange={handleChange}
                rows={6}
                placeholder="Masukkan persyaratan pekerjaan dalam Bahasa Indonesia..."
                className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-y"
              />
            </div>
          </div>
        )}
      </div>

      {/* Audit Trail (edit mode only) */}
      {mode === "edit" && initialData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Audit Trail
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created by:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{initialData.createdBy || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Created at:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {initialData.createdAt
                  ? new Date(initialData.createdAt).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Updated by:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{initialData.updatedBy || "-"}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Updated at:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {initialData.updatedAt
                  ? new Date(initialData.updatedAt).toLocaleString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
        >
          {isSubmitting && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
          )}
          {mode === "create" ? "Create Career" : "Update Career"}
        </button>
      </div>
    </form>
  );
}
