'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper/modules';

import Intro from '../base/section/Intro'; // Sesuaikan path jika diperlukan
import Button from '../base/Button';
import Icon from '../base/Icon';
import { useModalRegistry } from '../hooks/useModalRegistry';

// Styles
import 'swiper/css';
import 'swiper/css/effect-fade';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function TabBusiness({ 
  id, 
  introData, 
  items = [], 
  className = "" 
}) {
  const sectionRef = useRef(null);
  const cardRef = useRef(null); // Ini div yang akan membesar
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { openModal } = useModalRegistry();

  useEffect(() => {
    if (!items || items.length === 0) return;

    const ctx = gsap.context(() => {
      // --- LOGIC PIN & GROW (Persis TVC Section) ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",   // Mulai saat section menyentuh atas layar
          end: "+=100%",      // Jarak scroll untuk menyelesaikan animasi grow
          pin: true,          // Tahan section
          scrub: 1,           // Haluskan gerakan (delay 1s)
        }
      });

      // Animasi Membesar
      tl.to(cardRef.current, {
        width: "100vw",       // Lebar penuh
        height: "100vh",      // Tinggi penuh
        borderRadius: 0,      // Sudut tajam
        ease: "power2.inOut"  // Easing halus
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    // Section pembungkus
    <section id={id} className={`sectionProduct ${className}`}>
      
      {/* --- PANGGIL COMPONENT INTRO --- */}
      {introData && (
        <div className="container mx-auto px-4 md:px-0 mb-8 md:mb-12">
          <Intro 
            as={introData.as || "h2"}
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align || "left"}
          />
        </div>
      )}

      {/* --- CARD CONTAINER YANG MEMBESAR --- */}
      <div ref={sectionRef} className="h-screen w-full flex items-center m-0 justify-center overflow-hidden">
        <div 
            ref={cardRef}
            className="relative w-[90%] md:w-[90%] h-[90vh] bg-neutral-900 rounded-[32px] overflow-hidden shadow-2xl z-10"
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
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                </div>

                {/* Content Card (Posisi Absolute di atas background) */}
                <div className="absolute inset-0 flex items-center px-6 md:px-20 pb-20">
                    <div className="w-full max-w-md p-8 rounded-3xl border border-white/20 bg-white/5">
                    
                    {/* Tag */}
                    <div className="flex items-center gap-2 mb-4 text-neutral-300">
                        <span className="text-sm font-medium">{item.tagline}</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-headline-h3 text-white font-bold mb-6 leading-tight">
                        {item.title}
                    </h3>

                    <p className='text-body-b4 text-white font-regular'>
                        {item.desc}
                    </p>

                    {/* Tombol CTA dibikin fleksibel mengarah ke modalId yg ditentukan, jika kosong fallback ke 'get-started' */}
                    <Button variant="primary" size='lg' onClick={() => openModal(item.modalId || 'get-started')} className="bg-white text-black hover:bg-gray-200 border-none w-full md:w-auto justify-center">
                        {item.textCTA}
                    </Button>
                    </div>
                </div>

                </SwiperSlide>
            ))}
            </Swiper>

            {/* --- CUSTOM TABS NAVIGATION (UPDATED) --- */}
            <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-30 flex justify-center px-6">
              <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar w-full max-w-6xl py-2">
                  {items.map((item, idx) => (
                  <button
                      key={item.id}
                      onClick={() => swiperInstance?.slideTo(idx)}
                      className={`
                          px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap backdrop-blur-md border bg__glassBorder
                      ${activeIndex === idx 
                          ? 'opacity-100' // Active: Dark Glass
                          : 'opacity-50 hover:opacity-90' // Inactive: Light Milky Glass
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