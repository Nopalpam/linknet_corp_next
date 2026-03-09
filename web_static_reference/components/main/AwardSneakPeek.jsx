'use client';

import React, { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import UI Components
import Intro from '../base/section/Intro';
import CardAward from '../base/cards/CardAward'; 
import LinknetLink from '../base/Link';

// =========================================
// IMPORT DUA SUMBER DATA BERBEDA
// =========================================
import { AWARDS_SNEAK_PEEK_DATA } from '@/data/components/AwardsSneakPeek';
import { AWARDS_FEED_DATA } from '@/data/components/awardsFeed';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function AwardSneakPeek({ 
  name = 'default', // Key untuk intro & CTA
  feedName = 'awards-list', // Key untuk mengambil data items dari feed
  className = "" 
}) {
  const containerRef = useRef(null);
  const params = useParams();
  const locale = params?.locale || 'en';

  // 1. Ambil data Intro & CTA
  const sneakPeekData = AWARDS_SNEAK_PEEK_DATA[name];
  
  // 2. Ambil data Items (Daftar Penghargaan)
  const feedData = AWARDS_FEED_DATA[feedName];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sneakPeekData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.gsap-award-item');

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

  const { introData, ctaList } = sneakPeekData;
  const { items } = feedData;

  // 3. Ambil maksimal 10 data teratas dari data Feed
  const displayedAwards = items ? items.slice(0, 10) : [];
  
  // 4. Duplikasi array agar efek Marquee (berjalan) tidak pernah putus
  const marqueeItems = [...displayedAwards, ...displayedAwards];

  // Fungsi helper untuk mengambil tahun dari format string ISO (misal: 2026-02-23T...)
  const getYear = (isoString) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).getFullYear();
    } catch (e) {
      return isoString; 
    }
  };

  return (
    <section ref={containerRef} className={`py-16 md:py-24 overflow-hidden ${className}`}>
      
      {/* ========================================= */}
      {/* CSS KHUSUS MARQUEE (RUNNING TEXT)         */}
      {/* ========================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes running-marquee-awards {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-running-marquee-awards {
          display: flex;
          width: max-content;
          animation: running-marquee-awards 30s linear infinite;
        }
        .animate-running-marquee-awards:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="container">
        
        {/* --- INTRO SECTION --- */}
        {introData && (
          <div className="mb-10 md:mb-16 gsap-award-item">
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
        <div className="gsap-award-item w-full overflow-hidden relative pb-4 [mask-image:_linear-gradient(to_right,transparent_0,_black_100px,_black_calc(100%-100px),transparent_100%)]">
          
          <div className="animate-running-marquee-awards items-center gap-6 md:gap-8 px-4">
            {marqueeItems.map((item, index) => (
              <CardAward 
                key={`${item.id}-${index}`}
                logo={item.topLogo}
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
        {ctaList && ctaList.length > 0 && (
          <div className={`lnSection__cta mt-10 md:mt-16 flex flex-wrap gap-4 ${introData?.align === 'center' ? 'justify-center' : 'justify-start'}`}>
            {ctaList.map((cta, index) => (
              <div key={index} className="gsap-award-item">
                <LinknetLink 
                  variant={cta.variant || 'primary'}
                  size={cta.size || 'lg'} 
                  href={`/${locale}${cta.href}`}
                >
                  {cta.text}
                </LinknetLink>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}