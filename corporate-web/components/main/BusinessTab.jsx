'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';

import Intro from '../base/section/Intro';
import SegmentPicker from '../base/SegmentPicker';
import CardReportHome from '../base/cards/CardReportHome';

// Styles
import 'swiper/css';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function TabBusiness({ 
  id, 
  introData, 
  tabs = [], 
  className = "" 
}) {
  const [selectedTab, setSelectedTab] = useState('');
  const containerRef = useRef(null);
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : (tabs[0]?.id || '');

  // GSAP animation for header
  useEffect(() => {
    if (!tabs || tabs.length === 0) return;

    const ctx = gsap.context(() => {
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
  }, [tabs]);

  // GSAP animation for cards on tab change
  useEffect(() => {
    if (!activeTab) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.gsap-report-card', 
        { y: 60, opacity: 0 },
        {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeTab]);

  if (!tabs || tabs.length === 0) return null;

  // Build SegmentPicker options from tabs
  const segmentOptions = tabs.map((tab) => ({
    value: tab.id,
    label: tab.label,
  }));

  // Get cards for the active tab
  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const activeCards = activeTabData?.cards || [];

  return (
    <section 
      id={id} 
      ref={containerRef}
      className={`py-16 md:py-20 ${className}`}
    >
      <div className="container mx-auto px-4 md:px-0">
        
        {/* Header: Intro (left) & Segment Picker (right) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-8 md:mb-8">
          
          {/* Intro */}
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

          {/* Segment Picker Tabs */}
          {segmentOptions.length > 1 && (
            <div className="flex justify-start lg:justify-end shrink-0 gsap-report-header">
              <SegmentPicker 
                options={segmentOptions}
                value={activeTab}
                onChange={(selectedValue) => setSelectedTab(selectedValue)}
              />
            </div>
          )}
        </div>

        {/* Swiper Cards */}
        <div className="w-full overflow-hidden mx-auto">
          {activeCards.length > 0 ? (
            <Swiper
              spaceBetween={16}
              slidesPerView={1.1}
              breakpoints={{
                768: { slidesPerView: 2.2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              className="w-full pb-4 !overflow-visible"
            >
              {activeCards.map((card) => (
                <SwiperSlide key={card.id} className="h-auto">
                  <div className="gsap-report-card w-full h-full">
                    <CardReportHome 
                      iconSrc={card.iconSrc}
                      title={card.title}
                      description={card.description}
                      ctaText={card.ctaText}
                      ctaLink={card.ctaLink}
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