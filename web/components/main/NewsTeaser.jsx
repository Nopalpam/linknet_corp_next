'use client';

import React, { useMemo } from 'react';
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import CardNews from '../base/cards/CardNews'; // Sesuaikan path

import { useParams } from 'next/navigation';

import { resolveIntroTextValue } from '../../../shared/presentation/intro';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function withLocale(href, locale) {
  if (!href || !locale) return href;
  if (href.startsWith('http') || href.startsWith('#') || href.startsWith(`/${locale}`)) {
    return href;
  }

  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

function getCategoryHref(cta, locale) {
  const href = cta.href || cta.action || '';
  const linkType = cta.linkType || cta.link_type || 'url';
  if (linkType === 'action-modal' || href.startsWith('http') || href.startsWith('#') || href.startsWith('/')) {
    return withLocale(href, locale);
  }

  return withLocale(`/news/category/${href}`, locale);
}

export default function NewsTeaser({
  name = 'home', // Menerima prop name
  cmsData = null,
  mainData = null,
  locale: localeProp,
  className = ""
}) {


  const params = useParams();
const locale = params.locale || localeProp || 'en';

  const sectionData = cmsData || {};
  const serverNews = mainData?.news || [];
  const serverCategory = mainData?.category || null;
  const [clientNews, setClientNews] = React.useState([]);

  React.useEffect(() => {
    if (!sectionData || serverNews.length > 0) return;

    const categoryId = sectionData.category_id || sectionData.categoryId;
    if (!categoryId) return;

    const queryParams = new URLSearchParams();
    queryParams.set('page', '1');
    queryParams.set('limit', String(sectionData.limit || sectionData.max_data || 6));
    queryParams.set('category_id', categoryId);
    queryParams.set('sortBy', 'news_date');
    queryParams.set('sortOrder', sectionData.order === 'oldest' ? 'asc' : 'desc');

    let cancelled = false;
    fetch(`${API_BASE_URL}/public/news?${queryParams.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) setClientNews(json?.data || []);
      })
      .catch((error) => console.error('Error fetching news teaser:', error));

    return () => {
      cancelled = true;
    };
  }, [sectionData, serverNews.length]);

  const categoryTitle = useMemo(() => {
    const category = serverCategory || null;
    if (!category) return '';
    if (locale === 'id' && category.name_id) return category.name_id;
    return category.name_en || resolveIntroTextValue(category.name) || '';
  }, [locale, serverCategory]);

  const localizeNewsTitle = (news) => {
    if (locale === 'id' && news.title_id) return news.title_id;
    return news.title_en || news.title || '';
  };

  const localizeCategoryName = (category) => {
    if (!category) return '';
    if (locale === 'id' && category.name_id) return category.name_id;
    return category.name_en || resolveIntroTextValue(category.label) || resolveIntroTextValue(category.name) || '';
  };

  const ctaItems = useMemo(() => {
    if (!Array.isArray(sectionData?.ctaList)) return [];
    return sectionData.ctaList.map((cta) => ({
      ...cta,
      href: serverCategory?.slug && (!cta.href || cta.href === 'press-release')
        ? serverCategory.slug
        : cta.href,
    }));
  }, [sectionData, serverCategory]);

  // 1. Filter dan Urutkan Data
  const displayNews = useMemo(() => {
    // Jika data tidak ditemukan, kembalikan array kosong
    if (!sectionData) return [];
    if (serverNews.length > 0) return serverNews;
    if (clientNews.length > 0) return clientNews;

    return [];
  }, [sectionData, serverNews, clientNews]);

  // Jika tidak ada data section atau tidak ada berita yang sesuai, jangan render apa-apa
  if (!sectionData || !displayNews || displayNews.length === 0) return null;

  const introData = sectionData.introData || sectionData.sectionIntro || sectionData.intro || null;
  const resolvedIntroData = {
    ...(introData || {}),
    label: resolveIntroTextValue(introData?.label),
    title: resolveIntroTextValue(introData?.title) || categoryTitle,
    description: resolveIntroTextValue(introData?.description),
  };
  const hasIntro = Boolean(resolvedIntroData.label || resolvedIntroData.title || resolvedIntroData.description);
  const { config } = sectionData;
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

  return (
    <section
      id={sectionId}
      className={`lnSection__newsTeaser lnNewsTeaser py-8 md:py-12 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {hasIntro && (
          <div className="mb-8 md:mb-10">
            <Intro
              as={resolvedIntroData.as || 'h2'}
              label={resolvedIntroData.label}
              title={resolvedIntroData.title}
              description={resolvedIntroData.description}
              align={resolvedIntroData.align || 'left'}
            />
          </div>
        )}

        {/* 1. CATEGORY TITLE */}
        {categoryTitle && !hasIntro && (
          <div className="mb-8 md:mb-8">
            <h2 className="text-[28px] md:text-[40px] leading-tight font-bold text-neutral-900">
              {categoryTitle}
            </h2>
          </div>
        )}

        {/* 2. NEWS GRID (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayNews.map((news) => (
            <CardNews
              key={news.id}
              variant="default-row" // Menggunakan varian default yang sudah responsif
              image={news.news_thumbnail || news.image}
              badgeText={localizeCategoryName(news.news_categories || news.category)}
              title={localizeNewsTitle(news)}
              author={news.author || 'Linknet'}
              date={news.news_date || news.newsDate}
              href={`/${locale}/news/${news.slug}`}
            />
          ))}
        </div>

        {/* 3. CTA SECTION */}
        <CTAList
          ctaList={ctaItems?.map((cta) => ({ ...cta, href: getCategoryHref(cta, locale) }))}
          align="center"
          className="mt-10 md:mt-14"
          defaultVariant="secondary-outline"
          defaultSize="lg"
        />

      </div>
    </section>
  );
}
