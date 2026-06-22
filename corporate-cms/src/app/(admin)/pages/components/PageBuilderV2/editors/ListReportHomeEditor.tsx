'use client';

import React, { useMemo, useState } from 'react';
import { CtaListModule } from './CtaListModule';
import { SortableListEditor } from './SortableListEditor';
import MediaPickerButton from '@/components/media/MediaPickerButton';
import { MediaPickerKind } from '@/components/media/MediaPickerModal';

type LangText = string | { en?: string; id?: string };
const DEFAULT_REPORT_ICON_PATH = 'https://dev.linknet.co.id/assets/icons/pdf-circle.svg';
const DEFAULT_REPORT_ICON_PATHS = new Set(['', DEFAULT_REPORT_ICON_PATH, '/assets/icons/pdf-circle.svg']);

function asLangText(value: LangText | undefined): { en: string; id: string } {
  if (value && typeof value === 'object') {
    return { en: value.en || '', id: value.id || '' };
  }
  return { en: typeof value === 'string' ? value : '', id: typeof value === 'string' ? value : '' };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">{children}</label>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  mediaKind,
}: {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  mediaKind?: MediaPickerKind;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        <input
          type={type}
          value={value ?? ''}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        {mediaKind && (
          <MediaPickerButton
            kind={mediaKind}
            title={`Choose ${label}`}
            onSelect={(url) => onChange(url)}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function IconModeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  const currentValue = value || '';
  const hasCustomValue = !DEFAULT_REPORT_ICON_PATHS.has(currentValue);
  const [selectedMode, setSelectedMode] = useState(hasCustomValue ? 'custom' : 'default');
  const mode = hasCustomValue ? 'custom' : selectedMode;

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        value={mode}
        onChange={(event) => {
          const nextMode = event.target.value;
          setSelectedMode(nextMode);
          if (nextMode === 'default') onChange('');
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="default">Default (pdf-circle.svg)</option>
        <option value="custom">Custom image path</option>
      </select>
      {mode === 'custom' && (
        <div className="space-y-2">
          <input
            type="text"
            value={currentValue}
            placeholder="/assets/icons/example.svg"
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
          <MediaPickerButton
            kind="image"
            label="Choose Icon from File Manager"
            title={`Choose ${label}`}
            onSelect={(url) => onChange(url)}
          />
        </div>
      )}
    </div>
  );
}

function EditorSection({
  title,
  count,
  icon,
  children,
}: {
  title: string;
  count?: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <details open className="group">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            {icon}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
            {title}
          </span>
          {typeof count === 'number' && (
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {count}
            </span>
          )}
        </div>
        <svg
          className="h-4 w-4 text-gray-400 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-4 pb-5">
        {children}
      </div>
    </details>
  );
}

const ContentIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ItemsIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const AdvancedIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function MultiTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: LangText;
  onChange: (value: { en: string; id: string }) => void;
}) {
  const text = asLangText(value);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={text.en}
          placeholder="English"
          onChange={(event) => onChange({ ...text, en: event.target.value })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <input
          value={text.id}
          placeholder="Indonesia"
          onChange={(event) => onChange({ ...text, id: event.target.value })}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  );
}

function CtaArrayModule({
  value,
  onChange,
}: {
  value: Record<string, any>[];
  onChange: (value: Record<string, any>[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];
  const getCtaLabel = (item: Record<string, any>, index: number) => {
    const text = asLangText(item.text);
    const label = asLangText(item.label);
    return text.en || text.id || label.en || label.id || `CTA ${index + 1}`;
  };

  return (
    <SortableListEditor
      label="CTA List"
      items={items}
      onChange={onChange}
      createItem={() => ({ text: { en: '', id: '' }, href: '', variant: 'secondary-outline', size: 'md' })}
      addLabel="Add CTA"
      emptyLabel="No CTA yet"
      getItemLabel={getCtaLabel}
      renderItem={(item, _index, updateItem) => <CtaListModule value={item} onChange={updateItem} />}
    />
  );
}

function normalizeItemsByTab(settings: Record<string, any>, tabs: Record<string, any>[]) {
  const rawItems = settings.items && typeof settings.items === 'object' && !Array.isArray(settings.items)
    ? settings.items
    : {};

  return tabs.reduce<Record<string, Record<string, any>[]>>((acc, tab) => {
    const key = tab.value || '';
    if (!key) return acc;
    acc[key] = Array.isArray(rawItems[key]) ? rawItems[key] : [];
    return acc;
  }, {});
}

function flattenItemsByTab(itemsByTab: Record<string, Record<string, any>[]>, tabs: Record<string, any>[]) {
  return tabs.flatMap((tab) => {
    const tabValue = tab.value || '';
    if (!tabValue) return [];

    return (itemsByTab[tabValue] || []).map((item) => ({
      ...item,
      tabValue,
    }));
  });
}

function groupItemsByTab(items: Record<string, any>[], tabs: Record<string, any>[]) {
  const nextItems = tabs.reduce<Record<string, Record<string, any>[]>>((acc, tab) => {
    const tabValue = tab.value || '';
    if (tabValue) acc[tabValue] = [];
    return acc;
  }, {});

  items.forEach((item) => {
    const { tabValue, ...cleanItem } = item;
    const key = tabValue || tabs[0]?.value || '';
    if (!key) return;
    nextItems[key] = [...(nextItems[key] || []), cleanItem];
  });

  return nextItems;
}

function createReportHomeItem() {
  return {
    tabValue: '',
    title: { en: '', id: '' },
    desc: { en: '', id: '' },
    iconSrc: '',
    year: '',
    ctaList: [],
  };
}

const DEFAULT_CONFIG = {
  sectionId: '',
  className: '',
  bgImage: '',
  bgImageMobile: '',
  bgPositionClasses: '',
  bgSizeClass: '',
};

export function ListReportHomeEditor({
  settings,
  onChange,
}: {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
}) {
  const tabs = useMemo(() => (Array.isArray(settings.tabs) ? settings.tabs : []), [settings.tabs]);
  const itemsByTab = useMemo(() => normalizeItemsByTab(settings, tabs), [settings, tabs]);
  const itemList = useMemo(() => flattenItemsByTab(itemsByTab, tabs), [itemsByTab, tabs]);
  const introData = settings.introData || settings.intro || {};
  const config = { ...DEFAULT_CONFIG, ...(settings.config || {}) };
  const tabOptions = tabs.map((tab, index) => ({
    value: tab.value || '',
    label: asLangText(tab.label).en || asLangText(tab.label).id || tab.value || `Tab ${index + 1}`,
  })).filter((option) => option.value);

  const update = (patch: Record<string, any>) => {
    const {
      name: _name,
      source: _source,
      data_source: _dataSource,
      layout: _layout,
      report_type_id: _reportTypeId,
      report_section_id: _reportSectionId,
      limit: _limit,
      sort_by: _sortBy,
      sort_direction: _sortDirection,
      ...cleanSettings
    } = settings;
    onChange({ ...cleanSettings, ...patch });
  };

  const updateTabs = (nextTabs: Record<string, any>[]) => {
    const nextItems = normalizeItemsByTab({ ...settings, items: settings.items }, nextTabs);
    update({ tabs: nextTabs, items: nextItems });
  };

  const updateItemList = (nextItems: Record<string, any>[]) => {
    update({ items: groupItemsByTab(nextItems, tabs) });
  };

  const updateConfig = (patch: Record<string, any>) => {
    update({ config: { ...config, ...patch } });
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <EditorSection title="Content" count={1} icon={<ContentIcon />}>
        <div className="space-y-4">
          <MultiTextField label="Label" value={introData.label} onChange={(nextValue) => update({ introData: { ...introData, label: nextValue } })} />
          <MultiTextField label="Title" value={introData.title} onChange={(nextValue) => update({ introData: { ...introData, title: nextValue } })} />
          <MultiTextField label="Description" value={introData.description} onChange={(nextValue) => update({ introData: { ...introData, description: nextValue } })} />
        </div>
      </EditorSection>

      <EditorSection title="Items / Lists" count={2} icon={<ItemsIcon />}>
        <div className="space-y-6">
          <SortableListEditor<Record<string, any>>
            label="Tabs"
            items={tabs}
            onChange={updateTabs}
            createItem={() => ({ label: { en: '', id: '' }, value: `tab-${tabs.length + 1}` })}
            addLabel="Add Tab"
            emptyLabel="No tabs yet"
            getItemLabel={(item, index) => asLangText(item.label).en || asLangText(item.label).id || item.value || `Tab ${index + 1}`}
            renderItem={(item, _index, updateItem) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <MultiTextField label="Tab Label" value={item.label} onChange={(value) => updateItem({ ...item, label: value })} />
                <TextField label="Tab Value" value={item.value || ''} onChange={(value) => updateItem({ ...item, value })} />
              </div>
            )}
          />

          <SortableListEditor<Record<string, any>>
            label="Items List"
            items={itemList}
            onChange={updateItemList}
            collapsible
            createItem={() => ({ ...createReportHomeItem(), tabValue: tabs[0]?.value || '' })}
            addLabel="Add Item"
            emptyLabel="No items yet"
            getItemLabel={(item, index) => asLangText(item.title).en || asLangText(item.title).id || `Item ${index + 1}`}
            renderItem={(item, _childIndex, updateItem) => (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <SelectField
                    label="Parent Tab"
                    value={item.tabValue || tabs[0]?.value || ''}
                    onChange={(value) => updateItem({ ...item, tabValue: value })}
                    options={tabOptions}
                  />
                  <TextField label="Year" value={item.year || ''} onChange={(value) => updateItem({ ...item, year: value })} />
                  <MultiTextField label="Title" value={item.title} onChange={(value) => updateItem({ ...item, title: value })} />
                  <MultiTextField label="Desc" value={item.desc || item.description} onChange={(value) => updateItem({ ...item, desc: value })} />
                  <IconModeField label="Icon" value={item.iconSrc || item.icon || ''} onChange={(value) => updateItem({ ...item, iconSrc: value })} />
                </div>
                <CtaArrayModule value={item.ctaList || item.cta_list || []} onChange={(value) => updateItem({ ...item, ctaList: value })} />
              </div>
            )}
          />
        </div>
      </EditorSection>

      <EditorSection title="Advanced" count={1} icon={<AdvancedIcon />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Section ID" value={config.sectionId} onChange={(value) => updateConfig({ sectionId: value })} />
          <TextField label="Class Name" value={config.className} onChange={(value) => updateConfig({ className: value })} />
          <TextField label="Background Image" value={config.bgImage} onChange={(value) => updateConfig({ bgImage: value })} mediaKind="image" />
          <TextField label="Background Image Mobile" value={config.bgImageMobile} onChange={(value) => updateConfig({ bgImageMobile: value })} mediaKind="image" />
          <TextField label="Background Position Classes" value={config.bgPositionClasses} onChange={(value) => updateConfig({ bgPositionClasses: value })} />
          <TextField label="Background Size Class" value={config.bgSizeClass} onChange={(value) => updateConfig({ bgSizeClass: value })} />
        </div>
      </EditorSection>
    </div>
  );
}
