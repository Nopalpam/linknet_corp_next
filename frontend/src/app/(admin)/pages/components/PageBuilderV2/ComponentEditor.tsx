/**
 * PAGE BUILDER V2 - Generic Component Editor Panel
 * 
 * Introspects component_data JSON and renders appropriate form fields:
 * - Multilingual fields (en/id) → dual text inputs or dual textareas
 * - Boolean → toggle switch
 * - Number → number input
 * - String → text input or textarea (if long / HTML content)
 * - Array → repeatable items with add/remove
 * - Nested object → collapsible fieldset
 * 
 * Features:
 * - Smart field grouping (Content, Layout, Button, Advanced)
 * - 2-column grid for short fields
 * - Section dividers and clear visual hierarchy
 * - Helper text for technical fields
 */

'use client';

import React, { useState, useMemo} from 'react';
import { usePageBuilder } from './context';
import { getRegistryEntry } from './registry';
import { isMultilingual, ComponentSettings } from './types';
import { CkeditorEditor } from './editors/CkeditorEditor';

// =============================================================================
// TYPE-SPECIFIC EDITOR MAPPING
// =============================================================================

const TYPE_SPECIFIC_EDITORS: Record<string, React.ComponentType<{ settings: any; onChange: (s: any) => void }>> = {
  ckeditor: CkeditorEditor,
};

// =============================================================================
// FIELD HELPERS & CLASSIFICATION
// =============================================================================

const COMMON_FIELD_KEYS = ['custom_id', 'custom_class', 'bg_type', 'bg_color', 'bg_image', 'bg_position'];

/** Keys that belong to the CONTENT group */
const CONTENT_KEYS = ['title', 'subtitle', 'heading', 'subheading', 'description', 'content', 'text', 'label', 'name', 'caption', 'alt', 'excerpt', 'summary', 'body', 'quote', 'author', 'source', 'placeholder', 'badge', 'tag', 'category'];
/** Keys that belong to the LAYOUT group */
const LAYOUT_KEYS = ['theme', 'size', 'layout', 'alignment', 'text_position', 'columns', 'gap', 'padding', 'margin', 'width', 'height', 'max_width', 'max_items', 'per_page', 'order', 'direction', 'position', 'variant', 'style', 'display', 'grid', 'spacing', 'rows', 'cols', 'show_', 'hide_', 'is_', 'enable_', 'visible'];
/** Keys that belong to the BUTTON group */
const BUTTON_KEYS = ['button_', 'btn_', 'cta_', 'link_', 'href', 'url', 'target', 'action'];

/** Helper text for technical/non-obvious fields */
const FIELD_HELPERS: Record<string, string> = {
  custom_id: 'HTML id attribute for targeting with CSS/JS',
  custom_class: 'Additional CSS classes (space-separated)',
  bg_type: 'Background style: solid color, image, or gradient',
  bg_color: 'CSS color value, e.g. #ffffff or rgb(0,0,0)',
  bg_image: 'Full URL to the background image',
  bg_position: 'CSS background-position value',
  slug: 'URL-friendly identifier (lowercase, hyphens only)',
  href: 'Full URL or relative path for the link',
  url: 'Full URL or relative path',
  target: 'Link target: _blank for new tab, _self for same tab',
  max_items: 'Maximum number of items to display',
  per_page: 'Number of items per page for pagination',
  order: 'Sort order for displayed items',
  columns: 'Number of columns in the grid layout',
  gap: 'Spacing between grid items (in pixels or CSS units)',
  alt: 'Alternative text for accessibility (screen readers)',
};

/** Placeholder hints for common fields */
const FIELD_PLACEHOLDERS: Record<string, string> = {
  title: 'Enter title...',
  subtitle: 'Enter subtitle...',
  heading: 'Enter heading text...',
  description: 'Enter description...',
  content: 'Enter content...',
  text: 'Enter text...',
  label: 'Enter label...',
  name: 'Enter name...',
  caption: 'Enter caption...',
  alt: 'Describe the image...',
  href: 'https://example.com',
  url: 'https://example.com/image.jpg',
  bg_color: '#ffffff',
  bg_image: 'https://example.com/bg.jpg',
  custom_id: 'my-section-id',
  custom_class: 'mt-8 py-4 bg-white',
  button_text: 'Click here',
  button_url: 'https://example.com',
};

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

