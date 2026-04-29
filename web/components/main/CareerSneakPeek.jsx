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

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

const CareerSneakPeek = () => {
  const containerRef = useRef(null); // Ref untuk scope GSAP

  // Destructure konfigurasi section dari careerSneakPeek.js
  const { config, introData, ctaList, limit } = careerSneakPeekData;
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
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName}`}
      style={sectionStyle}
    >

      <div className="container">
        {/* --- Intro Section --- */}
      {introData && (
        <div className="mb-10 lnGsapCareerItem"> {/* Class GSAP ditambahkan di sini */}
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
          <div key={career.id} className="lnGsapCareerItem h-full flex">
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
      <CTAList
        ctaList={ctaList?.map((cta) => ({ ...cta, href: `/${locale}${cta.href}` }))}
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
