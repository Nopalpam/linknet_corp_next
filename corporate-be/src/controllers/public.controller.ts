import { Request, Response } from 'express';
import { ContentStatus, Prisma, PrismaClient, PageStatus } from '@prisma/client';
import { isMainComponent } from '../constants/componentDefaults';
import { syncComponentInstance } from '../pageBuilder/migrationEngine';
import { getComponentSchema } from '../pageBuilder/schemaRegistry';
import { MapCoverageService } from '../services/mapCoverage.service';
import { ComponentVisibilityService } from '../services/componentVisibility.service';
import {
  buildStateWhere as buildEventStateWhere,
  EVENT_LIST_INCLUDE,
  EventPublicState,
  serializeEventList,
} from '../services/event.service';

const prisma = new PrismaClient();

const pageRenderSelect = {
  id: true,
  title: true,
  titleEn: true,
  titleId: true,
  slug: true,
  template: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  metaThumbnail: true,
  ogImage: true,
  product: true,
  promo: true,
  source: true,
  noindex: true,
  nofollow: true,
  showNavbar: true,
  showFooter: true,
  status: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  components: {
    where: { isVisible: true },
    orderBy: {
      order: 'asc' as const,
    },
    select: {
      id: true,
      type: true,
      data: true,
      order: true,
      isVisible: true,
    },
  },
};

const safeDecodeURIComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizePublicPageSlug = (value: string): string => {
  const decoded = safeDecodeURIComponent(value);
  const segments = decoded.split('/').filter(Boolean);

  // Support legacy/public preview aliases: /page/{slug} and /pages/{slug}.
  if ((segments[0] === 'page' || segments[0] === 'pages') && segments.length > 1) {
    return segments.slice(1).join('/');
  }

  return segments.join('/');
};

const filterInactiveComponents = async (components: any[]) => {
  const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();
  if (inactiveKeys.size === 0) return components;
  return components.filter((component) => !inactiveKeys.has(component.type));
};

const toJsonSafeValue = (value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(toJsonSafeValue);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toJsonSafeValue(nestedValue)])
    );
  }

  return value;
};

