/**
 * PAGE BUILDER V2 - Canvas Component
 * 
 * The main canvas area where components are displayed and can be:
 * - Selected for editing
 * - Reordered via drag-and-drop
 * - Deleted
 * 
 * Renders DIRECTLY from PageBuilder state - no local state duplication.
 * Uses shared presentation mappers for richer preview parity where needed.
 */

'use client';

import React from 'react';
import { usePageBuilder } from './context';
import { getRegistryEntry } from './registry';
import { getLocalizedValue } from './types';
import {
  mapDocumentListPresentation,
  mapInfoContactsPresentation,
  mapInformationListPresentation,
  type SharedContactItem,
  type SharedDocumentItem,
  type SharedDocumentSection,
  type SharedInformationSection,
} from '../../../../../../../shared/presentation/content';
import {
  mapBusinessTabPresentation,
  mapUspGridPresentation,
  type SharedBusinessTabItem,
  type SharedUspItem,
} from '../../../../../../../shared/presentation/sections';
import {
  mapCardsWithSummaryPresentation,
  mapListServicesPresentation,
  type SharedServiceItem,
  type SharedSummaryCard,
  type SharedSummaryMetric,
} from '../../../../../../../shared/presentation/solutions';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';

// =============================================================================
// GENERIC COMPONENT PREVIEW
// =============================================================================

type PreviewSettings = Record<string, any>;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function getPreviewText(value: any, maxLength?: number): string {
  const text = typeof value === 'string' ? value : getLocalizedValue(value);
  const cleanText = stripHtml(text || '');

  if (!maxLength || cleanText.length <= maxLength) return cleanText;
  return `${cleanText.substring(0, maxLength).trim()}...`;
}

function resolvePreviewField(source: PreviewSettings | undefined, field: string): string {
  const value = source?.[field];
  const localizedValue = getLocalizedValue(value);

  if (localizedValue) return localizedValue;

  const suffixValue = source?.[`${field}_id`];
  return typeof suffixValue === 'string' ? suffixValue : '';
}

function getInitials(value: string): string {
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'S';
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('');
}

