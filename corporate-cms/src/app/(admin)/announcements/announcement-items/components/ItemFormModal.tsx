"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "@/components/ui/modal";
import {
  announcementService,
  AnnouncementItem,
  AnnouncementType,
  AnnouncementSection,
  CreateAnnouncementItemData,
} from "@/services/announcement.service";
import { useToast } from "@/context/ToastContext";
import MediaPickerButton from "@/components/media/MediaPickerButton";

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  item?: AnnouncementItem | null;
  announcementTypes: AnnouncementType[];
}

const LOCAL_IMAGE_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function sanitizeImagePreviewUrl(value?: string | null): string {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("blob:")) return trimmed;
  if (
    trimmed.startsWith("data:image/png;base64,") ||
    trimmed.startsWith("data:image/jpeg;base64,") ||
    trimmed.startsWith("data:image/gif;base64,") ||
    trimmed.startsWith("data:image/webp;base64,")
  ) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol === "https:" || (url.protocol === "http:" && LOCAL_IMAGE_HOSTS.has(url.hostname))) {
      return url.toString();
    }
  } catch {
    return "";
  }

  return "";
}

export default function ItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  item,
  announcementTypes,
}: ItemFormModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateAnnouncementItemData>({
    announcementTypeId: "",
    announcementSectionId: "",
    title: "",
    subDescription: "",
    pdfFile: "",
    coverImage: "",
    dataType: undefined,
    auditStatus: undefined,
    fileSize: "",
    sortOrder: 0,
    isActive: true,
  });

  const [sections, setSections] = useState<AnnouncementSection[]>([]);
  const [selectedType, setSelectedType] = useState<AnnouncementType | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const safeImagePreview = sanitizeImagePreviewUrl(imagePreview);

  const updateSelectedType = useCallback(
    (typeId: string) => {
      const found = announcementTypes.find((at) => at.id === typeId);
      setSelectedType(found || null);
    },
    [announcementTypes]
  );

  const fetchSections = useCallback(
    async (typeId: string) => {
      if (!typeId) {
        setSections([]);
        return;
      }
      const found = announcementTypes.find((at) => at.id === typeId);
      if (found && found.type === "List") {
        try {
          const response = await announcementService.getAnnouncementSectionsList(typeId);
          setSections(response.data || []);
        } catch {
          setSections([]);
        }
      } else {
        setSections([]);
      }
    },
    [announcementTypes]
  );

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && item) {
        const typeId = item.announcementTypeId || "";
        const safeCoverImage = sanitizeImagePreviewUrl(item.coverImage);
        setFormData({
          announcementTypeId: typeId,
          announcementSectionId: item.announcementSectionId || "",
          title: item.title || "",
          subDescription: item.subDescription || "",
          pdfFile: item.pdfFile || "",
          coverImage: safeCoverImage,
          dataType: item.dataType || undefined,
          auditStatus: item.auditStatus || undefined,
          fileSize: item.fileSize || "",
          sortOrder: Number(item.sortOrder ?? 0),
          isActive: item.isActive ?? true,
        });
        setImagePreview(safeCoverImage);
        updateSelectedType(typeId);
        fetchSections(typeId);
      } else {
        setFormData({
          announcementTypeId: "",
          announcementSectionId: "",
          title: "",
          subDescription: "",
          pdfFile: "",
          coverImage: "",
          dataType: undefined,
          auditStatus: undefined,
          fileSize: "",
          sortOrder: 0,
          isActive: true,
        });
        setImagePreview("");
        setSelectedType(null);
        setSections([]);
      }
    }
  }, [isOpen, mode, item, updateSelectedType, fetchSections]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type: inputType } = e.target;

    if (name === "announcementTypeId") {
      setFormData((prev) => ({
        ...prev,
        announcementTypeId: value,
        announcementSectionId: "",
      }));
      updateSelectedType(value);
      fetchSections(value);
      return;
    }

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const response = await announcementService.uploadCoverImage(file);
      const path = sanitizeImagePreviewUrl(response.data?.path);
      setFormData((prev) => ({ ...prev, coverImage: path }));
      setImagePreview(path);
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: "" }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.title.trim()) {
        toast.error("Title is required");
        setLoading(false);
        return;
      }

      const submitData: CreateAnnouncementItemData = {
        ...formData,
        coverImage: sanitizeImagePreviewUrl(formData.coverImage),
        announcementTypeId: formData.announcementTypeId || undefined,
        announcementSectionId: formData.announcementSectionId || undefined,
        dataType: formData.dataType || undefined,
        auditStatus: formData.auditStatus || undefined,
      };

      if (mode === "create") {
        const response = await announcementService.createAnnouncementItem(submitData);
        onSubmit(true, response.message || "Item created successfully");
      } else if (mode === "edit" && item) {
        const response = await announcementService.updateAnnouncementItem(item.id, submitData);
        onSubmit(true, response.message || "Item updated successfully");
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
      className="max-w-3xl max-h-[90vh] overflow-y-auto"
    >
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "create" ? "Create Announcement Item" : "Edit Announcement Item"}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === "create"
              ? "Add a new announcement item (PDF document with cover)"
              : "Update the announcement item details"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Announcement Type & Section */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="announcementTypeId"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Announcement Type
              </label>
              <select
                id="announcementTypeId"
                name="announcementTypeId"
                value={formData.announcementTypeId || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select Announcement Type</option>
                {announcementTypes.map((at) => (
                  <option key={at.id} value={at.id}>
                    {at.name} ({at.type})
                  </option>
                ))}
              </select>
            </div>

            {selectedType?.type === "List" && (
              <div>
                <label
                  htmlFor="announcementSectionId"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Section
                </label>
                <select
                  id="announcementSectionId"
                  name="announcementSectionId"
                  value={formData.announcementSectionId || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Select Section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} {s.announcementYear ? `(${s.announcementYear})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              placeholder="e.g., GMS Announcement 2024"
            />
          </div>

          {/* Sub Description */}
          <div>
            <label
              htmlFor="subDescription"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Sub Description
            </label>
            <textarea
              id="subDescription"
              name="subDescription"
              value={formData.subDescription || ""}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Optional sub description"
            />
          </div>

          {/* PDF File URL */}
          <div>
            <label
              htmlFor="pdfFile"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              PDF File URL
            </label>
            <input
              type="url"
              id="pdfFile"
              name="pdfFile"
              value={formData.pdfFile || ""}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="https://example.com/announcement.pdf"
            />
            <div className="mt-2">
              <MediaPickerButton
                kind="pdf"
                label="Choose PDF from File Manager"
                title="Choose Announcement PDF"
                onSelect={(url) => setFormData((prev) => ({ ...prev, pdfFile: url }))}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cover Image
            </label>
            <div className="flex items-start gap-4">
              {safeImagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={safeImagePreview}
                    alt="Cover preview"
                    className="h-24 w-18 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : null}

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coverImageUpload"
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="coverImageUpload"
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400 ${
                      uploading ? "pointer-events-none opacity-50" : ""
                    }`}
                  >
                    {uploading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Image
                      </>
                    )}
                  </label>
                  <MediaPickerButton
                    kind="image"
                    title="Choose Announcement Cover"
                    onSelect={(url) => {
                      const safeUrl = sanitizeImagePreviewUrl(url);
                      setFormData((prev) => ({ ...prev, coverImage: safeUrl }));
                      setImagePreview(safeUrl);
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Max 5MB. JPG, PNG, WebP.
                </p>

                <input
                  type="text"
                  name="coverImage"
                  value={formData.coverImage || ""}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, coverImage: e.target.value }));
                    setImagePreview(sanitizeImagePreviewUrl(e.target.value));
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  placeholder="Or enter image URL directly"
                />
              </div>
            </div>
          </div>

          {/* Data Type & Audit Status */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="dataType"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Data Type
              </label>
              <select
                id="dataType"
                name="dataType"
                value={formData.dataType || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">— None —</option>
                <option value="Consolidated">Consolidated</option>
                <option value="Interim">Interim</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="auditStatus"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Audit Status
              </label>
              <select
                id="auditStatus"
                name="auditStatus"
                value={formData.auditStatus || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">— None —</option>
                <option value="Audited">Audited</option>
                <option value="Unaudited">Unaudited</option>
                <option value="Limited Review">Limited Review</option>
              </select>
            </div>
          </div>

          {/* File Size & Sort Order */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="fileSize"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                File Size
              </label>
              <input
                type="text"
                id="fileSize"
                name="fileSize"
                value={formData.fileSize || ""}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="e.g., 2.5 MB"
              />
            </div>

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
              disabled={loading || uploading}
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
