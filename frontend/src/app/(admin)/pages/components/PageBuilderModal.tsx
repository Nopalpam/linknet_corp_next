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
  const { components, saveComponents, saving, canUndo } = usePageBuilder();
  const toast = useToast();

  const handleSave = async () => {
    console.log('💾 Manual save triggered');
    try {
      await saveComponents();
      console.log('✅ Manual save successful, closing modal');
      toast.success("Page saved successfully!");
      onClose();
    } catch (error) {
      console.error('❌ Manual save failed:', error);
      toast.error("Failed to save page");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Page Builder
              </h2>
              {canUndo && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded">
                  Unsaved
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Build your page with drag-and-drop components
            </p>
          </div>
          <UndoRedoToolbar />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Auto-save disabled indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Auto-save OFF - Use Save Button</span>
          </div>
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
  // Prevent backdrop click from bubbling
  const handleBackdropClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100001]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={handleBackdropClick} />

      {/* Modal */}
      <div 
        className="relative w-full h-full max-w-[95vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CRITICAL: key={pageId} ensures Provider only remounts when pageId actually changes */}
        <PageBuilderProvider key={pageId} pageId={pageId}>
          <PageBuilderContent onClose={onClose} pageId={pageId} />
        </PageBuilderProvider>
      </div>
    </div>
  );
}
