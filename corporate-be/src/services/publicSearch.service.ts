import {
  ContentStatus,
  MenuPosition,
  PageStatus,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

type SearchLocale = 'en' | 'id';

export type PublicSearchResult = {
  id: string;
  type: 'menu' | 'page' | 'news';
  title: string;
  description: string;
  url: string;
  publishedAt: Date | null;
};

const getLocalizedMenuTitle = (
  title: string,
  translations: unknown,
  locale: SearchLocale
): string => {
  if (!translations || typeof translations !== 'object' || Array.isArray(translations)) {
    return title;
  }

  const localized = (translations as Record<string, unknown>)[locale];
  if (typeof localized === 'string') return localized;
  if (localized && typeof localized === 'object' && !Array.isArray(localized)) {
    const translatedTitle = (localized as Record<string, unknown>).title;
    if (typeof translatedTitle === 'string') return translatedTitle;
  }

  return title;
};

const rankResult = (result: PublicSearchResult, normalizedQuery: string): number => {
  const title = result.title.toLocaleLowerCase();
  if (title === normalizedQuery) return 0;
  if (title.startsWith(normalizedQuery)) return 1;
  if (title.includes(normalizedQuery)) return 2;
  return 3;
};

export class PublicSearchService {
  static async search(
    query: string,
    locale: SearchLocale = 'en',
    limit = 10
  ): Promise<PublicSearchResult[]> {
    const search = query.trim();
    const take = Math.min(Math.max(limit, 1), 20);
    const now = new Date();

    const [menus, pages, newsItems] = await Promise.all([
      prisma.menu.findMany({
        where: {
          isActive: true,
          position: { in: [MenuPosition.HEADER, MenuPosition.BOTH] },
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { sectionTitle: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { url: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          translations: true,
          description: true,
          slug: true,
          url: true,
          updatedAt: true,
        },
        orderBy: { order: 'asc' },
        take,
      }),
      prisma.page.findMany({
        where: {
          status: PageStatus.PUBLISHED,
          deletedAt: null,
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { titleEn: { contains: search, mode: 'insensitive' } },
            { titleId: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
            { metaTitle: { contains: search, mode: 'insensitive' } },
            { metaDescription: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          titleEn: true,
          titleId: true,
          slug: true,
          metaDescription: true,
          publishedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
        take,
      }),
      prisma.news.findMany({
        where: {
          status: ContentStatus.PUBLISHED,
          visibility: 'PUBLIC',
          deleted_at: null,
          AND: [
            { OR: [{ published_at: null }, { published_at: { lte: now } }] },
            { news_categories: { is: { is_active: true, deleted_at: null } } },
          ],
          OR: [
            { title_en: { contains: search, mode: 'insensitive' } },
            { title_id: { contains: search, mode: 'insensitive' } },
            { excerpt_en: { contains: search, mode: 'insensitive' } },
            { excerpt_id: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title_en: true,
          title_id: true,
          excerpt_en: true,
          excerpt_id: true,
          slug: true,
          published_at: true,
          news_date: true,
        },
        orderBy: { news_date: 'desc' },
        take,
      }),
    ]);

    const results: PublicSearchResult[] = [
      ...menus.map((menu) => ({
        id: menu.id.toString(),
        type: 'menu' as const,
        title: getLocalizedMenuTitle(menu.title, menu.translations, locale),
        description: menu.description || '',
        url: menu.url || `/${menu.slug || ''}`,
        publishedAt: menu.updatedAt || null,
      })),
      ...pages.map((page) => ({
        id: page.id,
        type: 'page' as const,
        title: locale === 'id'
          ? page.titleId || page.title || page.titleEn || ''
          : page.titleEn || page.title || page.titleId || '',
        description: page.metaDescription || '',
        url: `/${page.slug}`,
        publishedAt: page.publishedAt,
      })),
      ...newsItems.map((news) => ({
        id: news.id,
        type: 'news' as const,
        title: locale === 'id' ? news.title_id || news.title_en : news.title_en || news.title_id || '',
        description: locale === 'id'
          ? news.excerpt_id || news.excerpt_en || ''
          : news.excerpt_en || news.excerpt_id || '',
        url: `/news/${news.slug}`,
        publishedAt: news.published_at || news.news_date,
      })),
    ];

    const normalizedQuery = search.toLocaleLowerCase();
    return results
      .sort((a, b) => rankResult(a, normalizedQuery) - rankResult(b, normalizedQuery))
      .slice(0, take);
  }
}
