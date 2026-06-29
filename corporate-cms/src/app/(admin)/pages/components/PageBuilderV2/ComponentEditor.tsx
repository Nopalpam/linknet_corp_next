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

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { usePageBuilder } from './context';
import { getRegistryEntry } from './registry';
import { isMultilingual, ComponentSettings } from './types';
import { CkeditorEditor } from './editors/CkeditorEditor';
import { CtaListModule, isCtaListItem } from './editors/CtaListModule';
import { InformationListEditor } from './editors/InformationListEditor';
import { ListReportHomeEditor } from './editors/ListReportHomeEditor';
import { MediaGenreField, MediaHighlightCategoriesField, MediaIdsField } from './editors/MediaSelectionEditor';
import { ICON_OPTIONS } from './iconOptions';
import MediaPickerButton from '@/components/media/MediaPickerButton';
import { MediaPickerKind } from '@/components/media/MediaPickerModal';
import { awardsService, Award } from '@/services/awards.service';
import { newsCategoryService, newsService, NewsCategory, News } from '@/services/news.service';
import { reportService } from '@/services/report.service';
import { announcementService } from '@/services/announcement.service';
import {
  getDataDrivenFieldHelper,
  getDataDrivenFieldLabel,
  isDataDrivenComponent,
  normalizeDataDrivenSettings,
} from './dataDrivenSettings';

// =============================================================================
// TYPE-SPECIFIC EDITOR MAPPING
// =============================================================================

const TYPE_SPECIFIC_EDITORS: Record<string, React.ComponentType<{ settings: any; onChange: (s: any) => void }>> = {
  ckeditor: CkeditorEditor,
  information_list: InformationListEditor,
  list_report_home: ListReportHomeEditor,
};

const RichTextEditor = dynamic(
  () => import('@/components/ui/ckeditor/CKEditorWrapper'),
  { ssr: false, loading: () => <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /> }
);

// =============================================================================
// FIELD HELPERS & CLASSIFICATION
// =============================================================================

const COMMON_FIELD_KEYS = ['config', 'custom_id', 'custom_class', 'bg_type', 'bg_color', 'bg_image', 'bg_position'];

/** Keys that belong to the CONTENT group */
const CONTENT_KEYS = ['title', 'subtitle', 'heading', 'subheading', 'description', 'content', 'text', 'label', 'name', 'caption', 'alt', 'excerpt', 'summary', 'body', 'quote', 'author', 'source', 'placeholder', 'badge', 'tag', 'category'];
/** Keys that belong to the LAYOUT group */
const LAYOUT_KEYS = ['theme', 'size', 'layout', 'alignment', 'text_position', 'columns', 'gap', 'padding', 'margin', 'width', 'height', 'max_width', 'max_items', 'per_page', 'itemsPerRow', 'items_per_row', 'limit', 'state', 'order', 'direction', 'position', 'variant', 'style', 'display', 'grid', 'spacing', 'rows', 'cols', 'report_type_id', 'report_section_id', 'announcement_type_id', 'announcement_section_id', 'sort_by', 'sort_direction', 'card_style', 'sort', 'sort_order', 'status', 'show_', 'hide_', 'is_', 'enable_', 'visible'];
/** Keys that belong to the BUTTON group. Button Settings must only expose CTA lists. */
const CTA_LIST_KEYS = ['ctaList', 'cta_list', 'ctaButtons', 'cta_buttons', 'buttons'];
const BUTTON_KEYS = CTA_LIST_KEYS;
const GROUP_ORDER = ['layout', 'content', 'button', 'items', 'advanced'];
const TYPE_GROUP_ORDER: Record<string, string[]> = {
  awards_marquee: ['content', 'items', 'button', 'advanced'],
};
const TYPE_HIDDEN_FIELDS: Record<string, string[]> = {
  hero_section: ['title', 'description', 'pill_text', 'labelText'],
  key_highlight: ['title', 'description', 'intro', 'sectionIntro'],
  highlighting_real_initiatives: ['title', 'description', 'intro', 'sectionIntro', 'partner_text', 'community_text', 'community_logos', 'partner_logos', 'logos'],
  usp_grid: ['title', 'description', 'intro', 'sectionIntro'],
  awards_list: ['layout', 'title'],
  awards_marquee: ['title', 'marquee_speed', 'marquee_direction'],
  career_list: ['title'],
  event_related: ['currentEvent', 'current_event', 'events', 'items', 'list'],
  events_list: ['events', 'items', 'list', 'mainData', 'main_data'],
  news_highlight: ['title'],
  news_featured: ['title'],
  news_list: ['category_slug', 'categorySlug'],
  news_teaser: ['categorySlug', 'category_slug'],
  navbar_newsroom: ['introData', 'sectionIntro', 'intro'],
  info_contacts: ['title', 'description'],
  vision_mission: ['vision', 'missions', 'layout', 'columns'],
  report_list: ['report_type_slug', 'report_section_slug'],
  report_grid: ['report_type_slug', 'report_section_slug', 'data'],
  report_list_part: ['report_type_slug', 'report_section_slug', 'data'],
  announcement_list: ['announcement_type_slug', 'announcement_section_slug'],
  list_report_home: ['name', 'source', 'data_source', 'layout'],
  logo_running: ['name'],
  logo_running_with_border: ['name'],
  join_first_squad: ['title'],
  closing_cta: ['title', 'description'],
};

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
  category_id: 'Filter content by category/type ID.',
  category_slug: 'Filter content by category/type slug.',
  card_style: 'Visual card style used by the public renderer.',
  display_image: 'Show or hide card images where supported.',
  display_description: 'Show or hide descriptions/excerpts where supported.',
  display_metadata: 'Show or hide metadata such as date/category where supported.',
  news_ids: 'Pilih beberapa berita dari database. Urutan pilihan di bawah ini akan dipakai di public.',
  channel_ids: 'Pilih channel dari Media API. Jika kosong, frontend menampilkan empty state.',
  genre_ids: 'Pilih genre dari Media API. Channel yang tampil akan mengikuti genre terpilih.',
  reel_item_ids: 'Pilih highlight/program dari Media API. Reel Name otomatis mengikuti item yang dipilih.',
  highlight_categories: 'Buat kategori dan pilih Reel Items untuk tiap kategori.',
  logo_channel_ids: 'Pilih channel logo dari Media API untuk marquee. Jika kosong, marquee tidak ditampilkan.',
  logo_display_limit: 'Logo channel ditampilkan acak dari Media API tanpa pilihan manual.',
  source: 'Data source for this component.',
  itemsPerRow: 'Number of event cards per row on desktop.',
  showPagination: 'Show frontend pagination controls when more CMS events are available.',
  state: 'Filter events by public state from CMS.',
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

const ICON_FIELD_KEYS = ['icon', 'iconClass', 'iconName', 'iconListDefault', 'iconLeft', 'iconRight', 'iconURL', 'iconUrl'];
const USP_VARIANT_OPTIONS = ['default', 'plain', 'background', 'card', 'border', 'accent-stat', 'accent-text', 'icon-left'];
const CTA_VARIANT_OPTIONS = [
  'primary',
  'secondary',
  'secondary-outline',
  'secondary-outline--white',
  'secondary-plain',
  'warning',
  'info',
  'danger',
  'link',
];
const LAYOUT_VARIANT_OPTIONS = ['default', 'image-on-left', 'image-on-right'];
const LINK_TYPE_OPTIONS = ['url', 'action-modal'];
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

function getSortByOptions(componentType?: string): SelectOption[] {
  switch (componentType) {
    case 'tv_channel_list':
    case 'tv_channel_sneak_peek':
      return [
        { value: 'manual', label: 'Manual selected order' },
        { value: 'name', label: 'Channel name' },
        { value: 'channel_number', label: 'Channel number' },
        { value: 'api_order', label: 'API order' },
      ];
    case 'tv_highlight_sliders':
    case 'tv_highlight_sneek_peak':
      return [
        { value: 'manual', label: 'Manual selected order' },
        { value: 'api_order', label: 'API order' },
        { value: 'title', label: 'Title' },
        { value: 'year', label: 'Year' },
      ];
    case 'report_list':
    case 'report_grid':
    case 'report_list_part':
    case 'list_report_home':
      return [
        { value: 'year', label: 'Report year' },
        { value: 'published_at', label: 'Publish date' },
        { value: 'title', label: 'Report title' },
        { value: 'sort_order', label: 'CMS sort order' },
      ];
    case 'announcement_list':
      return [
        { value: 'created_at', label: 'Publish date' },
        { value: 'title', label: 'Title' },
        { value: 'sort_order', label: 'CMS sort order' },
      ];
    case 'events_list':
    case 'event_related':
      return [
        { value: 'start_date', label: 'Event start date' },
        { value: 'created_at', label: 'Created date' },
        { value: 'title', label: 'Event title' },
      ];
    case 'news_list':
    case 'news_highlight':
    case 'news_featured':
    case 'news_feed':
    case 'news_teaser':
      return [
        { value: 'news_date', label: 'News date' },
        { value: 'published_at', label: 'Publish date' },
        { value: 'title', label: 'News title' },
        { value: 'created_at', label: 'Created date' },
      ];
    case 'awards_list':
      return [
        { value: 'issue_date', label: 'Issue date' },
        { value: 'year', label: 'Award year' },
        { value: 'title', label: 'Award title' },
      ];
    case 'solutions_list':
      return [
        { value: 'sort_order', label: 'CMS sort order' },
        { value: 'title', label: 'Solution title' },
        { value: 'latest', label: 'Newest first' },
        { value: 'updated_at', label: 'Last updated' },
      ];
    default:
      return ['latest', 'oldest', 'alphabetical'];
  }
}

function getSourceOptions(componentType?: string): SelectOption[] {
  if ([
    'tv_channel_list',
    'tv_channel_sneak_peek',
    'tv_highlight_sliders',
    'tv_highlight_sneek_peak',
  ].includes(componentType || '')) {
    return [
      { value: 'media_api', label: 'Media API' },
    ];
  }

  return [
    { value: 'cms_highlights', label: 'CMS News Highlights' },
    { value: 'selected_news', label: 'Selected News' },
  ];
}

