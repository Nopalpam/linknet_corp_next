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

import { CONTENT_HIGHLIGHT_DATA } from '@/data/components/contentHighlight';
import { NEWS_LIST } from '@/data/components/newsList';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const TAB_OPTIONS = [
  { label: 'Insight', value: 'business-insight' },
  { label: 'News', value: 'news' },
  { label: 'Event', value: 'event' },
];

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

export default function ContentHighlights({
  name = 'home',
  className = '',
  cmsData = null,
}) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const sectionData = cmsData || CONTENT_HIGHLIGHT_DATA[name] || {};
  const [activeTab, setActiveTab] = useState(TAB_OPTIONS[0].value);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [eventItems, setEventItems] = useState([]);

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
    let cancelled = false;
    const qp = new URLSearchParams({
      limit: '5',
      sortBy: 'start_date',
      sortOrder: 'desc',
      locale: String(locale),
    });

    fetch(`${API_BASE_URL}/events?${qp.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) setEventItems(json?.data || []);
      })
      .catch(() => {
        if (!cancelled) setEventItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const contentByTab = useMemo(() => {
    const activeNews = NEWS_LIST.filter((item) => item.status === 'active');
    const activeEvents = eventItems.filter((item) => item.publishStatus !== 'draft' && item.status !== 'DRAFT');

    return {
      'business-insight': sortByDateDesc(
        activeNews.filter((item) => item.category?.slug === 'press-release'),
        (item) => item.newsDate || item.createdDate
      ).slice(0, 5),
      news: sortByDateDesc(
        activeNews.filter((item) => item.category?.slug === 'news'),
        (item) => item.newsDate || item.createdDate
      ).slice(0, 5),
      event: sortByDateDesc(
        activeEvents,
        (item) => item.start_date || item.startDate || item.date || item.end_date || item.endDate
      ).slice(0, 5),
    };
  }, [eventItems]);

  const activeItems = contentByTab[activeTab] || [];
  const activeViewAll = VIEW_ALL_CONFIG[activeTab] || VIEW_ALL_CONFIG['business-insight'];
  const swiperBreakpoints = activeTab === 'event'
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

  if (!sectionData || Object.keys(sectionData).length === 0) return null;

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
              options={TAB_OPTIONS}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        <div className="mt-8 md:mt-10">
          {activeItems.length > 0 ? (
            <div className="relative">
              <Swiper
                key={activeTab}
                spaceBetween={12}
                slidesPerView={activeTab === 'event' ? 1.8 : 1.4}
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
                  <SwiperSlide key={`${activeTab}-${item.id}`} className="!h-auto">
                    <div className="h-full">
                      {activeTab === 'event' ? (
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
                          badgeText={activeTab === 'business-insight' ? 'Business Insight' : 'News'}
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
