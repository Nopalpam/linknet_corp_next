/**
 * Rich Text Editor Component - Settings Editor
 * 
 * WYSIWYG editor for the 'ckeditor' component type.
 * Uses TipTap (free, MIT license) with two editor instances:
 * one for English (content) and one for Indonesian (content_id).
 */

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with TipTap
const RichTextEditor = dynamic(
  () => import('@/components/ui/ckeditor/CKEditorWrapper'),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> }
);

interface CkeditorEditorSettings {
  content: string;
  content_id: string;
  custom_id?: string;
  custom_class?: string;
  [key: string]: any;
}

interface CkeditorEditorProps {
  settings: CkeditorEditorSettings;
  onChange: (settings: CkeditorEditorSettings) => void;
}

export const CkeditorEditor: React.FC<CkeditorEditorProps> = ({ settings, onChange }) => {
  const [activeTab, setActiveTab] = useState<'en' | 'id'>('en');

  const updateField = <K extends keyof CkeditorEditorSettings>(
    field: K,
    value: CkeditorEditorSettings[K]
  ) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-5">
      {/* Language Tab Switcher */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Content Editor
        </label>
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('en')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'en'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              EN
            </span>
            English
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('id')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'id'
                ? 'border-red-600 text-red-600 dark:border-red-400 dark:text-red-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              ID
            </span>
            Indonesia
          </button>
        </div>

        {/* English Content Editor */}
        <div className={activeTab === 'en' ? 'block' : 'hidden'}>
          <RichTextEditor
            key={`editor-en-${settings.custom_id || 'default'}`}
            value={settings.content || ''}
            onChange={(data) => updateField('content', data)}
            placeholder="Enter English content here..."
            minHeight="300px"
          />
        </div>

        {/* Indonesian Content Editor */}
        <div className={activeTab === 'id' ? 'block' : 'hidden'}>
          <RichTextEditor
            key={`editor-id-${settings.custom_id || 'default'}`}
            value={settings.content_id || ''}
            onChange={(data) => updateField('content_id', data)}
            placeholder="Masukkan konten Bahasa Indonesia di sini..."
            minHeight="300px"
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <details className="group">
        <summary className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
          <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Advanced Settings
        </summary>
        <div className="mt-3 space-y-3 pl-5 border-l-2 border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Custom ID</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              value={settings.custom_id || ''}
              placeholder="my-section-id"
              onChange={(e) => updateField('custom_id', e.target.value)}
            />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">HTML id attribute for targeting with CSS/JS</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Custom Class</label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              value={settings.custom_class || ''}
              placeholder="mt-8 py-4 bg-white"
              onChange={(e) => updateField('custom_class', e.target.value)}
            />
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">Additional CSS classes (space-separated)</p>
          </div>
        </div>
      </details>
    </div>
  );
};