function getCardStyleOptions(componentType?: string): SelectOption[] {
  if (componentType === 'report_list' || componentType === 'report_grid') {
    return [
      { value: 'default', label: 'Default report card' },
      { value: 'cover', label: 'Cover card' },
      { value: 'compact', label: 'Compact document row' },
    ];
  }

  if (componentType === 'announcement_list') {
    return [
      { value: 'document', label: 'Document row' },
      { value: 'compact', label: 'Compact row' },
    ];
  }

  return ['default', 'compact', 'featured'];
}

const SINGLE_BUTTON_TEXT_KEYS = ['cta_label', 'button_label', 'label', 'cta_text', 'button_text', 'textCTA', 'ctaText'];
const SINGLE_BUTTON_LINK_KEYS = ['cta_href', 'button_href', 'href', 'cta_link', 'button_link', 'button_url', 'cta_url', 'ctaLink', 'action'];
const LEGACY_SINGLE_BUTTON_FIELD_KEYS = new Set([
  'cta_label',
  'button_label',
  'cta_text',
  'button_text',
  'textCTA',
  'ctaText',
  'cta_href',
  'button_href',
  'cta_link',
  'button_link',
  'button_url',
  'cta_url',
  'ctaLink',
  'cta_variant',
  'button_variant',
  'cta_size',
  'button_size',
  'cta_link_type',
  'button_link_type',
  'cta_target',
  'button_target',
  'cta_action',
  'button_action',
  'cta_action_modal',
  'button_action_modal',
  'cta_icon_left',
  'button_icon_left',
  'cta_icon_right',
  'button_icon_right',
]);

const INTRO_DATA_ONLY_COMPONENTS = new Set([
  'key_highlight',
  'highlighting_real_initiatives',
  'usp_grid',
]);

function getFirstDefinedKey(data: Record<string, any>, keys: string[]): string | undefined {
  return keys.find((key) => key in data);
}

function getSingleButtonPrefix(data: Record<string, any>): 'button' | 'cta' {
  return Object.keys(data).some((key) => key.startsWith('button_') || key.startsWith('button'))
    ? 'button'
    : 'cta';
}

function isSingleButtonSettings(data: Record<string, any> | undefined): boolean {
  if (!data || typeof data !== 'object') return false;
  const hasText = SINGLE_BUTTON_TEXT_KEYS.some((key) => key in data);
  const hasLink = SINGLE_BUTTON_LINK_KEYS.some((key) => key in data);
  if (!hasText && !hasLink) return false;
  const buttonOnlyKeys = new Set([
    ...SINGLE_BUTTON_TEXT_KEYS,
    ...SINGLE_BUTTON_LINK_KEYS,
    'cta_variant',
    'button_variant',
    'variant',
    'cta_size',
    'button_size',
    'size',
    'cta_link_type',
    'button_link_type',
    'link_type',
    'linkType',
    'cta_target',
    'button_target',
    'target',
    'cta_action',
    'button_action',
    'action',
    'cta_action_modal',
    'button_action_modal',
    'action_modal',
    'actionModal',
    'cta_icon_left',
    'button_icon_left',
    'iconLeft',
    'icon_left',
    'cta_icon_right',
    'button_icon_right',
    'iconRight',
    'icon_right',
    'icon',
  ]);

  return Object.keys(data).every((key) => buttonOnlyKeys.has(key));
}

function normalizeSingleButtonSettings(data: Record<string, any>): Record<string, any> {
  const label = data.cta_label ?? data.button_label ?? data.label ?? data.cta_text ?? data.button_text ?? data.textCTA ?? data.ctaText ?? '';
  const href = data.cta_href ?? data.button_href ?? data.href ?? data.cta_link ?? data.button_link ?? data.button_url ?? data.cta_url ?? data.ctaLink ?? data.action ?? '';
  const action = data.cta_action ?? data.button_action ?? data.action ?? data.cta_action_modal ?? data.button_action_modal ?? data.action_modal ?? data.actionModal ?? '';

  return {
    label,
    text: label,
    href,
    action,
    variant: data.cta_variant ?? data.button_variant ?? data.variant ?? 'primary',
    size: data.cta_size ?? data.button_size ?? data.size ?? 'lg',
    link_type: data.cta_link_type ?? data.button_link_type ?? data.link_type ?? data.linkType ?? 'url',
    target: data.cta_target ?? data.button_target ?? data.target ?? '_self',
    action_modal: data.cta_action_modal ?? data.button_action_modal ?? data.action_modal ?? data.actionModal ?? '',
    iconLeft: data.cta_icon_left ?? data.button_icon_left ?? data.iconLeft ?? data.icon_left ?? '',
    iconRight: data.cta_icon_right ?? data.button_icon_right ?? data.iconRight ?? data.icon_right ?? data.icon ?? '',
  };
}

function applySingleButtonSettings(original: Record<string, any>, cta: Record<string, any>): Record<string, any> {
  const prefix = getSingleButtonPrefix(original);
  const textKey = getFirstDefinedKey(original, SINGLE_BUTTON_TEXT_KEYS) || `${prefix}_text`;
  const linkKey = getFirstDefinedKey(original, SINGLE_BUTTON_LINK_KEYS) || `${prefix}_link`;
  const actionKey = getFirstDefinedKey(original, ['cta_action', 'button_action', 'action']) || `${prefix}_action`;
  const nextLabel = cta.label ?? cta.text ?? '';
  const next = {
    ...original,
    [textKey]: nextLabel,
    [linkKey]: cta.href,
    [actionKey]: cta.action,
    [`${prefix}_variant`]: cta.variant,
    [`${prefix}_size`]: cta.size,
    [`${prefix}_link_type`]: cta.link_type,
    [`${prefix}_target`]: cta.target,
    [`${prefix}_action_modal`]: cta.action_modal,
    [`${prefix}_icon_left`]: cta.iconLeft,
    [`${prefix}_icon_right`]: cta.iconRight,
  };

  return next;
}

function hasRenderableValue(value: any): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.some((entry) => hasRenderableValue(entry));
  if (typeof value === 'object') return Object.values(value).some((entry) => hasRenderableValue(entry));
  return false;
}

function valuesMatch(left: any, right: any): boolean {
  if (!hasRenderableValue(left) || !hasRenderableValue(right)) return false;
  return JSON.stringify(left) === JSON.stringify(right);
}

function hasTopLevelSingleButtonFields(data: Record<string, any>): boolean {
  const hasText = SINGLE_BUTTON_TEXT_KEYS.some((key) => key in data && hasRenderableValue(data[key]));
  const hasLink = SINGLE_BUTTON_LINK_KEYS.some((key) => key in data && hasRenderableValue(data[key]));
  return hasText || hasLink;
}

function normalizeLocalizedText(value: any): { en: string; id: string } {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const en = value.en ?? value.label ?? value.title ?? value.name ?? value.id ?? '';
    const id = value.id ?? value.label ?? value.title ?? value.name ?? value.en ?? '';

    return {
      en: en == null || typeof en === 'object' ? '' : String(en),
      id: id == null || typeof id === 'object' ? '' : String(id),
    };
  }

  const text = value == null ? '' : String(value);
  return { en: text, id: text };
}

function normalizeInitiativeSource(value: any): 'manual' | 'news' {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return ['news', 'data_news', 'selected_news', 'cms_news'].includes(normalized) ? 'news' : 'manual';
}

function normalizeInitiativeTarget(value: any): '_self' | '_blank' {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return normalized === 'blank' || normalized === '_blank' ? '_blank' : '_self';
}

