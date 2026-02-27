/**
 * PAGE BUILDER V2 - Generic Component Editor Panel
 * 
 * Introspects component_data JSON and renders appropriate form fields:
 * - Multilingual fields (en/id) → dual text inputs or dual textareas
 * - Boolean → checkbox
 * - Number → number input
 * - String → text input or textarea (if long / HTML content)
 * - Array → repeatable items with add/remove
 * - Nested object → collapsible fieldset
 * 
 * Common fields (bg_type, bg_color etc.) shown in a collapsed "Styling" section.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { usePageBuilder } from './context';
import { getRegistryEntry } from './registry';
import { isMultilingual, ComponentSettings } from './types';

// =============================================================================
// FIELD HELPERS
// =============================================================================

const COMMON_FIELD_KEYS = ['custom_id', 'custom_class', 'bg_type', 'bg_color', 'bg_image', 'bg_position'];
const HTML_HINT_KEYS = ['content', 'description'];

function humanize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function isHtmlField(key: string, value: any): boolean {
  if (typeof value === 'string' && value.includes('<')) return true;
  if (isMultilingual(value) && (value.en?.includes('<') || value.id?.includes('<'))) return true;
  return false;
}

// =============================================================================
// INDIVIDUAL FIELD RENDERERS
// =============================================================================

interface FieldProps {
  label: string;
  fieldKey: string;
  value: any;
  onChange: (val: any) => void;
  depth?: number;
}

function MultilingualField({ label, value, onChange }: FieldProps) {
  const isHtml = isHtmlField('', value);
  const InputEl = isHtml ? 'textarea' : 'input';
  const extraProps = isHtml ? { rows: 3 } : {};

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="space-y-1">
        <div className="flex items-start gap-2">
          <span className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 w-5 flex-shrink-0">EN</span>
          <InputEl
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            value={value?.en || ''}
            onChange={(e: any) => onChange({ ...value, en: e.target.value })}
            {...extraProps}
          />
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-2 text-xs font-bold text-red-600 dark:text-red-400 w-5 flex-shrink-0">ID</span>
          <InputEl
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            value={value?.id || ''}
            onChange={(e: any) => onChange({ ...value, id: e.target.value })}
            {...extraProps}
          />
        </div>
      </div>
    </div>
  );
}

function StringField({ label, value, onChange, fieldKey }: FieldProps) {
  const isHtml = isHtmlField(fieldKey, value);
  if (isHtml || (typeof value === 'string' && value.length > 100)) {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <textarea
          rows={4}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 font-mono"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function NumberField({ label, value, onChange }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </div>
  );
}

function BooleanField({ label, value, onChange }: FieldProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</label>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: FieldProps & { options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <select
        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// =============================================================================
// ARRAY FIELD
// =============================================================================

function ArrayField({ label, value, onChange, fieldKey, depth = 0 }: FieldProps) {
  const items = Array.isArray(value) ? value : [];
  const [collapsed, setCollapsed] = useState(items.length > 3);

  const addItem = () => {
    if (items.length === 0) {
      onChange([{}]);
      return;
    }
    // Clone structure of first item with empty values
    const template = JSON.parse(JSON.stringify(items[0]));
    clearValues(template);
    onChange([...items, template]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, newVal: any) => {
    const updated = [...items];
    updated[idx] = newVal;
    onChange(updated);
  };

  const displayItems = collapsed ? items.slice(0, 2) : items;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label} ({items.length})
        </span>
        <div className="flex gap-1">
          {items.length > 3 && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {collapsed ? 'Show all' : 'Collapse'}
            </button>
          )}
          <button
            type="button"
            onClick={addItem}
            className="text-xs px-2 py-0.5 bg-brand-600 text-white rounded hover:bg-brand-700"
          >
            + Add
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayItems.map((item, idx) => (
          <div key={idx} className="p-3 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">#{idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
            {typeof item === 'object' && item !== null ? (
              <ObjectFields
                data={item}
                onChange={(newVal) => updateItem(idx, newVal)}
                depth={depth + 1}
              />
            ) : (
              <input
                type="text"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={item || ''}
                onChange={(e) => updateItem(idx, e.target.value)}
              />
            )}
          </div>
        ))}
        {collapsed && items.length > 2 && (
          <div className="p-2 text-center text-xs text-gray-400">
            ... and {items.length - 2} more
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// OBJECT FIELDS (recursive)
// =============================================================================

function ObjectFields({
  data,
  onChange,
  depth = 0,
  excludeKeys = [],
}: {
  data: Record<string, any>;
  onChange: (newData: Record<string, any>) => void;
  depth?: number;
  excludeKeys?: string[];
}) {
  const handleFieldChange = (key: string, newVal: any) => {
    onChange({ ...data, [key]: newVal });
  };

  const entries = Object.entries(data || {}).filter(([key]) => !excludeKeys.includes(key));

  return (
    <div className={`space-y-3 ${depth > 0 ? 'pl-2 border-l-2 border-gray-200 dark:border-gray-700' : ''}`}>
      {entries.map(([key, value]) => {
        const label = humanize(key);
        const fieldProps: FieldProps = { label, fieldKey: key, value, onChange: (v) => handleFieldChange(key, v), depth };

        // Determine field type
        if (isMultilingual(value)) {
          return <MultilingualField key={key} {...fieldProps} />;
        }
        if (Array.isArray(value)) {
          return <ArrayField key={key} {...fieldProps} />;
        }
        if (typeof value === 'boolean') {
          return <BooleanField key={key} {...fieldProps} />;
        }
        if (typeof value === 'number') {
          return <NumberField key={key} {...fieldProps} />;
        }
        if (value === null) {
          return <StringField key={key} {...fieldProps} value="" />;
        }
        if (typeof value === 'object') {
          // Nested object but not multilingual — render as collapsible section
          return (
            <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <details>
                <summary className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </summary>
                <div className="p-3">
                  <ObjectFields
                    data={value}
                    onChange={(v) => handleFieldChange(key, v)}
                    depth={depth + 1}
                  />
                </div>
              </details>
            </div>
          );
        }
        // Select field for known enum-like keys
        if (key === 'bg_type') {
          return <SelectField key={key} {...fieldProps} options={['color', 'image', 'gradient']} />;
        }
        if (key === 'bg_position') {
          return <SelectField key={key} {...fieldProps} options={['center', 'top', 'bottom', 'left', 'right']} />;
        }
        if (key === 'text_position' || key === 'alignment') {
          return <SelectField key={key} {...fieldProps} options={['left', 'center', 'right']} />;
        }
        if (key === 'layout') {
          return <SelectField key={key} {...fieldProps} options={['grid', 'list', 'carousel']} />;
        }
        if (key === 'theme') {
          return <SelectField key={key} {...fieldProps} options={['light', 'dark']} />;
        }
        if (key === 'order') {
          return <SelectField key={key} {...fieldProps} options={['latest', 'oldest', 'alphabetical']} />;
        }
        // Default: string
        return <StringField key={key} {...fieldProps} />;
      })}
    </div>
  );
}

// =============================================================================
// CLEAR HELPER (for cloning array item templates)
// =============================================================================

function clearValues(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') obj[key] = '';
    else if (typeof val === 'number') obj[key] = 0;
    else if (typeof val === 'boolean') obj[key] = false;
    else if (Array.isArray(val)) obj[key] = [];
    else if (typeof val === 'object' && val !== null) {
      clearValues(val);
    }
  }
}

// =============================================================================
// COMPONENT EDITOR (MAIN)
// =============================================================================

export function ComponentEditor() {
  const {
    selectedComponent,
    selectedComponentId,
    updateComponent,
    removeComponent,
    selectComponent,
  } = usePageBuilder();

  const [showCommon, setShowCommon] = useState(false);

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

  const registryEntry = getRegistryEntry(selectedComponent.type);
  const displayName = registryEntry?.name || selectedComponent.type.replace(/_/g, ' ');

  const handleSettingsChange = (newSettings: ComponentSettings) => {
    updateComponent(selectedComponentId, newSettings);
  };

  // Separate common fields from content fields
  const settings = selectedComponent.settings || {};
  const commonData: Record<string, any> = {};
  const contentData: Record<string, any> = {};
  for (const [key, value] of Object.entries(settings)) {
    if (COMMON_FIELD_KEYS.includes(key)) {
      commonData[key] = value;
    } else {
      contentData[key] = value;
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {displayName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Type: {selectedComponent.type}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Content Fields */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Content</h4>
          <ObjectFields
            data={contentData}
            onChange={(newContentData) => {
              handleSettingsChange({ ...commonData, ...newContentData });
            }}
          />
        </div>

        {/* Common/Styling Fields (collapsible) */}
        {Object.keys(commonData).length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => setShowCommon(!showCommon)}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <svg className={`w-3 h-3 transition-transform ${showCommon ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Styling &amp; Advanced
            </button>
            {showCommon && (
              <ObjectFields
                data={commonData}
                onChange={(newCommonData) => {
                  handleSettingsChange({ ...contentData, ...newCommonData });
                }}
              />
            )}
          </div>
        )}
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
