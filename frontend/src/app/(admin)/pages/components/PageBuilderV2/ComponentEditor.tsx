/**
 * PAGE BUILDER V2 - Component Editor Panel
 * 
 * Displays the editor form for the currently selected component.
 * Reads from and writes to the canonical state - no local duplication.
 */

'use client';

import React from 'react';
import { usePageBuilder } from './context';
import { getRegistryEntry } from './registry';
import { ComponentSettings } from './types';

export function ComponentEditor() {
  const {
    selectedComponent,
    selectedComponentId,
    updateComponent,
    removeComponent,
    selectComponent,
  } = usePageBuilder();

  // No component selected
  if (!selectedComponent || !selectedComponentId) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Component Settings
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              No Component Selected
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click on a component in the canvas to edit its settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get the editor component from registry
  const registryEntry = getRegistryEntry(selectedComponent.type);

  if (!registryEntry) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Component Settings
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">
              Unknown Component
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Component type &ldquo;{selectedComponent.type}&rdquo; is not registered.
            </p>
            <button
              onClick={() => {
                removeComponent(selectedComponentId);
                selectComponent(null);
              }}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Remove Component
            </button>
          </div>
        </div>
      </div>
    );
  }

  const EditorComponent = registryEntry.editor;

  // Handle settings change
  const handleSettingsChange = (newSettings: ComponentSettings) => {
    updateComponent(selectedComponentId, newSettings);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {registryEntry.displayName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Edit component settings
            </p>
          </div>
          <button
            onClick={() => selectComponent(null)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Close editor"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor Form */}
      <div className="flex-1 overflow-y-auto p-4">
        <EditorComponent
          settings={selectedComponent.settings as any}
          onChange={handleSettingsChange}
        />
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            removeComponent(selectedComponentId);
            selectComponent(null);
          }}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
        >
          Delete Component
        </button>
      </div>
    </div>
  );
}
