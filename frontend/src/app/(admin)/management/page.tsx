"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  managementService,
  ManagementCategory,
} from "@/services/management.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import CategoryFormModal from "./components/CategoryFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableRow } from "./components/SortableRow";

export default function ManagementCategoriesPage() {
  const toast = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<ManagementCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ManagementCategory | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await managementService.getCategories();
      setCategories(response.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle drag end — reorder categories
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    // Prepare updates
    const updates = reordered.map((cat, index) => ({
      id: cat.id,
      order: index + 1,
    }));

    try {
      await managementService.updateCategoriesOrder(updates);
      toast.success("Category order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
      fetchCategories(); // Revert on error
    }
  };

  // Handle create
  const handleCreate = () => {
    setFormMode("create");
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  // Handle edit
  const handleEdit = (category: ManagementCategory) => {
    setFormMode("edit");
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  // Handle delete
  const handleDelete = (category: ManagementCategory) => {
    setSelectedCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Handle manage data — navigate to management data page
  const handleManageData = (category: ManagementCategory) => {
    router.push(`/management/${category.id}`);
  };

  // Handle form submit
  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(
        message ||
          (formMode === "create"
            ? "Category berhasil ditambahkan"
            : "Category berhasil diperbarui")
      );
      await fetchCategories();
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      await managementService.deleteCategory(selectedCategory.id);
      toast.success("Category berhasil dihapus");
      setIsDeleteModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus category");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Management Categories" />

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Management Categories
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage categories for management team. Drag rows to reorder.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Category
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No categories found. Create your first category.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={categories.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="w-10 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Slug
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Description
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Members
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <SortableRow
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onManageData={handleManageData}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Form Modal */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        category={selectedCategory}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedCategory?.name || ""}
        itemType="category"
      />
    </div>
  );
}