const isPlainObject = (value: any): value is Record<string, any> => (
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const getNewsOrderBy = (configOrOrder: Record<string, any> | string | undefined): any => {
  const config = typeof configOrOrder === 'object' && configOrOrder !== null ? configOrOrder : {};
  const legacyOrder = typeof configOrOrder === 'string' ? configOrOrder : undefined;
  const sort = readString(config, ['sort_by', 'sortBy', 'sort', 'order'], legacyOrder || 'news_date').toLowerCase();
  const sortOrder = readSortOrder(config, sort === 'oldest' ? 'asc' : 'desc');

  if (sort === 'oldest') return { news_date: 'asc' };
  if (sort === 'latest') return { news_date: 'desc' };
  if (sort === 'alphabetical' || sort === 'title') return { title_en: 'asc' };

  const fieldMap: Record<string, string> = {
    created_at: 'created_at',
    createdat: 'created_at',
    date: 'news_date',
    news_date: 'news_date',
    newsdate: 'news_date',
    published_at: 'published_at',
    publishedat: 'published_at',
    updated_at: 'updated_at',
    updatedat: 'updated_at',
  };

  return { [fieldMap[sort] || 'news_date']: sortOrder };
};

const getConfiguredNewsIds = (config: any): string[] => {
  const rawIds = config?.news_ids || config?.newsIds || config?.selected_news_ids || config?.selectedNewsIds;
  return Array.isArray(rawIds)
    ? rawIds.filter((id: any) => typeof id === 'string' && id.trim()).map((id: string) => id.trim())
    : [];
};

const orderNewsByConfiguredIds = (newsItems: any[], ids: string[]) => {
  const byId = new Map(newsItems.map((news) => [news.id, news]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
};

const splitFeaturedNews = (newsItems: any[], featuredCount: number, gridCount: number) => ({
  featured: newsItems.slice(0, featuredCount),
  grid: newsItems.slice(featuredCount, featuredCount + gridCount),
  news: newsItems,
});

async function getDatabaseNow() {
  const rows = await prisma.$queryRaw<{ now: Date }[]>`SELECT CURRENT_TIMESTAMP AS now`;
  return rows[0]?.now || new Date();
}

const publicNewsWhere = (now: Date, extra: Prisma.newsWhereInput = {}): Prisma.newsWhereInput => ({
  status: ContentStatus.PUBLISHED,
  visibility: 'PUBLIC',
  deleted_at: null,
  AND: [
    { OR: [{ published_at: null }, { published_at: { lte: now } }] },
    { news_categories: { is: { is_active: true, deleted_at: null } } },
  ],
  ...extra,
});

const readConfigValue = (config: Record<string, any>, keys: string[]) => (
  keys.map((key) => config[key]).find((value) => value !== undefined && value !== null && value !== '')
);

const readString = (config: Record<string, any>, keys: string[], fallback = ''): string => {
  const value = readConfigValue(config, keys);
  return typeof value === 'string' ? value.trim() : value == null ? fallback : String(value).trim();
};

const readBoolean = (config: Record<string, any>, keys: string[], fallback = false): boolean => {
  const value = readConfigValue(config, keys);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  if (typeof value === 'number') return value === 1;
  return fallback;
};

const readNumber = (
  config: Record<string, any>,
  keys: string[],
  fallback: number,
  min = 1,
  max = 100
): number => {
  const value = Number(readConfigValue(config, keys));
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.trunc(value), min), max);
};

const readLimit = (config: Record<string, any>, fallback = 12, max = 100) => readNumber(
  config,
  ['limit', 'max_data', 'maxData', 'per_page', 'perPage', 'items_per_page', 'itemsPerPage'],
  fallback,
  1,
  max
);

const readPage = (config: Record<string, any>) => readNumber(config, ['page', 'currentPage', 'current_page'], 1, 1, 10000);

const readSortOrder = (config: Record<string, any>, fallback: Prisma.SortOrder = 'desc'): Prisma.SortOrder => (
  readString(config, ['sort_direction', 'sortDirection', 'sort_order', 'sortOrder', 'direction'], fallback).toLowerCase() === 'asc' ? 'asc' : 'desc'
);

const buildPagination = (page: number, limit: number, total: number) => ({
  currentPage: page,
  totalPages: Math.ceil(total / limit) || 1,
  totalItems: total,
  itemsPerPage: limit,
});

const getEventOrderBy = (config: Record<string, any>): Prisma.eventsOrderByWithRelationInput => {
  const sort = readString(config, ['sort_by', 'sortBy', 'sort', 'sorting', 'order'], 'start_date').toLowerCase();
  const sortOrder = readSortOrder(config, sort === 'oldest' ? 'asc' : 'desc');
  const fieldMap: Record<string, keyof Prisma.eventsOrderByWithRelationInput> = {
    alphabetical: 'title',
    created_at: 'created_at',
    createdat: 'created_at',
    date: 'start_date',
    latest: 'start_date',
    newest: 'created_at',
    old: 'start_date',
    oldest: 'start_date',
    start_date: 'start_date',
    startdate: 'start_date',
    title: 'title',
    updated_at: 'updated_at',
    updatedat: 'updated_at',
  };
  const field = fieldMap[sort] || 'start_date';
  const direction = sort === 'oldest' ? 'asc' : sort === 'alphabetical' ? 'asc' : sortOrder;
  return { [field]: direction } as Prisma.eventsOrderByWithRelationInput;
};

const getReportOrderBy = (config: Record<string, any>) => {
  const sort = readString(config, ['sort_by', 'sortBy', 'sort', 'sorting', 'order'], 'year').toLowerCase();
  const sortOrder = readSortOrder(config, sort === 'oldest' || sort === 'sort_order' || sort === 'sortorder' ? 'asc' : 'desc');

  if (sort === 'alphabetical' || sort === 'title') {
    return [{ title: 'asc' as const }];
  }

  if (sort === 'published_at' || sort === 'publishedat') {
    return [{ published_at: sortOrder }, { year: sortOrder }, { sort_order: 'asc' as const }];
  }

  if (sort === 'sort_order' || sort === 'sortorder') {
    return [{ sort_order: 'asc' as const }, { year: 'desc' as const }];
  }

  const direction = sort === 'oldest' ? 'asc' : sort === 'latest' ? 'desc' : sortOrder;
  return [
    { year: direction },
    { published_at: direction },
    { created_at: direction },
    { sort_order: 'asc' as const },
  ];
};

const serializeReport = (report: any) => ({
  id: report.id,
  title: report.title || report.lnCardReport__title || '',
  lnCardReport__title: report.lnCardReport__title || report.title || '',
  description: report.description,
  subDescription: report.description || report.subDescription || report.sub_description || '',
  sub_description: report.description || report.subDescription || report.sub_description || '',
  image: report.cover_image || report.thumbnail || '',
  year: report.year,
  period: report.period,
  fileSize: report.file_size || '',
  file_size: report.file_size || '',
  downloadUrl: report.pdf_file || report.file_url || '',
  download_url: report.pdf_file || report.file_url || '',
  fileUrl: report.pdf_file || report.file_url || '',
  pdfFile: report.pdf_file || '',
  pdf_file: report.pdf_file || '',
  dataType: report.data_type || '',
  data_type: report.data_type || '',
  reportType: report.report_types?.name || '',
  report_type: report.report_types?.name || '',
  sectionName: report.report_sections?.name || '',
  section_name: report.report_sections?.name || '',
  auditStatus: report.audit_status || '',
  category: report.report_sections?.name || report.report_types?.name || '',
  date: report.period || (report.year ? String(report.year) : ''),
  slug: report.slug,
});

const serializeReports = (reports: any[]) => reports.map(serializeReport);

const DEFAULT_CONTENT_HIGHLIGHT_CATEGORIES = [
  { label: 'Insight', value: 'business-insight', source: 'news', category_slug: 'press-release', is_visible: true },
  { label: 'News', value: 'news', source: 'news', category_slug: 'news', is_visible: true },
  { label: 'Event', value: 'event', source: 'events', category_slug: '', is_visible: true },
];

const normalizeContentHighlightCategories = (config: Record<string, any>) => {
  const rawCategories = Array.isArray(config.categories) && config.categories.length > 0
    ? config.categories
    : DEFAULT_CONTENT_HIGHLIGHT_CATEGORIES;

  return rawCategories
    .map((category: any, index: number) => ({
      label: readString(category || {}, ['label', 'name', 'title'], `Category ${index + 1}`),
      value: readString(category || {}, ['value', 'slug', 'key'], `category-${index + 1}`),
      source: readString(category || {}, ['source', 'type'], 'news').toLowerCase(),
      category_slug: readString(category || {}, ['category_slug', 'categorySlug', 'slug']),
      href: readString(category || {}, ['href', 'url']),
      is_visible: readBoolean(category || {}, ['is_visible', 'isVisible', 'visible'], true),
      sort_order: readNumber(category || {}, ['sort_order', 'sortOrder', 'order'], index, 0, 1000),
      originalIndex: index,
    }))
    .filter((category: any) => category.is_visible !== false && category.value)
    .sort((a: any, b: any) => a.sort_order - b.sort_order || a.originalIndex - b.originalIndex);
};

const serializeContentHighlightNews = (newsItem: any, locale = 'en') => {
  const category = newsItem.news_categories;
  return {
    id: newsItem.id,
    slug: newsItem.slug,
    title: locale === 'id' ? newsItem.title_id || newsItem.title_en : newsItem.title_en || newsItem.title_id,
    title_en: newsItem.title_en,
    title_id: newsItem.title_id,
    image: newsItem.news_thumbnail || '',
    newsDate: newsItem.news_date,
    news_date: newsItem.news_date,
    author: newsItem.author || '',
    excerpt: locale === 'id' ? newsItem.excerpt_id || newsItem.excerpt_en : newsItem.excerpt_en || newsItem.excerpt_id,
    category: category ? {
      id: category.id,
      slug: category.slug,
      name: locale === 'id' ? category.name_id || category.name_en : category.name_en || category.name_id,
      name_en: category.name_en,
      name_id: category.name_id,
    } : null,
  };
};

async function fetchContentHighlightsComponentData(config: Record<string, any>) {
  const now = await getDatabaseNow();
  const locale = readString(config, ['locale', 'lang'], 'en');
  const limit = readLimit(config, 5, 20);
  const categories = normalizeContentHighlightCategories(config);
  const tabs = categories.map((category: any) => ({
    label: category.label,
    value: category.value,
    source: category.source,
    href: category.href,
  }));
  const items: Record<string, any[]> = {};

  await Promise.all(categories.map(async (category: any) => {
    if (category.source === 'event' || category.source === 'events') {
      const events = await prisma.events.findMany({
        where: { status: ContentStatus.PUBLISHED },
        include: EVENT_LIST_INCLUDE,
        orderBy: getEventOrderBy(config),
        take: limit,
      });
      items[category.value] = serializeEventList(events, locale);
      return;
    }

    const categoryWhere: Prisma.newsWhereInput = {};
    if (category.category_slug) {
      categoryWhere.news_categories = {
        is: {
          slug: category.category_slug,
          is_active: true,
          deleted_at: null,
        },
      };
    }

    const newsItems = await prisma.news.findMany({
      where: publicNewsWhere(now, categoryWhere),
      include: { news_categories: true },
      orderBy: getNewsOrderBy(config),
      take: limit,
    });

    items[category.value] = newsItems.map((item: any) => serializeContentHighlightNews(item, locale));
  }));

  return { tabs, items };
}

const LOCAL_HTTP_PROTOCOL = 'http';
const DEFAULT_HOME_REPORT_ICON = '/assets/icons/pdf-circle.svg';

const serializeHomeReportCard = (report: any) => ({
  id: report.id,
  iconSrc: DEFAULT_HOME_REPORT_ICON,
  title: report.report_types?.name || report.report_sections?.name || report.title || '',
  description: report.report_sections?.description || report.description || report.title || '',
  ctaText: 'View More',
  ctaLink: report.pdf_file || report.file_url || report.slug || '#',
  year: report.year ? String(report.year) : '',
});

const serializeHomeAnnouncementCard = (announcement: any) => ({
  id: announcement.id,
  iconSrc: DEFAULT_HOME_REPORT_ICON,
  title: announcement.announcement_types?.name || announcement.announcement_sections?.name || announcement.title || '',
  description: announcement.description || announcement.title || '',
  ctaText: 'View More',
  ctaLink: announcement.pdf_file || announcement.file_url || announcement.slug || '#',
  year: announcement.created_at ? String(new Date(announcement.created_at).getFullYear()) : '',
});

async function fetchEventsComponentData(config: Record<string, any>, related = false) {
  const page = related ? 1 : readPage(config);
  const limit = readLimit(config, related ? 4 : 12, 100);
  const locale = readString(config, ['locale', 'lang'], 'en');
  const currentEventId = readString(config, ['current_event_id', 'currentEventId']);
  const currentEventSlug = readString(config, ['current_event_slug', 'currentEventSlug']);
  const state = readString(config, ['state', 'status_filter', 'statusFilter']);

  const where: Prisma.eventsWhereInput = {
    status: ContentStatus.PUBLISHED,
  };

  const exclude = [
    ...(currentEventId ? [currentEventId] : []),
  ];

  const notClauses: Prisma.eventsWhereInput[] = [];
  if (exclude.length) notClauses.push({ id: { in: exclude } });
  if (currentEventSlug) notClauses.push({ slug: currentEventSlug });
  if (notClauses.length) where.NOT = notClauses;

  const eventState = state === 'past' ? 'ended' : state;
  if (['upcoming', 'ongoing', 'ended'].includes(eventState)) {
    const stateWhere = buildEventStateWhere(eventState as EventPublicState);
    if (stateWhere) {
      where.AND = [...(Array.isArray(where.AND) ? where.AND : []), stateWhere];
    }
  }

  const skip = related ? 0 : (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.events.findMany({
      where,
      include: EVENT_LIST_INCLUDE,
      skip,
      take: limit,
      orderBy: getEventOrderBy(config),
    }),
    prisma.events.count({ where }),
  ]);

  return {
    events: serializeEventList(items, locale),
    pagination: buildPagination(page, limit, total),
  };
}

