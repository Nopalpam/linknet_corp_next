/**
 * PAGE BUILDER V2 - Modal Container
 * 
 * The main modal that wraps the entire Page Builder.
 * Provides the layout and controls state for the modal.
 * 
 * Key responsibilities:
 * - Modal open/close logic
 * - Save confirmation before close
 * - Layout of the 3-panel structure
 */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageBuilderProvider, usePageBuilder } from './context';
import { Sidebar } from './Sidebar';
import { Canvas } from './Canvas';
import { ComponentEditor } from './ComponentEditor';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// =============================================================================
// MODAL CONTENT (Inside Provider)
// =============================================================================

interface PageBuilderContentProps {
  onClose: () => void;
  onSaveSuccess: () => void;
}

function PageBuilderContent({ onClose, onSaveSuccess }: PageBuilderContentProps) {
  const { state, saveComponents, clearError, addComponent, moveComponent } = usePageBuilder();
  const { isDirty, isSaving, error } = state;

  // DnD state
  const [activeDragLabel, setActiveDragLabel] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    setActiveDragLabel(data?.label || data?.componentType || String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragLabel(null);

    if (!over) return;

    const activeData = active.data.current;

    // Case 1: New component from sidebar
    if (activeData?.isNewComponent) {
      const componentType = activeData.componentType as string;
      if (!componentType) return;

      if (String(over.id) === 'canvas-droppable') {
        // Dropped on the canvas area itself → append
        addComponent(componentType);
      } else {
        // Dropped on/near an existing sortable item → insert at that index
        const overIndex = state.components.findIndex((c) => c.id === String(over.id));
        addComponent(componentType, overIndex >= 0 ? overIndex : undefined);
      }
      return;
    }

    // Case 2: Reorder existing component
    if (active.id !== over.id && String(over.id) !== 'canvas-droppable') {
      const overIndex = state.components.findIndex((c) => c.id === String(over.id));
      if (overIndex !== -1) {
        moveComponent(String(active.id), overIndex);
      }
    }
  }, [addComponent, moveComponent, state.components]);

  // Handle close with unsaved changes check
  const handleClose = useCallback(() => {
    if (isDirty) {
      const shouldClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!shouldClose) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Handle save
  const handleSave = useCallback(async () => {
    try {
      await saveComponents();
      onSaveSuccess();
      onClose();
    } catch (err) {
      // Error is already set in state
    }
  }, [saveComponents, onSaveSuccess, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Escape to close
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, handleSave]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Page Builder
          </h2>
          {isDirty && (
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Error indicator */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-red-700 dark:text-red-300">
                {error}
              </span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Keyboard shortcut hint */}
          <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
              Ctrl+S
            </kbd>
            <span>to save</span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              'Save'
            )}
          </button>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Component Library */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <Sidebar />
        </aside>

        {/* Center Panel - Canvas */}
        <main className="flex-1 min-w-[280px]">
          <Canvas />
        </main>

        {/* Right Panel - Component Editor */}
        <aside className="w-[560px] flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <ComponentEditor />
        </aside>
      </div>
    </div>

    {/* Drag overlay - visual feedback during drag */}
    <DragOverlay dropAnimation={null}>
      {activeDragLabel ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-brand-500 px-4 py-3 opacity-90 pointer-events-none">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {activeDragLabel}
          </p>
        </div>
      ) : null}
    </DragOverlay>
    </DndContext>
  );
}

// =============================================================================
// MODAL WRAPPER
// =============================================================================

interface PageBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
}

export function PageBuilderModal({ isOpen, onClose, pageId }: PageBuilderModalProps) {
  // Handle save success - could be used for notifications
  const handleSaveSuccess = useCallback(() => {
    // Placeholder for future notifications
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        <PageBuilderProvider pageId={pageId}>
          <PageBuilderContent onClose={handleClose} onSaveSuccess={handleSaveSuccess} />
        </PageBuilderProvider>
      </div>
    </div>
  );
}

// Export for default usage
export default PageBuilderModal;
