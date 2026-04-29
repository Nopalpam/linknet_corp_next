'use client';

import { useMemo, useState } from 'react';

import Intro from '../base/section/Intro';
import TabsUnderline from '../base/section/TabsUnderline';
import CardTVChannel from '../base/cards/CardTVChannel';
import Icon from '../base/Icon';
import { TV_CHANNEL_LIST_DATA } from '@/data/components/tvChannelList';
import { TV_CHANNEL_CATALOG } from '@/data/components/tvChannelData';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function TVChannelList({
  name = 'enterprise',
  className = ''
}) {
  const sectionData = TV_CHANNEL_LIST_DATA[name];
  const {
    config = {},
    introData,
    tabs = []
  } = sectionData || {};

  const {
    sectionId = 'tv-channel-list'
  } = config;

  const initialTab = tabs[0]?.value || 'all';
  const searchPlaceholder = 'Search by Channel Name / Channel No';
  const emptyMessage = 'No TV channels match your search right now.';
  const catalogItems = useMemo(() => Object.values(TV_CHANNEL_CATALOG), []);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return catalogItems
      .filter((item) => {
        const matchTab = activeTab === 'all' || item.categories?.includes(activeTab);
        if (!matchTab) return false;

        if (!keyword) return true;

        return [item.channelName, item.channelNumber]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword));
      })
      .sort((a, b) => {
        const byName = (a.channelName || '').localeCompare(b.channelName || '');
        if (byName !== 0) return byName;

        return (a.channelNumber || '').localeCompare(b.channelNumber || '');
      });
  }, [activeTab, catalogItems, searchValue]);

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
              <TabsUnderline
              items={tabs}
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="TV channel categories"
              className="lnTVChannelList__tabs"
            />
            </div>

            <div className="lnTVChannelList__count mt-8 md:mt-10">
              <h2 className="text-headline-h5 font-bold text-black">
                {filteredItems.length} Channel TV
              </h2>
            </div>

            {filteredItems.length > 0 ? (
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
              <p className="lnTVChannelList__empty py-10 text-center text-neutral-500">
                {emptyMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
