'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper/modules';
import Button from '@/base/Button';
import Icon from '@/base/Icon';
import { useModalRegistry } from '@/hooks/useModalRegistry';


// Styles
import 'swiper/css';
import 'swiper/css/effect-fade';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function Hospitality() {
    const sectionRef = useRef(null);
    const cardRef = useRef(null); // Ini div yang akan membesar
    const [swiperInstance, setSwiperInstance] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { activeModalId, closeModal, openModal, isModalOpen } = useModalRegistry();

    const t = useTranslations('hospitality');
    const hospitalityUsage = t.raw('hospitalityUsage');
    const hospitalityFeatures = t.raw('hospitalityFeatures');
    const hospitalityAppFeatures = t.raw('hospitalityAppFeatures');

  // const services = t.raw('services');

  useEffect(() => {
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
  }, []);


  return (
    // Section pembungkus (height screen agar pas saat dipin)
    <section 
      id="corporate" className='sectionProduct' 
    >
      
        {/* Section Head */}
        <div className="container mx-auto text-start">
            <h2 className="text-headline-h3 text-white font-bold max-w-4xl leading-tight">
                {t('hospitalityUsage.title')}
            </h2>
            <p className='text-body-b4 text-neutral-400 mt-4'>
                {t('hospitalityUsage.desc')}
            </p>
        </div>

        {/* --- CARD CONTAINER YANG MEMBESAR ---
            Initial State: width 90%, height 80%, rounded-32px
        */}
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
            {hospitalityUsage.items.map((item) => (
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
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                        <Icon name="pin-map" className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                    </div>

                    {/* Headline */}
                    <h3 className="text-headline-h3 text-white font-bold mb-6 leading-tight">
                        {item.title}
                    </h3>

                    {/* Features */}
                    <ul className="flex flex-col gap-4 mb-8">
                        {item.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                            <Icon name="check" className="w-4 h-4 text-yellow-500 mt-1" />
                            <span className="text-body-b4 text-white/90">
                            {feat}
                            </span>
                        </li>
                        ))}
                    </ul>

                    <Button variant="primary" size='lg' onClick={() => openModal('get-started')} className="bg-white text-black hover:bg-gray-200 border-none w-full md:w-auto justify-center">
                        {item.textCTA}
                    </Button>
                    </div>
                </div>

                </SwiperSlide>
            ))}
            </Swiper>

            {/* --- CUSTOM TABS NAVIGATION (UPDATED) --- */}
            <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-30 flex justify-center px-6">
            {/* Perubahan Logic: 
                - Hapus container background (bg-black/50)
                - Ganti border container dengan 'gap-3' antar item
                - Style inactive: bg-white/30 (Transparan Terang)
                - Style active: bg-black/60 (Transparan Gelap)
            */}
            <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto no-scrollbar w-full max-w-6xl py-2">
                {hospitalityUsage.items.map((item, idx) => (
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


        {/* =========================================
          DIV 2: HOSPITALITY BENEFIT (Static)
         ========================================= */}
        <div className="relative w-full z-10 mt-20">
            <div className="container mx-auto px-6 w-full">
                <h2 className="text-headline-h3 text-white font-bold mb-10 text-left">
                    {t('hospitalityFeatures.title')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
                    
                    {/* --- Left: Image --- */}
                    <div className="relative w-full aspect-[4/3] group col-span-1 md:col-span-3">
                    <img
                        src="https://d2fsl11s4twg7t.cloudfront.net/assets/img/img-hospitality.png"
                        alt="Hospitality Benefits"
                        className="w-full h-full object-cover transition-transform duration-700"
                    />
                    {/* Overlay gradient (opsional, uncomment jika butuh) */}
                    {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" /> */}
                    </div>

                    {/* --- Right: List --- */}
                    <div className="flex flex-col w-full col-span-1 md:col-span-2">
                    {hospitalityFeatures.items.map((features, idx) => (
                        <div
                            key={idx}
                            className="group relative flex items-center gap-6 py-6 md:px-4 rounded-xl transition-all duration-300 hover:bg-white/5"
                        >
                        {/* Icon Wrapper */}
                        <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-hover:border-white/40 transition-colors">
                            <Icon name={features.icon} className="w-6 h-6 text-white" />
                        </div>

                        {/* Text */}
                        <span className="text-body-b3 text-neutral-200 group-hover:text-white transition-colors">
                            {features.title}
                        </span>

                        {/* Divider Line
                            Menggunakan absolute positioning.
                            left-[5.5rem] didapat dari: Padding kiri (1rem/px-4) + Lebar Icon (3rem/w-12) + Gap (1.5rem/gap-6) = 5.5rem
                        */}
                        <div className="absolute bottom-0 left-[5.5rem] right-4 h-[1px] bg-white/10 group-last:hidden group-hover:opacity-0 transition-opacity duration-300" />
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="relative w-full py-10">
      
            <div className="container flex flex-col items-center">
                {/* 1. Vertical Connecting Line (Garis atas) */}
                <div className="h-20 w-px bg-gradient-to-b from-transparent via-white/20 to-white/10 mb-0" />

                {/* 2. Main Container Box */}
                <div className="w-full border border-white/10 rounded-[24px] py-10 px-8 md:py-12 md:px-12 relative overflow-hidden">
                    
                    {/* Judul Section */}
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-headline-h4 font-bold text-white tracking-wide">
                             {t('hospitalityAppFeatures.title')}
                        </h2>
                    </div>

                    {/* Grid Layout (4 Kolom) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 md:gap-y-12 gap-y-8">
                        {hospitalityAppFeatures.items.map((item, index) => (
                            <div 
                                key={index} 
                                className="group flex md:flex-col items-center md:items-start text-left gap-4"
                            >
                            {/* Icon */}
                            
                            <img src={item.iconSrc} className='w-14 h-14 md:w-16 md:h-16' alt={`Icon of ${item.title}`} />

                                <div className="content md:mt-2">
                                    {/* Text Content */}
                                    <h3 className="text-white text-body-b4 font-semibold group-hover:text-red-500 transition-colors duration-300">
                                        {item.title}
                                    </h3>
                                    <p className="text-neutral-500 text-body-b5 mt-2 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                </div>
            </div>
            
        </div>

    </section>
  );
}