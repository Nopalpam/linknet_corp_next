"use client";

import React, { useState, useEffect } from "react";
import ComponentLibrary from "./PageBuilder/ComponentLibrary";
import PageCanvas from "./PageBuilder/PageCanvas";
import ComponentSettings from "./PageBuilder/ComponentSettings";
import { PageBuilderProvider, usePageBuilder, type ComponentSchema } from "./PageBuilder/EnhancedPageBuilderContext";
import { UndoRedoToolbar, AutoSaveIndicator, KeyboardShortcutsHint } from "./PageBuilder/EnhancedToolbar";
import { useToast } from "@/context/ToastContext";

interface PageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

function PageBuilderContent({ onClose, pageId }: { onClose: () => void; pageId: string }) {
  const { components, saveComponents, saving } = usePageBuilder();
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveComponents();
      toast.success("Page saved successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to save page");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Page Builder
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build your page with drag-and-drop components
            </p>
          </div>
          <UndoRedoToolbar />
        </div>
        
        <div className="flex items-center gap-4">
          <AutoSaveIndicator />
          <KeyboardShortcutsHint />
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save & Close"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden bg-gray-50 dark:bg-gray-950">
        {/* Left Panel - Component Library */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <ComponentLibrary />
        </div>

        {/* Center Panel - Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <PageCanvas />
        </div>

        {/* Right Panel - Component Settings */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          <ComponentSettings />
        </div>
      </div>
    </div>
  );
}

export default function PageBuilderModal({
  isOpen,
  onClose,
  pageId,
}: PageBuilderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center z-9999">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <PageBuilderProvider pageId={pageId}>
          <PageBuilderContent onClose={onClose} pageId={pageId} />
        </PageBuilderProvider>
      </div>
    </div>
  );
}
