type Settings = Record<string, any>;

const COMMON_SETTINGS = [
  'introData',
  'config',
  'ctaList',
];

const DATA_DRIVEN_ALLOWED_FIELDS: Record<string, string[]> = {
  contact_us: [
    'introData',
    'form_fields',
  ],
  content_highlights: [
    ...COMMON_SETTINGS,
    'categories',
    'limit',
    'sort_by',
    'sort_direction',
  ],
  news_highlight: [
    ...COMMON_SETTINGS,
    'source',
    'news_ids',
    'limit',
    'featured_count',
    'grid_count',
    'sort_by',
    'sort_direction',
    'show_category',
    'show_date',
  ],
  news_featured: [
    ...COMMON_SETTINGS,
    'source',
    'news_ids',
    'limit',
    'featured_count',
    'grid_count',
    'sort_by',
    'sort_direction',
    'show_category',
    'show_date',
  ],
  news_list: [
    ...COMMON_SETTINGS,
    'category_id',
    'category_slug',
    'limit',
    'sort_by',
    'sort_direction',
    'layout',
    'card_style',
    'show_search',
    'show_category_filter',
    'show_pagination',
    'display_image',
    'display_description',
    'show_date',
    'show_category',
    'search_placeholder',
    'search_button_text',
  ],
  news_feed: [
    ...COMMON_SETTINGS,
    'category_slug',
    'limit',
    'sort_by',
    'sort_direction',
    'show_pagination',
  ],
  news_teaser: [
    ...COMMON_SETTINGS,
    'name',
    'category_id',
    'category_slug',
    'limit',
    'sort_by',
    'sort_direction',
  ],
  report_list: [
    ...COMMON_SETTINGS,
    'report_type_id',
    'report_section_id',
    'report_type_slug',
    'report_section_slug',
    'limit',
    'sort_by',
    'sort_direction',
    'layout',
    'card_style',
    'display_image',
    'display_description',
    'show_search',
    'show_type_filter',
    'show_section_filter',
    'show_year_filter',
    'show_pagination',
  ],
  report_grid: [
    ...COMMON_SETTINGS,
    'report_type_id',
    'report_section_id',
    'report_type_slug',
    'report_section_slug',
    'limit',
    'sort_by',
    'sort_direction',
    'card_style',
    'display_image',
    'display_description',
    'show_pagination',
    'data',
  ],
  report_list_part: [
    ...COMMON_SETTINGS,
    'report_type_id',
    'report_section_id',
    'report_type_slug',
    'report_section_slug',
    'limit',
    'sort_by',
    'sort_direction',
    'display_description',
    'data',
  ],
  list_report_home: [
    ...COMMON_SETTINGS,
    'tabs',
    'items',
  ],
  maps_coverage_v1: [
    ...COMMON_SETTINGS,
    'name',
    'source',
    'widgetData',
  ],
  announcement_list: [
    ...COMMON_SETTINGS,
    'announcement_type_id',
    'announcement_section_id',
    'announcement_type_slug',
    'announcement_section_slug',
    'latest_only',
    'limit',
    'sort_by',
    'sort_direction',
    'layout',
    'card_style',
    'show_publish_date',
    'show_cta',
    'show_search',
    'show_type_filter',
    'show_section_filter',
    'show_year_filter',
    'show_pagination',
  ],
  events_list: [
    ...COMMON_SETTINGS,
    'state',
    'limit',
    'sort_by',
    'sort_direction',
    'itemsPerRow',
    'showPagination',
  ],
  event_related: [
    ...COMMON_SETTINGS,
    'state',
    'limit',
    'sort_by',
    'sort_direction',
  ],
  awards_list: [
    ...COMMON_SETTINGS,
    'limit',
    'sort_by',
    'sort_direction',
    'show_year_filter',
    'show_image',
    'show_pagination',
    'columns',
  ],
  solutions_list: [
    'introData',
    'order_by',
    'sort_direction',
    'show_filter_industry',
    'show_filter_business_scale',
    'show_filter_business_needs',
    'max_data_per_category',
  ],
  tv_channel_list: [
    ...COMMON_SETTINGS,
    'channel_ids',
    'genre_ids',
    'limit',
    'sort_by',
    'sort_direction',
    'tabs',
  ],
  tv_channel_sneak_peek: [
    ...COMMON_SETTINGS,
    'channel_ids',
    'genre_ids',
    'limit',
    'sort_by',
    'sort_direction',
  ],
  tv_highlight_sliders: [
    ...COMMON_SETTINGS,
    'reel_item_ids',
    'limit',
    'sort_by',
    'sort_direction',
  ],
  tv_highlight_sneek_peak: [
    ...COMMON_SETTINGS,
    'show',
    'highlight_categories',
    'logo_display_limit',
    'limit',
    'sort_by',
    'sort_direction',
  ],
};

