'use client';

import { useState, useEffect, useRef } from 'react';
import Intro from '../base/section/Intro';
import SegmentPicker from '../base/SegmentPicker';
import CardReportHome from '../base/cards/CardReportHome';

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

export default function ListReportHome({ 
  name, 
  className = "" 
}) {
  const [activeTab, setActiveTab] = useState('');
  const containerRef = useRef(null); // Ref untuk scope GSAP

  // Ambil data berdasarkan key 'name'
  const sectionData = LIST_REPORT_HOME_DATA[name];

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
      gsap.from('.gsap-report-header', {
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
      gsap.fromTo('.gsap-report-card', 
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

  const { id, introData, tabs, items } = sectionData;
  
  // Mengambil daftar array card sesuai dengan tab yang sedang aktif
  const activeItems = items[activeTab] || [];

  return (
    <section 
      id={id} 
      ref={containerRef} // Pasang ref di kontainer utama
      className={`py-16 md:py-20 bg-white/50 ${className}`}
    >
      <div className="container mx-auto px-4 md:px-0">
        
        {/* --- HEADER: Intro (Kiri) & Segment Picker (Kanan) --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8 md:mb-8">
          
          {/* Kiri: Intro Title */}
          <div className="w-full gsap-report-header">
            {introData && (
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
            <div className="flex justify-start lg:justify-end shrink-0 gsap-report-header">
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
                  <div className="gsap-report-card w-full h-full">
                    <CardReportHome 
                      iconSrc={item.iconSrc}
                      title={item.title}
                      description={item.description}
                      ctaText={item.ctaText}
                      ctaLink={item.ctaLink}
                      year={item.year}
                      className="w-full h-full" 
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="w-full py-10 text-center text-neutral-500 gsap-report-card">
              Belum ada data tersedia untuk kategori ini.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}