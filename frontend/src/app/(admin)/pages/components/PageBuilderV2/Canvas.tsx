/**
 * PAGE BUILDER V2 - Canvas Component
 * 
 * The main canvas area where components are displayed and can be:
 * - Selected for editing
 * - Reordered via drag-and-drop
 * - Deleted
 * 
 * Renders DIRECTLY from PageBuilder state - no local state duplication.
 * Uses a generic preview card for all component types.
 */

'use client';

import React from 'react';
import { usePageBuilder } from './context';
import { getRegistryEntry } from './registry';
import { getLocalizedValue } from './types';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// =============================================================================
// GENERIC COMPONENT PREVIEW
// =============================================================================

function ComponentPreview({ type, settings, registryName }: { type: string; settings: Record<string, any>; registryName: string }) {
  // Extract a title to display from common fields
  const displayTitle =
    getLocalizedValue(settings.title) ||
    getLocalizedValue(settings.name) ||
    getLocalizedValue(settings.label) ||
    settings.symbol ||
    registryName;

  const displayDescription =
    getLocalizedValue(settings.description) ||
    getLocalizedValue(settings.content)?.replace(/<[^>]*>/g, '').substring(0, 120) ||
    '';

  // Determine badge color for category
  const isMain = ['news_highlight', 'news_list', 'career_highlight', 'career_list', 'management_list', 'announcement_list', 'report_list', 'awards_list'].includes(type);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[80px]">
      <div className="flex items-start gap-3">
        {/* Type badge */}
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
          isMain
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {type.replace(/_/g, ' ')}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {displayTitle}
          </p>
          {displayDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {displayDescription}
            </p>
          )}
        </div>
      </div>

      {/* Array indicators */}
      {settings.slides && Array.isArray(settings.slides) && (
        <p className="text-xs text-gray-400 mt-2">{settings.slides.length} slide(s)</p>
      )}
      {settings.items && Array.isArray(settings.items) && (
        <p className="text-xs text-gray-400 mt-2">{settings.items.length} item(s)</p>
      )}
      {settings.tabs && Array.isArray(settings.tabs) && (
        <p className="text-xs text-gray-400 mt-2">{settings.tabs.length} tab(s)</p>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT WRAPPER
// =============================================================================

interface CanvasComponentProps {
  componentId: string;
  index: number;
}

function CanvasComponent({ componentId, index }: CanvasComponentProps) {
  const {
    state,
    selectedComponentId,
    selectComponent,
    removeComponent,
    toggleVisibility,
  } = usePageBuilder();

  const component = state.components.find((c) => c.id === componentId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: componentId });

  if (!component) return null;

  const isSelected = selectedComponentId === componentId;
  const registryEntry = getRegistryEntry(component.type);
  const displayName = registryEntry?.name || component.type.replace(/_/g, ' ');

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : (!component.isVisible ? 0.5 : 1),
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-colors duration-200`}
    >
      {/* Component Toolbar */}
      <div
        className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg transition-opacity ${
          isSelected
            ? 'opacity-100 bg-white dark:bg-gray-800 shadow-lg'
            : 'opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-gray-800/90 shadow'
        }`}
      >
        {/* Type label */}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
          {displayName}
        </span>
        
        {/* Visibility toggle */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(componentId);
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title={component.isVisible ? 'Hide component' : 'Show component'}
        >
          {component.isVisible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>

        {/* Delete button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(componentId);
          }}
          className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Delete component"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>

      {/* Component Selection Wrapper */}
      <div
        onClick={() => selectComponent(componentId)}
        className={`cursor-pointer rounded-lg transition-all ${
          isSelected
            ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900'
            : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
        }`}
      >
        <ComponentPreview
          type={component.type}
          settings={component.settings}
          registryName={displayName}
        />
      </div>
    </div>
  );
}

// =============================================================================
// CANVAS
// =============================================================================

export function Canvas() {
  const { state, selectComponent, addComponent } = usePageBuilder();
  const { components, isLoading, error } = state;

  // Make the canvas a droppable area for new components from sidebar
  const { setNodeRef: setDropRef, isOver: isCanvasOver } = useDroppable({
    id: 'canvas-droppable',
  });

  // Handle clicking on empty canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setDropRef}
      onClick={handleCanvasClick}
      className={`h-full overflow-y-auto p-6 bg-gray-100 dark:bg-gray-950 transition-colors ${
        isCanvasOver ? 'bg-brand-50 dark:bg-brand-950' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-3">
        <SortableContext
          items={components.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {components.map((component, index) => (
            <CanvasComponent
              key={component.id}
              componentId={component.id}
              index={index}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {components.length === 0 && (
          <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isCanvasOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-gray-300 dark:border-gray-700'
          }`}>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isCanvasOver ? 'Drop Here!' : 'No Components Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag components from the sidebar or click below to get started.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => addComponent('hero_section')}
                className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                + Add Hero
              </button>
              <button
                onClick={() => addComponent('text_block')}
                className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                + Add Text Block
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
