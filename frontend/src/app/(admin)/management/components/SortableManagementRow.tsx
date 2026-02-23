"use client";

import React from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Management } from "@/services/management.service";

interface SortableManagementRowProps {
  management: Management;
  onEdit: (management: Management) => void;
  onDelete: (management: Management) => void;
}

export function SortableManagementRow({
  management,
  onEdit,
  onDelete,
}: SortableManagementRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: management.id });

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
      {/* Drag Handle */}
      <td className="w-10 px-4 py-3">
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

      {/* Photo */}
      <td className="px-4 py-3">
        {management.photo ? (
          <Image
            src={management.photo}
            alt={management.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {management.name.charAt(0).toUpperCase()}
          </div>
        )}
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <span className="font-medium text-gray-900 dark:text-white">
          {management.name}
        </span>
      </td>

      {/* Position EN */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {management.positionEn || "-"}
        </span>
      </td>

      {/* Position ID */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {management.positionId || "-"}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            management.dataStatus === 1
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {management.dataStatus === 1 ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          {/* Edit */}
          <button
            onClick={() => onEdit(management)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Edit"
          >
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(management)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title="Delete"
          >
            <svg
              className="h-4.5 w-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