async function buildReportWhere(config: Record<string, any>, now: Date): Promise<Prisma.reportsWhereInput> {
  const typeSlug = readString(config, ['report_type_slug', 'reportTypeSlug', 'type_slug', 'typeSlug', 'category_slug', 'categorySlug']);
  const sectionSlug = readString(config, ['report_section_slug', 'reportSectionSlug', 'section_slug', 'sectionSlug']);

  const where: Prisma.reportsWhereInput = {
    status: ContentStatus.PUBLISHED,
    is_active: true,
    deleted_at: null,
    AND: [
      { OR: [{ published_at: null }, { published_at: { lte: now } }] },
      { OR: [{ type_id: null }, { report_types: { is: { isActive: true, deletedAt: null } } }] },
      { OR: [{ section_id: null }, { report_sections: { is: { isActive: true, deletedAt: null, report_types: { is: { isActive: true, deletedAt: null } } } } }] },
    ],
  };

  const typeId = readString(config, ['report_type_id', 'reportTypeId', 'type_id', 'typeId', 'category_id', 'categoryId']);
  const sectionId = readString(config, ['report_section_id', 'reportSectionId', 'section_id', 'sectionId']);

  if (typeId) {
    where.type_id = typeId;
  } else if (typeSlug) {
    where.report_types = { is: { slug: typeSlug, isActive: true, deletedAt: null } };
  }

  if (sectionId) {
    where.section_id = sectionId;
  } else if (sectionSlug) {
    where.report_sections = {
      is: {
        slug: sectionSlug,
        isActive: true,
        deletedAt: null,
        report_types: { is: { isActive: true, deletedAt: null } },
      },
    };
  }

  return where;
}

