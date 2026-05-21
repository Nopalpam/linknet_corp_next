'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CtaListModule } from './CtaListModule';
import { newsService, News } from '@/services/news.service';
import { SortableListEditor } from './SortableListEditor';
import MediaPickerButton from '@/components/media/MediaPickerButton';
import { MediaPickerKind } from '@/components/media/MediaPickerModal';

const RichTextEditor = dynamic(
  () => import('@/components/ui/ckeditor/CKEditorWrapper'),
  { ssr: false, loading: () => <div className="h-40 rounded-lg bg-gray-100 dark:bg-gray-800" /> },
);

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
  disabled = false,
  mediaKind,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  mediaKind?: MediaPickerKind;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-2">
        <input
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:disabled:bg-gray-900 dark:disabled:text-gray-500"
        />
        {mediaKind && !disabled && (
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

export function ContentEditor({
  value,
  onChange,
}: {
  value?: LangText;
  onChange: (value: { en: string; id: string }) => void;
}) {
  const [active, setActive] = useState<'en' | 'id'>('en');
  const text = asLangText(value);

  return (
    <div>
      <FieldLabel>Content</FieldLabel>
      <div className="mb-3 flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['en', 'id'] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActive(locale)}
            className={`border-b-2 px-3 py-2 text-xs font-semibold uppercase ${
              active === locale
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {locale}
          </button>
        ))}
      </div>
      <div className={active === 'en' ? 'block' : 'hidden'}>
        <RichTextEditor
          value={text.en}
          onChange={(nextValue: string) => onChange({ ...text, en: nextValue })}
          placeholder="Enter English content..."
          minHeight="220px"
        />
      </div>
      <div className={active === 'id' ? 'block' : 'hidden'}>
        <RichTextEditor
          value={text.id}
          onChange={(nextValue: string) => onChange({ ...text, id: nextValue })}
          placeholder="Masukkan konten Bahasa Indonesia..."
          minHeight="220px"
        />
      </div>
    </div>
  );
}

export function DocumentListModule({
  value,
  onChange,
}: {
  value: Record<string, any>[];
  onChange: (value: Record<string, any>[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  return (
    <SortableListEditor
      label="Documents"
      items={items}
      onChange={onChange}
      createItem={() => ({ documentName: { en: '', id: '' }, subDesc: '', url: '' })}
      addLabel="Add Document"
      emptyLabel="No documents yet"
      getItemLabel={(item, index) => asLangText(item.documentName).en || asLangText(item.documentName).id || `Document ${index + 1}`}
      renderItem={(item, _index, updateItem) => {
        const update = (patch: Record<string, any>) => updateItem({ ...item, ...patch });
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <MultiTextField label="Document Name" value={item.documentName} onChange={(nextValue) => update({ documentName: nextValue })} />
            <TextField label="Sub Desc" value={item.subDesc || ''} onChange={(nextValue) => update({ subDesc: nextValue })} />
            <div className="sm:col-span-2">
              <TextField label="URL" value={item.url || ''} onChange={(nextValue) => update({ url: nextValue })} placeholder="https://..." mediaKind="any" />
            </div>
          </div>
        );
      }}
    />
  );
}

function SearchableArticleSelect({
  value,
  onChange,
}: {
  value: Record<string, any>;
  onChange: (patch: Record<string, any>) => void;
}) {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    newsService
      .searchForSelection({ limit: 50 })
      .then((response) => {
        if (mounted) setNewsItems(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (mounted) setNewsItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const selectedStillLoaded = newsItems.some((news) => news.id === value.articleId);

  return (
    <div className="space-y-2">
      <FieldLabel>Article</FieldLabel>
      <select
        value={value.articleId || ''}
        onChange={(event) => {
          const selected = newsItems.find((news) => news.id === event.target.value);
          onChange({
            articleId: event.target.value,
            articleName: selected ? { en: selected.title_en || '', id: selected.title_id || selected.title_en || '' } : value.articleName,
            url: selected?.slug ? `/news/${selected.slug}` : value.url || '',
          });
        }}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">{loading ? 'Loading active articles...' : 'Select article'}</option>
        {value.articleId && !selectedStillLoaded && (
          <option value={value.articleId}>{asLangText(value.articleName).en || value.articleId}</option>
        )}
        {newsItems.map((news) => (
          <option key={news.id} value={news.id}>{news.title_en || news.title_id || news.slug}</option>
        ))}
      </select>
    </div>
  );
}

export function ArticleListModule({
  value,
  onChange,
}: {
  value: Record<string, any>[];
  onChange: (value: Record<string, any>[]) => void;
}) {
  const items = Array.isArray(value) ? value : [];

  return (
    <SortableListEditor
      label="Articles"
      items={items}
      onChange={onChange}
      createItem={() => ({ source: 'manual', articleName: { en: '', id: '' }, articleId: '', url: '' })}
      addLabel="Add Article"
      emptyLabel="No related articles yet"
      getItemLabel={(item, index) => asLangText(item.articleName).en || asLangText(item.articleName).id || `Article ${index + 1}`}
      renderItem={(item, _index, updateItem) => {
        const update = (patch: Record<string, any>) => updateItem({ ...item, ...patch });
        return (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel>Source</FieldLabel>
              <select
                value={item.source || 'manual'}
                onChange={(event) => update({ source: event.target.value })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="manual">Manual URL</option>
                <option value="database">Choose from database</option>
              </select>
            </div>
            {item.source === 'database' ? (
              <SearchableArticleSelect value={item} onChange={update} />
            ) : (
              <MultiTextField label="Article Name" value={item.articleName} onChange={(nextValue) => update({ articleName: nextValue })} />
            )}
            <div className="sm:col-span-2">
              <TextField
                label="URL"
                value={item.url || ''}
                onChange={(nextValue) => update({ url: nextValue })}
                placeholder="https://..."
                disabled={item.source === 'database'}
              />
            </div>
          </div>
        );
      }}
    />
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
      createItem={() => ({ label: '', href: '', variant: 'primary', size: 'lg' })}
      addLabel="Add CTA"
      emptyLabel="No CTA yet"
      getItemLabel={(item, index) => item.label?.en || item.label || item.text?.en || item.text || `CTA ${index + 1}`}
      renderItem={(item, _index, updateItem) => <CtaListModule value={item} onChange={updateItem} />}
    />
  );
}

export function ModularItemBuilder({
  sections,
  onChange,
}: {
  sections: Record<string, any>[];
  onChange: (sections: Record<string, any>[]) => void;
}) {
  const update = (index: number, patch: Record<string, any>) => {
    onChange(sections.map((section, sectionIndex) => (sectionIndex === index ? { ...section, ...patch } : section)));
  };

  return (
    <div className="space-y-4">
      <SortableListEditor
        label="Info Sections"
        items={sections}
        onChange={onChange}
        createItem={() => ({ title: { en: '', id: '' }, content: { en: '', id: '' }, documents: [], related_articles: [], ctaList: [] })}
        addLabel="Add Section"
        emptyLabel="No info sections yet"
        getItemLabel={(section, index) => asLangText(section.title).en || asLangText(section.title).id || `Section ${index + 1}`}
        renderItem={(section, index) => (
        <details open>
          <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
            {asLangText(section.title).en || asLangText(section.title).id || `Section ${index + 1}`}
          </summary>
          <div className="mt-4 space-y-5">
            <MultiTextField label="Section Title" value={section.title} onChange={(nextValue) => update(index, { title: nextValue })} />
            <ContentEditor value={section.content} onChange={(nextValue) => update(index, { content: nextValue })} />
            <DocumentListModule value={section.documents || []} onChange={(nextValue) => update(index, { documents: nextValue })} />
            <ArticleListModule value={section.related_articles || []} onChange={(nextValue) => update(index, { related_articles: nextValue })} />
            <CtaArrayModule value={section.ctaList || []} onChange={(nextValue) => update(index, { ctaList: nextValue })} />
          </div>
        </details>
        )}
      />
    </div>
  );
}

export function InformationListEditor({
  settings,
  onChange,
}: {
  settings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
}) {
  const sections = Array.isArray(settings.info_sections) ? settings.info_sections : [];
  const update = (patch: Record<string, any>) => onChange({ ...settings, ...patch });
  const introData = settings.introData || {};

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
      <ModularItemBuilder sections={sections} onChange={(nextSections) => update({ info_sections: nextSections })} />
    </div>
  );
}
