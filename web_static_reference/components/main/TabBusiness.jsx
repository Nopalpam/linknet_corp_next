'use client';

import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper/modules';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Intro from '../base/section/Intro';
import LinknetLink from '../base/Link'; 

// Import data dari file konfigurasi
import { TAB_BUSINESS_DATA } from '@/data/components/tabBusiness';

// Styles
import 'swiper/css';
import 'swiper/css/effect-fade';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function TabBusiness({ 
  name = 'default', 
  className = "" 
}) {
  const containerRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const [isMounted, setIsMounted] = useState(false);

  const sectionData = TAB_BUSINESS_DATA[name];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData || !isMounted) return;

    let ctx = gsap.context(() => {
      const elements = gsap.utils.toArray('.gsap-business-item');
      
      gsap.from(elements, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [sectionData, isMounted]);

  if (!isMounted || !sectionData || !sectionData.items || sectionData.items.length === 0) return null;

  const { id, introData, items } = sectionData;

  return (
    <section id={id} ref={containerRef} className={`py-16 md:py-20 bg-white ${className}`}>
      
      {/* --- PANGGIL COMPONENT INTRO --- */}
      {introData && (
        <div className="container mx-auto px-4 md:px-0 mb-10 gsap-business-item">
          <Intro 
            as={introData.as || "h2"}
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align || "center"} 
          />
        </div>
      )}

      {/* --- CARD CONTAINER --- */}
      <div className="md:container mx-auto px-2 md:px-0 gsap-business-item">
        <div className="relative w-full h-[640px] md:h-[600px] bg-neutral-900 rounded-[24px] md:rounded-[32px] overflow-hidden shadow-2xl">
            
            {/* --- ISI KONTEN (SWIPER) --- */}
            <Swiper
              modules={[EffectFade, Autoplay]}
              effect={'fade'}
              fadeEffect={{ crossFade: true }}
              speed={800}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              allowTouchMove={true}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full h-full"
            >
              {items.map((item) => (
                  <SwiperSlide key={item.id} className="relative w-full h-full bg-neutral-900">
                  
                  {/* 1. Background Image & Gradient Overlay */}
                  <div className="absolute inset-0 w-full h-full">
                      
                      {/* MENGGUNAKAN <picture> UNTUK RESPONSIVE IMAGE 
                         Jika item.imageMobile ada, render saat ukuran layar < 768px (Mobile).
                         Jika item.imageMobile kosong, browser otomatis melewati <source> 
                         dan langsung merender <img> fallback (Desktop image).
                      */}
                      <picture>
                        {item.imageMobile && (
                          <source media="(max-width: 767px)" srcSet={item.imageMobile} />
                        )}
                        <img 
                            src={item.image} 
                            alt={`${item.title} Background`} 
                            className="w-full h-full object-cover !object-[82%_90%]" 
                        />
                      </picture>

                      {/* Gradient gelap di kiri & bawah agar teks putih terbaca */}
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 md:from-black/64 md:via-black/32 to-transparent" />
                  </div>

                  {/* 2. Logo Brand (Pojok Kanan Atas) */}
                  {item.logoSrc && (
                      <div className="absolute top-6 right-6 md:top-10 md:right-12 z-20">
                          <img 
                              src={item.logoSrc} 
                              alt={`${item.label} Logo`} 
                              // TAMBAHAN: brightness-0 invert untuk mengubah logo warna menjadi putih solid
                              className="h-10 md:h-12 w-auto object-contain drop-shadow-md brightness-0 invert"
                          />
                      </div>
                  )}

                  {/* 3. Teks Konten (Kiri Tengah) */}
                  <div className="absolute inset-0 flex items-end md:items-center bottom-[20%] md:bottom-[4%] px-6 md:px-16 z-10">
                      <div className="w-full max-w-lg md:max-w-lg">
                        
                        {/* Tagline / Hashtag Kuning */}
                        {item.tagline && (
                          <span className="block text-[#FFB800] text-sm md:text-body-b4 font-bold tracking-wide">
                              {item.tagline}
                          </span>
                        )}

                        {/* Headline */}
                        <h3 className="text-headline-h3 text-white font-bold mt-2 md:mt-4">
                            {item.title}
                        </h3>

                        {/* Deskripsi */}
                        <p className='text-body-b5 text-neutral-200 font-regular mt-3 max-w-md md:max-w-xl leading-relaxed'>
                            {item.desc}
                        </p>

                        {/* Button CTA */}
                        {item.textCTA && (
                          <div className='mt-8 md:mt-10'>
                            <LinknetLink 
                              href={item.href || '#'} 
                              variant="secondary-outline--white" 
                              size='lg' 
                              className="inline-flex items-center justify-center transition-all hover:bg-white hover:text-black"
                            >
                                {item.textCTA}
                            </LinknetLink>
                          </div>
                        )}
                      </div>
                  </div>

                  </SwiperSlide>
              ))}
            </Swiper>

            {/* --- CUSTOM TABS NAVIGATION (Pill Style di Bawah) --- */}
            <div className="absolute bottom-6 md:bottom-10 left-0 right-0 z-[50] flex justify-center px-4">
              <div className="flex items-center  p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                  {items.map((item, idx) => (
                  <button
                      key={item.id}
                      onClick={() => swiperInstance?.slideTo(idx)}
                      className={`
                        px-4 md:px-6 py-2 md:py-2.5 rounded-full text-body-b5 font-medium transition-all duration-300 whitespace-nowrap
                        ${activeIndex === idx 
                            ? 'bg-white text-black shadow-md' 
                            : 'text-white hover:bg-white/20' 
                        }
                      `}
                  >
                      {item.label}
                  </button>
                  ))}
              </div>
            </div>

        </div>
      </div>

    </section>
  );
}