async function fetchReportsComponentData(config: Record<string, any>, mode: 'grid' | 'part' | 'home') {
  const now = await getDatabaseNow();
  const limit = readLimit(config, mode === 'home' ? 12 : 9, mode === 'home' ? 200 : 100);
  const page = readPage(config);
  const where = await buildReportWhere(config, now);

  if (mode === 'home') {
    const [types, reports, announcements] = await Promise.all([
      prisma.reportType.findMany({
        where: { isActive: true, deletedAt: null },
        orderBy: { position: 'asc' },
      }),
      prisma.reports.findMany({
        where,
        include: { report_types: true, report_sections: true },
        orderBy: getReportOrderBy(config),
        take: limit,
      }),
      prisma.announcements.findMany({
        where: buildAnnouncementWhere({}),
        include: { announcement_sections: { include: { announcement_types: true } }, announcement_types: true },
        orderBy: getAnnouncementOrderBy(config),
        take: limit,
      }),
    ]);

    const configuredTabs = Array.isArray(config.tabs) && config.tabs.length > 0
      ? config.tabs
      : [
          { label: 'Report', value: 'report' },
          { label: 'Announcement', value: 'announcement' },
        ];
    const hasConfiguredItems = isPlainObject(config.items);
    const manualItems = hasConfiguredItems ? config.items : {};
    const reportItems = hasConfiguredItems
      ? (Array.isArray(manualItems.report) ? manualItems.report : [])
      : reports.map(serializeHomeReportCard);
    const announcementItems = hasConfiguredItems
      ? (Array.isArray(manualItems.announcement) ? manualItems.announcement : [])
      : announcements.map(serializeHomeAnnouncementCard);
    const items = configuredTabs.reduce<Record<string, any[]>>((acc, tab) => {
      const value = String(tab.value || '').trim();
      if (!value) return acc;
      if (value === 'report') acc[value] = reportItems;
      else if (value === 'announcement') acc[value] = announcementItems;
      else if (hasConfiguredItems) acc[value] = Array.isArray(manualItems[value]) ? manualItems[value] : [];
      else {
        acc[value] = serializeReports(reports.filter((report) => report.report_types?.slug === value));
      }
      return acc;
    }, {});

    return { tabs: configuredTabs.length > 0 ? configuredTabs : types.map((type) => ({ label: type.name, value: type.slug })), items };
  }

  const [items, total] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: { report_types: true, report_sections: true },
      orderBy: getReportOrderBy(config),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.reports.count({ where }),
  ]);
  const serializedItems = serializeReports(items);

  if (mode === 'part') {
    const first = items[0];
    return {
      id: first?.report_sections?.slug || first?.report_types?.slug || readString(config, ['sectionId', 'section_id'], 'reports'),
      header: {
        title: first?.report_sections?.name || first?.report_types?.name || readString(config, ['header_title', 'headerTitle', 'title'], 'Reports'),
        desc: first?.report_sections?.description || first?.report_types?.description || readString(config, ['header_description', 'headerDescription', 'description']),
      },
      items: serializedItems,
    };
  }

  return {
    items: serializedItems,
    pagination: buildPagination(page, limit, total),
  };
}