function normalizeSettingsForEditor(data: Record<string, any> | undefined, componentType?: string): Record<string, any> {
  const normalized: Record<string, any> = { ...(data || {}) };
  const introSource = normalized.introData || normalized.sectionIntro || normalized.intro;

  if (componentType === 'sliders_hero') {
    if (!('showFinderEnterprise' in normalized) && 'showEnterpriseSolutionFinderCTA' in normalized) {
      normalized.showFinderEnterprise = normalized.showEnterpriseSolutionFinderCTA;
    }
    delete normalized.showEnterpriseSolutionFinderCTA;
  }

  if (introSource && typeof introSource === 'object' && !Array.isArray(introSource)) {
    normalized.introData = { ...introSource };

    if ('title' in normalized) {
      if (!hasRenderableValue(normalized.introData.title)) {
        normalized.introData.title = normalized.title;
        delete normalized.title;
      } else if (!hasRenderableValue(normalized.title) || valuesMatch(normalized.title, normalized.introData.title)) {
        delete normalized.title;
      }
    }
    if ('description' in normalized) {
      if (!hasRenderableValue(normalized.introData.description)) {
        normalized.introData.description = normalized.description;
        delete normalized.description;
      } else if (!hasRenderableValue(normalized.description) || valuesMatch(normalized.description, normalized.introData.description)) {
        delete normalized.description;
      }
    }

    delete normalized.sectionIntro;
    delete normalized.intro;
  }

  // These components use Intro Data as their single source of heading copy.
  // Legacy flat fields are migrated above, then removed to prevent duplicates.
  if (componentType === 'join_first_squad') {
    delete normalized.title;
  }
  if (componentType === 'closing_cta') {
    delete normalized.title;
    delete normalized.description;
  }

  if (componentType === 'hero_section') {
    const heroIntro = normalized.introData && typeof normalized.introData === 'object' && !Array.isArray(normalized.introData)
      ? normalized.introData
      : {};
    const hasHeroIntroField = (field: string) => Object.prototype.hasOwnProperty.call(heroIntro, field);

    normalized.introData = {
      ...heroIntro,
      as: heroIntro.as || normalized.as || 'h1',
      label: hasHeroIntroField('label') ? heroIntro.label : (normalized.pill_text ?? normalized.labelText ?? ''),
      title: hasHeroIntroField('title') ? heroIntro.title : (normalized.title ?? ''),
      description: hasHeroIntroField('description') ? heroIntro.description : (normalized.description ?? ''),
      align: heroIntro.align || 'left',
    };

    delete normalized.title;
    delete normalized.description;
    delete normalized.pill_text;
    delete normalized.labelText;
    delete normalized.as;
  }

  if (componentType && INTRO_DATA_ONLY_COMPONENTS.has(componentType)) {
    const introData = normalized.introData && typeof normalized.introData === 'object' && !Array.isArray(normalized.introData)
      ? normalized.introData
      : {};
    const hasIntroField = (field: string) => Object.prototype.hasOwnProperty.call(introData, field);

    normalized.introData = {
      ...introData,
      as: introData.as || normalized.intro_as || 'h2',
      label: hasIntroField('label') ? introData.label : (normalized.intro_label ?? normalized.pill_text ?? ''),
      title: hasIntroField('title') ? introData.title : (normalized.title ?? normalized.intro_title ?? ''),
      description: hasIntroField('description') ? introData.description : (normalized.description ?? normalized.intro_description ?? ''),
      align: introData.align || normalized.intro_align || (componentType === 'key_highlight' ? 'left' : 'center'),
    };

    delete normalized.title;
    delete normalized.description;
    delete normalized.intro;
    delete normalized.sectionIntro;
    delete normalized.intro_as;
    delete normalized.intro_label;
    delete normalized.intro_title;
    delete normalized.intro_description;
    delete normalized.intro_align;
    delete normalized.pill_text;
  }

  if (componentType === 'highlighting_real_initiatives') {
    const initiatives = Array.isArray(normalized.initiatives) ? normalized.initiatives : [];
    normalized.initiatives = initiatives.map((item: Record<string, any>, index: number) => {
      const {
        content,
        ctaUrl,
        cta_url,
        cover_image,
        coverImage,
        desc,
        data_source,
        href,
        link,
        logo,
        logo_image,
        logoImage,
        name,
        news,
        news_id,
        newsId,
        partner_logo,
        partnerLogo,
        published_at,
        publishedAt,
        slug,
        source,
        sub_description,
        subDescription,
        target,
        thumbnail,
        thumbnail_image,
        thumbnailImage,
        top_logo,
        urlTarget,
        url_target,
        ...rest
      } = item || {};
      const contentData = content && typeof content === 'object' && !Array.isArray(content) ? content : {};
      const resolvedNewsId = contentData.newsId ?? contentData.news_id ?? newsId ?? news_id ?? '';
      const resolvedSource = normalizeInitiativeSource(source ?? data_source ?? contentData.source ?? (resolvedNewsId ? 'news' : 'manual'));

      return {
        ...rest,
        id: rest.id ?? index + 1,
        topLogo: rest.topLogo ?? top_logo ?? logo ?? logo_image ?? logoImage ?? partner_logo ?? partnerLogo ?? '',
        source: resolvedSource,
        content: {
          newsId: resolvedNewsId,
          image: contentData.image ?? rest.image ?? thumbnail ?? thumbnail_image ?? thumbnailImage ?? cover_image ?? coverImage ?? news?.news_thumbnail ?? '',
          title: contentData.title ?? rest.title ?? name ?? (news ? { en: news.title_en || '', id: news.title_id || news.title_en || '' } : { en: '', id: '' }),
          description: contentData.description ?? contentData.desc ?? rest.description ?? desc ?? sub_description ?? subDescription ?? (news ? { en: news.excerpt_en || '', id: news.excerpt_id || news.excerpt_en || '' } : { en: '', id: '' }),
          date: contentData.date ?? rest.date ?? published_at ?? publishedAt ?? news?.news_date ?? '',
          url: contentData.url ?? rest.url ?? href ?? link ?? ctaUrl ?? cta_url ?? (news?.slug ? `/news/${news.slug}` : ''),
          slug: contentData.slug ?? slug ?? news?.slug ?? '',
        },
        target: normalizeInitiativeTarget(target ?? urlTarget ?? url_target ?? contentData.target),
      };
    });

    normalized.partnerText = normalized.partnerText ?? normalized.partner_text ?? normalized.community_text ?? normalized.communityText ?? '';
    normalized.partnerLogos = Array.isArray(normalized.partnerLogos)
      ? normalized.partnerLogos
      : Array.isArray(normalized.partner_logos)
        ? normalized.partner_logos
        : Array.isArray(normalized.community_logos)
          ? normalized.community_logos
          : Array.isArray(normalized.logos)
            ? normalized.logos
            : [];

    delete normalized.partner_text;
    delete normalized.community_text;
    delete normalized.communityText;
    delete normalized.partner_logos;
    delete normalized.community_logos;
    delete normalized.logos;
  }

  const ctaListKey = CTA_LIST_KEYS.find((key) => Array.isArray(normalized[key]));
  if (ctaListKey) {
    normalized.ctaList = normalized[ctaListKey];
  } else if (hasTopLevelSingleButtonFields(normalized)) {
    const legacyCta = normalizeSingleButtonSettings(normalized);
    if (hasRenderableValue(legacyCta.label) || hasRenderableValue(legacyCta.href) || hasRenderableValue(legacyCta.action)) {
      normalized.ctaList = [legacyCta];
    }
  }

  for (const key of CTA_LIST_KEYS) {
    if (key !== 'ctaList') {
      delete normalized[key];
    }
  }

  for (const key of Object.keys(normalized)) {
    if (LEGACY_SINGLE_BUTTON_FIELD_KEYS.has(key)) {
      delete normalized[key];
    }
  }

  if (componentType === 'info_contacts') {
    const contactItems = Array.isArray(normalized.contact_items)
      ? normalized.contact_items
      : Array.isArray(normalized.items)
        ? normalized.items
        : [];

    normalized.contact_items = contactItems.map((item: Record<string, any>) => {
      const { icon, icon_left, icon_right, type, ...rest } = item || {};

      return {
        ...rest,
        iconLeft: rest.iconLeft ?? icon_left ?? icon ?? '',
        iconRight: rest.iconRight ?? icon_right ?? '',
        label: normalizeLocalizedText(item.label),
        value: normalizeLocalizedText(item.value ?? item.text),
      };
    });

    delete normalized.items;
  }

  if (componentType === 'logo_running' || componentType === 'logo_running_with_border') {
    normalized.ctaList = Array.isArray(normalized.ctaList) ? normalized.ctaList : [];
  }

  return normalized;
}

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
  if (['label', 'title', 'description', 'labelClassName', 'titleClassName', 'descriptionClassName', 'className'].includes(key)) return true;
  if (isHtmlField(key, value)) return true;
  if (typeof value === 'string' && value.length > 100) return true;
  return false;
}

/** Classify a field key into a group */
function classifyField(key: string): 'content' | 'layout' | 'button' | 'items' | 'advanced' {
  if (key === 'introData' || key === 'sectionIntro' || key === 'intro') return 'content';
  if (COMMON_FIELD_KEYS.includes(key)) return 'advanced';
  if (isSectionToggleField(key)) return 'layout';
  if ([
    'autoplay',
    'autoplaySpeed',
    'autoplay_speed',
    'showFinderEnterprise',
    'show_finder_enterprise',
    'showEnterpriseSolutionFinderCTA',
    'show_enterprise_solution_finder_cta',
    'solutionsFinderEnterpriseClassName',
    'solutions_finder_enterprise_class_name',
  ].includes(key)) return 'layout';
  if (isSliderField(key)) return 'layout';
  if (BUTTON_KEYS.some(bk => key.startsWith(bk) || key === bk)) return 'button';
  if (LAYOUT_KEYS.some(lk => key === lk || key.startsWith(lk))) return 'layout';
  if (CONTENT_KEYS.some(ck => key === ck || key.startsWith(ck))) return 'content';
  return 'content'; // default
}

function isSectionToggleField(key: string): boolean {
  return [
    'show_cta_section',
    'showCtaSection',
    'show_intro_section',
    'showIntroSection',
    'show_slider_section',
    'showSliderSection',
    'show_community_section',
    'showCommunitySection',
  ].includes(key);
}

function normalizeBooleanLike(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
}

function getHelperText(key: string, componentType?: string): string | undefined {
  const contextualHelper = getDataDrivenFieldHelper(componentType, key);
  if (contextualHelper) return contextualHelper;
  if (FIELD_HELPERS[key]) return FIELD_HELPERS[key];
  for (const [hk, hv] of Object.entries(FIELD_HELPERS)) {
    if (key.startsWith(hk) || key.endsWith(hk)) return hv;
  }
  return undefined;
}

