import { PrismaClient, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../types/error.types';
import { sanitizeHtmlContent } from '../utils/htmlSanitizer';

const prisma = new PrismaClient();

const DEFAULT_ORGANIZER = {
  label: 'Organized by',
  name: 'PT Link Net Tbk',
  logo: '/assets/logos/linknet-logo.svg',
};

const RELATED_NEWS_SELECT = {
  id: true,
  title_en: true,
  title_id: true,
  slug: true,
  news_date: true,
  news_thumbnail: true,
  excerpt_en: true,
  excerpt_id: true,
  status: true,
  deleted_at: true,
} as const;

const EVENT_LIST_INCLUDE: Prisma.eventsInclude = {
  _count: {
    select: {
      event_registrations: true,
      event_news_relations: true,
    },
  },
};

const ADMIN_EVENT_DETAIL_INCLUDE: Prisma.eventsInclude = {
  event_news_relations: {
    orderBy: { position: 'asc' },
    include: {
      news: {
        select: RELATED_NEWS_SELECT,
      },
    },
  },
  _count: {
    select: {
      event_registrations: true,
      event_news_relations: true,
    },
  },
};

const PUBLIC_EVENT_DETAIL_INCLUDE: Prisma.eventsInclude = {
  event_news_relations: {
    where: {
      news: {
        status: 'PUBLISHED',
        deleted_at: null,
      },
    },
    orderBy: { position: 'asc' },
    include: {
      news: {
        select: RELATED_NEWS_SELECT,
      },
    },
  },
  _count: {
    select: {
      event_registrations: true,
      event_news_relations: true,
    },
  },
};

export type EventPublicState = 'upcoming' | 'ongoing' | 'ended';
export type EventLocale = 'en' | 'id';

export interface EventQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  state?: EventPublicState;
  locale?: EventLocale;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEventData {
  title: string;
  title_id?: string;
  hero_title?: string;
  hero_title_id?: string;
  slug?: string;
  excerpt?: string;
  excerpt_id?: string;
  content: string;
  content_id?: string;
  cover_image?: string;
  location?: string;
  venue?: string;
  address?: string;
  map_embed_url?: string;
  organizer_label?: string;
  organizer_name?: string;
  organizer_logo?: string;
  ticket_price?: string;
  register_link?: string;
  registration_end_at?: string | Date | null;
  max_register_participants?: number;
  start_date: string | Date;
  end_date?: string | Date | null;
  status?: string;
  article_ids?: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {}

const EVENT_SORT_FIELD_MAP: Record<string, string> = {
  title: 'title',
  slug: 'slug',
  startDate: 'start_date',
  start_date: 'start_date',
  endDate: 'end_date',
  end_date: 'end_date',
  registrationEndAt: 'registration_end_at',
  registration_end_at: 'registration_end_at',
  createdAt: 'created_at',
  created_at: 'created_at',
  updatedAt: 'updated_at',
  updated_at: 'updated_at',
  status: 'status',
  location: 'location',
  venue: 'venue',
};

function getUtcDayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

function getUtcDayEnd(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

function isSameUtcDay(left: Date, right: Date) {
  return left.getUTCFullYear() === right.getUTCFullYear()
    && left.getUTCMonth() === right.getUTCMonth()
    && left.getUTCDate() === right.getUTCDate();
}

function derivePublicState(startDate: Date, endDate?: Date | null, now = new Date()): EventPublicState {
  const effectiveEndDate = endDate || getUtcDayEnd(startDate);

  if (now < startDate) {
    return 'upcoming';
  }

  if (now <= effectiveEndDate) {
    return 'ongoing';
  }

  return 'ended';
}

function buildDateAliases(startDate: Date, endDate?: Date | null) {
  if (!endDate) {
    return {
      date: startDate.toISOString(),
      startDate: null,
      endDate: null,
      timeStart: startDate.toISOString(),
      timeEnd: null,
    };
  }

  if (isSameUtcDay(startDate, endDate)) {
    return {
      date: startDate.toISOString(),
      startDate: null,
      endDate: null,
      timeStart: startDate.toISOString(),
      timeEnd: endDate.toISOString(),
    };
  }

  return {
    date: null,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    timeStart: null,
    timeEnd: null,
  };
}

function createDirectionUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

function sanitizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function sanitizeOptionalHtml(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? sanitizeHtmlContent(trimmed) : null;
}

function normalizeSlug(input: string, fallback: string) {
  const base = slugify(input || fallback, {
    lower: true,
    strict: true,
    trim: true,
  });

  return base || slugify(fallback, { lower: true, strict: true, trim: true }) || 'event';
}

function normalizeArticleIds(articleIds?: string[]) {
  return Array.from(
    new Set(
      (articleIds || [])
        .map((item) => item?.trim())
        .filter((item): item is string => Boolean(item))
    )
  );
}

function normalizeLocale(locale?: string): EventLocale {
  return locale === 'id' ? 'id' : 'en';
}

function localizedValue(primary: string | null | undefined, localized: string | null | undefined, locale?: string) {
  return normalizeLocale(locale) === 'id' && localized ? localized : primary;
}

function isRegistrationOpen(item: {
  status: string;
  start_date: Date;
  end_date?: Date | null;
  registration_end_at?: Date | null;
  max_register_participants?: number | null;
}, now = new Date()) {
  if (item.status !== 'PUBLISHED') {
    return false;
  }

  if (!item.registration_end_at) {
    return false;
  }

  if ((item.max_register_participants || 0) < 1) {
    return false;
  }

  const effectiveEndDate = item.end_date || getUtcDayEnd(item.start_date);

  return now <= item.registration_end_at && now <= effectiveEndDate;
}

function serializeRelatedNews(newsItem: any, locale?: string) {
  if (!newsItem) {
    return null;
  }

  return {
    id: newsItem.id,
    title: localizedValue(newsItem.title_en, newsItem.title_id, locale),
    title_en: newsItem.title_en,
    title_id: newsItem.title_id,
    slug: newsItem.slug,
    news_date: newsItem.news_date,
    news_thumbnail: newsItem.news_thumbnail,
    excerpt: localizedValue(newsItem.excerpt_en, newsItem.excerpt_id, locale),
    excerpt_en: newsItem.excerpt_en,
    excerpt_id: newsItem.excerpt_id,
    status: newsItem.status,
  };
}

function serializeEvent(item: any, locale?: string) {
  if (!item) {
    return item;
  }

  const publicState = derivePublicState(item.start_date, item.end_date);
  const dateAliases = buildDateAliases(item.start_date, item.end_date);
  const relatedNews = (item.event_news_relations || [])
    .map((relation: any) => serializeRelatedNews(relation.news, locale))
    .filter(Boolean);
  const articleIds = relatedNews.map((article: any) => article.id);
  const organizer = {
    label: item.organizer_label || DEFAULT_ORGANIZER.label,
    name: item.organizer_name || DEFAULT_ORGANIZER.name,
    logo: item.organizer_logo || DEFAULT_ORGANIZER.logo,
  };
  const directionQuery = [item.address, item.venue, item.location]
    .filter(Boolean)
    .join(', ');
  const locationSection = item.venue || item.address || item.map_embed_url
    ? {
        title: 'Event Location',
        map_embed_url: item.map_embed_url || null,
        mapEmbedUrl: item.map_embed_url || null,
        name: item.venue || null,
        address: item.address || null,
        directions_link: directionQuery ? createDirectionUrl(directionQuery) : null,
        directionsLink: directionQuery ? createDirectionUrl(directionQuery) : null,
      }
    : null;
  const title = localizedValue(item.title, item.title_id, locale) || item.title;
  const heroTitle = localizedValue(item.hero_title || item.title, item.hero_title_id || item.title_id, locale) || title;
  const excerpt = localizedValue(item.excerpt, item.excerpt_id, locale);
  const content = localizedValue(item.content, item.content_id, locale) || item.content;

  return {
    ...item,
    title,
    title_en: item.title,
    title_id: item.title_id,
    hero_title: heroTitle,
    hero_title_en: item.hero_title || item.title,
    hero_title_id: item.hero_title_id,
    heroTitle,
    heroTitleEn: item.hero_title || item.title,
    heroTitleId: item.hero_title_id,
    excerpt,
    excerpt_en: item.excerpt,
    excerpt_id: item.excerpt_id,
    content,
    content_en: item.content,
    content_id: item.content_id,
    image: item.cover_image || null,
    poster_image: item.cover_image || null,
    posterImage: item.cover_image || null,
    thumbnail_image: item.cover_image || null,
    thumbnailImage: item.cover_image || null,
    public_state: publicState,
    state: publicState,
    publish_status: item.status === 'PUBLISHED' ? 'active' : 'draft',
    publishStatus: item.status === 'PUBLISHED' ? 'active' : 'draft',
    badge_text: publicState === 'ongoing' ? 'On Going' : undefined,
    badgeText: publicState === 'ongoing' ? 'On Going' : undefined,
    organizer,
    hero_location: [item.venue, item.location].filter(Boolean).join(', '),
    heroLocation: [item.venue, item.location].filter(Boolean).join(', '),
    ticket_price: item.ticket_price || 'FREE',
    ticketPrice: item.ticket_price || 'FREE',
    register_link: item.register_link || null,
    registerLink: item.register_link || null,
    registration_ended_time: item.registration_end_at || null,
    registrationEndedTime: item.registration_end_at || null,
    max_register_participants: item.max_register_participants ?? 5,
    maxRegisterParticipants: item.max_register_participants ?? 5,
    related_news: relatedNews,
    relatedNews: relatedNews,
    article_ids: articleIds,
    articleIds: articleIds,
    location_section: locationSection,
    locationSection: locationSection,
    is_registration_open: isRegistrationOpen(item),
    isRegistrationOpen: isRegistrationOpen(item),
    registration_count: item._count?.event_registrations,
    registrationCount: item._count?.event_registrations,
    related_news_count: item._count?.event_news_relations,
    relatedNewsCount: item._count?.event_news_relations,
    ...dateAliases,
  };
}

function serializeEventList(items: any[], locale?: string) {
  return items.map((item) => serializeEvent(item, locale));
}

async function generateUniqueSlug(input: string, fallback: string, excludeId?: string) {
  const baseSlug = normalizeSlug(input, fallback);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.events.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function checkSlug(slug: string, excludeId?: string) {
  const normalizedSlug = normalizeSlug(slug, slug);

  const existing = await prisma.events.findFirst({
    where: {
      slug: normalizedSlug,
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
    },
    select: { id: true, slug: true },
  });

  return {
    slug: normalizedSlug,
    available: !existing,
  };
}

function buildStateWhere(state?: EventPublicState): Prisma.eventsWhereInput | undefined {
  if (!state || !['upcoming', 'ongoing', 'ended'].includes(state)) {
    return undefined;
  }

  const now = new Date();
  const utcDayStart = getUtcDayStart(now);

  if (state === 'upcoming') {
    return { start_date: { gt: now } };
  }

  if (state === 'ongoing') {
    return {
      OR: [
        {
          AND: [
            { start_date: { lte: now } },
            { end_date: { gte: now } },
          ],
        },
        {
          AND: [
            { end_date: null },
            { start_date: { lte: now } },
            { start_date: { gte: utcDayStart } },
          ],
        },
      ],
    };
  }

  return {
    OR: [
      { end_date: { lt: now } },
      {
        AND: [
          { end_date: null },
          { start_date: { lt: utcDayStart } },
        ],
      },
    ],
  };
}

function validateEventDates(startDate: Date, endDate?: Date | null, registrationEndAt?: Date | null) {
  if (Number.isNaN(startDate.getTime())) {
    throw new AppError('Start date is invalid', 400);
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    throw new AppError('End date is invalid', 400);
  }

  if (registrationEndAt && Number.isNaN(registrationEndAt.getTime())) {
    throw new AppError('Registration end time is invalid', 400);
  }

  if (endDate && endDate < startDate) {
    throw new AppError('End date must be greater than or equal to start date', 400);
  }

  if (registrationEndAt && registrationEndAt > startDate) {
    throw new AppError('Registration end time must be before or equal to the event start date', 400);
  }
}

async function validateRelatedNewsIds(articleIds: string[]) {
  if (!articleIds.length) {
    return;
  }

  const total = await prisma.news.count({
    where: {
      id: { in: articleIds },
      deleted_at: null,
    },
  });

  if (total !== articleIds.length) {
    throw new AppError('One or more related news IDs are invalid', 400);
  }
}

function normalizeMaxRegisterParticipants(value?: number | null) {
  if (value === undefined || value === null) {
    return 5;
  }

  if (!Number.isInteger(value) || value < 1) {
    throw new AppError('Max register participants must be a positive integer', 400);
  }

  return value;
}

function buildSearchWhere(search: string): Prisma.eventsWhereInput[] {
  return [
    { title: { contains: search, mode: 'insensitive' } },
    { title_id: { contains: search, mode: 'insensitive' } },
    { hero_title: { contains: search, mode: 'insensitive' } },
    { hero_title_id: { contains: search, mode: 'insensitive' } },
    { slug: { contains: search, mode: 'insensitive' } },
    { excerpt: { contains: search, mode: 'insensitive' } },
    { excerpt_id: { contains: search, mode: 'insensitive' } },
    { location: { contains: search, mode: 'insensitive' } },
    { venue: { contains: search, mode: 'insensitive' } },
    { organizer_name: { contains: search, mode: 'insensitive' } },
  ];
}

export class EventService {
  async getEvents(params: EventQueryParams) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      state,
      locale,
      sortBy: rawSortBy = 'updated_at',
      sortOrder = 'desc',
    } = params;

    const sortBy = EVENT_SORT_FIELD_MAP[rawSortBy] || 'updated_at';
    const skip = (page - 1) * limit;

    const where: Prisma.eventsWhereInput = {
      ...(status ? { status: status as any } : {}),
    };

    if (search) {
      where.OR = buildSearchWhere(search);
    }

    const stateWhere = buildStateWhere(state);
    if (stateWhere) {
      where.AND = [stateWhere];
    }

    const [items, total] = await Promise.all([
      prisma.events.findMany({
        where,
        include: EVENT_LIST_INCLUDE,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.events.count({ where }),
    ]);

    return {
      data: serializeEventList(items, locale),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getPublishedEvents(params: EventQueryParams) {
    const {
      page = 1,
      limit = 12,
      search,
      state,
      locale,
      sortBy: rawSortBy = 'start_date',
      sortOrder = 'asc',
    } = params;

    const sortBy = EVENT_SORT_FIELD_MAP[rawSortBy] || 'start_date';
    const skip = (page - 1) * limit;

    const where: Prisma.eventsWhereInput = {
      status: 'PUBLISHED',
    };

    if (search) {
      where.OR = [
        ...buildSearchWhere(search),
        { content: { contains: search, mode: 'insensitive' } },
        { content_id: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const stateWhere = buildStateWhere(state);
    if (stateWhere) {
      where.AND = [stateWhere];
    }

    const [items, total] = await Promise.all([
      prisma.events.findMany({
        where,
        include: EVENT_LIST_INCLUDE,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.events.count({ where }),
    ]);

    return {
      data: serializeEventList(items, locale),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async getEventById(id: string) {
    const item = await prisma.events.findUnique({
      where: { id },
      include: ADMIN_EVENT_DETAIL_INCLUDE,
    });

    if (!item) {
      throw new AppError('Event not found', 404);
    }

    return serializeEvent(item);
  }

  async getEventBySlug(slug: string, locale?: string) {
    const item = await prisma.events.findUnique({
      where: { slug },
      include: PUBLIC_EVENT_DETAIL_INCLUDE,
    });

    if (!item || item.status !== 'PUBLISHED') {
      throw new AppError('Event not found', 404);
    }

    return serializeEvent(item, locale);
  }

  async checkSlugAvailability(slug: string, excludeId?: string) {
    const normalizedSlug = normalizeSlug(slug, slug);
    if (!normalizedSlug) {
      throw new AppError('Slug is required', 400);
    }

    return checkSlug(normalizedSlug, excludeId);
  }

  async createEvent(data: CreateEventData) {
    const startDate = new Date(data.start_date);
    const endDate = data.end_date ? new Date(data.end_date) : null;
    const registrationEndAt = data.registration_end_at ? new Date(data.registration_end_at) : null;
    validateEventDates(startDate, endDate, registrationEndAt);

    const articleIds = normalizeArticleIds(data.article_ids);
    await validateRelatedNewsIds(articleIds);

    const slug = await generateUniqueSlug(data.slug || data.title, data.title);
    const now = new Date();

    const item = await prisma.events.create({
      data: {
        id: uuidv4(),
        title: data.title.trim(),
        title_id: sanitizeOptionalText(data.title_id),
        hero_title: sanitizeOptionalText(data.hero_title),
        hero_title_id: sanitizeOptionalText(data.hero_title_id),
        slug,
        excerpt: sanitizeOptionalHtml(data.excerpt),
        excerpt_id: sanitizeOptionalHtml(data.excerpt_id),
        content: sanitizeHtmlContent(data.content.trim()),
        content_id: sanitizeOptionalHtml(data.content_id),
        cover_image: sanitizeOptionalText(data.cover_image),
        location: sanitizeOptionalText(data.location),
        venue: sanitizeOptionalText(data.venue),
        address: sanitizeOptionalText(data.address),
        map_embed_url: sanitizeOptionalText(data.map_embed_url),
        organizer_label: sanitizeOptionalText(data.organizer_label),
        organizer_name: sanitizeOptionalText(data.organizer_name),
        organizer_logo: sanitizeOptionalText(data.organizer_logo),
        ticket_price: sanitizeOptionalText(data.ticket_price),
        register_link: sanitizeOptionalText(data.register_link),
        registration_end_at: registrationEndAt,
        max_register_participants: normalizeMaxRegisterParticipants(data.max_register_participants),
        start_date: startDate,
        end_date: endDate,
        status: (data.status as any) || 'DRAFT',
        created_at: now,
        updated_at: now,
        ...(articleIds.length
          ? {
              event_news_relations: {
                create: articleIds.map((newsId, index) => ({
                  id: uuidv4(),
                  news_id: newsId,
                  position: index,
                  created_at: now,
                  updated_at: now,
                })),
              },
            }
          : {}),
      },
      include: ADMIN_EVENT_DETAIL_INCLUDE,
    });

    return serializeEvent(item);
  }

  async updateEvent(id: string, data: UpdateEventData) {
    const existing = await prisma.events.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Event not found', 404);
    }

    const startDate = data.start_date ? new Date(data.start_date) : existing.start_date;
    const endDate = data.end_date === undefined
      ? existing.end_date
      : data.end_date
        ? new Date(data.end_date)
        : null;
    const registrationEndAt = data.registration_end_at === undefined
      ? existing.registration_end_at
      : data.registration_end_at
        ? new Date(data.registration_end_at)
        : null;

    validateEventDates(startDate, endDate, registrationEndAt);

    const slug = data.slug !== undefined
      ? await generateUniqueSlug(data.slug || data.title || existing.title, data.title || existing.title, id)
      : existing.slug;
    const articleIds = data.article_ids === undefined ? undefined : normalizeArticleIds(data.article_ids);

    if (articleIds !== undefined) {
      await validateRelatedNewsIds(articleIds);
    }

    const now = new Date();
    const item = await prisma.$transaction(async (tx) => {
      await tx.events.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.title_id !== undefined ? { title_id: sanitizeOptionalText(data.title_id) } : {}),
          ...(data.hero_title !== undefined ? { hero_title: sanitizeOptionalText(data.hero_title) } : {}),
          ...(data.hero_title_id !== undefined ? { hero_title_id: sanitizeOptionalText(data.hero_title_id) } : {}),
          ...(data.slug !== undefined ? { slug } : {}),
          ...(data.excerpt !== undefined ? { excerpt: sanitizeOptionalHtml(data.excerpt) } : {}),
          ...(data.excerpt_id !== undefined ? { excerpt_id: sanitizeOptionalHtml(data.excerpt_id) } : {}),
          ...(data.content !== undefined ? { content: sanitizeHtmlContent(data.content.trim()) } : {}),
          ...(data.content_id !== undefined ? { content_id: sanitizeOptionalHtml(data.content_id) } : {}),
          ...(data.cover_image !== undefined ? { cover_image: sanitizeOptionalText(data.cover_image) } : {}),
          ...(data.location !== undefined ? { location: sanitizeOptionalText(data.location) } : {}),
          ...(data.venue !== undefined ? { venue: sanitizeOptionalText(data.venue) } : {}),
          ...(data.address !== undefined ? { address: sanitizeOptionalText(data.address) } : {}),
          ...(data.map_embed_url !== undefined ? { map_embed_url: sanitizeOptionalText(data.map_embed_url) } : {}),
          ...(data.organizer_label !== undefined ? { organizer_label: sanitizeOptionalText(data.organizer_label) } : {}),
          ...(data.organizer_name !== undefined ? { organizer_name: sanitizeOptionalText(data.organizer_name) } : {}),
          ...(data.organizer_logo !== undefined ? { organizer_logo: sanitizeOptionalText(data.organizer_logo) } : {}),
          ...(data.ticket_price !== undefined ? { ticket_price: sanitizeOptionalText(data.ticket_price) } : {}),
          ...(data.register_link !== undefined ? { register_link: sanitizeOptionalText(data.register_link) } : {}),
          ...(data.registration_end_at !== undefined ? { registration_end_at: registrationEndAt } : {}),
          ...(data.max_register_participants !== undefined
            ? { max_register_participants: normalizeMaxRegisterParticipants(data.max_register_participants) }
            : {}),
          ...(data.start_date !== undefined ? { start_date: startDate } : {}),
          ...(data.end_date !== undefined ? { end_date: endDate } : {}),
          ...(data.status !== undefined ? { status: data.status as any } : {}),
          updated_at: now,
        },
      });

      if (articleIds !== undefined) {
        await tx.event_news_relations.deleteMany({ where: { event_id: id } });

        if (articleIds.length) {
          await tx.event_news_relations.createMany({
            data: articleIds.map((newsId, index) => ({
              id: uuidv4(),
              event_id: id,
              news_id: newsId,
              position: index,
              created_at: now,
              updated_at: now,
            })),
          });
        }
      }

      return tx.events.findUnique({
        where: { id },
        include: ADMIN_EVENT_DETAIL_INCLUDE,
      });
    });

    return serializeEvent(item);
  }

  async deleteEvent(id: string) {
    const existing = await prisma.events.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError('Event not found', 404);
    }

    await prisma.events.delete({ where: { id } });
  }
}

export default new EventService();