async function fetchReportListComponentData(config: Record<string, any>) {
  const now = await getDatabaseNow();
  const showAll = readBoolean(config, ['show_all', 'showAll'], true);
  const limit = showAll ? undefined : readNumber(config, ['fetch_limit', 'fetchLimit', 'data_limit', 'dataLimit'], 200, 1, 500);
  const page = 1;
  const where = await buildReportWhere(config, now);

  const [reports, total, types, sections] = await Promise.all([
    prisma.reports.findMany({
      where,
      include: { report_types: true, report_sections: true },
      orderBy: getReportOrderBy(config),
      ...(limit ? { take: limit } : {}),
    }),
    prisma.reports.count({ where }),
    prisma.reportType.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { position: 'asc' },
    }),
    prisma.reportSection.findMany({
      where: { isActive: true, deletedAt: null, report_types: { is: { isActive: true, deletedAt: null } } },
      include: { report_types: true },
      orderBy: { position: 'asc' },
    }),
  ]);

  const groupsById = new Map<string, any>();

  reports.forEach((report: any) => {
    const section = report.report_sections;
    const type = report.report_types;
    const groupId = section?.id || type?.id || 'reports';

    if (!groupsById.has(groupId)) {
      groupsById.set(groupId, {
        id: groupId,
        header: {
          title: section?.name || type?.name || 'Reports',
          desc: section?.description || type?.description || '',
          date: report.published_at || report.created_at || '',
        },
        items: [],
      });
    }

    groupsById.get(groupId).items.push(serializeReport(report));
  });

  const sectionOrderMap = new Map(
    sections.map((section: any, index: number) => [
      String(section.id),
      Number.isFinite(Number(section.position)) ? Number(section.position) : index,
    ])
  );
  const groups = Array.from(groupsById.values()).sort((a, b) => {
    const aPosition = sectionOrderMap.get(String(a.id)) ?? Number.MAX_SAFE_INTEGER;
    const bPosition = sectionOrderMap.get(String(b.id)) ?? Number.MAX_SAFE_INTEGER;
    if (aPosition !== bPosition) return aPosition - bPosition;
    return String(a.header?.title || '').localeCompare(String(b.header?.title || ''));
  });

  return {
    groups,
    items: serializeReports(reports),
    types,
    sections,
    pagination: buildPagination(page, limit ?? Math.max(total, 1), total),
  };
}

const getAnnouncementOrderBy = (config: Record<string, any>) => {
  const sort = readString(config, ['sort_by', 'sortBy', 'sort', 'order'], 'created_at').toLowerCase();
  const sortOrder = readSortOrder(config, sort === 'oldest' || sort === 'sort_order' || sort === 'sortorder' ? 'asc' : 'desc');

  if (sort === 'alphabetical' || sort === 'title') {
    return [{ title: 'asc' as const }];
  }

  if (sort === 'sort_order' || sort === 'sortorder') {
    return [{ sort_order: 'asc' as const }, { created_at: 'desc' as const }];
  }

  return [{ created_at: sortOrder }, { sort_order: 'asc' as const }];
};

function buildAnnouncementWhere(config: Record<string, any>): Prisma.announcementsWhereInput {
  const typeId = readString(config, ['announcement_type_id', 'announcementTypeId', 'type_id', 'typeId', 'category_id', 'categoryId']);
  const sectionId = readString(config, ['announcement_section_id', 'announcementSectionId', 'section_id', 'sectionId']);
  const typeSlug = readString(config, ['announcement_type_slug', 'announcementTypeSlug', 'type_slug', 'typeSlug', 'category_slug', 'categorySlug']);
  const sectionSlug = readString(config, ['announcement_section_slug', 'announcementSectionSlug', 'section_slug', 'sectionSlug']);

  const where: Prisma.announcementsWhereInput = {
    status: ContentStatus.PUBLISHED,
    is_active: true,
    deleted_at: null,
  };
  const and: Prisma.announcementsWhereInput[] = [
    { OR: [{ type_id: null }, { announcement_types: { is: { isActive: true, deletedAt: null } } }] },
    {
      OR: [
        { section_id: null },
        { announcement_sections: { is: { isActive: true, deletedAt: null, announcement_types: { is: { isActive: true, deletedAt: null } } } } },
      ],
    },
  ];

  if (typeId) {
    and.push({
      OR: [
        { type_id: typeId },
        { announcement_sections: { is: { type_id: typeId } } },
      ],
    });
  } else if (typeSlug) {
    and.push({
      OR: [
        { announcement_types: { is: { slug: typeSlug, isActive: true, deletedAt: null } } },
        { announcement_sections: { is: { announcement_types: { is: { slug: typeSlug, isActive: true, deletedAt: null } } } } },
      ],
    });
  }

  if (sectionId) {
    and.push({ section_id: sectionId });
  } else if (sectionSlug) {
    and.push({ announcement_sections: { is: { slug: sectionSlug, isActive: true, deletedAt: null } } });
  }

  if (and.length) {
    where.AND = and;
  }

  return where;
}

async function fetchAnnouncementListComponentData(config: Record<string, any>) {
  const latestOnly = readBoolean(config, ['latest_only', 'latestOnly'], false);
  const page = 1;
  const showAll = readBoolean(config, ['show_all', 'showAll'], true);
  const limit = latestOnly ? 1 : showAll ? undefined : readNumber(config, ['fetch_limit', 'fetchLimit', 'data_limit', 'dataLimit'], 200, 1, 500);
  const where = buildAnnouncementWhere(config);

  const [announcements, total, types, sections] = await Promise.all([
    prisma.announcements.findMany({
      where,
      include: { announcement_sections: { include: { announcement_types: true } }, announcement_types: true },
      orderBy: getAnnouncementOrderBy(config),
      ...(limit ? { take: limit } : {}),
    }),
    prisma.announcements.count({ where }),
    prisma.announcementType.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { position: 'asc' },
    }),
    prisma.announcementSection.findMany({
      where: { isActive: true, deletedAt: null, announcement_types: { is: { isActive: true, deletedAt: null } } },
      include: { announcement_types: true },
      orderBy: { position: 'asc' },
    }),
  ]);

  return {
    announcements,
    items: announcements,
    types,
    sections,
    pagination: buildPagination(page, limit ?? Math.max(total, 1), total),
  };
}

const getSolutionOrderBy = (config: Record<string, any>) => {
  const sort = readString(config, ['sort_by', 'sortBy', 'order_by', 'orderBy', 'order'], 'sort_order').toLowerCase();
  const sortOrder = readSortOrder(config, sort === 'latest' ? 'desc' : 'asc');

  if (sort === 'title' || sort === 'alphabetical') return [{ title: 'asc' as const }, { sortOrder: 'asc' as const }];
  if (sort === 'latest' || sort === 'created_at' || sort === 'createdat') return [{ createdAt: 'desc' as const }, { sortOrder: 'asc' as const }];
  if (sort === 'updated_at' || sort === 'updatedat') return [{ updatedAt: sortOrder }, { sortOrder: 'asc' as const }];

  return [{ sortOrder: sortOrder }, { title: 'asc' as const }];
};