const LEGACY_DROP_KEYS = [
  'data_source',
  'content_type',
  'tag_ids',
  'manual_ids',
  'include_ids',
  'exclude_ids',
  'published_only',
  'status',
  'search',
  'pagination',
  'empty_state',
  'featured_only',
];

const FIELD_ALIASES: Record<string, Record<string, string[]>> = {
  news_highlight: {
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  news_featured: {
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  content_highlights: {
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sortBy', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sortDirection', 'sort_order', 'sortOrder'],
  },
  news_list: {
    category_id: ['category_id', 'categoryId'],
    category_slug: ['category_slug', 'categorySlug', 'category'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
    show_pagination: ['show_pagination', 'showPagination'],
  },
  news_feed: {
    category_slug: ['category_slug', 'categorySlug'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  news_teaser: {
    category_id: ['category_id', 'categoryId'],
    category_slug: ['category_slug', 'categorySlug', 'category'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  report_list: {
    report_type_id: ['report_type_id', 'reportTypeId', 'type_id', 'typeId', 'category_id', 'categoryId'],
    report_section_id: ['report_section_id', 'reportSectionId', 'section_id', 'sectionId'],
    report_type_slug: ['report_type_slug', 'reportTypeSlug', 'type_slug', 'typeSlug', 'category_slug', 'categorySlug', 'report_type'],
    report_section_slug: ['report_section_slug', 'reportSectionSlug', 'section_slug', 'sectionSlug'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
    show_pagination: ['show_pagination', 'showPagination'],
  },
  report_grid: {
    report_type_id: ['report_type_id', 'reportTypeId', 'type_id', 'typeId', 'category_id', 'categoryId'],
    report_section_id: ['report_section_id', 'reportSectionId', 'section_id', 'sectionId'],
    report_type_slug: ['report_type_slug', 'reportTypeSlug', 'type_slug', 'typeSlug', 'category_slug', 'categorySlug'],
    report_section_slug: ['report_section_slug', 'reportSectionSlug', 'section_slug', 'sectionSlug'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  report_list_part: {
    report_type_id: ['report_type_id', 'reportTypeId', 'type_id', 'typeId', 'category_id', 'categoryId'],
    report_section_id: ['report_section_id', 'reportSectionId', 'section_id', 'sectionId'],
    report_type_slug: ['report_type_slug', 'reportTypeSlug', 'type_slug', 'typeSlug', 'category_slug', 'categorySlug'],
    report_section_slug: ['report_section_slug', 'reportSectionSlug', 'section_slug', 'sectionSlug'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  list_report_home: {
    report_type_id: ['report_type_id', 'reportTypeId', 'type_id', 'typeId', 'category_id', 'categoryId'],
    report_section_id: ['report_section_id', 'reportSectionId', 'section_id', 'sectionId'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  maps_coverage_v1: {
    source: ['source', 'data_source', 'dataSource'],
  },
  announcement_list: {
    announcement_type_id: ['announcement_type_id', 'announcementTypeId', 'type_id', 'typeId', 'category_id', 'categoryId'],
    announcement_section_id: ['announcement_section_id', 'announcementSectionId', 'section_id', 'sectionId'],
    announcement_type_slug: ['announcement_type_slug', 'announcementTypeSlug', 'type_slug', 'typeSlug', 'category_slug', 'categorySlug'],
    announcement_section_slug: ['announcement_section_slug', 'announcementSectionSlug', 'section_slug', 'sectionSlug'],
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
    show_pagination: ['show_pagination', 'showPagination'],
  },
  events_list: {
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
    showPagination: ['showPagination', 'show_pagination'],
  },
  event_related: {
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
  },
  awards_list: {
    limit: ['limit', 'max_data', 'maxData', 'per_page', 'perPage'],
    sort_by: ['sort_by', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sort_order'],
    show_pagination: ['show_pagination', 'showPagination'],
  },
  solutions_list: {
    order_by: ['order_by', 'orderBy', 'sort_by', 'sortBy', 'order'],
    sort_direction: ['sort_direction', 'sortDirection', 'sort_order'],
    show_filter_industry: ['show_filter_industry', 'showFilterIndustry'],
    show_filter_business_scale: ['show_filter_business_scale', 'showFilterBusinessScale'],
    show_filter_business_needs: ['show_filter_business_needs', 'showFilterBusinessNeeds'],
    max_data_per_category: ['max_data_per_category', 'maxDataPerCategory', 'limit', 'max_data', 'maxData'],
  },
  tv_channel_list: {
    channel_ids: ['channel_ids', 'channelIds'],
    genre_ids: ['genre_ids', 'genreIds', 'genre_names', 'genreNames', 'genres'],
    limit: ['limit', 'displayLimit', 'display_limit', 'max_data', 'maxData'],
    sort_by: ['sort_by', 'sortBy', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sortDirection', 'sort_order'],
  },
  tv_channel_sneak_peek: {
    channel_ids: ['channel_ids', 'channelIds'],
    genre_ids: ['genre_ids', 'genreIds', 'genre_names', 'genreNames', 'genres'],
    limit: ['limit', 'displayLimit', 'display_limit', 'max_data', 'maxData'],
    sort_by: ['sort_by', 'sortBy', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sortDirection', 'sort_order'],
  },
  tv_highlight_sliders: {
    reel_item_ids: ['reel_item_ids', 'reelItemIds', 'highlight_item_ids', 'highlightItemIds'],
    limit: ['limit', 'displayLimit', 'display_limit', 'max_data', 'maxData'],
    sort_by: ['sort_by', 'sortBy', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sortDirection', 'sort_order'],
  },
  tv_highlight_sneek_peak: {
    show: ['show', 'is_visible', 'isVisible', 'visible'],
    highlight_categories: ['highlight_categories', 'highlightCategories', 'categories'],
    logo_display_limit: ['logo_display_limit', 'logoDisplayLimit', 'show_data_per', 'showDataPer'],
    limit: ['limit', 'displayLimit', 'display_limit', 'max_data', 'maxData'],
    sort_by: ['sort_by', 'sortBy', 'sort', 'order'],
    sort_direction: ['sort_direction', 'sortDirection', 'sort_order'],
  },
};

export const DATA_DRIVEN_FIELD_LABELS: Record<string, Record<string, string>> = {
  report_list: {
    report_type_id: 'Report Type',
    report_section_id: 'Report Section',
    limit: 'Number of Reports',
    sort_by: 'Sort Reports By',
    sort_direction: 'Sort Direction',
    layout: 'Report Layout',
    card_style: 'Card Style',
    display_image: 'Show Cover Image',
    display_description: 'Show Description',
  },
  announcement_list: {
    announcement_type_id: 'Announcement Category',
    announcement_section_id: 'Announcement Section',
    latest_only: 'Latest Announcement Only',
    limit: 'Number of Announcements',
    sort_by: 'Sort Announcements By',
    sort_direction: 'Sort Direction',
    show_publish_date: 'Show Publish Date',
    show_cta: 'Show Section CTA',
  },
  news_list: {
    category_id: 'News Category',
    limit: 'Number of News Items',
    sort_by: 'Sort News By',
    sort_direction: 'Sort Direction',
    display_image: 'Show Thumbnail',
    display_description: 'Show Excerpt',
  },
  news_highlight: {
    source: 'Featured News Source',
    news_ids: 'Selected News',
    limit: 'Number of News Items',
    sort_by: 'Sort Featured News By',
    sort_direction: 'Sort Direction',
  },
  content_highlights: {
    categories: 'Content Categories',
    limit: 'Items per Category',
    sort_by: 'Sort Content By',
    sort_direction: 'Sort Direction',
  },
  events_list: {
    state: 'Event State',
    limit: 'Number of Events',
    sort_by: 'Sort Events By',
    sort_direction: 'Sort Direction',
    itemsPerRow: 'Cards per Row',
    showPagination: 'Show Pagination',
  },
  list_report_home: {
    tabs: 'Tabs',
    items: 'Items List',
    title: 'Title',
    desc: 'Desc',
    ctaList: 'CTA List',
    year: 'Year',
  },
  info_contacts: {
    contact_items: 'Contact Items',
    value: 'Text',
  },
  maps_coverage_v1: {
    name: 'Preset Name',
    source: 'Coverage Source',
    widgetData: 'Widget Copy',
  },
  tv_channel_list: {
    channel_ids: 'Channel IDs',
    genre_ids: 'Genre IDs',
    limit: 'Show Data Per',
    tabs: 'Channel Tabs',
  },
  tv_channel_sneak_peek: {
    channel_ids: 'Channel IDs',
    genre_ids: 'Genre IDs',
    limit: 'Show Data Per',
  },
  tv_highlight_sliders: {
    reel_item_ids: 'Reel Items',
    limit: 'Show Data Per',
  },
  tv_highlight_sneek_peak: {
    show: 'Show Section',
    highlight_categories: 'Reel Name Categories',
    logo_display_limit: 'Logo Show Data Per',
    limit: 'Highlight Show Data Per',
  },
  solutions_list: {
    order_by: 'Order By',
    sort_direction: 'Sort Direction',
    show_filter_industry: 'Show Industry Filter',
    show_filter_business_scale: 'Show Business Scale Filter',
    show_filter_business_needs: 'Show Business Needs Filter',
    max_data_per_category: 'Max Data per Category',
  },
};

export const DATA_DRIVEN_FIELD_HELPERS: Record<string, Record<string, string>> = {
  report_list: {
    report_type_id: 'Uses active Report Types from Report CMS.',
    report_section_id: 'Optional. Narrows reports to one active Report Section.',
    sort_by: 'Sort is applied by the public database query before rendering.',
  },
  announcement_list: {
    announcement_type_id: 'Uses active Announcement Types from Announcement CMS.',
    announcement_section_id: 'Optional. Narrows announcements to one active Announcement Section.',
    latest_only: 'For homepage teaser use cases, this forces the component to show only the latest item.',
  },
  news_list: {
    category_id: 'Uses active News Categories from News CMS.',
  },
  news_highlight: {
    source: 'CMS Highlights uses the News Highlight module. Selected News enables manual curated picks.',
  },
  content_highlights: {
    categories: 'Drag to reorder categories. Turn Is Visible off to hide a category from the public tabs.',
  },
  list_report_home: {
    tabs: 'Segment tabs shown in the homepage report carousel.',
    items: 'Manual child items grouped by each tab value. Empty arrays render no cards on the public page.',
  },
  maps_coverage_v1: {
    source: 'Detailed province/city data is managed in Map Coverage Management.',
  },
  solutions_list: {
    order_by: 'Solutions are loaded automatically from CMS Data Bank Solutions.',
    max_data_per_category: 'Limits visible cards in each industry group after filtering.',
  },
};

export function isDataDrivenComponent(type?: string): boolean {
  return Boolean(type && DATA_DRIVEN_ALLOWED_FIELDS[type]);
}

export function getDataDrivenFieldLabel(componentType: string | undefined, key: string): string | undefined {
  if (!componentType) return undefined;
  return DATA_DRIVEN_FIELD_LABELS[componentType]?.[key];
}

export function getDataDrivenFieldHelper(componentType: string | undefined, key: string): string | undefined {
  if (!componentType) return undefined;
  return DATA_DRIVEN_FIELD_HELPERS[componentType]?.[key];
}

export function getDataDrivenAllowedFields(componentType: string | undefined): string[] | null {
  if (!componentType) return null;
  return DATA_DRIVEN_ALLOWED_FIELDS[componentType] || null;
}

function getFirstPresent(settings: Settings, keys: string[]) {
  for (const key of keys) {
    const value = settings[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
}

function isLegacyGenericKey(key: string): boolean {
  return LEGACY_DROP_KEYS.includes(key);
}

export function normalizeDataDrivenSettings(componentType: string, settings: Settings): Settings {
  const allowed = DATA_DRIVEN_ALLOWED_FIELDS[componentType];
  if (!allowed) return settings;

  const aliases = FIELD_ALIASES[componentType] || {};
  const next: Settings = { ...(settings || {}) };

  for (const [canonicalKey, keys] of Object.entries(aliases)) {
    const value = getFirstPresent(next, keys);
    if (value !== undefined) {
      next[canonicalKey] = value;
    }
  }

  if (componentType === 'news_highlight' || componentType === 'news_featured') {
    if (!next.source) {
      next.source = next.data_source === 'selected_news' ? 'selected_news' : 'cms_highlights';
    }
    if (next.source !== 'selected_news' && Array.isArray(next.news_ids) && next.news_ids.length === 0) {
      delete next.news_ids;
    }
  }

  if (componentType === 'announcement_list' && next.latest_only === true) {
    next.limit = 1;
  }

  const allowedSet = new Set(allowed);
  const cleaned: Settings = {};

  for (const [key, value] of Object.entries(next)) {
    if (allowedSet.has(key)) {
      cleaned[key] = value;
      continue;
    }

    if (!isLegacyGenericKey(key) && key.startsWith('_')) {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
