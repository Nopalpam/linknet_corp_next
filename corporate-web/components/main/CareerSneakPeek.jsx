'use client';

import React, { useEffect, useRef } from 'react';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 1. Import Data (Sesuaikan path folder kamu)
import careerSneakPeekData from '../../data/components/careerSneakPeek';
import { careers } from '../../data/components/careerList';
import { useParams } from 'next/navigation';

// 2. Import UI Components (Sesuaikan path folder kamu)
import CardCareer from '../base/cards/CardCareer';
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import { hasIntroContent } from '@/shared/presentation/intro';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

function withLocale(href, locale) {
  if (!href || !locale) return href;
  if (href.startsWith('http') || href.startsWith('#') || href.startsWith(`/${locale}`)) {
    return href;
  }

  return href.startsWith('/') ? `/${locale}${href}` : `/${locale}/${href}`;
}

const CareerSneakPeek = ({
  cmsData = null,
  mainData = null,
  className = '',
  locale: localeProp,
}) => {
  const containerRef = useRef(null); // Ref untuk scope GSAP

  const sectionData = cmsData || careerSneakPeekData;
  const params = useParams();
  const locale = localeProp || params?.locale || 'en';

  // Destructure konfigurasi section dari careerSneakPeek.js / CMS
  const { config, introData, ctaList, limit, max_display } = sectionData;
  const {
    sectionId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};

  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);

  const careerItems = Array.isArray(mainData?.careers)
    ? mainData.careers
    : (Array.isArray(sectionData.items) ? sectionData.items : (Array.isArray(sectionData.careers) ? sectionData.careers : careers));
  // Batasi jumlah data karir yang dirender sesuai dengan 'limit' (misal: 4)
  const displayedCareers = careerItems.slice(0, limit || max_display || 8);

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    // gsap.context memastikan animasi aman dan dibersihkan saat komponen unmount
    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapCareerItem');

      gsap.from(gsapElements, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%', // Animasi mulai saat elemen masuk 80% dari atas layar
          toggleActions: 'play none none reverse', // Mainkan saat masuk, kembalikan saat scroll ke atas jauh
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15, // Efek jeda antar elemen (muncul bergantian)
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert(); // Cleanup animasi
  }, [displayedCareers]);

  return (
    // Tambahkan ref={containerRef} pada bungkus terluar section
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__careerSneakPeek py-16
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
    >

      <div className="container">
        {/* --- Intro Section --- */}
      {hasIntroContent(introData) && (
        <div className="mb-10 lnGsapCareerItem"> {/* Class GSAP ditambahkan di sini */}
          {/* Mapping prop 'label' dari data ke prop 'preTitle' di komponen Intro */}
          <Intro
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align || 'center'}
            as={introData.as || 'h2'}
          />
        </div>
      )}

      {/* --- Grid Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedCareers.map((career) => (
          // Bungkus CardCareer dengan div yang memiliki class GSAP agar ikut teranimasi
          <div key={career.id} className="lnGsapCareerItem h-full flex">
            <CardCareer
              department={career.department || career.division}
              title={career.title || career.position}
              type={career.employment_type || career.type} // Mapping employment_type ke type
              location={career.location}
              applyUrl={career.applyURL || career.applyUrl || career.linkJob}
              detailUrl={career.detailURL || career.detailUrl || (career.slug ? `/career/${career.slug}` : '#')}
            />
          </div>
        ))}
      </div>

      {/* --- CTA Section --- */}
      <CTAList
        ctaList={ctaList?.map((cta) => ({ ...cta, href: withLocale(cta.href || cta.action, locale) }))}
        align={introData?.align || 'left'}
        className="mt-10 md:mt-16"
        itemClassName="lnGsapCareerItem"
        defaultSize="lg"
      />
      </div>

    </section>
  );
};

export default CareerSneakPeek;
