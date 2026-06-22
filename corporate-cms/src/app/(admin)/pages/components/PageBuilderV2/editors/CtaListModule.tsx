'use client';

import React from 'react';
import { ICON_OPTIONS } from '../iconOptions';
import MediaPickerButton from '@/components/media/MediaPickerButton';

const CTA_VARIANT_OPTIONS = [
  'primary',
  'secondary',
  'secondary-outline',
  'secondary-outline--black',
  'secondary-outline--white',
  'secondary-plain',
  'warning',
  'info',
  'danger',
  'link',
];

const CTA_SIZE_OPTIONS = ['sm', 'md', 'lg'];

/**
 * CTA link behavior stored in CMS.
 *
 * - `url`: render a normal link using `href` and `target`.
 * - `action-modal`: ignore `href` in the public CTA renderer and open the
 *   modal selected in `action_modal`.
 *
 * Keep these values in sync with `web/components/base/section/CTAList.jsx`.
 */
const LINK_TYPE_OPTIONS = ['url', 'action-modal'];
const LINK_TARGET_OPTIONS = ['_self', '_blank'];

/**
 * IDs available for `link_type: action-modal`.
 *
 * To add a new modal action:
 * 1. Add the option here so CMS editors can select it.
 * 2. Add the matching handler in `actionModalMap` inside
 *    `web/components/base/section/CTAList.jsx`.
 * 3. Wrap `CTAListContent` with the modal provider if the modal uses context.
 */
const ACTION_MODAL_OPTIONS = [
  '',
  'get-started',
  'form-registration-enterprise',
  'form-registration-enterprise-smb',
  'form-registration-fiber',
  'form-registration-media',
  'form-inquiry-fiber',
  'form-subscribe-internet-fiber',
  'form-partnership-enterprise',
  'form-suggest-enterprise',
  'form-event-register',
];