/** Determine if a field is "wide" (should span full width) */
function isWideField(key: string, value: any): boolean {
  if (isMultilingual(value)) return true;
  if (Array.isArray(value)) return true;
  if (typeof value === 'object' && value !== null) return true;
  if (isHtmlField(key, value)) return true;
  if (typeof value === 'string' && value.length > 100) return true;
  return false;
}

/** Classify a field key into a group */
function classifyField(key: string): 'content' | 'layout' | 'button' | 'items' | 'advanced' {
  if (COMMON_FIELD_KEYS.includes(key)) return 'advanced';
  if (BUTTON_KEYS.some(bk => key.startsWith(bk) || key === bk)) return 'button';
  if (LAYOUT_KEYS.some(lk => key === lk || key.startsWith(lk))) return 'layout';
  if (CONTENT_KEYS.some(ck => key === ck || key.startsWith(ck))) return 'content';
  return 'content'; // default
}

function getHelperText(key: string): string | undefined {
  if (FIELD_HELPERS[key]) return FIELD_HELPERS[key];
  for (const [hk, hv] of Object.entries(FIELD_HELPERS)) {
    if (key.startsWith(hk) || key.endsWith(hk)) return hv;
  }
  return undefined;
}

function getPlaceholder(key: string): string {
  if (FIELD_PLACEHOLDERS[key]) return FIELD_PLACEHOLDERS[key];
  for (const [pk, pv] of Object.entries(FIELD_PLACEHOLDERS)) {
    if (key.endsWith(pk)) return pv;
  }
  return '';
}

// =============================================================================
// SECTION HEADER
// =============================================================================

function SectionHeader({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="flex items-center justify-center w-6 h-6 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
        {icon}
      </span>
      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
        {title}
      </h4>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
          {count}
        </span>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-gray-200 dark:border-gray-700" />;
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

function FieldWrapper({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div>
      {children}
      {helper && (
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 leading-tight">{helper}</p>
      )}
    </div>
  );
}

function MultilingualField({ label, value, onChange, fieldKey }: FieldProps) {
  const isHtml = isHtmlField('', value);
  const InputEl = isHtml ? 'textarea' : 'input';
  const extraProps = isHtml ? { rows: 3 } : {};
  const placeholder = getPlaceholder(fieldKey);
  const helper = getHelperText(fieldKey);

  return (
    <FieldWrapper helper={helper}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 w-6 flex-shrink-0 text-center py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded">EN</span>
          <InputEl
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            value={value?.en || ''}
            placeholder={placeholder ? `${placeholder} (English)` : ''}
            onChange={(e: any) => onChange({ ...value, en: e.target.value })}
            {...extraProps}
          />
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 w-6 flex-shrink-0 text-center py-0.5 bg-red-50 dark:bg-red-900/30 rounded">ID</span>
          <InputEl
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            value={value?.id || ''}
            placeholder={placeholder ? `${placeholder} (Indonesia)` : ''}
            onChange={(e: any) => onChange({ ...value, id: e.target.value })}
            {...extraProps}
          />
        </div>
      </div>
    </FieldWrapper>
  );
}

function StringField({ label, value, onChange, fieldKey }: FieldProps) {
  const isHtml = isHtmlField(fieldKey, value);
  const placeholder = getPlaceholder(fieldKey);
  const helper = getHelperText(fieldKey);

  if (isHtml || (typeof value === 'string' && value.length > 100)) {
    return (
      <FieldWrapper helper={helper || (isHtml ? 'Supports HTML content' : undefined)}>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <textarea
          rows={4}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors font-mono"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </FieldWrapper>
    );
  }
  return (
    <FieldWrapper helper={helper}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type={fieldKey.includes('color') ? 'text' : 'text'}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {fieldKey.includes('color') && value && (
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: value }} />
          <span className="text-[11px] text-gray-400 font-mono">{value}</span>
        </div>
      )}
    </FieldWrapper>
  );
}

