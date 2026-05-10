'use client';

import { useState, useEffect, useRef } from 'react';
import Intro from '../base/section/Intro';
import SegmentPicker from '../base/SegmentPicker';
import CardReportHome from '../base/cards/CardReportHome';
import { hasIntroContent } from '../../../shared/presentation/intro';

// Import Swiper React components & styles
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import data konfigurasi
import { LIST_REPORT_HOME_DATA } from '@/data/components/listReportHome';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

function firstValue(source, keys, fallback = '') {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return fallback;
}

function normalizeCtaList(item = {}) {
  const ctaSource = item.ctaList || item.cta_list || item.ctaButtons || item.cta_buttons;
  if (Array.isArray(ctaSource)) {
    return ctaSource.map((cta, index) => ({
      id: cta.id || `cta-${index}`,
      label: firstValue(cta, ['label', 'text', 'ctaText', 'cta_text']),
      text: firstValue(cta, ['text', 'label', 'ctaText', 'cta_text']),
      href: firstValue(cta, ['href', 'url', 'ctaLink', 'cta_link'], '#'),
      variant: cta.variant || 'secondary-outline',
      size: cta.size || 'md',
    })).filter((cta) => cta.label || cta.text || cta.href);
  }

  const label = firstValue(item, ['ctaText', 'cta_text', 'buttonText', 'button_text']);
  const href = firstValue(item, ['ctaLink', 'cta_link', 'buttonLink', 'button_link'], '');
  return label || href ? [{ label, text: label, href: href || '#', variant: 'secondary-outline', size: 'md' }] : [];
}

function normalizeReportHomeItem(item = {}, index = 0) {
  return {
    id: item.id || `report-home-${index}`,
    iconSrc: firstValue(item, ['iconSrc', 'icon_src', 'icon']),
    title: firstValue(item, ['title']),
    desc: firstValue(item, ['desc', 'description']),
    ctaList: normalizeCtaList(item),
    year: firstValue(item, ['year']),
  };
}

export default function ListReportHome({
  name,
  className = "",
  cmsData = null
}) {
  const [activeTab, setActiveTab] = useState('');
  const containerRef = useRef(null); // Ref untuk scope GSAP

  // Ambil data berdasarkan key 'name'
  const sectionData = cmsData || LIST_REPORT_HOME_DATA[name];

  // Set default tab yang aktif saat komponen pertama kali di-render
  useEffect(() => {
    if (sectionData?.tabs?.length > 0) {
      setActiveTab(sectionData.tabs[0].value);
    }
  }, [sectionData]);

  // =========================================
  // SETUP ANIMASI GSAP 1: Initial Scroll Header
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    let ctx = gsap.context(() => {
      // Animasi Header (Intro & Tab) saat di-scroll masuk ke viewport
      gsap.from('.lnGsapReportHeader', {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [sectionData]);

  // =========================================
  // SETUP ANIMASI GSAP 2: Swiper Cards (Scroll & Tab Change)
  // =========================================
  useEffect(() => {
    if (!activeTab) return;

    let ctx = gsap.context(() => {
      // Tambahkan ScrollTrigger di dalam fromTo agar saat awal load,
      // animasi Swiper Card juga menunggu di-scroll.
      gsap.fromTo('.lnGsapReportCard',
        {
          y: 60,
          opacity: 0
        },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%', // Animasi Swiper akan menunggu area ini terlihat
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1, // Jeda cepat antar kartu
          ease: 'power3.out',
          clearProps: 'all' // Bersihkan style agar Swiper tidak error saat di-drag
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  // Cegah error jika data tidak ditemukan
  if (!sectionData) return null;

  const { config, introData, tabs, items } = sectionData;
  const {
    sectionId,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config || {};
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  // Mengambil daftar array card sesuai dengan tab yang sedang aktif
  const activeItems = Array.isArray(items?.[activeTab])
    ? items[activeTab].map(normalizeReportHomeItem)
    : [];

  return (
    <section
      id={sectionId}
      ref={containerRef} // Pasang ref di kontainer utama
      className={`lnSection__listReportHome py-16 md:py-20 bg-white/50
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* --- HEADER: Intro (Kiri) & Segment Picker (Kanan) --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8 md:mb-8">

          {/* Kiri: Intro Title */}
          <div className="w-full lnGsapReportHeader">
            {hasIntroContent(introData) && (
              <Intro
                as={introData.as || "h2"}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || "left"}
                className="whitespace-pre-line !mb-auto"
              />
            )}
          </div>

          {/* Kanan: Segment Picker Tabs */}
          {tabs && tabs.length > 0 && (
            <div className="flex justify-start lg:justify-end shrink-0 lnGsapReportHeader">
              <SegmentPicker
                options={tabs}
                value={activeTab}
                onChange={(selectedValue) => setActiveTab(selectedValue)}
              />
            </div>
          )}
        </div>

        {/* --- KONTEN: Swiper Cards --- */}
        <div className="w-full overflow-hidden mx-auto">
          {activeItems.length > 0 ? (
            <Swiper
              spaceBetween={16}
              slidesPerView={1.1}
              breakpoints={{
                768: {
                  slidesPerView: 2.2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 32,
                },
              }}
              className="w-full pb-4 !overflow-visible"
            >
              {activeItems.map((item) => (
                <SwiperSlide key={item.id} className="h-auto">
                  {/* Class gsap-report-card diletakkan di wrapper kartu */}
                  <div className="lnGsapReportCard w-full h-full">
                    <CardReportHome
                      iconSrc={item.iconSrc}
                      title={item.title}
                      description={item.desc}
                      ctaList={item.ctaList}
                      year={item.year}
                      className="w-full h-full"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full py-10 text-center text-neutral-500 lnGsapReportCard">
              Belum ada data tersedia untuk kategori ini.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
