'use client';

import React, { useMemo } from 'react';
import { CtaListModule } from './CtaListModule';
import { SortableListEditor } from './SortableListEditor';

type LangText = string | { en?: string; id?: string };

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
}: {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
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
  return (
    <SortableListEditor
      label="CTA List"
      items={items}
      onChange={onChange}
      createItem={() => ({ text: { en: '', id: '' }, href: '', variant: 'secondary-outline', size: 'md' })}
      addLabel="Add CTA"
      emptyLabel="No CTA yet"
      getItemLabel={(item, index) => item.text?.en || item.label?.en || item.text || item.label || `CTA ${index + 1}`}
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

function createReportHomeItem() {
  return {
    title: { en: '', id: '' },
    desc: { en: '', id: '' },
    iconSrc: '',
    year: '',
    ctaList: [],
  };
}

export function ListReportHomeEditor({
  settings,
  onChange,
}: {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
}) {
  const tabs = Array.isArray(settings.tabs) ? settings.tabs : [];
  const itemsByTab = useMemo(() => normalizeItemsByTab(settings, tabs), [settings, tabs]);
  const introData = settings.introData || settings.intro || {};

  const update = (patch: Record<string, any>) => {
    const { name: _name, source: _source, data_source: _dataSource, layout: _layout, ...cleanSettings } = settings;
    onChange({ ...cleanSettings, ...patch });
  };

  const updateTabItems = (tabValue: string, nextItems: Record<string, any>[]) => {
    update({
      items: {
        ...(settings.items && typeof settings.items === 'object' && !Array.isArray(settings.items) ? settings.items : {}),
        [tabValue]: nextItems,
      },
    });
  };

  const updateTabs = (nextTabs: Record<string, any>[]) => {
    const nextItems = normalizeItemsByTab({ ...settings, items: settings.items }, nextTabs);
    update({ tabs: nextTabs, items: nextItems });
  };

  return (
    <div className="space-y-6">
      <details open className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">Intro</summary>
        <div className="mt-4 space-y-4">
          <MultiTextField label="Label" value={introData.label} onChange={(nextValue) => update({ introData: { ...introData, label: nextValue } })} />
          <MultiTextField label="Title" value={introData.title} onChange={(nextValue) => update({ introData: { ...introData, title: nextValue } })} />
          <MultiTextField label="Description" value={introData.description} onChange={(nextValue) => update({ introData: { ...introData, description: nextValue } })} />
        </div>
      </details>

      <details open className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">Database Query</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <TextField label="Report Type ID" value={settings.report_type_id || ''} onChange={(value) => update({ report_type_id: value })} />
          <TextField label="Report Section ID" value={settings.report_section_id || ''} onChange={(value) => update({ report_section_id: value })} />
          <TextField label="Limit" type="number" value={settings.limit ?? 12} onChange={(value) => update({ limit: Number(value) || 0 })} />
          <SelectField
            label="Sort By"
            value={settings.sort_by || 'year'}
            onChange={(value) => update({ sort_by: value })}
            options={[
              { value: 'year', label: 'Report year' },
              { value: 'published_at', label: 'Publish date' },
              { value: 'title', label: 'Report title' },
              { value: 'sort_order', label: 'CMS sort order' },
            ]}
          />
          <SelectField
            label="Sort Direction"
            value={settings.sort_direction || 'desc'}
            onChange={(value) => update({ sort_direction: value })}
            options={[
              { value: 'desc', label: 'Descending' },
              { value: 'asc', label: 'Ascending' },
            ]}
          />
        </div>
      </details>

      <details open className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
        <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">Tabs</summary>
        <div className="mt-4">
          <SortableListEditor
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
        </div>
      </details>

      {tabs.map((tab, index) => {
        const tabValue = tab.value || '';
        if (!tabValue) return null;
        const tabLabel = asLangText(tab.label).en || asLangText(tab.label).id || `Tab ${index + 1}`;

        return (
          <details key={tabValue} open className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
              Child Items per Tab: {tabLabel}
            </summary>
            <div className="mt-4">
              <SortableListEditor
                label={`${tabLabel} Items`}
                items={itemsByTab[tabValue] || []}
                onChange={(nextItems) => updateTabItems(tabValue, nextItems)}
                createItem={createReportHomeItem}
                addLabel="Add Child Item"
                emptyLabel="No child items yet"
                getItemLabel={(item, childIndex) => asLangText(item.title).en || asLangText(item.title).id || `Child Item ${childIndex + 1}`}
                renderItem={(item, _childIndex, updateItem) => (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <MultiTextField label="Title" value={item.title} onChange={(value) => updateItem({ ...item, title: value })} />
                      <MultiTextField label="Desc" value={item.desc || item.description} onChange={(value) => updateItem({ ...item, desc: value })} />
                      <TextField label="Icon Image Path" value={item.iconSrc || item.icon || ''} onChange={(value) => updateItem({ ...item, iconSrc: value })} />
                      <TextField label="Year" value={item.year || ''} onChange={(value) => updateItem({ ...item, year: value })} />
                    </div>
                    <CtaArrayModule value={item.ctaList || item.cta_list || []} onChange={(value) => updateItem({ ...item, ctaList: value })} />
                  </div>
                )}
              />
            </div>
          </details>
        );
      })}
    </div>
  );
}
