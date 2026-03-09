'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper/modules';

import Intro from '../base/section/Intro';
import LinknetLink from '../base/Link'; 

// Import data dari file konfigurasi
import { TAB_BUSINESS_DATA } from '../../data/components/tabBusiness';

// Styles
import 'swiper/css';
import 'swiper/css/effect-fade';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function TabBusiness({ 
  name, 
  className = "" 
}) {
  const sectionRef = useRef(null);
  const cardRef = useRef(null); 
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionData = TAB_BUSINESS_DATA[name];

  useEffect(() => {
    if (!sectionData || !sectionData.items || sectionData.items.length === 0) return;

    const ctx = gsap.context(() => {
      // --- LOGIC PIN & GROW ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          // onEnter / onLeaveBack dihapus agar tidak ada lompatan layout (jumpy)
        }
      });

      // Animasi Membesar Card
      // Karena parent-nya items-start, ia akan otomatis membesar dari atas ke bawah
      tl.to(cardRef.current, {
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        ease: "power2.inOut"
      }, "sync"); 

      // Animasi Posisi Logo (top-4 ke top-16)
      tl.to('.anim-logo', {
        top: "6rem", 
        ease: "power2.inOut"
      }, "sync"); 

    }, sectionRef);

    return () => ctx.revert();
  }, [sectionData]);

  if (!sectionData || !sectionData.items || sectionData.items.length === 0) return null;

  const { id, introData, items } = sectionData;

  return (
    // Section pembungkus
    <section id={id} className={`sectionProduct ${className}`}>
      
      {/* --- PANGGIL COMPONENT INTRO --- */}
      {introData && (
        <div className="container mx-auto px-4 md:px-0 mb-8 md:mb-10">
          <Intro 
            as={introData.as || "h2"}
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align || "left"}
            className=""
          />
        </div>
      )}

      {/* --- CARD CONTAINER --- */}
      {/* Menggunakan items-start secara permanen */}
      <div ref={sectionRef} className="h-screen w-full flex items-start m-0 justify-center overflow-hidden">
        <div 
            ref={cardRef}
            className="relative w-[90%] md:w-[92.5%] h-[90vh] md:h-[80vh] bg-neutral-900 rounded-[20px] md:rounded-[32px] overflow-hidden shadow-2xl z-10"
            style={{ willChange: 'width, height, borderRadius' }}
        >
            
            {/* --- ISI KONTEN (SWIPER) --- */}
            <Swiper
              modules={[EffectFade, Autoplay]}
              effect={'fade'}
              speed={700}
              allowTouchMove={true}
              onSwiper={setSwiperInstance}
              onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
              className="w-full h-full"
            >
            {items.map((item) => (
                <SwiperSlide key={item.id} className="relative w-full h-full">
                
                {/* Background Image */}
                <div className="absolute inset-0 w-full h-full">
                    <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent bg-black/20" />
                </div>

                {/* --- LOGO POJOK KANAN ATAS --- */}
                {item.logoSrc && (
                    <div className="anim-logo absolute top-10 right-8 md:right-12 z-20">
                        <img 
                            src={item.logoSrc} 
                            alt="Brand Logo" 
                            className="h-10 md:h-14 w-auto object-contain drop-shadow-md"
                        />
                    </div>
                )}

                {/* Content Card */}
                {/* Agar konten di dalam kartu ikut center secara vertikal, pastikan items-center di-apply di sini untuk desktop */}
                <div className="absolute inset-0 flex items-start md:items-center px-6 md:px-20 pt-10 md:pt-0 pb-20 z-10">
                    <div className="w-full max-w-md">
                    
                    {/* Tag */}
                    <div className="flex items-center gap-2 mb-4 text-neutral-300">
                        <span className="text-sm font-medium">{item.tagline}</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-headline-h3 text-white font-bold mb-4 leading-tight">
                        {item.title}
                    </h3>

                    <p className='text-body-b4 text-white/80 font-regular mb-8'>
                        {item.desc}
                    </p>

                    {/* --- BUTTON CTA --- */}
                    <LinknetLink 
                      href={item.href || '#'} 
                      variant="secondary-outline--white" 
                      size='lg' 
                      className="bg-white hover:bg-gray-200 border-none flex justify-center transition-colors"
                    >
                        {item.textCTA}
                    </LinknetLink>
                    </div>
                </div>

                </SwiperSlide>
            ))}
            </Swiper>

            {/* --- CUSTOM TABS NAVIGATION --- */}
            <div className="absolute bottom-8 md:bottom-6 left-0 right-0 z-30 flex justify-center px-6">
              <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar w-full max-w-6xl py-2">
                  {items.map((item, idx) => (
                  <button
                      key={item.id}
                      onClick={() => swiperInstance?.slideTo(idx)}
                      className={`
                          px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-md border bg__glassBorder
                      ${activeIndex === idx 
                          ? 'opacity-100' 
                          : 'opacity-50 hover:opacity-90' 
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