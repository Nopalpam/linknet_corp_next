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
import LinknetLink from '../base/Link';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

const CareerSneakPeek = () => {
  const containerRef = useRef(null); // Ref untuk scope GSAP

  // Destructure konfigurasi section dari careerSneakPeek.js
  const { introData, ctaList, limit } = careerSneakPeekData;

  // Batasi jumlah data karir yang dirender sesuai dengan 'limit' (misal: 4)
  const displayedCareers = careers.slice(0, limit || 8);

  const params = useParams();
  const locale = params.locale || 'en';

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    // gsap.context memastikan animasi aman dan dibersihkan saat komponen unmount
    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.gsap-career-item');

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
    <section ref={containerRef} className="py-16">
      
      <div className="container">
        {/* --- Intro Section --- */}
      {introData && (
        <div className="mb-10 gsap-career-item"> {/* Class GSAP ditambahkan di sini */}
          {/* Mapping prop 'label' dari data ke prop 'preTitle' di komponen Intro */}
          <Intro 
            label={introData.label} 
            title={introData.title}
            align={introData.align || 'center'}
            as={introData.as || 'h2'}
          />
        </div>
      )}

      {/* --- Grid Cards Section --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedCareers.map((career) => (
          // Bungkus CardCareer dengan div yang memiliki class GSAP agar ikut teranimasi
          <div key={career.id} className="gsap-career-item h-full flex">
            <CardCareer 
              department={career.department}
              title={career.title}
              type={career.employment_type} // Mapping employment_type ke type
              location={career.location}
              applyUrl={career.applyURL}
              detailUrl={career.detailURL}
            />
          </div>
        ))}
      </div>

      {/* --- CTA Section --- */}
      {ctaList && ctaList.length > 0 && (
        <div className={`lnSection__cta mt-10 md:mt-16 flex flex-wrap gap-4 ${introData?.align === 'center' ? 'justify-center' : 'justify-start'}`}>
          {ctaList.map((cta, index) => (
            // Bungkus setiap Link/Button dengan class GSAP
            <div key={index} className="gsap-career-item">
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
};

export default CareerSneakPeek;