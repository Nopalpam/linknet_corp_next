'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import SegmentPicker from '../base/SegmentPicker';
import CardTVHighlight from '../base/cards/CardTVHighlight';
import { TV_HIGHLIGHT_SNEEK_PEAK_DATA } from '@/data/components/tvHighlightSneekPeak';

function withLocale(href, locale) {
  if (!href || !locale) return href;
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith(`/${locale}`)) {
    return href;
  }
  return href.startsWith('/') ? `/${locale}${href}` : href;
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

function duplicateLogos(row = []) {
  return [...row, ...row, ...row];
}

function getLoopedItem(items, index) {
  if (!items.length) return null;

  const normalizedIndex = ((index % items.length) + items.length) % items.length;
  return items[normalizedIndex];
}

function subscribeToMobileViewport(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(max-width: 767px)');
  mediaQuery.addEventListener('change', callback);

  return () => {
    mediaQuery.removeEventListener('change', callback);
  };
}

function getMobileViewportSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(max-width: 767px)').matches;
}

export default function TVHighlightSneekPeak({
  name = 'home',
  className = ''
}) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const swiperRef = useRef(null);
  const sectionData = TV_HIGHLIGHT_SNEEK_PEAK_DATA[name];
  const initialTabValue = sectionData?.config?.initialTab || 'now-showing';
  const initialItems = sectionData?.itemGroups?.[initialTabValue] || [];
  const initialDesktopIndex = Math.floor(initialItems.length / 2);
  const [activeTab, setActiveTab] = useState(
    initialTabValue
  );
  const [activeSlide, setActiveSlide] = useState(initialDesktopIndex);
  const isMobile = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    () => false
  );

  const {
    config = {},
    introData,
    itemGroups = {},
    logoIntro,
    logoRows = [],
    ctaList = []
  } = sectionData || {};

  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover'
  } = config || {};

  const tabs = [
    { value: 'now-showing', label: 'Now Showing' },
    { value: 'trending', label: 'Trending' }
  ];
  const groupKeys = Object.keys(itemGroups);
  const defaultTab = config?.initialTab || tabs[0]?.value || groupKeys[0] || '';
  const currentTab = itemGroups[activeTab] ? activeTab : defaultTab;
  const activeItems = itemGroups[currentTab] || itemGroups[defaultTab] || [];

  const localizedCtaList = ctaList.map((cta) => ({
    ...cta,
    href: withLocale(cta.href, locale)
  }));

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };
  const centerIndex = Math.floor(activeItems.length / 2);
  const scaleMap = { 0: 1.1, 1: 1.075, 2: 1.05, 3: 1 };
  const opacityMap = { 0: .98, 1: 0.96, 2: 0.84, 3: 0.72 };
  const zMap = { 0: 20, 1: 10, 2: 5, 3: 0 };
  const desktopScaleMap = { 0: 1.08, 1: 0.98, 2: 0.9, 3: 0.86 };
  const desktopOpacityMap = { 0: 1, 1: 0.94, 2: 0.82, 3: 0.72 };
  const desktopWidthMap = {
    0: 'md:w-[276px] xl:w-[288px]',
    1: 'md:w-[236px] xl:w-[248px]',
    2: 'md:w-[208px] xl:w-[220px]',
    3: 'md:w-[196px] xl:w-[208px]'
  };
  const initialSlideIndex = isMobile ? 0 : centerIndex;
  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    const nextItems = itemGroups[nextTab] || itemGroups[defaultTab] || [];
    const nextCenterIndex = Math.floor(nextItems.length / 2);
    setActiveSlide(isMobile ? 0 : nextCenterIndex);
  };

  if (!sectionData) return null;

  return (
    <section
      id={sectionId}
      className={cx(
        'lnSection__tvHighlightSneekPeak overflow-hidden py-16 md:py-24',
        'bg-no-repeat bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]',
        bgPositionClasses,
        bgSizeClass,
        configClassName,
        className
      )}
      style={sectionStyle}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tv-highlight-marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }

        @keyframes tv-highlight-marquee-right {
          0% { transform: translate3d(-33.333%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .tvHighlightSneekPeak__marqueeTrack {
          display: flex;
          width: max-content;
        }

        .tvHighlightSneekPeak__marqueeTrack--left {
          animation: tv-highlight-marquee-left 28s linear infinite;
        }

        .tvHighlightSneekPeak__marqueeTrack--right {
          animation: tv-highlight-marquee-right 30s linear infinite;
        }

        .tvHighlightSneekPeak__marquee:hover .tvHighlightSneekPeak__marqueeTrack {
          animation-play-state: paused;
        }
      ` }} />

      <div className="container">
        <div className="mx-auto">
          <div className="flex flex-col gap-8 md:flex-row lg:items-end lg:justify-between">
            <Intro
                as={introData?.as || 'h2'}
                label={introData?.label}
                title={introData?.title}
                description={introData?.description}
                align={introData?.align || 'left'}
              />

            <div className="items-end h-auto pt-1 lg:pt-12">
              <SegmentPicker
                options={tabs}
                value={currentTab}
                onChange={handleTabChange}
                className="w-auto rounded-full bg-light-1 p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
              />
            </div>
          </div>

          <div className="relative mt-6 md:mt-12 md:justify-self-center">
            {isMobile ? (
              <Swiper
                key={`${name}-${currentTab}-${activeItems.map((item) => item.id).join('-')}`}
                spaceBetween={18}
                slidesPerView={1.4}
                loop
                centeredSlides={true}
                initialSlide={initialSlideIndex}
                allowTouchMove
                simulateTouch
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  setActiveSlide(swiper.realIndex || 0);
                }}
                onSlideChange={(swiper) => {
                  setActiveSlide(swiper.realIndex || 0);
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 1.4,
                    spaceBetween: 18
                  }
                }}
                className="w-full !mt-[50px] !overflow-visible md:hidden"
              >
                {activeItems.map((item, index) => {
                  const isActiveMobileSlide = index === activeSlide;
                  return (
                    <SwiperSlide
                      key={item.id}
                      className="!flex !h-auto !items-center !justify-center !overflow-visible !p-0"
                    >
                      <div
                        className="w-full"
                        style={{
                          transform: `scale(${isActiveMobileSlide ? 1.08 : 0.92})`,
                          transformOrigin: 'center',
                          opacity: isActiveMobileSlide ? 1 : 0.72,
                          zIndex: isActiveMobileSlide ? 20 : 0,
                          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out'
                        }}
                      >
                        <CardTVHighlight
                          badge={item.badge}
                          image={item.posterImage || item.posterImage_landscape || item.bgImageVertical}
                          posterImageLandscape={item.posterImage_landscape}
                          bgImageVertical={item.bgImageVertical}
                          posterImage={item.posterImage}
                          title={item.title}
                          year={item.year}
                          category={item.category}
                          rating={item.rating}
                          metaItems={item.metaItems}
                          synopsis={item.synopsis}
                          channelLogo={item.channelLogo}
                          channelName={item.channelName}
                          watchChannel={item.watchChannel}
                          watchChannelCode={item.watchChannelCode}
                          trailerUrl={item.trailerUrl}
                          details={item.details}
                          href={withLocale(item.href, locale)}
                          className="h-full w-full bg-transparent !p-1 shadow-none md:hover:!bg-transparent md:hover:!shadow-none"
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : (
              <div className="hidden md:flex md:items-center md:justify-center md:gap-3 xl:gap-3">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const item = getLoopedItem(activeItems, activeSlide + offset);

                  if (!item) return null;
                  const desktopLevel = Math.min(Math.abs(offset), 3);
                  const scale = desktopScaleMap[desktopLevel];
                  const opacity = desktopOpacityMap[desktopLevel];
                  const zIndex = zMap[desktopLevel];
                  const widthClass = desktopWidthMap[desktopLevel] || desktopWidthMap[3];
                  const transformOrigin = offset === -2
                    ? 'right top'
                    : offset === 2
                      ? 'left top'
                      : 'center top';

                  return (
                    <div
                      key={`${item.id}-${offset}`}
                      className={cx('w-full shrink-0', widthClass)}
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin,
                        opacity,
                        zIndex,
                        transition: 'transform 0.5s ease-out, opacity 0.5s ease-out'
                      }}
                    >
                      <CardTVHighlight
                        badge={item.badge}
                        image={item.posterImage || item.posterImage_landscape || item.bgImageVertical}
                        posterImageLandscape={item.posterImage_landscape}
                        bgImageVertical={item.bgImageVertical}
                        posterImage={item.posterImage}
                        title={item.title}
                        year={item.year}
                        category={item.category}
                        rating={item.rating}
                        metaItems={item.metaItems}
                        synopsis={item.synopsis}
                        channelLogo={item.channelLogo}
                        channelName={item.channelName}
                        watchChannel={item.watchChannel}
                        watchChannelCode={item.watchChannelCode}
                        trailerUrl={item.trailerUrl}
                        details={item.details}
                        href={withLocale(item.href, locale)}
                        className="h-full w-full bg-transparent !p-1 shadow-none md:hover:!bg-transparent md:hover:!shadow-none"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {activeItems.length === 0 && (
              <p className="py-10 text-center text-body-b4 text-secondary">
                No TV highlight data available.
              </p>
            )}
          </div>

          {logoIntro && (
            <div className="mt-12 text-center md:mt-20">
              <p className="text-headline-h4 font-bold text-black">
                Enjoy 100+ of the best TV channels
              </p>
            </div>
          )}

          {logoRows.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 md:mt-10 md:gap-0">
              {logoRows.map((row, rowIndex) => (
                <div
                  key={`logo-row-${rowIndex}`}
                  className="tvHighlightSneekPeak__marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
                >
                  <div
                    className={cx(
                      'tvHighlightSneekPeak__marqueeTrack items-center gap-10 md:gap-12',
                      rowIndex % 2 === 0
                        ? 'tvHighlightSneekPeak__marqueeTrack--left'
                        : 'tvHighlightSneekPeak__marqueeTrack--right'
                    )}
                  >
                    {duplicateLogos(row).map((logo, logoIndex) => (
                      <img
                        key={`${logo.name}-${rowIndex}-${logoIndex}`}
                        src={logo.img}
                        alt={logo.name}
                        title={logo.name}
                        className="h-16 w-auto shrink-0 object-contain opacity-95 md:h-24"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <CTAList
            ctaList={localizedCtaList}
            align="center"
            className="mt-12 md:mt-16"
            ctaClassName="!rounded-full !border-neutral-200 !bg-white !px-8 md:!px-10 !text-black hover:!border-neutral-300 hover:!bg-neutral-50"
            defaultSize="lg"
          />
        </div>
      </div>
    </section>
  );
}