function serializeSolutionCategory(category: any, locale = 'en') {
  return {
    id: category.id,
    type: category.type,
    name: locale === 'id' ? category.nameId || category.name : category.nameEn || category.name,
    name_id: category.nameId,
    name_en: category.nameEn,
    slug: category.slug,
    icon: category.icon || '',
    sortOrder: category.sortOrder || 0,
  };
}

function serializeSolution(solution: any, locale = 'en') {
  const categories = (solution.categories || [])
    .map((relation: any) => relation.category)
    .filter(Boolean)
    .map((category: any) => serializeSolutionCategory(category, locale));
  const industries = categories.filter((category: any) => category.type === 'INDUSTRY');
  const businessScales = categories.filter((category: any) => category.type === 'BUSINESS_SCALE');
  const businessNeeds = categories.filter((category: any) => category.type === 'BUSINESS_NEED');
  const title = locale === 'id' ? solution.titleId || solution.title : solution.titleEn || solution.title;
  const description = locale === 'id'
    ? solution.descriptionId || solution.description || ''
    : solution.descriptionEn || solution.description || '';

  return {
    id: solution.id,
    slug: solution.slug,
    title,
    title_id: solution.titleId,
    title_en: solution.titleEn,
    description,
    description_id: solution.descriptionId,
    description_en: solution.descriptionEn,
    image: solution.image || solution.bannerImage || '',
    thumbnail: solution.image || solution.bannerImage || '',
    bannerImage: solution.bannerImage || solution.image || '',
    href: `/solutions/${solution.slug}`,
    ctaList: Array.isArray(solution.ctaList) ? solution.ctaList : [],
    sortOrder: solution.sortOrder,
    categories,
    industries,
    businessScales,
    businessNeeds,
    industry: industries[0] || null,
    businessScale: businessScales[0] || null,
    tags: businessNeeds.map((need: any) => need.name),
    category: industries[0]?.name || '',
    categoryIcon: industries[0]?.icon || '',
  };
}

async function fetchSolutionsComponentData(config: Record<string, any>) {
  const db = prisma as any;
  const page = readPage(config);
  const limit = readLimit(config, 100, 200);
  const locale = readString(config, ['locale', 'lang'], 'en');

  const [solutions, total, taxonomies] = await Promise.all([
    db.dataBankSolution.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        deletedAt: null,
      },
      include: {
        categories: {
          include: { category: true },
        },
      },
      orderBy: getSolutionOrderBy(config),
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.dataBankSolution.count({
      where: {
        status: ContentStatus.PUBLISHED,
        deletedAt: null,
      },
    }),
    db.dataBankSolutionCategory.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    }),
  ]);

  const items = solutions.map((solution: any) => serializeSolution(solution, locale));

  return {
    items,
    solutions: items,
    taxonomies: taxonomies.map((category: any) => serializeSolutionCategory(category, locale)),
    pagination: buildPagination(page, limit, total),
  };
}

// ============================================================================
// MAIN COMPONENT DATA FETCHERS
// ============================================================================