function renderPreviewCount(label: string, value: number) {
  return (
    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
      {value} {label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isMain = ['news_highlight', 'news_list', 'news_teaser', 'career_highlight', 'career_list', 'management_list', 'announcement_list', 'report_list', 'awards_list', 'awards_marquee'].includes(type);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
      isMain
        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    }`}>
      {type.replace(/_/g, ' ')}
    </span>
  );
}

function InfoContactsPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapInfoContactsPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const introTitle = getPreviewText(presentation.introData.title, 90);
  const introDescription = getPreviewText(presentation.introData.description, 140);

  if (presentation.items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={type} />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {introTitle || 'Contact Info'}
            </p>
            {introDescription && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {introDescription}
              </p>
            )}
          </div>
          {renderPreviewCount('contact(s)', presentation.items.length)}
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {presentation.items.slice(0, 3).map((item: SharedContactItem, index: number) => {
          const label = getPreviewText(item.label, 30) || `Contact ${index + 1}`;
          const value = getPreviewText(item.value, 42) || '-';

          return (
            <div
              key={item.id || `contact-item-${index}`}
              className="rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold uppercase tracking-[0.12em] text-gray-900 dark:bg-amber-400/20 dark:text-amber-200">
                  {getInitials(label)}
                </div>
                {item.href && (
                  <span className="rounded-full border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-600 dark:text-gray-300">
                    Link
                  </span>
                )}
              </div>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label}
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InformationListPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapInformationListPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const introTitle = getPreviewText(presentation.introData.title, 90);
  const introDescription = getPreviewText(presentation.introData.description, 140);

  if (presentation.items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={type} />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {introTitle || 'Information List'}
            </p>
            {introDescription && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {introDescription}
              </p>
            )}
          </div>
          {renderPreviewCount('section(s)', presentation.items.length)}
        </div>
      </div>

      <div className="space-y-3 p-4">
        {presentation.items.slice(0, 2).map((item: SharedInformationSection, index: number) => {
          const title = getPreviewText(item.title, 50) || `Section ${index + 1}`;
          const content = getPreviewText(item.contents, 140);

          return (
            <div
              key={item.id || `information-item-${index}`}
              className="rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</p>
                <div className="flex shrink-0 gap-2">
                  {item.relatedArticles.length > 0 && renderPreviewCount('article(s)', item.relatedArticles.length)}
                  {item.documents.length > 0 && renderPreviewCount('doc(s)', item.documents.length)}
                </div>
              </div>
              {content && (
                <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                  {content}
                </p>
              )}
              {item.ctaList.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.ctaList.slice(0, 2).map((cta, ctaIndex: number) => (
                    <span
                      key={cta.id || `information-item-${index}-cta-${ctaIndex}`}
                      className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      {getPreviewText(cta.text, 24) || `CTA ${ctaIndex + 1}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DocumentListPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapDocumentListPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const title = getPreviewText(presentation.title, 90);

  if (presentation.documents.length === 0 && presentation.sections.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={type} />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {title || 'Document List'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {presentation.sections.length > 0 && renderPreviewCount('section(s)', presentation.sections.length)}
            {renderPreviewCount('doc(s)', presentation.documents.length)}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {presentation.sections.length > 0 ? presentation.sections.slice(0, 2).map((section: SharedDocumentSection, index: number) => {
          const sectionTitle = getPreviewText(section.title, 40) || `Section ${index + 1}`;
          const leadDocument = section.documents[0];

          return (
            <div
              key={section.id || `document-section-${index}`}
              className="rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{sectionTitle}</p>
                {renderPreviewCount('doc(s)', section.documents.length)}
              </div>
              {leadDocument && (
                <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                  {getPreviewText(leadDocument.title || leadDocument.filename, 90)}
                </p>
              )}
            </div>
          );
        }) : presentation.documents.slice(0, 3).map((document: SharedDocumentItem, index: number) => (
          <div
            key={document.id || `document-item-${index}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {getPreviewText(document.title || document.filename, 70) || `Document ${index + 1}`}
              </p>
              {document.date && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {getPreviewText(document.date, 28)}
                </p>
              )}
            </div>
            {document.url && (
              <span className="rounded-full border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-600 dark:text-gray-300">
                Link
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function UspGridPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapUspGridPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const introTitle = getPreviewText(presentation.introData.title, 90);
  const introDescription = getPreviewText(presentation.introData.description, 140);

  if (presentation.uspList.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={type} />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {introTitle || 'USP Grid'}
            </p>
            {introDescription && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {introDescription}
              </p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {renderPreviewCount('USP item(s)', presentation.uspList.length)}
            {presentation.ctaList.length > 0 && renderPreviewCount('CTA(s)', presentation.ctaList.length)}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200">
            {presentation.isSlider ? 'Slider mode' : 'Grid mode'}
          </span>
          <span className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200">
            Variant: {getPreviewText(presentation.uspVariant, 18) || 'card'}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {presentation.uspList.slice(0, 3).map((item: SharedUspItem, index: number) => {
            const title = getPreviewText(item.title, 40) || `USP ${index + 1}`;
            const description = getPreviewText(item.description, 90);

            return (
              <div
                key={item.id || `usp-item-${index}`}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold uppercase tracking-[0.12em] text-gray-900 dark:bg-amber-400/20 dark:text-amber-200">
                  {getInitials(title)}
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">{title}</p>
                {description && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                    {description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BusinessTabPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapBusinessTabPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const introTitle = getPreviewText(presentation.introData.title, 90);
  const introDescription = getPreviewText(presentation.introData.description, 140);
  const activeItem = presentation.items[0];

  if (presentation.items.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={type} />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {introTitle || 'Business Tab'}
            </p>
            {introDescription && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {introDescription}
              </p>
            )}
          </div>
          {renderPreviewCount('tab(s)', presentation.items.length)}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {presentation.items.slice(0, 4).map((item: SharedBusinessTabItem, index: number) => (
            <span
              key={item.id || `business-tab-${index}`}
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-medium ${index === 0 ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'border border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'}`}
            >
              {getPreviewText(item.label, 24) || `Tab ${index + 1}`}
            </span>
          ))}
        </div>

        {activeItem && (
          <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {getPreviewText(activeItem.title, 60) || getPreviewText(activeItem.label, 40) || 'Active tab'}
                </p>
                {activeItem.desc && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                    {getPreviewText(activeItem.desc, 140)}
                  </p>
                )}
              </div>
              {activeItem.href && (
                <span className="rounded-full border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-600 dark:text-gray-300">
                  CTA
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ListServicesPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapListServicesPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const intro = {
    title: getPreviewText(presentation.introData.title, 90),
    description: getPreviewText(presentation.introData.description, 140),
  };
  const services = presentation.services;

  if (services.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800/70">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={type} />
            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
              {intro.title || 'List Services'}
            </p>
            {intro.description && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {intro.description}
              </p>
            )}
          </div>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-300">
            {services.length} service(s)
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
        {services.slice(0, 3).map((service: SharedServiceItem, index: number) => {
          const title = getPreviewText(service?.title, 60) || `Service ${index + 1}`;
          const description = getPreviewText(service?.description, 100);
          const products = Array.isArray(service?.products) ? service.products : [];

          return (
            <div
              key={service?.id || `service-${index}`}
              className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold uppercase tracking-[0.12em] text-gray-900 dark:bg-amber-400/20 dark:text-amber-200">
                  {getInitials(title)}
                </div>
                {service?.link && (
                  <span className="rounded-full border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-600 dark:text-gray-300">
                    Link
                  </span>
                )}
              </div>

              <div className="mt-4 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {title}
                </p>
                {description && (
                  <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3">
                    {description}
                  </p>
                )}
              </div>

              {products.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {products.slice(0, 3).map((product, productIndex: number) => (
                    <span
                      key={product?.id || `service-${index}-product-${productIndex}`}
                      className="inline-flex items-center rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:border-gray-600 dark:text-gray-200"
                    >
                      {getPreviewText(product?.name, 24) || `Product ${productIndex + 1}`}
                    </span>
                  ))}
                  {products.length > 3 && (
                    <span className="inline-flex items-center rounded-full border border-dashed border-gray-200 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:border-gray-600 dark:text-gray-400">
                      +{products.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CardsWithSummaryPreview({ type, settings }: { type: string; settings: PreviewSettings }) {
  const presentation = mapCardsWithSummaryPresentation(settings, {
    resolveField: resolvePreviewField,
  });
  const intro = {
    title: getPreviewText(presentation.introData.title, 90),
    description: getPreviewText(presentation.introData.description, 140),
  };
  const cards = presentation.cards;
  const metrics = Array.isArray(presentation.highlight?.metrics) ? presentation.highlight.metrics : [];

  if (cards.length === 0 && metrics.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900/60">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <TypeBadge type={type} />
        <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white truncate">
          {intro.title || 'Cards with Summary'}
        </p>
        {intro.description && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {intro.description}
          </p>
        )}
      </div>

      <div className={`grid gap-4 p-4 ${metrics.length > 0 ? 'xl:grid-cols-[minmax(0,1.6fr)_260px]' : ''}`}>
        <div className="grid gap-3 md:grid-cols-2">
          {cards.slice(0, 2).map((card: SharedSummaryCard, index: number) => {
            const title = getPreviewText(card?.title, 60) || `Card ${index + 1}`;
            const description = getPreviewText(card?.description, 100);

            return (
              <div
                key={card?.id || `card-${index}`}
                className="relative min-h-[180px] overflow-hidden rounded-2xl bg-gray-900"
              >
                {card?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.image} alt={title} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(246,196,71,0.35),_transparent_42%),linear-gradient(135deg,_#1f2937,_#0f172a)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/80" />

                <div className="relative flex h-full flex-col justify-end p-4">
                  <p className="text-sm font-semibold text-white line-clamp-2">{title}</p>
                  {description && (
                    <p className="mt-2 text-xs leading-relaxed text-white/80 line-clamp-3">{description}</p>
                  )}
                  {card?.link && (
                    <span className="mt-4 inline-flex w-fit rounded-full border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white/90">
                      Linked card
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {cards.length > 2 && (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-xs font-medium text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
              +{cards.length - 2} additional card(s)
            </div>
          )}
        </div>

        {metrics.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {getPreviewText(presentation.highlight?.title, 40) || 'Highlight Summary'}
            </p>
            <div className="mt-3 space-y-3">
              {metrics.slice(0, 3).map((metric: SharedSummaryMetric, index: number) => (
                <div
                  key={metric?.id || `metric-${index}`}
                  className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {getPreviewText(metric?.label, 28) || `Metric ${index + 1}`}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {getPreviewText(metric?.value, 20) || '-'}
                  </p>
                  {metric?.change && (
                    <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {getPreviewText(metric.change, 16)}
                    </p>
                  )}
                </div>
              ))}
              {metrics.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{metrics.length - 3} additional metric(s)
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComponentPreview({ type, settings, registryName }: { type: string; settings: PreviewSettings; registryName: string }) {
  if (type === 'usp_grid') {
    const preview = <UspGridPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  if (type === 'business_tab') {
    const preview = <BusinessTabPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  if (type === 'info_contacts') {
    const preview = <InfoContactsPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  if (type === 'information_list') {
    const preview = <InformationListPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  if (type === 'document_list') {
    const preview = <DocumentListPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  if (type === 'list_services') {
    const preview = <ListServicesPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  if (type === 'card_with_highlight_summary') {
    const preview = <CardsWithSummaryPreview type={type} settings={settings} />;
    if (preview) return preview;
  }

  // Extract a title to display from common fields
  const displayTitle =
    getLocalizedValue(settings.introData?.title) ||
    getLocalizedValue(settings.title) ||
    getLocalizedValue(settings.name) ||
    getLocalizedValue(settings.label) ||
    settings.symbol ||
    registryName;

  const displayDescription =
    getPreviewText(settings.introData?.description, 120) ||
    getPreviewText(settings.description, 120) ||
    getPreviewText(settings.content, 120) ||
    '';

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[80px]">
      <div className="flex items-start gap-3">
        {/* Type badge */}
        <TypeBadge type={type} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {displayTitle}
          </p>
          {displayDescription && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {displayDescription}
            </p>
          )}
        </div>
      </div>

      {/* Array indicators */}
      {settings.slides && Array.isArray(settings.slides) && (
        <p className="text-xs text-gray-400 mt-2">{settings.slides.length} slide(s)</p>
      )}
      {settings.items && Array.isArray(settings.items) && (
        <p className="text-xs text-gray-400 mt-2">{settings.items.length} item(s)</p>
      )}
      {settings.tabs && Array.isArray(settings.tabs) && (
        <p className="text-xs text-gray-400 mt-2">{settings.tabs.length} tab(s)</p>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT WRAPPER
// =============================================================================

interface CanvasComponentProps {
  componentId: string;
  index: number;
}

function CanvasComponent({ componentId, index }: CanvasComponentProps) {
  const {
    state,
    selectedComponentId,
    selectComponent,
    removeComponent,
    toggleVisibility,
  } = usePageBuilder();

  const component = state.components.find((c) => c.id === componentId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: componentId });

  if (!component) return null;

  const isSelected = selectedComponentId === componentId;
  const registryEntry = getRegistryEntry(component.type);
  const displayName = registryEntry?.name || component.type.replace(/_/g, ' ');
  const schemaStatus = component.schemaStatus;
  const needsSchemaSync = Boolean(schemaStatus?.isOutdated);
  const schemaTooltip = schemaStatus
    ? [
        `Stored schema v${schemaStatus.currentVersion}`,
        `Latest schema v${schemaStatus.targetVersion}`,
        ...schemaStatus.operations.slice(0, 4),
        ...schemaStatus.warnings.slice(0, 2),
        ...schemaStatus.errors.slice(0, 2),
      ].join('\n')
    : '';

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : (!component.isVisible ? 0.5 : 1),
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group transition-colors duration-200`}
    >
      {/* Component Toolbar */}
      <div
        className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-lg transition-opacity ${
          isSelected
            ? 'opacity-100 bg-white dark:bg-gray-800 shadow-lg'
            : 'opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-gray-800/90 shadow'
        }`}
      >
        {/* Type label */}
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
          {displayName}
        </span>
        {needsSchemaSync && (
          <span
            className="mr-1 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
            title={schemaTooltip}
          >
            Outdated
          </span>
        )}
        
        {/* Visibility toggle */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            toggleVisibility(componentId);
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          title={component.isVisible ? 'Hide component' : 'Show component'}
        >
          {component.isVisible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          )}
        </button>

        {/* Delete button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(componentId);
          }}
          className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
          title="Delete component"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>

      {/* Component Selection Wrapper */}
      <div
        onClick={() => selectComponent(componentId)}
        className={`relative cursor-pointer rounded-lg transition-all ${
          isSelected
            ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-gray-900'
            : needsSchemaSync
              ? 'ring-1 ring-orange-200 hover:ring-2 hover:ring-orange-300 dark:ring-orange-900/60 dark:hover:ring-orange-700'
              : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-600'
        }`}
      >
        {needsSchemaSync && (
          <div
            className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700 shadow-sm dark:border-orange-800 dark:bg-orange-900/80 dark:text-orange-200"
            title={schemaTooltip}
          >
            <span aria-hidden="true">!</span>
            Outdated
          </div>
        )}
        <ComponentPreview
          type={component.type}
          settings={component.settings}
          registryName={displayName}
        />
      </div>
    </div>
  );
}

// =============================================================================
// CANVAS
// =============================================================================

export function Canvas() {
  const { state, selectComponent, addComponent, isComponentTypeActive } = usePageBuilder();
  const { components, isLoading, error } = state;
  const canAddHero = isComponentTypeActive('hero_section');
  const canAddTextBlock = isComponentTypeActive('text_block');

  // Make the canvas a droppable area for new components from sidebar
  const { setNodeRef: setDropRef, isOver: isCanvasOver } = useDroppable({
    id: 'canvas-droppable',
  });

  // Handle clicking on empty canvas
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading components...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setDropRef}
      onClick={handleCanvasClick}
      className={`h-full overflow-y-auto p-6 bg-gray-100 dark:bg-gray-950 transition-colors ${
        isCanvasOver ? 'bg-brand-50 dark:bg-brand-950' : ''
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-3">
        <SortableContext
          items={components.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {components.map((component, index) => (
            <CanvasComponent
              key={component.id}
              componentId={component.id}
              index={index}
            />
          ))}
        </SortableContext>

        {/* Empty state */}
        {components.length === 0 && (
          <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            isCanvasOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
              : 'border-gray-300 dark:border-gray-700'
          }`}>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isCanvasOver ? 'Drop Here!' : 'No Components Yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag components from the sidebar or click below to get started.
            </p>
            {(canAddHero || canAddTextBlock) && (
              <div className="flex justify-center gap-3">
                {canAddHero && (
                  <button
                    onClick={() => addComponent('hero_section')}
                    className="px-4 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                  >
                    + Add Hero
                  </button>
                )}
                {canAddTextBlock && (
                  <button
                    onClick={() => addComponent('text_block')}
                    className="px-4 py-2 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    + Add Text Block
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
