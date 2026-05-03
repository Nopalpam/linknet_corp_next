'use client';

import React from 'react';
import Intro from '../base/section/Intro';
import CardNews from '../base/cards/CardNews';
import CTAList from '../base/section/CTAList';

// Import Swiper React components & styles
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function uniqueNews(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    if (!item?.id) return Boolean(item);
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function sortNews(items, order) {
  if (!Array.isArray(items)) return [];
  if (!['latest', 'oldest', 'alphabetical'].includes(order)) return items;

  return [...items].sort((a, b) => {
    if (order === 'alphabetical') {
      return String(a.title_en || a.title || '').localeCompare(String(b.title_en || b.title || ''));
    }

    const left = new Date(a.news_date || a.newsDate || a.created_at || a.createdDate || 0).getTime();
    const right = new Date(b.news_date || b.newsDate || b.created_at || b.createdDate || 0).getTime();
    return order === 'oldest' ? left - right : right - left;
  });
}

function orderNewsByIds(items, ids) {
  if (!Array.isArray(ids) || ids.length === 0) return items;
  const byId = new Map((items || []).map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export default function NewsFeatured({
  name = 'home',
  cmsData = null,
  mainData = null,
  className = "",
  hideCta = false // 1. Tambahkan prop hideCta dengan default false
}) {

    const params = useParams();
  const locale = params.locale || 'en';

  const sectionData = cmsData || {};

  const { config, ctaList } = sectionData;
  const introData = sectionData.introData || sectionData.sectionIntro || sectionData.intro;
  const source = sectionData.source || sectionData.data_source || 'manual';
  const selectedNewsIds = sectionData.news_ids || sectionData.newsIds || sectionData.selected_news_ids || sectionData.selectedNewsIds || [];
  const [clientHighlights, setClientHighlights] = React.useState([]);
  React.useEffect(() => {
    if (source !== 'cms_highlights' && source !== 'news_highlights') return;
    if (mainData?.featured?.length || mainData?.grid?.length || mainData?.news?.length) return;

    let cancelled = false;
    fetch(`${API_BASE_URL}/public/news/highlights?limit=${sectionData.limit || sectionData.featured_count || 5}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) setClientHighlights((json?.data || []).map((item) => item.news || item));
      })
      .catch((error) => console.error('Error fetching news highlights:', error));

    return () => {
      cancelled = true;
    };
  }, [source, mainData, sectionData.limit, sectionData.featured_count]);
  const mainNews = mainData?.news?.length
    ? mainData.news
    : [
        ...(mainData?.featured || []),
        ...(mainData?.grid || []),
        ...clientHighlights,
      ];
  const cmsHighlightNews = uniqueNews(mainNews);
  const manualNews = sectionData.featuredNews || sectionData.items || [];
  const featuredNews = React.useMemo(() => {
    if (source === 'selected_news') {
      return orderNewsByIds(cmsHighlightNews, selectedNewsIds);
    }

    if (source === 'cms_highlights' || source === 'news_highlights') {
      return sortNews(cmsHighlightNews, sectionData.order);
    }

    return sortNews(manualNews.length > 0 ? manualNews : cmsHighlightNews, sectionData.order);
  }, [source, cmsHighlightNews, manualNews, selectedNewsIds, sectionData.order]);

  if (!sectionData || Object.keys(sectionData).length === 0) return null;
  if (!featuredNews || featuredNews.length === 0) return null;
  const {
    sectionId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const localizeNewsTitle = (news) => {
    if (locale === 'id' && news.title_id) return news.title_id;
    if (news.title && typeof news.title === 'object') {
      return news.title[locale] || news.title.en || news.title.id || '';
    }
    return news.title_en || news.title || '';
  };

  const localizeCategoryName = (category) => {
    if (!category) return '';
    if (locale === 'id' && category.name_id) return category.name_id;
    if (category.label && typeof category.label === 'object') {
      return category.label[locale] || category.label.en || category.label.id || '';
    }
    return category.name_en || category.label || category.name || '';
  };

  const normalizeNews = (news) => ({
    ...news,
    image: news.news_thumbnail || news.image,
    title: localizeNewsTitle(news),
    categoryLabel: localizeCategoryName(news.news_categories || news.category),
    newsDate: news.news_date || news.newsDate,
  });

  const normalizedNews = featuredNews.map(normalizeNews);
  const topNews = normalizedNews.slice(0, 2);
  const bottomNews = normalizedNews.slice(2);

  return (
    <section
      id={sectionId}
      className={`lnSection__newsFeatured py-16 md:py-20 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* Intro Section */}
        {introData && (
          <div className="mb-8 md:mb-8">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "left"}
            />
          </div>
        )}

        {/* Top Row: 2 Berita Pertama (Featured Variant) dengan Swiper */}
        {topNews.length > 0 && (
          <div className="mb-8 md:mb-12">
            <Swiper
              spaceBetween={16}
              slidesPerView={1.1}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 2,
                  spaceBetween: 32,
                }
              }}
              className="w-full"
            >
              {topNews.map((news, index) => (
                <SwiperSlide key={index} className="h-auto">
                  <CardNews
                    variant="featured"
                    image={news.image}
                    badgeText={news.categoryLabel}
                    title={news.title}
                    author={news.author || 'Linknet'}
                    date={news.newsDate}
                    href={`/${locale}/news/${news.slug}`}
                    className="h-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Bottom Row: Sisa Berita (Default Variant) */}
        {bottomNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {bottomNews.map((news, index) => (
              <div key={index} className="border-t border-neutral-100 md:border-none pt-6 md:pt-0">
                  <CardNews
                    variant="default"
                    image={news.image}
                    badgeText={news.categoryLabel}
                    title={news.title}
                    author={news.author || 'Linknet'}
                    date={news.newsDate}
                    href={`/${locale}/news/${news.slug}`}
                  />
              </div>
            ))}
          </div>
        )}

        {/* 2. Tambahkan kondisi !hideCta di sini */}
        {!hideCta && (
          <CTAList
            ctaList={ctaList}
            align="center"
            className="mx-auto mt-12 md:mt-20"
            useButton
            defaultSize="md"
          />
        )}

      </div>
    </section>
  );
}
