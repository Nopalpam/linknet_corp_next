"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  managementService,
  Management,
  ManagementCategory,
} from "@/services/management.service";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import ManagementFormModal from "../components/ManagementFormModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
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
import { SortableManagementRow } from "../components/SortableManagementRow";

export default function ManagementDataPage() {
  const toast = useToast();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [managements, setManagements] = useState<Management[]>([]);
  const [category, setCategory] = useState<ManagementCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedManagement, setSelectedManagement] =
    useState<Management | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch category details
  const fetchCategory = useCallback(async () => {
    try {
      const response = await managementService.getCategoryById(categoryId);
      setCategory(response.data);
    } catch (err: any) {
      toast.error("Category not found");
      router.push("/management");
    }
  }, [categoryId, toast, router]);

  // Fetch managements for this category
  const fetchManagements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await managementService.getManagements({
        categoryId,
        limit: 100,
        sortBy: "dataOrder",
        sortOrder: "asc",
      });
      setManagements(response.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch data");
      setManagements([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId, toast]);

  useEffect(() => {
    fetchCategory();
    fetchManagements();
  }, [fetchCategory, fetchManagements]);

  // Handle drag end — reorder managements
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = managements.findIndex((m) => m.id === active.id);
    const newIndex = managements.findIndex((m) => m.id === over.id);

    const reordered = arrayMove(managements, oldIndex, newIndex);
    setManagements(reordered);

    const updates = reordered.map((item, index) => ({
      id: item.id,
      order: index + 1,
    }));

    try {
      await managementService.updateManagementsOrder(updates);
      toast.success("Order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
      fetchManagements();
    }
  };

  // Handle create
  const handleCreate = () => {
    setFormMode("create");
    setSelectedManagement(null);
    setIsFormModalOpen(true);
  };

  // Handle edit
  const handleEdit = (management: Management) => {
    setFormMode("edit");
    setSelectedManagement(management);
    setIsFormModalOpen(true);
  };

  // Handle delete
  const handleDelete = (management: Management) => {
    setSelectedManagement(management);
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsFormModalOpen(false);
    if (success) {
      toast.success(
        message ||
          (formMode === "create"
            ? "Data berhasil ditambahkan"
            : "Data berhasil diperbarui")
      );
      await fetchManagements();
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedManagement) return;

    try {
      await managementService.deleteManagement(selectedManagement.id);
      toast.success("Data berhasil dihapus");
      setIsDeleteModalOpen(false);
      await fetchManagements();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {category?.name || "Management Data"}
        </h2>
        <nav>
          <ol className="flex items-center gap-1.5 text-sm">
            <li>
              <Link href="/" className="text-gray-500 dark:text-gray-400">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/management" className="text-gray-500 hover:text-blue-600 dark:text-gray-400">
                Management Categories
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-800 dark:text-white/90">
              {category?.name || "Data"}
            </li>
          </ol>
        </nav>
      </div>

      {/* Header */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/management")}
                className="rounded-lg border border-gray-300 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                title="Back to Categories"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category?.name || "Management Data"}
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage members in this category. Drag rows to reorder.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Member
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        ) : managements.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No members found. Add your first member to this category.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={managements.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="w-10 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"></th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Photo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Position (EN)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Position (ID)
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
                    {managements.map((management) => (
                      <SortableManagementRow
                        key={management.id}
                        management={management}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
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
      <ManagementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={handleFormSubmit}
        mode={formMode}
        management={selectedManagement}
        categoryId={categoryId}
        categoryName={category?.name || ""}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={selectedManagement?.name || ""}
        itemType="management"
      />
    </div>
  );
}
