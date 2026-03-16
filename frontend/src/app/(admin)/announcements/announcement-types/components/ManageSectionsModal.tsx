"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import {
  announcementService,
  AnnouncementType,
  AnnouncementSection,
  OrderUpdate,
} from "@/services/announcement.service";
import { useToast } from "@/context/ToastContext";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ManageSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcementType: AnnouncementType;
  onUpdate: () => void;
}

function SortableSectionRow({
  section,
  onToggle,
}: {
  section: AnnouncementSection;
  onToggle: (section: AnnouncementSection) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
    >
      <td className="w-10 px-3 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Drag to reorder"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>
      </td>
      <td className="px-3 py-3">
        <span className="font-medium text-gray-900 dark:text-white">{section.title}</span>
        {section.announcementYear && (
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({section.announcementYear})</span>
        )}
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {section._count?.announcements ?? 0}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(section);
          }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            section.isActive ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              section.isActive ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </td>
    </tr>
  );
}

export default function ManageSectionsModal({
  isOpen,
  onClose,
  announcementType,
  onUpdate,
}: ManageSectionsModalProps) {
  const toast = useToast();
  const [sections, setSections] = useState<AnnouncementSection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncementTypeSections(announcementType.id);
      setSections(response.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch sections");
    } finally {
      setLoading(false);
    }
  }, [announcementType.id, toast]);

  useEffect(() => {
    if (isOpen) {
      fetchSections();
    }
  }, [isOpen, fetchSections]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);

    const reordered = arrayMove(sections, oldIndex, newIndex);
    setSections(reordered);

    const updates: OrderUpdate[] = reordered.map((s, idx) => ({
      id: s.id,
      sortOrder: idx + 1,
    }));

    try {
      setSaving(true);
      await announcementService.updateSectionsOrder(announcementType.id, updates);
      toast.success("Section order updated");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order");
      fetchSections();
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (section: AnnouncementSection) => {
    try {
      await announcementService.toggleAnnouncementSectionStatus(section.id);
      toast.success(`Section "${section.title}" status toggled`);
      fetchSections();
      onUpdate();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
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
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Manage Sections
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Drag and drop to reorder sections for{" "}
            <span className="font-semibold">{announcementType.name}</span>
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <p>No sections found for this announcement type.</p>
            <p className="text-sm mt-1">Create sections from the Announcement Sections page.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="w-10 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400"></th>
                      <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Title</th>
                      <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Items</th>
                      <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <SortableSectionRow
                        key={section.id}
                        section={section}
                        onToggle={handleToggleStatus}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {saving ? "Saving order..." : `${sections.length} section(s)`}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
