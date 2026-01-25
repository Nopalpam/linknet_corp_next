'use client';

import React from 'react';
import { usePageBuilder } from './EnhancedPageBuilderContext';

export function UndoRedoToolbar() {
  const { undo, redo, canUndo, canRedo } = usePageBuilder();
  
  return (
    <div className="flex items-center gap-2 border-r pr-4 border-gray-200 dark:border-gray-700">
      <button
        onClick={undo}
        disabled={!canUndo}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>Undo</span>
      </button>
      
      <button
        onClick={redo}
        disabled={!canRedo}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
        title="Redo (Ctrl+Y)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
        <span>Redo</span>
      </button>
    </div>
  );
}

export function AutoSaveIndicator() {
  const { autoSaveEnabled, toggleAutoSave, saving, lastSaved } = usePageBuilder();
  
  // Check if there are unsaved changes - in EnhancedPageBuilderContext this is tracked internally
  const hasUnsavedChanges = lastSaved === null;
  
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 10) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <button
        onClick={toggleAutoSave}
        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title="Toggle auto-save"
      >
        <div className={`w-2 h-2 rounded-full ${autoSaveEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Auto-save: {autoSaveEnabled ? 'ON' : 'OFF'}
        </span>
      </button>
      
      <div className="flex items-center gap-2">
        {saving && (
          <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-medium">Saving...</span>
          </span>
        )}
        
        {!saving && lastSaved && !hasUnsavedChanges && (
          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Saved {formatTime(lastSaved)}</span>
          </span>
        )}
        
        {!saving && hasUnsavedChanges && (
          <span className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Unsaved changes</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function KeyboardShortcutsHint() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        title="Keyboard shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              ⌨️ Keyboard Shortcuts
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Undo</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Redo</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Ctrl+Y</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Save</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Ctrl+S</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Copy</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Ctrl+C</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Paste</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Ctrl+V</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Duplicate</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Ctrl+D</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Delete</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono">Delete</kbd>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
