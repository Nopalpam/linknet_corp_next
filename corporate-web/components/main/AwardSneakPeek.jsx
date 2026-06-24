'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import UI Components
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import CardAward from '../base/cards/CardAward';
import { hasIntroContent } from '@/shared/presentation/intro';

// =========================================
// IMPORT DUA SUMBER DATA BERBEDA
// =========================================
import { AWARDS_SNEAK_PEEK_DATA } from '@/data/components/AwardsSneakPeek';
import { AWARDS_FEED_DATA } from '@/data/components/awardsFeed';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function AwardSneakPeek({
  name = 'default', // Key untuk intro & CTA
  feedName = 'awards-list', // Key untuk mengambil data items dari feed
  cmsData = null,
  className = ""
}) {
  const containerRef = useRef(null);
  const params = useParams();
  const locale = params?.locale || 'en';

  // 1. Ambil data Intro & CTA
  const sneakPeekData = cmsData || AWARDS_SNEAK_PEEK_DATA[name];

  // 2. Ambil data Items (Daftar Penghargaan)
  const feedData = cmsData ? { items: cmsData.items || [] } : AWARDS_FEED_DATA[feedName];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sneakPeekData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapAwardItem');

      if (gsapElements.length > 0) {
        gsap.from(gsapElements, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%', // Animasi mulai saat elemen masuk 80% viewport
            toggleActions: 'play none none reverse',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [sneakPeekData]);

  // Pastikan kedua data ada sebelum render
  if (!sneakPeekData || !feedData) return null;

  const { config, introData, ctaList } = sneakPeekData;
  const { items } = feedData;
  const {
    sectionId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};

  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);

  // 3. Ambil maksimal 10 data teratas dari data Feed
  const displayedAwards = items ? items.slice(0, 10) : [];

  // 4. Duplikasi array agar efek Marquee (berjalan) tidak pernah putus
  const marqueeItems = [...displayedAwards, ...displayedAwards];

  // Fungsi helper untuk mengambil tahun dari format string ISO (misal: 2026-02-23T...)
  const getYear = (isoString) => {
    if (!isoString) return '';
    if (typeof isoString === 'number') return isoString;
    try {
      return new Date(isoString).getFullYear();
    } catch (e) {
      return isoString;
    }
  };

  const withLocalePrefix = (href, linkType) => {
    if (!href || linkType === 'action-modal' || href === '#') return href;
    if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
    if (href.startsWith(`/${locale}/`) || href === `/${locale}`) return href;
    return `/${locale}${href.startsWith('/') ? href : `/${href}`}`;
  };

  return (
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__awardSneakPeek py-16 md:py-24 overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
    >

      {/* ========================================= */}
      {/* CSS KHUSUS MARQUEE (RUNNING TEXT)         */}
      {/* ========================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes running-marquee-awards {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .lnAnimateRunningMarqueeAwards {
          display: flex;
          width: max-content;
          animation: running-marquee-awards 30s linear infinite;
        }
        .lnAnimateRunningMarqueeAwards:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="container">

        {/* --- INTRO SECTION --- */}
        {hasIntroContent(introData) && (
          <div className="mb-10 md:mb-16 lnGsapAwardItem">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}
      </div>

      {/* --- MARQUEE AWARDS LIST (Data dari Feed) --- */}
      {displayedAwards.length > 0 && (
        <div className="lnGsapAwardItem w-full overflow-hidden relative pb-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">

          <div className="lnAnimateRunningMarqueeAwards items-center gap-6 md:gap-8 px-4">
            {marqueeItems.map((item, index) => (
              <CardAward
                key={`${item.id}-${index}`}
                logo={item.topLogo || '/assets/icons/badge.svg'}
                title={item.title}
                year={getYear(item.date)}
                className="w-[280px] md:w-[360px] shrink-0 bg-transparent border-none shadow-none hover:shadow-none"
              />
            ))}
          </div>

        </div>
      )}

      {/* --- CTA SECTION --- */}
      <div className="container mx-auto px-4 md:px-0 max-w-7xl">
        <CTAList
          ctaList={ctaList?.map((cta) => {
            const linkType = cta.linkType || cta.link_type || 'url';
            return { ...cta, href: withLocalePrefix(cta.href, linkType) };
          })}
          align={introData?.align || 'left'}
          className="mt-10 md:mt-16"
          itemClassName="lnGsapAwardItem"
          defaultSize="lg"
        />
      </div>

    </section>
  );
}
