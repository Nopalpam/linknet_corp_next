'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Grid } from 'swiper/modules';
import gsap from 'gsap';
import 'swiper/css';
import 'swiper/css/grid';

import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import SectionPillTabs from '../base/section/SectionPillTabs';
import CardTVChannel from '../base/cards/CardTVChannel';
import { TV_CHANNEL_SNEAK_PEEK_DATA } from '@/data/components/tvChannelSneakPeek';
import { hasIntroContent } from '../../../shared/presentation/intro';
import { useLinknetMedia } from '@/hooks/useLinknetMedia';
import { buildMediaTabs, resolveMediaChannels } from '@/lib/mediaService';
import MediaEmptyState from './MediaEmptyState';

function withLocale(href, locale) {
  if (!href || !locale) return href;
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith(`/${locale}`)) {
    return href;
  }

  return href.startsWith('/') ? `/${locale}${href}` : href;
}

export default function TVChannelSneakPeek({
  name = 'home',
  className = '',
  cmsData = null
}) {
  const sectionRef = useRef(null);
  const params = useParams();
  const locale = params?.locale || 'en';
  const sectionData = cmsData || TV_CHANNEL_SNEAK_PEEK_DATA[name];
  const configuredTabs = sectionData?.tabs || [];
  const initialTab = sectionData?.config?.initialTab || configuredTabs[0]?.value || 'all';
  const mediaSettings = useMemo(() => ({ ...(sectionData || {}), source: 'media_api' }), [sectionData]);
  const { data: mediaData, isLoading } = useLinknetMedia(Boolean(sectionData));
  const channels = useMemo(
    () => resolveMediaChannels(mediaData, { ...mediaSettings, limit: 0 }, []),
    [mediaData, mediaSettings]
  );
  const tabs = useMemo(
    () => buildMediaTabs(channels, configuredTabs),
    [channels, configuredTabs]
  );
  const [tabState, setTabState] = useState({
    scope: name,
    value: initialTab
  });
  const {
    config = {},
    introData,
    ctaList = []
  } = sectionData || {};
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
    displayLimit: configDisplayLimit = 8,
    mobileSlidesPerView = 2,
    mobileGridRows = 2
  } = config || {};
  const displayLimit = Number(sectionData?.limit || configDisplayLimit || 8);

  const tabValues = tabs.map((item) => item.value ?? item.id);
  const requestedTab = tabState.scope === name ? tabState.value : initialTab;
  const activeTab = tabValues.includes(requestedTab) ? requestedTab : (tabValues[0] || 'all');

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const activeChannels = channels
    .filter((item) => activeTab === 'all' || item.categories?.includes(activeTab))
    .slice(0, displayLimit);

  const localizedCtaList = ctaList.map((cta) => ({
    ...cta,
    href: withLocale(cta.href, locale)
  }));

  useEffect(() => {
    if (!sectionRef.current || activeChannels.length === 0) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.lnGsapTvChannelCard');
      if (!cards.length) return;

      gsap.fromTo(
        cards,
        {
          y: 20,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [activeTab, activeChannels.length]);

  if (!sectionData) return null;

  return (
    <section
      ref={sectionRef}
      id={sectionId}
      className={`lnSection__tvChannelSneakPeek overflow-hidden py-16 md:py-24
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">
        <div className="mx-auto max-w-[1440px]">
          {hasIntroContent(introData) && (
            <div className="max-w-[920px]">
              <Intro
                as={introData.as || 'h2'}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || 'left'}
                titleClassName="text-headline-h2 !mt-0 max-w-[720px]"
                descriptionClassName="max-w-[720px]"
              />
            </div>
          )}

          {channels.length > 0 && tabs.length > 0 && (
            <SectionPillTabs
              items={tabs}
              value={activeTab}
              onChange={(nextTab) => setTabState({ scope: name, value: nextTab })}
              ariaLabel="TV channel categories"
              className="mt-8"
            />
          )}

          {isLoading && activeChannels.length === 0 ? (
            <p className="mt-10 text-body-b4 text-secondary">
              Loading channels...
            </p>
          ) : activeChannels.length > 0 ? (
            <>
              <div className="mt-8 md:hidden">
                <Swiper
                  key={`${name}-${activeTab}-${activeChannels.length}`}
                  modules={[Grid]}
                  slidesPerView={mobileSlidesPerView}
                  grid={{
                    rows: mobileGridRows,
                    fill: 'row'
                  }}
                  spaceBetween={12}
                  watchOverflow
                  className="!overflow-visible !pb-2"
                >
                  {activeChannels.map((channel) => (
                    <SwiperSlide key={channel.id} className="!h-auto">
                      <CardTVChannel
                        image={channel.image}
                        imageAlt={channel.channelName}
                        channelName={channel.channelName}
                        channelNumber={channel.channelNumber}
                        className="h-full"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="mt-8 hidden grid-cols-2 gap-5 md:grid xl:grid-cols-4 md:gap-[16px]">
                {activeChannels.map((channel) => (
                  <CardTVChannel
                    key={channel.id}
                    image={channel.image}
                    imageAlt={channel.channelName}
                    channelName={channel.channelName}
                    channelNumber={channel.channelNumber}
                    className=""
                  />
                ))}
              </div>
            </>
          ) : (
            <MediaEmptyState className="mt-10" />
          )}

          <CTAList
            ctaList={localizedCtaList}
            align="center"
            className="mt-10 md:mt-14"
            ctaClassName="!rounded-full !border-neutral-200 !px-8 md:!px-10 !text-black hover:!border-neutral-300"
            defaultSize="lg"
          />
        </div>
      </div>
    </section>
  );
}