function labelize(value: string): string {
  if (!value) return 'None';
  return value
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeCta(value: Record<string, any>): Record<string, any> {
  const label = value.label ?? value.text ?? value.button_text ?? value.cta_text ?? '';
  const action = value.action ?? value.actionModal ?? value.action_modal ?? value.modal_id ?? value.modalId ?? '';

  return {
    ...value,
    label,
    text: value.text ?? label,
    variant: value.variant ?? 'primary',
    size: value.size ?? 'lg',
    link_type: value.link_type ?? value.linkType ?? 'url',
    href: value.href ?? value.url ?? value.action ?? '',
    action,
    target: value.target ?? '_self',
    action_modal: value.action_modal ?? value.actionModal ?? value.modal_id ?? value.modalId ?? value.action ?? '',
    iconLeft: value.iconLeft ?? value.icon_left ?? '',
    iconRight: value.iconRight ?? value.icon_right ?? value.icon ?? '',
  };
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

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const normalizedOptions = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <FieldWrapper>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {normalizedOptions.map((option) => (
          <option key={option} value={option}>
            {labelize(option)}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <FieldWrapper>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldWrapper>
  );
}

function IconSelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedIcon = ICON_OPTIONS.includes(value as any) ? value : '';
  const customPath = selectedIcon ? '' : value || '';

  return (
    <FieldWrapper helper="Uses the existing icon data bank. Path values are still accepted for backward compatibility.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="space-y-2">
        <select
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          value={selectedIcon}
          onChange={(e) => onChange(e.target.value)}
        >
          {ICON_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {labelize(option)}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="/assets/icons/example.svg"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          value={customPath}
          onChange={(event) => onChange(event.target.value)}
        />
        <MediaPickerButton
          kind="image"
          label="Choose Icon from File Manager"
          title={`Choose ${label}`}
          onSelect={(url) => onChange(url)}
        />
      </div>
    </FieldWrapper>
  );
}

function MultilingualTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  return (
    <FieldWrapper>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 w-6 flex-shrink-0 text-center py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded">EN</span>
          <input
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            value={value?.en || ''}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
          />
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-400 w-6 flex-shrink-0 text-center py-0.5 bg-red-50 dark:bg-red-900/30 rounded">ID</span>
          <input
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            value={value?.id || ''}
            onChange={(e) => onChange({ ...value, id: e.target.value })}
          />
        </div>
      </div>
    </FieldWrapper>
  );
}

export function isCtaListItem(data: Record<string, any> | undefined): boolean {
  if (!data || typeof data !== 'object') return false;
  const hasDestination = 'href' in data || 'url' in data || 'action' in data || 'action_modal' in data || 'actionModal' in data;
  const hasLabel = 'label' in data || 'text' in data || 'button_text' in data || 'cta_text' in data;
  const hasCtaControls = Boolean(
    'variant' in data ||
    'size' in data ||
    'link_type' in data ||
    'linkType' in data ||
    'iconLeft' in data ||
    'iconRight' in data ||
    'icon_left' in data ||
    'icon_right' in data
  );

  // A media item commonly has a `url` (for example `{ url, alt }`). It is a
  // CTA only when the destination is accompanied by CTA content or controls.
  return Boolean(hasDestination && (hasLabel || hasCtaControls));
}

/**
 * Reusable CMS editor for one CTA item.
 *
 * `ComponentEditor` detects CTA-like objects and delegates to this module so
 * every component with `cta_list`, `ctaList`, or `cta_buttons` gets the same
 * field order and behavior.
 */
export function CtaListModule({
  value,
  onChange,
}: {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}) {
  const cta = normalizeCta(value || {});
  const linkType = cta.link_type || 'url';

  const update = (key: string, nextValue: any) => {
    onChange({ ...cta, [key]: nextValue });
  };

  const updateLabel = (nextValue: any) => {
    onChange({ ...cta, label: nextValue, text: nextValue });
  };

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <div className="col-span-2 sm:col-span-1">
        <SelectField
          label="Variant"
          value={cta.variant}
          options={CTA_VARIANT_OPTIONS}
          onChange={(nextValue) => update('variant', nextValue)}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <SelectField
          label="Size"
          value={cta.size}
          options={CTA_SIZE_OPTIONS}
          onChange={(nextValue) => update('size', nextValue)}
        />
      </div>

      <div className="col-span-2 sm:col-span-1">
        {/* Link Type controls which field is relevant for the public click action. */}
        <SelectField
          label="Link Type"
          value={linkType}
          options={LINK_TYPE_OPTIONS}
          onChange={(nextValue) => update('link_type', nextValue)}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        {linkType === 'action-modal' ? (
          // Action Modal is executed by CTAList.jsx through actionModalMap.
          <SelectField
            label="Action Modal"
            value={cta.action_modal}
            options={ACTION_MODAL_OPTIONS}
            onChange={(nextValue) => onChange({ ...cta, action_modal: nextValue, action: nextValue })}
          />
        ) : (
          // URL mode keeps a normal href and optional target for same/new tab.
          <TextField
            label="Href"
            value={cta.href}
            placeholder="https://example.com"
            onChange={(nextValue) => update('href', nextValue)}
          />
        )}
      </div>

      {linkType === 'url' && (
        <div className="col-span-2 sm:col-span-1">
          <SelectField
            label="Target"
            value={cta.target}
            options={LINK_TARGET_OPTIONS}
            onChange={(nextValue) => update('target', nextValue)}
          />
        </div>
      )}

      <div className="col-span-2 sm:col-span-1">
        <IconSelectField
          label="Icon Left"
          value={cta.iconLeft}
          onChange={(nextValue) => update('iconLeft', nextValue)}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <IconSelectField
          label="Icon Right"
          value={cta.iconRight}
          onChange={(nextValue) => update('iconRight', nextValue)}
        />
      </div>

      <div className="col-span-2">
        {cta.label && typeof cta.label === 'object' ? (
          <MultilingualTextField
            label="Label"
            value={cta.label}
            onChange={updateLabel}
          />
        ) : (
          <TextField
            label="Label"
            value={cta.label || ''}
            placeholder="Button label"
            onChange={updateLabel}
          />
        )}
      </div>
    </div>
  );
}
