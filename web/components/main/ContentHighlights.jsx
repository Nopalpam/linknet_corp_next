'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import Intro from '../base/section/Intro';
import SegmentPicker from '../base/SegmentPicker';
import CardNews from '../base/cards/CardNews';
import CardEvent from '../base/cards/CardEvent';
import CTAList from '../base/section/CTAList';
import Icon from '../base/Icon';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const DEFAULT_CATEGORIES = [
  { label: 'Insight', value: 'business-insight', source: 'news', category_slug: 'press-release', is_visible: true },
  { label: 'News', value: 'news', source: 'news', category_slug: 'news', is_visible: true },
  { label: 'Event', value: 'event', source: 'events', category_slug: '', is_visible: true },
];

const EMPTY_SECTION_DATA = {};

const VIEW_ALL_CONFIG = {
  'business-insight': {
    label: 'View All Business Insight',
    href: '/news/category/press-release',
  },
  news: {
    label: 'View All News',
    href: '/news/category/news',
  },
  event: {
    label: 'View All Event',
    href: '/events',
  },
};

function withLocale(href, locale) {
  if (!href || !locale) return href;
  if (href.startsWith('http') || href.startsWith('#') || href.startsWith(`/${locale}`)) {
    return href;
  }

  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

function sortByDateDesc(items, getDate) {
  return [...items].sort((a, b) => {
    const left = new Date(getDate(a) || 0).getTime();
    const right = new Date(getDate(b) || 0).getTime();

    return right - left;
  });
}

function normalizeCategory(category, index) {
  if (!category || typeof category !== 'object') return null;
  const value = String(category.value || category.slug || category.key || `category-${index + 1}`).trim();
  if (!value) return null;

  return {
    label: category.label || category.name || category.title || value,
    value,
    source: String(category.source || category.type || (value === 'event' ? 'events' : 'news')).toLowerCase(),
    categorySlug: category.category_slug || category.categorySlug || category.slug || '',
    href: category.href || category.url || '',
    isVisible: category.is_visible !== false && category.isVisible !== false && category.visible !== false,
    sortOrder: Number.isFinite(Number(category.sort_order ?? category.sortOrder ?? category.order))
      ? Number(category.sort_order ?? category.sortOrder ?? category.order)
      : index,
    originalIndex: index,
  };
}

function normalizeCategories(cmsData) {
  const source = Array.isArray(cmsData?.categories) && cmsData.categories.length > 0
    ? cmsData.categories
    : DEFAULT_CATEGORIES;

  return source
    .map(normalizeCategory)
    .filter((category) => category?.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.originalIndex - b.originalIndex);
}

function normalizeNewsItem(item, locale) {
  const category = item.category || item.news_categories || {};
  return {
    ...item,
    title: locale === 'id' ? item.title_id || item.titleId || item.title : item.title_en || item.titleEn || item.title,
    image: item.image || item.news_thumbnail || item.thumbnail || '',
    newsDate: item.newsDate || item.news_date || item.published_at || item.created_at,
    category,
  };
}

function normalizeEventItem(item, locale) {
  return {
    ...item,
    title: locale === 'id' ? item.title_id || item.titleId || item.title : item.title_en || item.titleEn || item.title,
    cover_image: item.cover_image || item.coverImage || item.image || '',
  };
}

export default function ContentHighlights({
  name = 'home',
  className = '',
  cmsData = null,
  mainData = null,
}) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const sectionData = cmsData || EMPTY_SECTION_DATA;
  const categories = useMemo(() => normalizeCategories(sectionData), [sectionData]);
  const [activeTab, setActiveTab] = useState(categories[0]?.value || '');
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [fetchedItems, setFetchedItems] = useState({});
  const resolvedActiveTab = categories.some((category) => category.value === activeTab)
    ? activeTab
    : (categories[0]?.value || '');

  const { config, introData } = sectionData;
  const {
    sectionId = 'content-highlights',
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  useEffect(() => {
    if (mainData?.items) return;
    let cancelled = false;
    const limit = Number(sectionData.limit || sectionData.max_data || 5) || 5;
    const sortBy = sectionData.sort_by || sectionData.sortBy || 'published_at';
    const sortOrder = String(sectionData.sort_direction || sectionData.sortDirection || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

    Promise.all(categories.map(async (category) => {
      const qp = new URLSearchParams({ limit: String(limit), locale: String(locale) });
      if (category.source === 'events' || category.source === 'event') {
        qp.set('sortBy', 'start_date');
        qp.set('sortOrder', sortOrder);
        const res = await fetch(`${API_BASE_URL}/events?${qp.toString()}`);
        const json = res.ok ? await res.json() : null;
        return [category.value, (json?.data || []).map((item) => normalizeEventItem(item, locale))];
      }

      qp.set('page', '1');
      qp.set('sortBy', String(sortBy));
      qp.set('sortOrder', sortOrder);
      const url = category.categorySlug
        ? `${API_BASE_URL}/public/news/category/${encodeURIComponent(category.categorySlug)}?${qp.toString()}`
        : `${API_BASE_URL}/public/news?${qp.toString()}`;
      const res = await fetch(url);
      const json = res.ok ? await res.json() : null;
      return [category.value, (json?.data || []).map((item) => normalizeNewsItem(item, locale))];
    }))
      .then((entries) => {
        if (!cancelled) setFetchedItems(Object.fromEntries(entries));
      })
      .catch(() => {
        if (!cancelled) setFetchedItems({});
      });

    return () => {
      cancelled = true;
    };
  }, [categories, locale, mainData, sectionData.limit, sectionData.max_data, sectionData.sort_by, sectionData.sortBy, sectionData.sort_direction, sectionData.sortDirection]);

  const contentByTab = useMemo(() => {
    const serverItems = mainData?.items && typeof mainData.items === 'object' ? mainData.items : null;
    const sourceItems = serverItems || fetchedItems;
    const limit = Number(sectionData.limit || sectionData.max_data || 5) || 5;

    return categories.reduce((acc, category) => {
      const rawItems = Array.isArray(sourceItems?.[category.value]) ? sourceItems[category.value] : [];
      const isEvent = category.source === 'event' || category.source === 'events';
      acc[category.value] = sortByDateDesc(
        rawItems.map((item) => isEvent ? normalizeEventItem(item, locale) : normalizeNewsItem(item, locale)),
        (item) => isEvent
          ? item.start_date || item.startDate || item.date || item.end_date || item.endDate
          : item.newsDate || item.news_date || item.createdDate || item.created_at
      ).slice(0, limit);
      return acc;
    }, {});
  }, [categories, fetchedItems, locale, mainData, sectionData.limit, sectionData.max_data]);

  const activeItems = contentByTab[resolvedActiveTab] || [];
  const activeCategory = categories.find((category) => category.value === resolvedActiveTab);
  const activeViewAll = {
    ...(VIEW_ALL_CONFIG[resolvedActiveTab] || VIEW_ALL_CONFIG['business-insight']),
    ...(activeCategory?.href ? { href: activeCategory.href } : {}),
  };
  const swiperBreakpoints = resolvedActiveTab === 'event'
    ? {
        0: {
          slidesPerView: 1.8,
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
      }
    : {
        640: {
          slidesPerView: 1.4,
          spaceBetween: 12,
        },
        768: {
          slidesPerView: 2.1,
          spaceBetween: 16,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
      };

  const syncSwiperState = (swiper) => {
    setSwiperInstance(swiper);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  if (categories.length === 0) return null;

  const ctaList = Array.isArray(sectionData.ctaList) && sectionData.ctaList.length > 0
    ? sectionData.ctaList
    : [{
        label: activeViewAll.label,
        text: activeViewAll.label,
        href: activeViewAll.href,
        variant: 'secondary-outline',
        size: 'lg',
      }];

  return (
    <section
      id={sectionId}
      className={`lnSection__contentHighlights py-16 md:py-20 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full">
            <Intro
              as={introData?.as || 'h2'}
              label={introData?.label}
              title={introData?.title}
              description={introData?.description}
              align={introData?.align || 'left'}
              className="whitespace-pre-line"
            />
          </div>

          <div className="flex justify-start lg:justify-end shrink-0">
            <SegmentPicker
              options={categories.map((category) => ({ label: category.label, value: category.value }))}
              value={resolvedActiveTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        <div className="mt-8 md:mt-10">
          {activeItems.length > 0 ? (
            <div className="relative">
              <Swiper
                key={resolvedActiveTab}
                spaceBetween={12}
                slidesPerView={resolvedActiveTab === 'event' ? 1.8 : 1.4}
                breakpoints={swiperBreakpoints}
                onSwiper={syncSwiperState}
                onSlideChange={syncSwiperState}
                onReachBeginning={syncSwiperState}
                onReachEnd={syncSwiperState}
                onFromEdge={syncSwiperState}
                onResize={syncSwiperState}
                className="w-full overflow-hidden"
              >
                {activeItems.map((item) => (
                  <SwiperSlide key={`${resolvedActiveTab}-${item.id}`} className="!h-auto">
                    <div className="h-full">
                      {activeCategory?.source === 'event' || activeCategory?.source === 'events' ? (
                        <CardEvent
                          href={withLocale(`/events/${item.slug}`, locale)}
                          image={item.cover_image || item.image || item.thumbnailImage}
                          title={item.title}
                          date={item.date}
                          startDate={item.start_date || item.startDate}
                          endDate={item.end_date || item.endDate}
                          location={item.location || item.venue}
                          status={item.public_state || item.state || item.status}
                          className="!max-w-none w-full h-full"
                        />
                      ) : (
                        <CardNews
                          variant="featured"
                          image={item.image}
                          badgeText={activeCategory?.label || item.category?.name || 'News'}
                          title={item.title}
                          author={item.author}
                          date={item.newsDate}
                          href={withLocale(`/news/${item.slug}`, locale)}
                          className="h-full"
                        />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-20 hidden items-center justify-between md:flex">
                <button
                  type="button"
                  onClick={() => swiperInstance?.slidePrev()}
                  className={`pointer-events-auto mb-[10%]  -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-yellow-500 ${
                    isBeginning ? 'cursor-default opacity-40' : 'opacity-100'
                  }`}
                  aria-label="Previous Slide"
                  disabled={isBeginning}
                >
                  <Icon name="chevron-left" />
                </button>
                <button
                  type="button"
                  onClick={() => swiperInstance?.slideNext()}
                  className={`pointer-events-auto mb-[10%] translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-neutral-800 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:text-yellow-500 ${
                    isEnd ? 'cursor-default opacity-40' : 'opacity-100'
                  }`}
                  aria-label="Next Slide"
                  disabled={isEnd}
                >
                  <Icon name="chevron-right" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-[20px] bg-light-1 px-6 py-10 text-center text-secondary">
              Belum ada konten untuk kategori ini.
            </div>
          )}
        </div>

        <div className="mt-10 flex justify-center md:mt-14">
          <CTAList
            ctaList={ctaList.map((cta) => ({
              ...cta,
              href: withLocale(cta.href || cta.action, locale),
            }))}
            align="center"
            defaultVariant="secondary-outline"
            defaultSize="lg"
          />
        </div>
      </div>
    </section>
  );
}