function NumberField({ label, value, onChange, fieldKey }: FieldProps) {
  const helper = getHelperText(fieldKey);
  const placeholder = getPlaceholder(fieldKey);

  return (
    <FieldWrapper helper={helper}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type="number"
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </FieldWrapper>
  );
}

function BooleanField({ label, value, onChange, fieldKey }: FieldProps) {
  const helper = getHelperText(fieldKey);

  return (
    <FieldWrapper helper={helper}>
      <div className="flex items-center justify-between py-1">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        <button
          type="button"
          role="switch"
          aria-checked={!!value}
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
            value ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              value ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </FieldWrapper>
  );
}

function SelectField({ label, value, onChange, options, fieldKey }: FieldProps & { options: string[] }) {
  const helper = getHelperText(fieldKey);

  return (
    <FieldWrapper helper={helper}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
        ))}
      </select>
    </FieldWrapper>
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium">
            {items.length}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          {items.length > 3 && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
            >
              {collapsed ? 'Show all' : 'Collapse'}
            </button>
          )}
          <button
            type="button"
            onClick={addItem}
            className="text-xs px-2.5 py-1 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            + Add
          </button>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {displayItems.map((item, idx) => (
          <div key={idx} className="p-4 relative group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item {idx + 1}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-[11px] text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
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
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                value={item || ''}
                onChange={(e) => updateItem(idx, e.target.value)}
              />
            )}
          </div>
        ))}
        {collapsed && items.length > 2 && (
          <div className="px-4 py-2.5 text-center text-xs text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
            + {items.length - 2} more item{items.length - 2 !== 1 ? 's' : ''} hidden
          </div>
        )}
        {items.length === 0 && (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">No items yet</p>
            <button
              type="button"
              onClick={addItem}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
            >
              + Add first item
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// OBJECT FIELDS (recursive, with 2-column grid for short fields)
// =============================================================================

function renderField(key: string, value: any, handleFieldChange: (key: string, val: any) => void, depth: number): { element: React.ReactNode; wide: boolean } {
  const label = humanize(key);
  const fieldProps: FieldProps = { label, fieldKey: key, value, onChange: (v) => handleFieldChange(key, v), depth };

  // Select fields for known enums
  if (key === 'bg_type') {
    return { element: <SelectField key={key} {...fieldProps} options={['color', 'image', 'gradient']} />, wide: false };
  }
  if (key === 'bg_position') {
    return { element: <SelectField key={key} {...fieldProps} options={['center', 'top', 'bottom', 'left', 'right']} />, wide: false };
  }
  if (key === 'text_position' || key === 'alignment') {
    return { element: <SelectField key={key} {...fieldProps} options={['left', 'center', 'right']} />, wide: false };
  }
  if (key === 'layout') {
    return { element: <SelectField key={key} {...fieldProps} options={['grid', 'list', 'carousel']} />, wide: false };
  }
  if (key === 'theme') {
    return { element: <SelectField key={key} {...fieldProps} options={['light', 'dark']} />, wide: false };
  }
  if (key === 'order') {
    return { element: <SelectField key={key} {...fieldProps} options={['latest', 'oldest', 'alphabetical']} />, wide: false };
  }

  // Multilingual (always wide)
  if (isMultilingual(value)) {
    return { element: <MultilingualField key={key} {...fieldProps} />, wide: true };
  }
  // Array (always wide)
  if (Array.isArray(value)) {
    return { element: <ArrayField key={key} {...fieldProps} />, wide: true };
  }
  // Boolean (narrow)
  if (typeof value === 'boolean') {
    return { element: <BooleanField key={key} {...fieldProps} />, wide: false };
  }
  // Number (narrow)
  if (typeof value === 'number') {
    return { element: <NumberField key={key} {...fieldProps} />, wide: false };
  }
  // Null → string
  if (value === null) {
    return { element: <StringField key={key} {...fieldProps} value="" />, wide: false };
  }
  // Nested object
  if (typeof value === 'object') {
    return {
      element: (
        <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <details>
            <summary className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 cursor-pointer text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
              <svg className="w-3 h-3 text-gray-400 transition-transform details-open:rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {label}
            </summary>
            <div className="p-4">
              <ObjectFields
                data={value}
                onChange={(v) => handleFieldChange(key, v)}
                depth={depth + 1}
              />
            </div>
          </details>
        </div>
      ),
      wide: true,
    };
  }
  // Default string — wide if long or HTML
  const wide = isWideField(key, value);
  return { element: <StringField key={key} {...fieldProps} />, wide };
}

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

  // Render fields into a smart grid: wide fields get full width, short fields share a row
  const rendered = entries.map(([key, value]) => {
    const { element, wide } = renderField(key, value, handleFieldChange, depth);
    return { key, element, wide };
  });

  return (
    <div className={`${depth > 0 ? 'pl-3 border-l-2 border-brand-200 dark:border-brand-800/40' : ''}`}>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {rendered.map(({ key, element, wide }) => (
          <div key={key} className={wide ? 'col-span-2' : 'col-span-2 sm:col-span-1'}>
            {element}
          </div>
        ))}
      </div>
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
// SECTION ICONS
// =============================================================================

const ContentIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LayoutIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
);

const ButtonIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
  </svg>
);

const ItemsIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

const AdvancedIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

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

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    layout: true,
    button: true,
    items: true,
    advanced: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Categorize fields into groups
  const settings = selectedComponent.settings || {};
  const groups: Record<string, Record<string, any>> = {
    content: {},
    layout: {},
    button: {},
    items: {},
    advanced: {},
  };

  for (const [key, value] of Object.entries(settings)) {
    // Arrays always go to items group
    if (Array.isArray(value)) {
      groups.items[key] = value;
    } else if (COMMON_FIELD_KEYS.includes(key)) {
      groups.advanced[key] = value;
    } else {
      const group = classifyField(key);
      groups[group][key] = value;
    }
  }

  // Remove empty groups
  const activeGroups = Object.entries(groups).filter(([, data]) => Object.keys(data).length > 0);

  const sectionConfig: Record<string, { title: string; icon: React.ReactNode }> = {
    content: { title: 'Content', icon: <ContentIcon /> },
    layout: { title: 'Layout', icon: <LayoutIcon /> },
    button: { title: 'Button Settings', icon: <ButtonIcon /> },
    items: { title: 'Items / Lists', icon: <ItemsIcon /> },
    advanced: { title: 'Advanced', icon: <AdvancedIcon /> },
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {displayName}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
                {selectedComponent.type}
              </p>
            </div>
          </div>
          <button
            onClick={() => selectComponent(null)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close editor"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Editor Form — type-specific or grouped sections */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        {TYPE_SPECIFIC_EDITORS[selectedComponent.type] ? (
          <div className="p-4">
            {React.createElement(TYPE_SPECIFIC_EDITORS[selectedComponent.type], {
              settings,
              onChange: handleSettingsChange,
            })}
          </div>
        ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activeGroups.map(([groupKey, groupData], idx) => {
            const config = sectionConfig[groupKey];
            const isExpanded = expandedSections[groupKey] ?? true;
            const fieldCount = Object.keys(groupData).length;

            return (
              <div key={groupKey}>
                {/* Section Toggle Header */}
                <button
                  type="button"
                  onClick={() => toggleSection(groupKey)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-md bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
                      {config.icon}
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      {config.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                      {fieldCount}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className="px-4 pb-5">
                    <ObjectFields
                      data={groupData}
                      onChange={(newGroupData) => {
                        // Merge back all groups
                        const merged: Record<string, any> = {};
                        for (const [gk, gd] of activeGroups) {
                          if (gk === groupKey) {
                            Object.assign(merged, newGroupData);
                          } else {
                            Object.assign(merged, gd);
                          }
                        }
                        handleSettingsChange(merged);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => {
            removeComponent(selectedComponentId);
            selectComponent(null);
          }}
          className="w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Component
        </button>
      </div>
    </div>
  );
}
