'use client';

import React, { useEffect, useRef } from 'react';
import Intro from '../base/section/Intro';
import { VISION_MISSION_DATA } from '@/data/components/visionMission'; 

// Import GSAP dan ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugin
gsap.registerPlugin(ScrollTrigger);

export default function VisionMission({ cmsData = null, className = '' }) {
  const containerRef = useRef(null); // Ref untuk membatasi scope animasi GSAP

  // CMS mode uses cmsData, static mode uses hardcoded 'about' key
  const data = cmsData || VISION_MISSION_DATA?.about;
  const { config = {}, id } = data || {};
  const {
    sectionId = id,
    className: configClassName = '',
    bgImage = '',
    bgImageMobile = '',
    bgPositionClasses = 'bg-center md:bg-center',
    bgSizeClass = 'bg-cover',
  } = config;
  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none'),
  };

  // Setup Animasi GSAP
  useEffect(() => {
    // Jika data tidak valid, jangan jalankan animasi
    if (!data || !data.items || data.items.length < 2) return;

    // Gunakan gsap.context agar animasi aman di React (termasuk saat unmount)
    let ctx = gsap.context(() => {
      // Ambil semua elemen dengan class 'gsap-item'
      const items = gsap.utils.toArray('.gsap-item');

      // Animasi muncul berurutan dari bawah (Fade Up Stagger)
      gsap.from(items, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%', // Animasi mulai saat bagian atas container menyentuh 80% tinggi layar
          toggleActions: 'play none none reverse', // Mainkan saat masuk, reverse saat scroll ke atas jauh
        },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2, // Jeda antar elemen
        ease: 'power3.out',
      });
    }, containerRef);

    // Cleanup function untuk mencegah memory leak
    return () => ctx.revert();
  }, [data]);

  // 2. PROTEKSI: Jika data tidak ada, atau items tidak ada, jangan render apapun
  if (!data || !data.items || data.items.length < 2) {
    return null;
  }

  // Jika aman, baru ambil array-nya
  const vision = data.items[0];
  const mission = data.items[1];

  return (
    <section
      id={sectionId}
      className={`lnSection__visionMission py-16 bg-white bg-no-repeat ${bgPositionClasses} ${bgSizeClass} bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)] ${configClassName} ${className}`}
      style={sectionStyle}
      ref={containerRef}
    >
      <div className="container">
        
        {/* Intro */}
        <div className="mb-10 text-center gsap-item"> {/* Tambahkan class gsap-item di sini jika ingin Intro ikut teranimasi */}
          <Intro {...data.introData} />
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 overflow-hidden">
          
          {/* 1. OUR VISION (Teks) */}
          <div className="gsap-item order-1 md:order-1 md:col-span-2 bg-light-1 rounded-[20px] justify-between p-8 flex flex-col h-full min-h-[320px]">
            <div className={`text-right text-warning text-body-b5 font-bold uppercase tracking-wide mb-4`}>
              {vision.label}
            </div>
            <div className={`text-${vision.align}`}>
              <h3 className="text-headline-h4 font-bold text-primary leading-snug">
                {vision.title}
              </h3>
              {vision.description && (
                <p className="text-body-b5 text-secondary mt-3">
                  {vision.description}
                </p>
              )}
            </div>
          </div>

          {/* 2. GAMBAR VISION */}
          <div className="gsap-item order-2 md:order-2 md:col-span-3 rounded-[20px] overflow-hidden min-h-[320px] bg-neutral-100">
            <img 
              src={vision.image} 
              alt={vision.label} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* 3. GAMBAR MISSION (Gambar dulu di code, order atur visual) */}
          <div className="gsap-item order-4 md:order-3 md:col-span-3 rounded-[20px] overflow-hidden min-h-[320px] bg-neutral-100">
            <img 
              src={mission.image} 
              alt={mission.label} 
              className="w-full h-full object-cover"
            />
          </div>

          {/* 4. OUR MISSION (Teks) */}
          <div className="gsap-item order-3 md:order-4 md:col-span-2 bg-light-1 rounded-[20px] justify-between p-8 flex flex-col h-full min-h-[320px]">
            <div className={`text-${mission.align} text-[#FFB800] text-sm font-bold uppercase tracking-wide mb-4`}>
              {mission.label}
            </div>
            <div className={`text-${mission.align}`}>
              <h3 className="text-headline-h4 font-bold text-primary leading-snug">
                {mission.title}
              </h3>
              {mission.description && (
                <p className="text-body-b5 text-secondary mt-3">
                  {mission.description}
                </p>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
}