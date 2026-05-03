"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { awardsServiceNew, Award, CreateAwardData } from "@/services/awards.service.new";
import { useToast } from "@/context/ToastContext";

function getDisplayImageSrc(value?: string | null): string {
  const src = value?.trim();
  if (!src) return "";
  if (/^(https?:|data:|blob:|\/)/i.test(src)) return src;
  return `/${src}`;
}

interface AwardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (success: boolean, message?: string) => void;
  mode: 'create' | 'edit';
  award?: Award | null;
}

export default function AwardFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  award,
}: AwardFormModalProps) {
  const toast = useToast();
  const [formData, setFormData] = useState<CreateAwardData>({
    title: '',
    year: new Date().getFullYear(),
    issuer: '',
    description: '',
    topLogo: '',
    image: '',
    link: '',
    status: 'ACTIVE',
  });

  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && award) {
        setFormData({
          title: award.title,
          year: award.year,
          issuer: award.issuer,
          description: award.description || '',
          topLogo: award.topLogo || '',
          image: award.image || '',
          link: award.link || '',
          status: award.status,
        });
      } else {
        setFormData({
          title: '',
          year: new Date().getFullYear(),
          issuer: '',
          description: '',
          topLogo: '',
          image: '',
          link: '',
          status: 'ACTIVE',
        });
      }
    }
  }, [isOpen, mode, award]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        toast.error('Judul award harus diisi');
        setLoading(false);
        return;
      }
      if (!formData.issuer.trim()) {
        toast.error('Penerbit award harus diisi');
        setLoading(false);
        return;
      }
      if (formData.year < 1900 || formData.year > new Date().getFullYear() + 10) {
        toast.error('Tahun tidak valid');
        setLoading(false);
        return;
      }

      if (mode === 'create') {
        const response = await awardsServiceNew.create(formData);
        onSuccess(true, response.message || 'Award berhasil ditambahkan');
      } else if (mode === 'edit' && award) {
        const response = await awardsServiceNew.update(award.id, formData);
        onSuccess(true, response.message || 'Award berhasil diperbarui');
      }

      onClose();
    } catch (err: any) {
      // Don't close modal on error
      toast.error(err.message || 'Terjadi kesalahan');
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
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'create' ? 'Create New Award' : 'Edit Award'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {mode === 'create'
              ? 'Fill in the details to create a new award'
              : 'Update the award information'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Enter award title"
            />
          </div>

          {/* Year & Issuer */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="year"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
                min={1900}
                max={new Date().getFullYear() + 10}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="issuer"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Issuer <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="issuer"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Enter issuer name"
              />
            </div>
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
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Enter award description"
            />
          </div>

          {/* Top Logo URL */}
          <div>
            <label
              htmlFor="topLogo"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Top Logo URL
            </label>
            <input
              type="text"
              id="topLogo"
              name="topLogo"
              value={formData.topLogo || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="/assets/logos/awards/logo-swa.png"
            />
            {formData.topLogo && (
              <div className="mt-2 h-12 w-24">
                <img
                  src={getDisplayImageSrc(formData.topLogo)}
                  alt="Top logo preview"
                  className="h-full w-full rounded object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="48"%3E%3Crect fill="%23eee" width="96" height="48"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Logo%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="image"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Image URL
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="Enter image URL"
            />
            {formData.image && (
              <div className="mt-2 h-20 w-20">
                <img
                  src={getDisplayImageSrc(formData.image)}
                  alt="Preview"
                  className="h-full w-full rounded object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="link"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              URL
            </label>
            <input
              type="text"
              id="link"
              name="link"
              value={formData.link || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              placeholder="# or /about-us/awards/detail"
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{mode === 'create' ? 'Create Award' : 'Update Award'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