async function fetchMainComponentData(type: string, config: any): Promise<any> {
  try {
    const componentConfig = config || {};
    const now = await getDatabaseNow();
    switch (type) {
      case 'news_highlight':
      case 'news_featured': {
        const featuredCount = componentConfig.featured_count || 1;
        const gridCount = componentConfig.grid_count || 4;
        const totalCount = featuredCount + gridCount;
        const source = componentConfig.source || 'cms_highlights';
        const selectedNewsIds = getConfiguredNewsIds(componentConfig);
        const orderBy = getNewsOrderBy(componentConfig);

        if (source === 'selected_news' && selectedNewsIds.length > 0) {
          const selectedNews = await prisma.news.findMany({
            where: publicNewsWhere(now, {
              id: { in: selectedNewsIds },
            }),
            include: { news_categories: true },
          });

          return splitFeaturedNews(orderNewsByConfiguredIds(selectedNews, selectedNewsIds), featuredCount, gridCount);
        }

        const highlights = await prisma.news_highlights.findMany({
          include: { news: { include: { news_categories: true } } },
          where: { news: { is: publicNewsWhere(now) } },
          orderBy: { position: 'asc' },
          take: totalCount,
        });
        const fallbackNews = await prisma.news.findMany({
          where: publicNewsWhere(now),
          include: { news_categories: true },
          orderBy,
          take: totalCount,
        });
        const highlightedNews = highlights.map((h: any) => h.news);
        const highlightSort = readString(componentConfig, ['sort_by', 'sortBy', 'sort', 'order'], 'news_date').toLowerCase();
        const highlightDirection = readSortOrder(componentConfig, 'desc');
        const sortedHighlightedNews = ['news_date', 'published_at', 'created_at', 'latest', 'oldest', 'alphabetical', 'title'].includes(highlightSort)
          ? [...highlightedNews].sort((a: any, b: any) => {
              if (highlightSort === 'alphabetical' || highlightSort === 'title') {
                return String(a.title_en || '').localeCompare(String(b.title_en || ''));
              }
              const dateKey = highlightSort === 'published_at'
                ? 'published_at'
                : highlightSort === 'created_at'
                  ? 'created_at'
                  : 'news_date';
              const left = new Date(a[dateKey] || a.news_date || a.created_at || 0).getTime();
              const right = new Date(b[dateKey] || b.news_date || b.created_at || 0).getTime();
              const direction = highlightSort === 'oldest' ? 'asc' : highlightSort === 'latest' ? 'desc' : highlightDirection;
              return direction === 'asc' ? left - right : right - left;
            })
          : highlightedNews;
        const newsItems = sortedHighlightedNews.length > 0 ? sortedHighlightedNews : fallbackNews;
        return splitFeaturedNews(newsItems, featuredCount, gridCount);
      }
      case 'news_feed':
      case 'news_list': {
        const maxData = readLimit(componentConfig, 12, 100);
        const page = readPage(componentConfig);
        const categorySlug = readString(componentConfig, ['category_slug', 'categorySlug', 'category']);
        const categoryId = readString(componentConfig, ['category_id', 'categoryId']);
        let resolvedCategoryId = categoryId;

        if (categorySlug && !resolvedCategoryId) {
          const category = await prisma.news_categories.findFirst({
            where: { slug: categorySlug, is_active: true, deleted_at: null },
            select: { id: true },
          });
          resolvedCategoryId = category?.id || '__missing_category__';
        }

        const where: any = {
          ...publicNewsWhere(now),
          ...(resolvedCategoryId ? { category_id: resolvedCategoryId } : {}),
        };

        const [newsItems, total] = await Promise.all([
          prisma.news.findMany({
            where,
            include: { news_categories: true },
            orderBy: getNewsOrderBy(componentConfig),
            skip: (page - 1) * maxData,
            take: maxData,
          }),
          prisma.news.count({ where }),
        ]);
        const categories = await prisma.news_categories.findMany({
          where: { is_active: true, deleted_at: null },
          orderBy: { position: 'asc' },
        });
        return {
          news: newsItems,
          categories,
          total,
          pagination: buildPagination(page, maxData, total),
        };
      }
      case 'news_teaser': {
        const maxData = componentConfig.limit || componentConfig.max_data || 6;
        const categorySlug = componentConfig.categorySlug || componentConfig.category_slug || componentConfig.category;
        const categoryId = componentConfig.category_id || componentConfig.categoryId;

        const categoryWhere: any = {
          is_active: true,
          deleted_at: null,
        };

        if (categoryId) {
          categoryWhere.id = categoryId;
        } else if (categorySlug) {
          categoryWhere.slug = categorySlug;
        }

        const category = categoryId || categorySlug
          ? await prisma.news_categories.findFirst({ where: categoryWhere })
          : null;

        if ((categoryId || categorySlug) && !category) {
          return { news: [], category: null };
        }

        const where: any = {
          ...publicNewsWhere(now),
          ...(category ? { category_id: category.id } : {}),
        };

        const newsItems = await prisma.news.findMany({
          where,
          include: { news_categories: true },
          orderBy: getNewsOrderBy(componentConfig),
          take: maxData,
        });

        return {
          news: newsItems,
          category,
        };
      }
      case 'content_highlights':
        return fetchContentHighlightsComponentData(componentConfig);
      case 'career_highlight': {
        const maxDisplay = componentConfig.max_display || 6;
        const careers = await prisma.careerContent.findMany({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: maxDisplay,
        });
        return { careers };
      }
      case 'career_list': {
        const perPage = componentConfig.per_page || 10;
        const careers = await prisma.careerContent.findMany({
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: perPage,
        });
        return { careers, total: careers.length };
      }
      case 'management_list': {
        const managements = await prisma.management.findMany({
          where: {
            is_active: true,
            deleted_at: null,
            managementCategory: { is: { is_active: true, deleted_at: null } },
          },
          include: { managementCategory: true },
          orderBy: { order: 'asc' },
        });
        const categories = await prisma.managementCategory.findMany({
          where: { is_active: true, deleted_at: null },
          orderBy: { position: 'asc' },
        });
        return { managements, categories };
      }
      case 'announcement_list': {
        return fetchAnnouncementListComponentData(componentConfig);
      }
      case 'report_list': {
        return fetchReportListComponentData(componentConfig);
      }
      case 'report_grid':
        return fetchReportsComponentData(componentConfig, 'grid');
      case 'report_list_part':
        return fetchReportsComponentData(componentConfig, 'part');
      case 'list_report_home':
        return fetchReportsComponentData(componentConfig, 'home');
      case 'maps_coverage_v1':
        return MapCoverageService.getPublicMapData();
      case 'events_list':
        return fetchEventsComponentData(componentConfig);
      case 'event_related':
        return fetchEventsComponentData(componentConfig, true);
      case 'awards_list': {
        const sortBy = readString(componentConfig, ['sort_by', 'sortBy', 'order'], 'issue_date').toLowerCase();
        const sortDirection = readSortOrder(componentConfig, 'desc');
        const issueDateOrder = sortBy === 'oldest' ? 'asc' : sortDirection;

        const awards = await prisma.award.findMany({
          where: { isActive: true, deletedAt: null },
          orderBy: sortBy === 'year'
            ? [{ year: issueDateOrder }, { position: 'asc' }]
            : sortBy === 'title'
              ? [{ title: 'asc' }, { year: 'desc' }]
              : [{ issueDate: issueDateOrder }, { year: issueDateOrder }, { position: 'asc' }],
        });
        return { awards };
      }
      case 'solutions_list':
        return fetchSolutionsComponentData(componentConfig);
      case 'awards_marquee': {
        const awardIds = Array.isArray(componentConfig.award_ids || componentConfig.awardIds)
          ? componentConfig.award_ids || componentConfig.awardIds
          : [];
        if (awardIds.length === 0) return { awards: [] };

        const awards = await prisma.award.findMany({
          where: {
            isActive: true,
            deletedAt: null,
            id: { in: awardIds },
          },
          orderBy: [{ position: 'asc' }, { year: 'desc' }],
        });

        const orderedAwards = awardIds
          .map((id: string) => awards.find((award: any) => String(award.id) === String(id)))
          .filter(Boolean);

        return { awards: orderedAwards };
      }
      default:
        return null;
    }
  } catch (error) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    console.error('Public component data fetch failed', {
      componentType: type,
      prismaCode: prismaError?.code,
      prismaMeta: prismaError?.meta,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ============================================================================
// AVAILABLE COMPONENTS ENDPOINT
// ============================================================================

/**
 * GET /api/v1/available-components
 * Returns list of all available component types with defaults
 */
export const getAvailableComponents = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const componentTypes = await ComponentVisibilityService.getVisibleComponentTypes();

    res.json({
      success: true,
      data: componentTypes.map((ct) => ({
        schemaVersion: getComponentSchema(ct.type)?.version || 1,
        fields: getComponentSchema(ct.type)?.fields || [],
        metadata: getComponentSchema(ct.type)?.metadata || {},
        type: ct.type,
        name: ct.name,
        description: ct.description,
        icon: ct.icon,
        category: ct.category,
        defaultData: ct.defaultData,
      })),
    });
  } catch (error) {
    console.error('Error fetching available components:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ============================================================================
// PUBLIC PAGE ENDPOINTS
// ============================================================================

/**
 * Get published page by slug (public access)
 * Supports nested slugs (e.g., "about/management") via wildcard param
 */
export const getPublicPageBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Support both :slug and catch-all *slug (0 param) for nested paths
    const slug = normalizePublicPageSlug(req.params.slug || req.params[0] || '');

    const page = await prisma.page.findFirst({
      where: {
        slug,
        status: PageStatus.PUBLISHED,
        deletedAt: null,
      },
      select: pageRenderSelect,
    });

    if (!page) {
      res.status(404).json({
        success: false,
        message: 'Page not found',
      });
      return;
    }

    // For MAIN components, fetch additional data
    const visibleComponents = await filterInactiveComponents(page.components);

    const componentsWithData = await Promise.all(
      visibleComponents.map(async (c: any) => {
        const synced = syncComponentInstance(c.type, c.data);
        const componentData = synced.instance.data;
        const base = {
          id: c.id,
          type: c.type,
          data: synced.instance,
          order: c.order,
          isVisible: c.isVisible,
        };

        if (isMainComponent(c.type)) {
          const mainData = await fetchMainComponentData(c.type, componentData);
          return { ...base, mainData: toJsonSafeValue(mainData) };
        }

        return base;
      })
    );

    res.json({
      success: true,
      data: {
        id: page.id,
        title: page.title,
        titleEn: page.titleEn,
        titleId: page.titleId,
        slug: page.slug,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        metaKeywords: page.metaKeywords,
        metaThumbnail: page.metaThumbnail,
        ogImage: page.ogImage,
        product: page.product,
        promo: page.promo,
        source: page.source,
        noindex: page.noindex,
        nofollow: page.nofollow,
        showNavbar: page.showNavbar,
        showFooter: page.showFooter,
        status: page.status,
        template: page.template,
        publishedAt: page.publishedAt,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        components: componentsWithData,
      },
    });
  } catch (error) {
    console.error('Error fetching public page:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get page preview by slug (with secret)
 */
export const getPagePreview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const slug = normalizePublicPageSlug(req.params.slug || req.params[0] || '');
    const secret = req.get('x-preview-secret');

    // Validate secret
    if (secret !== process.env.PREVIEW_SECRET) {
      res.status(401).json({
        success: false,
        message: 'Invalid preview secret',
      });
      return;
    }

    const page = await prisma.page.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      select: pageRenderSelect,
    });

    if (!page) {
      res.status(404).json({
        success: false,
        message: 'Page not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...page,
        components: (await filterInactiveComponents(page.components)).map((c: any) => ({
          id: c.id,
          type: c.type,
          data: syncComponentInstance(c.type, c.data).instance,
          order: c.order,
          isVisible: c.isVisible,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching page preview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Get all published page slugs (for SSG)
 */
export const getPublishedSlugs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const pages = await prisma.page.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        deletedAt: null,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching published slugs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Trigger page revalidation
 */
export const triggerRevalidation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!page) {
      res.status(404).json({
        success: false,
        message: 'Page not found',
      });
      return;
    }

    // Call Next.js revalidation API
    const nextjsUrl = process.env.NEXTJS_URL
      || (process.env.NODE_ENV === 'development' ? `${LOCAL_HTTP_PROTOCOL}://localhost:3000` : '');
    const revalidateSecret = process.env.REVALIDATE_SECRET;

    if (!nextjsUrl) {
      res.status(500).json({
        success: false,
        message: 'Next.js revalidation URL is not configured',
      });
      return;
    }

    if (!revalidateSecret) {
      res.status(500).json({
        success: false,
        message: 'Revalidation secret not configured',
      });
      return;
    }

    const pagePath = `/page/${page.slug
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')}`;

    const response = await fetch(new URL('/api/revalidate', nextjsUrl).toString(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': revalidateSecret,
      },
      body: JSON.stringify({ path: pagePath }),
    });

    if (!response.ok) {
      throw new Error('Revalidation failed');
    }

    res.json({
      success: true,
      message: 'Page revalidation triggered',
      data: { slug: page.slug },
    });
  } catch (error) {
    console.error('Error triggering revalidation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger revalidation',
    });
  }
};