function getObjectHelperText(key: string): string | undefined {
  if (key === 'image') {
    return 'Only visible when Layout Variant is Image-on-Left or Image-on-Right.';
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

function isIconField(key: string): boolean {
  const normalized = key.toLowerCase();
  return ICON_FIELD_KEYS.some((iconKey) => normalized === iconKey.toLowerCase());
}

function isMediaPathField(key: string): boolean {
  const normalized = key.toLowerCase();
  const exactImageKeys = new Set(['src', 'image', 'img', 'photo', 'thumbnail', 'poster', 'favicon']);
  if (exactImageKeys.has(normalized)) return true;

  return [
    'image',
    'img',
    'thumbnail',
    'thumb',
    'photo',
    'poster',
    'backgroundimage',
    'background_image',
    'bgimage',
    'bg_image',
    'logo',
    'iconsrc',
    'iconurl',
    'icon_url',
  ].some((token) => normalized.includes(token));
}

function getMediaKindForField(key: string): MediaPickerKind {
  const normalized = key.toLowerCase();
  if (normalized.includes('pdf') || normalized.includes('document')) return 'pdf';
  if (normalized.includes('video')) return 'video';
  if (normalized.includes('audio')) return 'audio';
  return 'image';
}

function uniqueOptions(options: string[]): string[] {
  return Array.from(new Set(options));
}

function isSliderSlidesField(key: string): boolean {
  return [
    'slides_per_view',
    'slides_per_view_desktop',
    'slides_per_view_mobile',
    'slidesPerView',
    'slidesPerViewDesktop',
    'slidesPerViewMobile',
  ].includes(key);
}

function isSliderToggleField(key: string): boolean {
  return key === 'is_slider' || key === 'isSlider' || key === 'thumbsVisible' || key === 'thumbs_visible';
}

function isSliderField(key: string): boolean {
  return isSliderToggleField(key) || isSliderSlidesField(key);
}

function isGridColsField(key: string): boolean {
  return [
    'grid_cols_desktop',
    'grid_cols_mobile',
    'gridColsDesktop',
    'gridColsMobile',
  ].includes(key);
}

function isActionModalField(key: string): boolean {
  return [
    'action_modal',
    'action_modal_id',
    'actionModal',
    'actionModalId',
    'modal_id',
    'modalId',
    'form_modal',
    'formModal',
  ].includes(key);
}

function shouldHideField(key: string, data: Record<string, any>, componentType?: string, objectKey?: string): boolean {
  const isInfoContactItem = componentType === 'info_contacts' && objectKey === 'contact_items';
  const linkType = data.link_type ?? data.linkType;
  if (linkType === 'action-modal' && (key === 'href' || key === 'url')) return true;
  if (isActionModalField(key) && linkType !== 'action-modal') return true;
  if (!isInfoContactItem && isCtaListItem(data) && (key === 'icon' || key === 'iconLeft' || key === 'icon_left' || key === 'iconRight' || key === 'icon_right')) return true;

  const source = data.source;
  if (key === 'reel_names' || key === 'reelNames') return true;
  const isNewsIdsField = key === 'news_ids' || key === 'newsIds' || key === 'selected_news_ids' || key === 'selectedNewsIds';
  if (isNewsIdsField && source !== 'selected_news') return true;
  if ((key === 'featuredNews' || key === 'items') && source === 'selected_news') return true;

  const sliderValue = data.is_slider ?? data.isSlider;
  if (sliderValue === false && isSliderSlidesField(key)) return true;
  if (sliderValue === true && isGridColsField(key)) return true;

  return false;
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
  templateValue?: any;
  componentType?: string;
  contextData?: Record<string, any>;
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

function MultilingualField({ label, value, onChange, fieldKey, componentType }: FieldProps) {
  const isHtml = isHtmlField('', value);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'id'>('en');
  const InputEl = isHtml ? 'textarea' : 'input';
  const extraProps = isHtml ? { rows: 3 } : {};
  const placeholder = getPlaceholder(fieldKey);
  const helper = getHelperText(fieldKey, componentType);

  if (isHtml) {
    return (
      <FieldWrapper helper={helper || 'Supports rich text / HTML content'}>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3">
          <button
            type="button"
            onClick={() => setActiveLanguage('en')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeLanguage === 'en'
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
            onClick={() => setActiveLanguage('id')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeLanguage === 'id'
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

        <div className={activeLanguage === 'en' ? 'block' : 'hidden'}>
          <RichTextEditor
            key={`${fieldKey}-editor-en`}
            value={value?.en || ''}
            onChange={(data) => onChange({ ...value, en: data })}
            placeholder={placeholder ? `${placeholder} (English)` : 'Enter English content here...'}
            minHeight="300px"
          />
        </div>

        <div className={activeLanguage === 'id' ? 'block' : 'hidden'}>
          <RichTextEditor
            key={`${fieldKey}-editor-id`}
            value={value?.id || ''}
            onChange={(data) => onChange({ ...value, id: data })}
            placeholder={placeholder ? `${placeholder} (Indonesia)` : 'Masukkan konten Bahasa Indonesia di sini...'}
            minHeight="300px"
          />
        </div>
      </FieldWrapper>
    );
  }

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

function StringField({ label, value, onChange, fieldKey, componentType }: FieldProps) {
  const isHtml = isHtmlField(fieldKey, value);
  const placeholder = getPlaceholder(fieldKey);
  const helper = getHelperText(fieldKey, componentType);

  const isRunningPhotoUrl = componentType === 'about_with_marquee' && fieldKey === 'url';

  if (!isHtml && (isMediaPathField(fieldKey) || isRunningPhotoUrl)) {
    return (
      <FieldWrapper helper={helper}>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
        <div className="space-y-2">
          <input
            type="text"
            placeholder={placeholder || 'https://...'}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
          <MediaPickerButton
            kind={getMediaKindForField(fieldKey)}
            title={`Choose ${label}`}
            onSelect={(url) => onChange(url)}
          />
        </div>
      </FieldWrapper>
    );
  }

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

function NumberField({ label, value, onChange, fieldKey, componentType }: FieldProps) {
  const helper = getHelperText(fieldKey, componentType);
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

function BooleanField({ label, value, onChange, fieldKey, componentType }: FieldProps) {
  const helper = getHelperText(fieldKey, componentType);

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

type SelectOption = string | { value: string; label: string };

function SelectField({ label, value, onChange, options, fieldKey, componentType }: FieldProps & { options: SelectOption[] }) {
  const helper = getHelperText(fieldKey, componentType);
  const optionValues = options.map((option) => typeof option === 'string' ? option : option.value);
  const normalizedOptions: SelectOption[] = typeof value === 'string' && value && !optionValues.includes(value)
    ? [value, ...options]
    : options;

  return (
    <FieldWrapper helper={helper}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        {normalizedOptions.map((opt) => {
          const optionValue = typeof opt === 'string' ? opt : opt.value;
          const optionLabel = typeof opt === 'string' ? opt.charAt(0).toUpperCase() + opt.slice(1).replace(/_/g, ' ') : opt.label;

          return (
            <option key={optionValue} value={optionValue}>{optionLabel}</option>
          );
        })}
      </select>
    </FieldWrapper>
  );
}

function NewsCategorySelectField({ label, value, onChange, fieldKey }: FieldProps) {
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const useSlugValue = fieldKey === 'categorySlug' || fieldKey === 'category_slug';
  const currentValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    let mounted = true;

    newsCategoryService
      .getActiveCategories()
      .then((response) => {
        if (mounted) setCategories(response.data || []);
      })
      .catch(() => {
        if (mounted) setCategories([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FieldWrapper helper="Pilih kategori berita dari CMS News Category. Title public akan memakai nama kategori ini.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading categories...' : 'All categories'}</option>
        {currentValue && !categories.some((category) => (useSlugValue ? category.slug : category.id) === currentValue) && (
          <option value={currentValue}>{currentValue}</option>
        )}
        {categories.map((category) => {
          const optionValue = useSlugValue ? category.slug : category.id;
          const labelText = category.name_en || category.name_id || category.slug;
          return (
            <option key={category.id} value={optionValue}>
              {labelText}{category.name_id ? ` / ${category.name_id}` : ''}
            </option>
          );
        })}
      </select>
    </FieldWrapper>
  );
}

function ReportTypeSelectField({ label, value, onChange }: FieldProps) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    let mounted = true;

    reportService
      .getReportTypesList()
      .then((response) => {
        if (mounted) setTypes(response.data || []);
      })
      .catch(() => {
        if (mounted) setTypes([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FieldWrapper helper="Pilih Report Type aktif dari Report CMS. Source component ini fixed ke data Report.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading report types...' : 'All report types'}</option>
        {currentValue && !types.some((type) => type.id === currentValue) && (
          <option value={currentValue}>{currentValue}</option>
        )}
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function ReportSectionSelectField({ label, value, onChange, contextData }: FieldProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const reportTypeId = typeof contextData?.report_type_id === 'string' ? contextData.report_type_id : '';
  const currentValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    let mounted = true;

    reportService
      .getReportSectionsList(reportTypeId || undefined)
      .then((response) => {
        if (mounted) setSections(response.data || []);
      })
      .catch(() => {
        if (mounted) setSections([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [reportTypeId]);

  return (
    <FieldWrapper helper="Opsional. Pilih Report Section aktif; kosongkan untuk menampilkan semua section yang cocok.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading report sections...' : 'All report sections'}</option>
        {currentValue && !sections.some((section) => section.id === currentValue) && (
          <option value={currentValue}>{currentValue}</option>
        )}
        {sections.map((section) => (
          <option key={section.id} value={section.id}>
            {section.name || section.title}{section.report_types?.name ? ` - ${section.report_types.name}` : ''}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function AnnouncementTypeSelectField({ label, value, onChange }: FieldProps) {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    let mounted = true;

    announcementService
      .getAnnouncementTypesList()
      .then((response) => {
        if (mounted) setTypes(response.data || []);
      })
      .catch(() => {
        if (mounted) setTypes([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <FieldWrapper helper="Pilih kategori/type aktif dari Announcement CMS.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading announcement categories...' : 'All announcement categories'}</option>
        {currentValue && !types.some((type) => type.id === currentValue) && (
          <option value={currentValue}>{currentValue}</option>
        )}
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function AnnouncementSectionSelectField({ label, value, onChange, contextData }: FieldProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const announcementTypeId = typeof contextData?.announcement_type_id === 'string' ? contextData.announcement_type_id : '';
  const currentValue = typeof value === 'string' ? value : '';

  useEffect(() => {
    let mounted = true;

    announcementService
      .getAnnouncementSectionsList(announcementTypeId || undefined)
      .then((response) => {
        if (mounted) setSections(response.data || []);
      })
      .catch(() => {
        if (mounted) setSections([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [announcementTypeId]);

  return (
    <FieldWrapper helper="Opsional. Pilih section aktif; kosongkan untuk menampilkan semua section yang cocok.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={currentValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading announcement sections...' : 'All announcement sections'}</option>
        {currentValue && !sections.some((section) => section.id === currentValue) && (
          <option value={currentValue}>{currentValue}</option>
        )}
        {sections.map((section) => (
          <option key={section.id} value={section.id}>
            {section.name || section.title}{section.announcement_types?.name ? ` - ${section.announcement_types.name}` : ''}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function NewsIdsField({ label, value, onChange }: FieldProps) {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedIds = Array.isArray(value) ? value.filter(Boolean) : [];
  const selectedSet = new Set(selectedIds);
  const newsById = new Map(newsItems.map((item) => [item.id, item]));
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNews = normalizedQuery
    ? newsItems.filter((news) => (
        news.title_en.toLowerCase().includes(normalizedQuery) ||
        (news.title_id || '').toLowerCase().includes(normalizedQuery) ||
        news.slug.toLowerCase().includes(normalizedQuery) ||
        (news.category?.name_en || '').toLowerCase().includes(normalizedQuery)
      ))
    : newsItems;

  useEffect(() => {
    let mounted = true;

    newsService
      .getActiveNews({ page: 1, limit: 100, sortBy: 'news_date', sortOrder: 'desc' })
      .then((response) => {
        if (mounted) setNewsItems(response.data || []);
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

  const toggleNews = (newsId: string) => {
    const nextIds = selectedSet.has(newsId)
      ? selectedIds.filter((id: string) => id !== newsId)
      : [...selectedIds, newsId];
    onChange(nextIds);
  };

  const moveSelected = (newsId: string, direction: -1 | 1) => {
    const currentIndex = selectedIds.indexOf(newsId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= selectedIds.length) return;

    const nextIds = [...selectedIds];
    const [item] = nextIds.splice(currentIndex, 1);
    nextIds.splice(nextIndex, 0, item);
    onChange(nextIds);
  };

  return (
    <FieldWrapper helper="Pilih berita dari CMS News. Urutan di daftar Selected News menentukan urutan tampil di public.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>

      {selectedIds.length > 0 && (
        <div className="mb-3 rounded-lg border border-brand-100 dark:border-brand-900/50 bg-brand-50/40 dark:bg-brand-900/10 divide-y divide-brand-100 dark:divide-brand-900/50">
          {selectedIds.map((newsId: string, index: number) => {
            const news = newsById.get(newsId);
            const title = news?.title_en || news?.title_id || newsId;

            return (
              <div key={`${newsId}-${index}`} className="flex items-center gap-2 px-3 py-2 text-xs">
                <span className="w-5 text-center font-semibold text-brand-600 dark:text-brand-300">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-gray-800 dark:text-gray-100">{title}</span>
                  {news?.news_date && (
                    <span className="block text-gray-400 dark:text-gray-500">{news.news_date}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => moveSelected(newsId, -1)}
                  disabled={index === 0}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => moveSelected(newsId, 1)}
                  disabled={index === selectedIds.length - 1}
                  className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => toggleNews(newsId)}
                  className="px-2 py-1 rounded border border-red-200 text-red-600 dark:border-red-900/50 dark:text-red-400"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search news..."
        className="mb-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
      />
      <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">Loading news...</div>
        ) : filteredNews.length > 0 ? (
          filteredNews.map((news) => (
            <label
              key={news.id}
              className="flex items-start gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={selectedSet.has(news.id)}
                onChange={() => toggleNews(news.id)}
              />
              <span className="min-w-0">
                <span className="block font-medium text-gray-800 dark:text-gray-100 truncate">{news.title_en || news.title_id}</span>
                <span className="block text-gray-400 dark:text-gray-500">
                  {news.category?.name_en || news.category?.slug || 'Uncategorized'} {news.news_date ? `- ${news.news_date}` : ''}
                </span>
              </span>
            </label>
          ))
        ) : (
          <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">No news found.</div>
        )}
      </div>
    </FieldWrapper>
  );
}

function NewsSelectField({
  label,
  value,
  onChange,
  onSelectNews,
}: FieldProps & { onSelectNews?: (news: News | null) => void }) {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const currentValue = typeof value === 'string' ? value : '';
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredNews = normalizedQuery
    ? newsItems.filter((news) => (
        news.title_en.toLowerCase().includes(normalizedQuery) ||
        (news.title_id || '').toLowerCase().includes(normalizedQuery) ||
        news.slug.toLowerCase().includes(normalizedQuery) ||
        (news.category?.name_en || '').toLowerCase().includes(normalizedQuery)
      ))
    : newsItems;

  useEffect(() => {
    let mounted = true;

    newsService
      .getActiveNews({ page: 1, limit: 100, sortBy: 'news_date', sortOrder: 'desc' })
      .then((response) => {
        if (mounted) setNewsItems(response.data || []);
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

  const handleChange = (newsId: string) => {
    const selectedNews = newsItems.find((news) => news.id === newsId) || null;
    onChange(newsId);
    onSelectNews?.(selectedNews);
  };

  return (
    <FieldWrapper helper="Pilih satu berita. Image, title, desc, date, dan URL public akan mengikuti data news.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search news..."
        className="mb-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
      />
      <select
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading news...' : 'Select news'}</option>
        {currentValue && !newsItems.some((news) => news.id === currentValue) && (
          <option value={currentValue}>{currentValue}</option>
        )}
        {filteredNews.map((news) => (
          <option key={news.id} value={news.id}>
            {news.title_en || news.title_id || news.slug}{news.news_date ? ` - ${news.news_date}` : ''}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function IconField({ label, value, onChange, fieldKey, componentType }: FieldProps) {
  const helper = getHelperText(fieldKey, componentType) || 'Select an icon name or enter a file/path value';
  const currentValue = typeof value === 'string' ? value : '';
  const selectedIcon = ICON_OPTIONS.includes(currentValue as any) ? currentValue : '';
  const customPath = selectedIcon ? '' : currentValue;

  return (
    <FieldWrapper helper={helper}>
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
      <div className="space-y-2">
        <select
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          value={selectedIcon}
          onChange={(e) => onChange(e.target.value)}
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : 'None'}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="/assets/icons/example.svg"
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
          value={customPath}
          onChange={(e) => onChange(e.target.value)}
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

function AwardIdsField({ label, value, onChange }: FieldProps) {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedIds = Array.isArray(value) ? value : [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredAwards = normalizedQuery
    ? awards.filter((award) => (
        award.title.toLowerCase().includes(normalizedQuery) ||
        award.issuer.toLowerCase().includes(normalizedQuery) ||
        String(award.year).includes(normalizedQuery)
      ))
    : awards;

  useEffect(() => {
    let mounted = true;

    awardsService
      .getAllAwards('ACTIVE')
      .then((response) => {
        if (mounted) setAwards(response.data || []);
      })
      .catch(() => {
        if (mounted) setAwards([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleAward = (awardId: string) => {
    const nextIds = selectedIds.includes(awardId)
      ? selectedIds.filter((id: string) => id !== awardId)
      : [...selectedIds, awardId];
    onChange(nextIds);
  };

  return (
    <FieldWrapper helper="Pilih dari bank data Awards CMS. Hanya awards yang dicentang yang akan tampil di public.">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search awards..."
        className="mb-2 w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
      />
      <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {loading ? (
          <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">Loading awards...</div>
        ) : filteredAwards.length > 0 ? (
          filteredAwards.map((award) => (
            <label
              key={award.id}
              className="flex items-start gap-2 px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={selectedIds.includes(award.id)}
                onChange={() => toggleAward(award.id)}
              />
              <span className="min-w-0">
                <span className="block font-medium text-gray-800 dark:text-gray-100 truncate">{award.title}</span>
                <span className="block text-gray-400 dark:text-gray-500">{award.year} {award.issuer ? `- ${award.issuer}` : ''}</span>
              </span>
            </label>
          ))
        ) : (
          <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">No awards found.</div>
        )}
      </div>
    </FieldWrapper>
  );
}

// =============================================================================
// ARRAY FIELD (with drag-to-reorder + per-item minimize toggle)
// =============================================================================

/** Get a short preview label for an item (first string or multilingual field) */
function getItemPreview(item: any): string {
  if (typeof item === 'string') return item.slice(0, 40) || '(empty)';
  if (typeof item !== 'object' || item === null) return '';
  if (item.content && typeof item.content === 'object') {
    const title = item.content.title;
    if (typeof title === 'string' && title) return title.slice(0, 40);
    if (title && typeof title === 'object' && (title.en || title.id)) return (title.en || title.id).slice(0, 40);
    if (typeof item.content.newsId === 'string' && item.content.newsId) return item.content.newsId.slice(0, 40);
  }
  // Try common label fields
  for (const key of ['title', 'name', 'label', 'text', 'heading', 'caption', 'alt', 'url', 'value', 'year']) {
    const val = item[key];
    if (typeof val === 'string' && val) return val.slice(0, 40);
    if (val && typeof val === 'object' && (val.en || val.id)) return (val.en || val.id).slice(0, 40);
  }
  return '';
}

const EMPTY_ARRAY_ITEM_TEMPLATES: Record<string, any> = {
  items: {
    title: { en: '', id: '' },
    description: { en: '', id: '' },
    image: '',
  },
  slides: {
    image: '',
    title: { en: '', id: '' },
    description: { en: '', id: '' },
    button_text: { en: '', id: '' },
    button_link: '',
  },
  list: {
    icon: '',
    text: { en: '', id: '' },
  },
  tabs: {
    key: '',
    label: { en: '', id: '' },
  },
  cards: {
    title: { en: '', id: '' },
    description: { en: '', id: '' },
    image: '',
    link: '',
  },
  documents: {
    title: { en: '', id: '' },
    url: '',
    file_type: '',
    file_size: '',
  },
  related_articles: {
    title: { en: '', id: '' },
    url: '',
  },
  featuredNews: {
    title: { en: '', id: '' },
    image: '',
    slug: '',
    author: '',
    newsDate: '',
    category: {
      label: { en: '', id: '' },
      slug: '',
    },
  },
  contact_items: {
    iconLeft: '',
    iconRight: '',
    label: { en: '', id: '' },
    value: { en: '', id: '' },
    url: '',
  },
  logos: {
    image: '',
    altImage: '',
  },
  logo_items: {
    image: '',
    altImage: '',
  },
  services: {
    icon: '',
    title: { en: '', id: '' },
    description: { en: '', id: '' },
    products: [],
  },
  products: {
    name: { en: '', id: '' },
    link: '',
  },
  metrics: {
    label: { en: '', id: '' },
    value: '',
    change: '',
  },
  initiatives: {
    topLogo: '',
    source: 'manual',
    content: {
      newsId: '',
      image: '',
      title: { en: '', id: '' },
      description: { en: '', id: '' },
      date: '',
      url: '',
      slug: '',
    },
    target: '_self',
  },
  community_logos: {
    url: '',
    image: '',
    alt: '',
  },
  photos: {
    url: '',
    image: '',
    alt: '',
  },
  testimonials: {
    image: '',
    companyLogo: '',
    companyName: '',
    quote: { en: '', id: '' },
    tags: [],
    readMoreUrl: '',
    name: '',
    role: '',
  },
  milestones: {
    year: '',
    title: { en: '', id: '' },
    description: { en: '', id: '' },
    image: '',
  },
  missions: {
    title: { en: '', id: '' },
    description: { en: '', id: '' },
    image: '',
  },
  ctaList: {
    text: { en: '', id: '' },
    href: '',
    variant: 'primary',
    size: 'lg',
    iconLeft: '',
    iconRight: '',
    link_type: 'url',
    action_modal: '',
  },
  cta_list: {
    text: { en: '', id: '' },
    href: '',
    variant: 'primary',
    size: 'lg',
    iconLeft: '',
    iconRight: '',
    link_type: 'url',
    action_modal: '',
  },
  cta_buttons: {
    text: { en: '', id: '' },
    href: '',
    variant: 'primary',
    size: 'lg',
    iconLeft: '',
    iconRight: '',
    link_type: 'url',
    action_modal: '',
  },
};

const CONTEXTUAL_ARRAY_ITEM_TEMPLATES: Record<string, Record<string, any>> = {
  list_report_home: {
    report: {
      title: { en: '', id: '' },
      desc: { en: '', id: '' },
      ctaList: [],
      year: '',
    },
    announcement: {
      title: { en: '', id: '' },
      desc: { en: '', id: '' },
      ctaList: [],
      year: '',
    },
  },
  milestone: {
    list: {
      text: { en: '', id: '' },
    },
  },
  usp_grid_slider: {
    list: {
      icon: 'key',
      text: { en: '', id: '' },
    },
  },
  info_contacts: {
    contact_items: {
      iconLeft: '',
      iconRight: '',
      label: { en: '', id: '' },
      value: { en: '', id: '' },
      url: '',
    },
  },
};

const CTA_ARRAY_KEYS = new Set(['ctaList', 'cta_list', 'cta_buttons']);

function getContextualArrayItemTemplate(componentType: string | undefined, fieldKey: string): any {
  if (!componentType) return null;
  if (componentType === 'list_report_home' && fieldKey !== 'tabs' && !CTA_ARRAY_KEYS.has(fieldKey)) {
    return CONTEXTUAL_ARRAY_ITEM_TEMPLATES.list_report_home.report;
  }
  return CONTEXTUAL_ARRAY_ITEM_TEMPLATES[componentType]?.[fieldKey] || null;
}

function applyArrayItemDefaults(fieldKey: string, item: any): any {
  if (!item || typeof item !== 'object' || !CTA_ARRAY_KEYS.has(fieldKey)) return item;
  return {
    ...item,
    variant: item.variant || 'primary',
    size: item.size || 'lg',
    link_type: item.link_type || 'url',
  };
}

function cloneAndClear(value: any): any {
  const cloned = JSON.parse(JSON.stringify(value));
  clearValues(cloned);
  return cloned;
}

function getEmptyArrayItemTemplate(fieldKey: string, templateValue?: any, componentType?: string): any {
  const contextualTemplate = getContextualArrayItemTemplate(componentType, fieldKey);
  if (contextualTemplate) {
    return JSON.parse(JSON.stringify(contextualTemplate));
  }

  if (Array.isArray(templateValue) && templateValue.length > 0) {
    return applyArrayItemDefaults(fieldKey, cloneAndClear(templateValue[0]));
  }

  if (EMPTY_ARRAY_ITEM_TEMPLATES[fieldKey]) {
    return applyArrayItemDefaults(fieldKey, cloneAndClear(EMPTY_ARRAY_ITEM_TEMPLATES[fieldKey]));
  }

  return {
    title: { en: '', id: '' },
    description: { en: '', id: '' },
  };
}

function ArrayField({ label, value, onChange, fieldKey, depth = 0, templateValue, componentType }: FieldProps) {
  const items = useMemo(() => (Array.isArray(value) ? value : []), [value]);
  const [collapsed, setCollapsed] = useState(items.length > 3);
  const [minimizedItems, setMinimizedItems] = useState<Record<number, boolean>>(() => {
    // Default: minimize all items if there are many
    const initial: Record<number, boolean> = {};
    items.forEach((_, idx) => { initial[idx] = items.length > 1; });
    return initial;
  });

  // ── Drag state ──
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const toggleMinimize = (idx: number) => {
    setMinimizedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const expandAll = () => {
    const next: Record<number, boolean> = {};
    items.forEach((_, idx) => { next[idx] = false; });
    setMinimizedItems(next);
  };

  const collapseAll = () => {
    const next: Record<number, boolean> = {};
    items.forEach((_, idx) => { next[idx] = true; });
    setMinimizedItems(next);
  };

  const addItem = () => {
    setCollapsed(false);
    const contextualTemplate = getContextualArrayItemTemplate(componentType, fieldKey);
    if (items.length === 0) {
      onChange([getEmptyArrayItemTemplate(fieldKey, templateValue, componentType)]);
      setMinimizedItems({ 0: false });
      return;
    }
    let template = contextualTemplate
      ? getEmptyArrayItemTemplate(fieldKey, templateValue, componentType)
      : JSON.parse(JSON.stringify(items[0]));
    if (!contextualTemplate) {
      clearValues(template);
      template = applyArrayItemDefaults(fieldKey, template);
    }
    const newItems = [...items, template];
    onChange(newItems);
    // Expand the new item, keep others as-is
    setMinimizedItems(prev => ({ ...prev, [newItems.length - 1]: false }));
  };

  const removeItem = (idx: number) => {
    const newItems = items.filter((_, i) => i !== idx);
    onChange(newItems);
    // Re-index minimized states
    const next: Record<number, boolean> = {};
    newItems.forEach((_, i) => {
      const oldIdx = i >= idx ? i + 1 : i;
      next[i] = minimizedItems[oldIdx] ?? true;
    });
    setMinimizedItems(next);
  };

  const updateItem = (idx: number, newVal: any) => {
    const updated = [...items];
    updated[idx] = newVal;
    onChange(updated);
  };

  // ── Drag handlers ──
  const handleDragStart = useCallback((e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    // Make the drag image semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDragIdx(null);
    setDragOverIdx(null);
    dragCounter.current = 0;
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIdx(idx);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIdx(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    const sourceIdx = dragIdx;
    setDragIdx(null);
    setDragOverIdx(null);

    if (sourceIdx === null || sourceIdx === targetIdx) return;

    const newItems = [...items];
    const [moved] = newItems.splice(sourceIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    onChange(newItems);

    // Re-map minimized states
    const next: Record<number, boolean> = {};
    newItems.forEach((_, i) => {
      // Find the original index of this item after the move
      let origIdx: number;
      if (sourceIdx < targetIdx) {
        if (i < sourceIdx) origIdx = i;
        else if (i < targetIdx) origIdx = i + 1;
        else if (i === targetIdx) origIdx = sourceIdx;
        else origIdx = i;
      } else {
        if (i < targetIdx) origIdx = i;
        else if (i === targetIdx) origIdx = sourceIdx;
        else if (i <= sourceIdx) origIdx = i - 1;
        else origIdx = i;
      }
      next[i] = minimizedItems[origIdx] ?? true;
    });
    setMinimizedItems(next);
  }, [dragIdx, items, onChange, minimizedItems]);

  // ── Move up/down buttons ──
  const moveItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
    onChange(newItems);
    // Swap minimized states
    setMinimizedItems(prev => ({
      ...prev,
      [idx]: prev[targetIdx] ?? true,
      [targetIdx]: prev[idx] ?? true,
    }));
  };

  const displayItems = collapsed ? items.slice(0, 2) : items;
  const allMinimized = items.length > 0 && items.every((_, idx) => minimizedItems[idx]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
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
        <div className="flex gap-1.5 items-center">
          {/* Expand/Collapse all toggle */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={allMinimized ? expandAll : collapseAll}
              className="text-[11px] px-2 py-0.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={allMinimized ? 'Expand all items' : 'Collapse all items'}
            >
              {allMinimized ? 'Expand All' : 'Collapse All'}
            </button>
          )}
          {items.length > 3 && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
            >
              {collapsed ? 'Show all' : 'Show less'}
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

      {/* Items list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
        {displayItems.map((item, idx) => {
          const isMinimized = minimizedItems[idx] ?? false;
          const isDragOver = dragOverIdx === idx && dragIdx !== idx;
          const preview = getItemPreview(item);

          return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragEnter={(e) => handleDragEnter(e, idx)}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              className={`relative group transition-colors ${
                isDragOver
                  ? 'bg-brand-50 dark:bg-brand-900/20 border-t-2 border-brand-400'
                  : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20'
              } ${dragIdx === idx ? 'opacity-50' : ''}`}
            >
              {/* Item header (always visible) */}
              <div className="flex items-center gap-2 px-4 py-2.5">
                {/* Drag handle */}
                <button
                  type="button"
                  className="cursor-grab active:cursor-grabbing p-0.5 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition-colors flex-shrink-0"
                  title="Drag to reorder"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="6" r="1.5" />
                    <circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" />
                    <circle cx="15" cy="18" r="1.5" />
                  </svg>
                </button>

                {/* Minimize toggle */}
                <button
                  type="button"
                  onClick={() => toggleMinimize(idx)}
                  className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0"
                  title={isMinimized ? 'Expand item' : 'Minimize item'}
                >
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isMinimized ? '' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Item label & preview */}
                <div className="flex-1 min-w-0 flex items-center gap-2" onClick={() => toggleMinimize(idx)} style={{ cursor: 'pointer' }}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">
                    Item {idx + 1}
                  </span>
                  {preview && (
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      — {preview}
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Move up */}
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  {/* Move down */}
                  <button
                    type="button"
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    className="p-1 text-gray-300 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove item"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Item content (collapsible) */}
              {!isMinimized && (
                <div className="px-4 pb-4">
                  {typeof item === 'object' && item !== null ? (
                    <ObjectFields
                      data={item}
                      onChange={(newVal) => updateItem(idx, newVal)}
                      depth={depth + 1}
                      templateData={Array.isArray(templateValue) ? (templateValue[idx] || templateValue[0]) : undefined}
                      contextData={item}
                      objectKey={fieldKey}
                      componentType={componentType}
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
              )}
            </div>
          );
        })}
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

function buildNewsContent(news: News | null, currentContent: Record<string, any>) {
  if (!news) {
    return {
      ...currentContent,
      newsId: '',
    };
  }

  return {
    ...currentContent,
    newsId: news.id,
    image: news.news_thumbnail || currentContent.image || '',
    title: {
      en: news.title_en || '',
      id: news.title_id || news.title_en || '',
    },
    description: {
      en: news.excerpt_en || '',
      id: news.excerpt_id || news.excerpt_en || '',
    },
    date: news.news_date || news.published_at || currentContent.date || '',
    url: news.slug ? `/news/${news.slug}` : currentContent.url || '',
    slug: news.slug || currentContent.slug || '',
  };
}

function normalizeDateInputValue(value: any): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : trimmed;
}

function normalizeInitiativeEditorItem(data: Record<string, any>) {
  const content = data.content && typeof data.content === 'object' && !Array.isArray(data.content)
    ? data.content
    : {};

  return {
    id: data.id ?? '',
    topLogo: data.topLogo ?? data.top_logo ?? data.logo ?? '',
    source: normalizeInitiativeSource(data.source),
    content: {
      newsId: content.newsId ?? content.news_id ?? data.newsId ?? data.news_id ?? '',
      image: content.image ?? data.image ?? data.thumbnail ?? '',
      title: content.title ?? data.title ?? { en: '', id: '' },
      description: content.description ?? content.desc ?? data.description ?? data.desc ?? { en: '', id: '' },
      date: content.date ?? data.date ?? data.published_at ?? data.publishedAt ?? '',
      url: content.url ?? data.url ?? data.href ?? data.link ?? data.ctaUrl ?? data.cta_url ?? '',
      slug: content.slug ?? data.slug ?? '',
    },
    target: normalizeInitiativeTarget(data.target ?? data.urlTarget ?? data.url_target ?? content.target),
  };
}

function InitiativeItemFields({
  data,
  onChange,
}: {
  data: Record<string, any>;
  onChange: (newData: Record<string, any>) => void;
}) {
  const normalized = normalizeInitiativeEditorItem(data || {});
  const content = normalized.content;
  const baseItem = {
    id: normalized.id,
    topLogo: normalized.topLogo,
    source: normalized.source,
    content,
    target: normalized.target,
  };

  const updateField = (key: string, value: any) => {
    onChange({
      ...baseItem,
      [key]: value,
    });
  };

  const updateContentField = (key: string, value: any) => {
    onChange({
      ...baseItem,
      content: {
        ...content,
        [key]: value,
      },
    });
  };

  const updateNewsContent = (news: News | null) => {
    onChange({
      ...baseItem,
      source: 'news',
      content: buildNewsContent(news, content),
    });
  };

  return (
    <div className="pl-3 border-l-2 border-brand-200 dark:border-brand-800/40">
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <div className="col-span-2">
          <StringField
            label="Top Logo"
            fieldKey="topLogo"
            value={normalized.topLogo}
            onChange={(value) => updateField('topLogo', value)}
            componentType="highlighting_real_initiatives"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <SelectField
            label="Source"
            fieldKey="source"
            value={normalized.source}
            onChange={(value) => updateField('source', normalizeInitiativeSource(value))}
            options={[
              { value: 'manual', label: 'Manual' },
              { value: 'news', label: 'Data News' },
            ]}
            componentType="highlighting_real_initiatives"
          />
        </div>

        <div className="col-span-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Content</p>
            {normalized.source === 'news' ? (
              <NewsSelectField
                label="News"
                fieldKey="newsId"
                value={content.newsId}
                onChange={(value) => updateContentField('newsId', value)}
                onSelectNews={updateNewsContent}
                componentType="highlighting_real_initiatives"
              />
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                <div className="col-span-2">
                  <StringField
                    label="Image"
                    fieldKey="image"
                    value={content.image}
                    onChange={(value) => updateContentField('image', value)}
                    componentType="highlighting_real_initiatives"
                  />
                </div>
                <div className="col-span-2">
                  <MultilingualField
                    label="Title"
                    fieldKey="title"
                    value={normalizeLocalizedText(content.title)}
                    onChange={(value) => updateContentField('title', value)}
                    componentType="highlighting_real_initiatives"
                  />
                </div>
                <div className="col-span-2">
                  <MultilingualField
                    label="Desc"
                    fieldKey="description"
                    value={normalizeLocalizedText(content.description)}
                    onChange={(value) => updateContentField('description', value)}
                    componentType="highlighting_real_initiatives"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <FieldWrapper helper={getHelperText('date', 'highlighting_real_initiatives')}>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      value={normalizeDateInputValue(content.date)}
                      onChange={(e) => updateContentField('date', e.target.value)}
                    />
                  </FieldWrapper>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <StringField
                    label="URL"
                    fieldKey="url"
                    value={content.url}
                    onChange={(value) => updateContentField('url', value)}
                    componentType="highlighting_real_initiatives"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <SelectField
            label="Target URL"
            fieldKey="target"
            value={normalized.target}
            onChange={(value) => updateField('target', normalizeInitiativeTarget(value))}
            options={[
              { value: '_self', label: 'Self' },
              { value: '_blank', label: 'Blank' },
            ]}
            componentType="highlighting_real_initiatives"
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// OBJECT FIELDS (recursive, with 2-column grid for short fields)
// =============================================================================

function renderField(
  key: string,
  value: any,
  handleFieldChange: (key: string, val: any) => void,
  depth: number,
  templateValue?: any,
  componentType?: string,
  contextData?: Record<string, any>
): { element: React.ReactNode; wide: boolean } {
  const label = getDataDrivenFieldLabel(componentType, key) || humanize(key);
  const fieldProps: FieldProps = { label, fieldKey: key, value, onChange: (v) => handleFieldChange(key, v), depth, templateValue, componentType, contextData };

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
  if (key === 'align') {
    return { element: <SelectField key={key} {...fieldProps} options={['left', 'center', 'right']} />, wide: false };
  }
  if (key === 'as') {
    return { element: <SelectField key={key} {...fieldProps} options={['h1', 'h2', 'h3', 'h4', 'h5', 'h6']} />, wide: false };
  }
  if (key === 'layout') {
    const layoutOptions = componentType === 'report_list'
      ? [{ value: 'list', label: 'Grouped list' }, { value: 'grid', label: 'Card grid' }]
      : componentType === 'announcement_list'
        ? [{ value: 'list', label: 'Grouped cover cards' }, { value: 'grid', label: 'Document card grid' }, { value: 'compact', label: 'Compact list' }]
        : ['grid', 'list', 'carousel'];
    return { element: <SelectField key={key} {...fieldProps} options={layoutOptions} />, wide: false };
  }
  if (key === 'layoutVariant' || key === 'layout_variant') {
    return { element: <SelectField key={key} {...fieldProps} options={LAYOUT_VARIANT_OPTIONS} />, wide: false };
  }
  if (key === 'theme') {
    return { element: <SelectField key={key} {...fieldProps} options={['light', 'dark']} />, wide: false };
  }
  if (key === 'variant') {
    return { element: <SelectField key={key} {...fieldProps} options={uniqueOptions([...CTA_VARIANT_OPTIONS, ...USP_VARIANT_OPTIONS])} />, wide: false };
  }
  if (key === 'usp_variant') {
    return { element: <SelectField key={key} {...fieldProps} options={USP_VARIANT_OPTIONS} />, wide: false };
  }
  if (key === 'link_type' || key === 'linkType') {
    return { element: <SelectField key={key} {...fieldProps} options={LINK_TYPE_OPTIONS} />, wide: false };
  }
  if (isActionModalField(key)) {
    return { element: <SelectField key={key} {...fieldProps} options={ACTION_MODAL_OPTIONS} />, wide: false };
  }
  if (key === 'size_hero') {
    return { element: <SelectField key={key} {...fieldProps} options={['lnHero__medium', 'lnHero__small']} />, wide: false };
  }
  if (key === 'order' || key === 'sort_by' || key === 'order_by') {
    const options = getSortByOptions(componentType);
    return { element: <SelectField key={key} {...fieldProps} options={options} />, wide: false };
  }
  if (key === 'sort_direction') {
    return { element: <SelectField key={key} {...fieldProps} options={[{ value: 'desc', label: 'Newest / Descending' }, { value: 'asc', label: 'Oldest / Ascending' }]} />, wide: false };
  }
  if (key === 'state' && (componentType === 'events_list' || componentType === 'event_related')) {
    return { element: <SelectField key={key} {...fieldProps} options={['all', 'upcoming', 'ongoing', 'ended']} />, wide: false };
  }
  if (componentType === 'highlighting_real_initiatives' && isSectionToggleField(key)) {
    return {
      element: (
        <BooleanField
          key={key}
          {...fieldProps}
          value={normalizeBooleanLike(value)}
          onChange={(v) => handleFieldChange(key, v)}
        />
      ),
      wide: false,
    };
  }
  if (key === 'source') {
    return { element: <SelectField key={key} {...fieldProps} options={getSourceOptions(componentType)} />, wide: false };
  }
  if (key === 'card_style') {
    return { element: <SelectField key={key} {...fieldProps} options={getCardStyleOptions(componentType)} />, wide: false };
  }
  if (key === 'report_type_id') {
    return { element: <ReportTypeSelectField key={key} {...fieldProps} />, wide: false };
  }
  if (key === 'report_section_id') {
    return { element: <ReportSectionSelectField key={key} {...fieldProps} />, wide: false };
  }
  if (key === 'announcement_type_id') {
    return { element: <AnnouncementTypeSelectField key={key} {...fieldProps} />, wide: false };
  }
  if (key === 'announcement_section_id') {
    return { element: <AnnouncementSectionSelectField key={key} {...fieldProps} />, wide: false };
  }
  if (key === 'category_sort_by' || key === 'categorySortBy') {
    return { element: <SelectField key={key} {...fieldProps} options={['default', 'label_asc', 'label_desc', 'slug_asc', 'slug_desc']} />, wide: false };
  }
  if (key === 'logo_display_limit' || key === 'logoDisplayLimit' || key === 'show_data_per' || key === 'showDataPer') {
    return { element: <SelectField key={key} {...fieldProps} options={['10', '15', '20', '25']} />, wide: false };
  }
  if (key === 'category_id' || key === 'categoryId' || key === 'category_slug' || key === 'categorySlug') {
    return { element: <NewsCategorySelectField key={key} {...fieldProps} />, wide: false };
  }
  if (isIconField(key)) {
    return { element: <IconField key={key} {...fieldProps} />, wide: false };
  }
  if (key === 'award_ids' || key === 'awardIds') {
    return { element: <AwardIdsField key={key} {...fieldProps} />, wide: true };
  }
  if (key === 'news_ids' || key === 'newsIds' || key === 'selected_news_ids' || key === 'selectedNewsIds') {
    return { element: <NewsIdsField key={key} {...fieldProps} />, wide: true };
  }
  if (key === 'channel_ids' || key === 'channelIds' || key === 'logo_channel_ids' || key === 'logoChannelIds') {
    return { element: <MediaIdsField key={key} label={label} value={value} onChange={(v) => handleFieldChange(key, v)} kind="channel" />, wide: true };
  }
  if (key === 'genre_ids' || key === 'genreIds' || key === 'genre_names' || key === 'genreNames') {
    return { element: <MediaGenreField key={key} label={label} value={value} onChange={(v) => handleFieldChange(key, v)} />, wide: true };
  }
  if (key === 'reel_item_ids' || key === 'reelItemIds' || key === 'highlight_item_ids' || key === 'highlightItemIds') {
    return { element: <MediaIdsField key={key} label={label} value={value} onChange={(v) => handleFieldChange(key, v)} kind="reel_item" />, wide: true };
  }
  if (key === 'highlight_categories' || key === 'highlightCategories') {
    return { element: <MediaHighlightCategoriesField key={key} label={label} value={value} onChange={(v) => handleFieldChange(key, v)} />, wide: true };
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
    const objectHelper = getObjectHelperText(key);

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
            {objectHelper && (
              <p className="px-4 pt-3 text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
                {objectHelper}
              </p>
            )}
            <div className="p-4">
              <ObjectFields
                data={value}
                onChange={(v) => handleFieldChange(key, v)}
                depth={depth + 1}
                templateData={templateValue}
                contextData={value}
                objectKey={key}
                componentType={componentType}
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

const CONTEXTUAL_FIELD_ORDER: Record<string, Record<string, string[]>> = {
  key_highlight: {
    slides: ['image', 'value', 'delta', 'caption'],
  },
  highlighting_real_initiatives: {
    initiatives: ['topLogo', 'source', 'content', 'target'],
    partnerLogos: ['url', 'alt'],
  },
  usp_grid: {
    items: ['iconURL', 'title', 'description'],
    uspList: ['iconURL', 'title', 'description'],
  },
  info_contacts: {
    contact_items: ['iconLeft', 'iconRight', 'label', 'value', 'url', 'target'],
  },
  usp_grid_slider: {
    items: ['logo', 'title', 'desc', 'ctaList', 'bodyTitle', 'list'],
  },
  milestone: {
    list: ['text'],
  },
};

function shouldHideContextualField(key: string, componentType?: string, objectKey?: string): boolean {
  if (componentType === 'milestone' && objectKey === 'list' && key === 'icon') {
    return true;
  }

  if (componentType === 'usp_grid_slider' && objectKey === 'items' && key === 'iconListDefault') {
    return true;
  }

  return false;
}

function orderObjectFieldEntries(
  entries: [string, any][],
  componentType?: string,
  objectKey?: string
): [string, any][] {
  const order = componentType && objectKey
    ? CONTEXTUAL_FIELD_ORDER[componentType]?.[objectKey]
    : undefined;

  if (!order) return entries;

  const position = new Map(order.map((key, index) => [key, index]));

  return [...entries].sort(([keyA], [keyB]) => {
    const a = position.get(keyA);
    const b = position.get(keyB);

    if (a !== undefined && b !== undefined) return a - b;
    if (a !== undefined) return -1;
    if (b !== undefined) return 1;
    return 0;
  });
}

function ObjectFields({
  data,
  onChange,
  depth = 0,
  excludeKeys = [],
  templateData,
  contextData,
  objectKey,
  componentType,
}: {
  data: Record<string, any>;
  onChange: (newData: Record<string, any>) => void;
  depth?: number;
  excludeKeys?: string[];
  templateData?: Record<string, any>;
  contextData?: Record<string, any>;
  objectKey?: string;
  componentType?: string;
}) {
  const editorData: Record<string, any> = componentType === 'info_contacts' && objectKey === 'contact_items'
    ? (() => {
        const { icon, icon_left, icon_right, type, ...rest } = data || {};

        return {
          ...rest,
          iconLeft: rest.iconLeft ?? icon_left ?? icon ?? '',
          iconRight: rest.iconRight ?? icon_right ?? '',
          label: normalizeLocalizedText(data?.label),
          value: normalizeLocalizedText(data?.value ?? data?.text),
        };
      })()
    : (data || {});

  const isInfoContactItem = componentType === 'info_contacts' && objectKey === 'contact_items';

  if (componentType === 'highlighting_real_initiatives' && objectKey === 'initiatives') {
    return <InitiativeItemFields data={editorData} onChange={onChange} />;
  }

  if (!isInfoContactItem && isCtaListItem(editorData)) {
    return (
      <div className={`${depth > 0 ? 'pl-3 border-l-2 border-brand-200 dark:border-brand-800/40' : ''}`}>
        <CtaListModule value={editorData} onChange={onChange} />
      </div>
    );
  }

  if (isSingleButtonSettings(editorData)) {
    return (
      <div className={`${depth > 0 ? 'pl-3 border-l-2 border-brand-200 dark:border-brand-800/40' : ''}`}>
        <CtaListModule
          value={normalizeSingleButtonSettings(editorData)}
          onChange={(nextCta) => onChange(applySingleButtonSettings(editorData, nextCta))}
        />
      </div>
    );
  }

  const handleFieldChange = (key: string, newVal: any) => {
    const nextData = { ...editorData, [key]: newVal };

    if (key === 'report_type_id') {
      nextData.report_section_id = '';
    }
    if (key === 'announcement_type_id') {
      nextData.announcement_section_id = '';
    }
    if (key === 'latest_only' && newVal === true) {
      nextData.limit = 1;
    }

    onChange(nextData);
  };

  const visibilityContext = contextData || data || {};
  const entries = orderObjectFieldEntries(
    Object.entries(editorData).filter(([key]) =>
      !excludeKeys.includes(key) &&
      !shouldHideField(key, visibilityContext, componentType, objectKey) &&
      !shouldHideContextualField(key, componentType, objectKey)
    ),
    componentType,
    objectKey
  );

  // Render fields into a smart grid: wide fields get full width, short fields share a row
  const rendered = entries.map(([key, value]) => {
    const { element, wide } = renderField(key, value, handleFieldChange, depth, templateData?.[key], componentType, visibilityContext);
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
    else if (Array.isArray(val)) {
      if (val.length > 0) {
        const template = JSON.parse(JSON.stringify(val[0]));
        clearValues(template);
        obj[key] = [template];
      } else {
        obj[key] = [];
      }
    }
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
    layout: true,
    content: true,
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
  const defaultSettings = registryEntry?.defaultData || {};

  const handleSettingsChange = (newSettings: ComponentSettings) => {
    const normalizedSettings = normalizeSettingsForEditor(newSettings, selectedComponent.type);
    updateComponent(
      selectedComponentId,
      isDataDrivenComponent(selectedComponent.type)
        ? normalizeDataDrivenSettings(selectedComponent.type, normalizedSettings)
        : normalizedSettings
    );
  };

  // Categorize fields into groups
  const normalizedSelectedSettings = normalizeSettingsForEditor(selectedComponent.settings || {}, selectedComponent.type);
  const componentEditorDefaults = selectedComponent.type === 'sliders_hero'
    ? {
        thumbsVisible: false,
        showFinderEnterprise: false,
        solutionsFinderEnterpriseClassName: '',
      }
    : {};
  const settings = isDataDrivenComponent(selectedComponent.type) ? normalizeDataDrivenSettings(selectedComponent.type, {
    ...componentEditorDefaults,
    ...(selectedComponent.type === 'awards_marquee' ? { award_ids: [] } : {}),
    ...(['news_highlight', 'news_featured'].includes(selectedComponent.type) ? { news_ids: [] } : {}),
    ...normalizedSelectedSettings,
  }) : {
    ...componentEditorDefaults,
    ...(selectedComponent.type === 'awards_marquee' ? { award_ids: [] } : {}),
    ...(['news_highlight', 'news_featured'].includes(selectedComponent.type) ? { news_ids: [] } : {}),
    ...normalizedSelectedSettings,
  };
  const groups: Record<string, Record<string, any>> = {
    layout: {},
    content: {},
    button: {},
    items: {},
    advanced: {},
  };

  const hiddenFields = TYPE_HIDDEN_FIELDS[selectedComponent.type] || [];

  for (const [key, value] of Object.entries(settings)) {
    if (hiddenFields.includes(key)) continue;
    // CTA arrays belong with buttons; other arrays are content lists/items.
    if (Array.isArray(value)) {
      if (BUTTON_KEYS.some(bk => key.startsWith(bk) || key === bk)) {
        groups.button[key] = value;
      } else {
        groups.items[key] = value;
      }
    } else if (COMMON_FIELD_KEYS.includes(key)) {
      groups.advanced[key] = value;
    } else {
      const group = classifyField(key);
      groups[group][key] = value;
    }
  }

  // Remove empty groups
  const groupOrder = TYPE_GROUP_ORDER[selectedComponent.type] || GROUP_ORDER;
  const activeGroups = groupOrder
    .map((groupKey) => [groupKey, groups[groupKey]] as [string, Record<string, any>])
    .filter(([, data]) => Object.keys(data).length > 0);

  const sectionConfig: Record<string, { title: string; icon: React.ReactNode }> = {
    layout: { title: 'Layout', icon: <LayoutIcon /> },
    content: { title: 'Content', icon: <ContentIcon /> },
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
          selectedComponent.type === 'list_report_home' ? (
            React.createElement(TYPE_SPECIFIC_EDITORS[selectedComponent.type], {
              settings,
              onChange: handleSettingsChange,
            })
          ) : (
            <div className="p-4">
              {React.createElement(TYPE_SPECIFIC_EDITORS[selectedComponent.type], {
                settings,
                onChange: handleSettingsChange,
              })}
            </div>
          )
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
                      templateData={defaultSettings}
                      contextData={settings}
                      componentType={selectedComponent.type}
                      onChange={(newGroupData) => {
                        // Preserve hidden/unrendered keys while replacing the edited group.
                        const merged: Record<string, any> = { ...settings };
                        for (const key of Object.keys(groupData)) {
                          delete merged[key];
                        }
                        Object.assign(merged, newGroupData);
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
