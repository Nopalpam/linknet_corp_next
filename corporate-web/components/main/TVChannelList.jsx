'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import Intro from '../base/section/Intro';
import TabsUnderline from '../base/section/TabsUnderline';
import CardTVChannel from '../base/cards/CardTVChannel';
import CTAList from '../base/section/CTAList';
import Icon from '../base/Icon';
import { TV_CHANNEL_LIST_DATA } from '@/data/components/tvChannelList';
import { useLinknetMedia } from '@/hooks/useLinknetMedia';
import { buildMediaTabs, resolveMediaChannels } from '@/lib/mediaService';
import MediaEmptyState from './MediaEmptyState';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function withLocale(href, locale) {
  if (!href || !locale) return href;
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith(`/${locale}`)) {
    return href;
  }

  return href.startsWith('/') ? `/${locale}${href}` : href;
}

export default function TVChannelList({
  name = 'enterprise',
  className = '',
  cmsData = null
}) {
  const params = useParams();
  const locale = params?.locale || 'en';
  const sectionData = cmsData || TV_CHANNEL_LIST_DATA[name];
  const {
    config = {},
    introData,
    tabs = [],
    ctaList = []
  } = sectionData || {};

  const {
    sectionId = 'tv-channel-list'
  } = config;

  const initialTab = tabs[0]?.value || 'all';
  const searchPlaceholder = 'Search by Channel Name / Channel No';
  const mediaSettings = useMemo(() => ({ ...(sectionData || {}), source: 'media_api' }), [sectionData]);
  const { data: mediaData, isLoading } = useLinknetMedia(Boolean(sectionData));
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchValue, setSearchValue] = useState('');
  const channels = useMemo(
    () => resolveMediaChannels(mediaData, mediaSettings, []),
    [mediaData, mediaSettings]
  );
  const resolvedTabs = useMemo(
    () => buildMediaTabs(channels, tabs),
    [channels, tabs]
  );
  const tabValues = resolvedTabs.map((item) => item.value ?? item.id);
  const currentTab = tabValues.includes(activeTab) ? activeTab : (tabValues[0] || 'all');
  const localizedCtaList = ctaList.map((cta) => ({
    ...cta,
    href: withLocale(cta.href, locale)
  }));

  const filteredItems = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return channels
      .filter((item) => {
        const matchTab = currentTab === 'all' || item.categories?.includes(currentTab);
        if (!matchTab) return false;

        if (!keyword) return true;

        return [item.channelName, item.channelNumber]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));
      });
  }, [channels, currentTab, searchValue]);

  if (!sectionData) return null;

  return (
    <div className={cn('lnTVChannelList', className)}>
      <section
        className={cn(
          'lnTVChannelList__hero bg-[url(/assets/bg/bg-ribbon-right.jpg)] bg-cover bg-center py-16 md:py-20 pb-16 md:pb-28'
        )}
      >
        <div className="container">
          {introData ? (
            <div className="lnTVChannelList__intro md:max-w-[820px]">
              <Intro
                as={introData.as || 'h1'}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || 'left'}
              />
            </div>
          ) : null}
        </div>
      </section>

      <section
        id={sectionId}
        className="lnTVChannelList__content relative mt-5 md:-mt-5 rounded-t-[32px] bg-white py-8 md:py-10 lg:py-12"
      >
        <div className="container">
          <div className="lnTVChannelList__panel">
            <form
              className="lnTVChannelList__searchWrap -mt-[88px] mb-8 md:mb-10"
              role="search"
              aria-label="Search TV channels"
              onSubmit={(event) => event.preventDefault()}
            >
              <label className="lnTVChannelList__searchBar flex w-full items-center gap-2.5 md:gap-4 rounded-[16px] bg-white px-4 py-4 md:py-5.5 border border-[#f3f3f3] shadow-lg md:px-7">
                <Icon
                  name="search"
                  className="lnTVChannelList__searchIcon text-neutral-500 shrink-0"
                  style={{ '--icon-size': '24px' }}
                />
                <input
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="lnTVChannelList__searchInput w-full border-none bg-transparent p-0 text-body-b4 text-black outline-none placeholder:text-neutral-400 focus:ring-0"
                  autoComplete="off"
                />
              </label>
            </form>

            <div className="overflow-hidden">
              {channels.length > 0 && resolvedTabs.length > 0 && (
                <TabsUnderline
                  items={resolvedTabs}
                  value={currentTab}
                  onChange={setActiveTab}
                  ariaLabel="TV channel categories"
                  className="lnTVChannelList__tabs"
                />
              )}
            </div>

            <div className="lnTVChannelList__count mt-8 md:mt-10">
              <h2 className="text-headline-h5 font-bold text-black">
                {filteredItems.length} Channel TV
              </h2>
            </div>

            {isLoading && filteredItems.length === 0 ? (
              <p className="lnTVChannelList__empty py-10 text-center text-neutral-500">
                Loading TV channels...
              </p>
            ) : filteredItems.length > 0 ? (
              <div className="lnTVChannelList__grid mt-6 grid grid-cols-2 gap-3 md:mt-8 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
                {filteredItems.map((item) => (
                  <CardTVChannel
                    key={item.id}
                    image={item.image}
                    imageAlt={item.channelName}
                    channelName={item.channelName}
                    channelNumber={item.channelNumber}
                    className="lnTVChannelList__card"
                  />
                ))}
              </div>
            ) : (
              <MediaEmptyState className="lnTVChannelList__empty text-neutral-500" />
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
    </div>
  );
}
