/**
 * PAGE BUILDER V2 - Sidebar Component
 * 
 * Displays available components that can be dragged onto the canvas.
 * Components are grouped by category from the registry.
 */

'use client';

import React from 'react';
import { getComponentsByCategory, getRegisteredComponents } from './registry';
import { ComponentType, DRAG_TYPE, DragItem } from './types';
import { usePageBuilder } from './context';

// =============================================================================
// COMPONENT CARD
// =============================================================================

interface ComponentCardProps {
  type: ComponentType;
  displayName: string;
  icon: string;
}

// Icon component - defined outside render
function ComponentIcon({ icon }: { icon: string }) {
  switch (icon) {
    case 'hero':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case 'pricing':
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
        </svg>
      );
  }
}

function ComponentCard({ type, displayName, icon }: ComponentCardProps) {
  const { addComponent } = usePageBuilder();

  const handleDragStart = (e: React.DragEvent) => {
    const dragData: DragItem = {
      type: 'NEW_COMPONENT',
      componentType: type,
    };
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleClick = () => {
    addComponent(type);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-grab active:cursor-grabbing hover:border-brand-500 hover:shadow-md transition-all"
    >
      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300">
        <ComponentIcon icon={icon} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {displayName}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Drag or click to add
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// SIDEBAR
// =============================================================================

export function Sidebar() {
  const componentsByCategory = getComponentsByCategory();

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          Components
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Drag onto canvas or click to add
        </p>

        {Object.entries(componentsByCategory).map(([category, components]) => (
          <div key={category} className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {category}
            </h4>
            <div className="space-y-2">
              {components.map((comp) => (
                <ComponentCard
                  key={comp.type}
                  type={comp.type}
                  displayName={comp.displayName}
                  icon={comp.icon}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Help text */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
            Tips
          </h4>
          <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
            <li>• Drag components to reorder them</li>
            <li>• Click a component to edit its settings</li>
            <li>• Use the eye icon to show/hide components</li>
            <li>• Changes are saved when you click &ldquo;Save&rdquo;</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
