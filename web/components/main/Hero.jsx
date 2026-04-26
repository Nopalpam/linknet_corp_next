'use client';

import React, { useEffect, useRef } from 'react';
import LinknetLink from '../base/Link';
import SplitText from '../base/text/SplitText';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import data konfigurasi hero
import { HERO_DATA } from '../../data/components/hero';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

/**
 * Hero component - supports both:
 * 1. Static mode: pass `name` to look up from HERO_DATA (legacy)
 * 2. CMS mode: pass `data` object directly from CMS / HeroSliders
 */
export default function Hero({
  name, // Prop untuk mengambil key dari file data
  data: directData = null, // CMS data passed directly
  className = "" 
}) {
  const containerRef = useRef(null); // Ref untuk membatasi scope animasi GSAP
  
  // CMS mode uses directData, static mode uses name lookup
    const sectionData = directData || HERO_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
        if (!sectionData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.gsap-hero-item');

      if (gsapElements.length > 0) {
        gsap.from(gsapElements, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%', // Animasi mulai saat elemen masuk 80% dari atas viewport
            toggleActions: 'play none none reverse',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          // Memberikan sedikit delay awal agar selaras dengan SplitText (yang memiliki delay 240ms)
          delay: 0.1, 
          stagger: 0.15,
          ease: 'power3.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
    }, [sectionData]);

  // Jika data tidak ditemukan, jangan render apapun
    if (!sectionData) return null;

  // Destructure data dengan default value jika diperlukan
  const {
        config = {},
        id,
        sectionId: inlineSectionId,
    as: Tag = "h2",
    logoSrc = "",
    logoSquare,
    labelText = "",
    labelIconSrc = "",
    title = "",
    description = "",
    ctaText = "Get to Know Us",
    ctaLink = "https://google.com",
    ctaTarget = "_blank",
        bgImageDesktop: flatBgImageDesktop = "", 
        bgImageMobile: flatBgImageMobile = "",
    bgColor = "bg-[#FFB800]",
    bgOverlay = false, 
        heroSize = "md",
        theme = "light",
        className: dataClassName = "",
    } = sectionData;

    const {
        sectionId = id || inlineSectionId,
        className: configClassName = "",
        bgImage = "",
        bgImageMobile: configBgImageMobile = "",
    } = config;

    const bgImageDesktop = flatBgImageDesktop || bgImage;
    const bgImageMobile = flatBgImageMobile || configBgImageMobile || bgImageDesktop;
    const mergedSectionClassName = dataClassName || configClassName;

  const hasBgImage = bgImageDesktop || bgImageMobile;

  // Menentukan class ukuran hero berdasarkan heroSize
  const heightClass = heroSize === 'sm' 
        ? 'h-[560px] md:h-[64vh]' 
        : 'h-[600px] md:h-[70vh]';

  // Kondisi untuk warna text berdasarkan theme
  const isDark = theme === 'dark';

  return (
    // Container Luar (Padding Putih) - Tambahkan ref di sini
        <div id={sectionId} ref={containerRef} className={`p-2 pt-0 bg-white ${mergedSectionClassName} ${className}`}>
        <div className={`relative w-full ${heightClass} flex items-center overflow-hidden rounded-[20px] md:rounded-[24px] ${!hasBgImage ? bgColor : ''}`}>
      
            {/* ======================================= */}
            {/* 1. BACKGROUND LAYER (Z-INDEX: 0)        */}
            {/* ======================================= */}
            {hasBgImage && (
                <>
                    {/* Desktop Image */}
                    {bgImageDesktop && (
                    <img 
                        src={bgImageDesktop} 
                        alt="Hero Background Desktop"
                        className="hidden md:block absolute inset-0 w-full h-full object-cover z-0"
                    />
                    )}

                    {/* Mobile Image */}
                    {(bgImageMobile || bgImageDesktop) && (
                    <img 
                        src={bgImageMobile || bgImageDesktop} 
                        alt="Hero Background Mobile"
                        className="block md:hidden absolute inset-0 w-full h-full object-cover z-0"
                    />
                    )}
                </>
            )}

            {/* ======================================= */}
            {/* 2. OVERLAY LAYER (Z-INDEX: 1)           */}
            {/* ======================================= */}
            {bgOverlay && (
                <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-[#13131356] to-[#13131372] z-[1] pointer-events-none"></div>
            )}

            {/* ======================================= */}
            {/* 3. CONTENT LAYER (Z-INDEX: 10)          */}
            {/* ======================================= */}
            <div className="relative z-10 w-full p-6 md:p-8 lg:p-12 mx-auto h-full flex flex-col justify-end">
                {/* HAPUS class animate-fade-in-up di sini agar tidak konflik dengan GSAP */}
                <div className="max-w-full md:max-w-[560px] flex flex-col items-start gap-2 md:gap-2">
                
                    {/* COMPONENT 1: BRAND LOGO */}
                    {logoSrc && (
                    <div className="mb-3 gsap-hero-item"> {/* Class GSAP */}
                        <img 
                            src={logoSrc} 
                            alt="Brand Logo" 
                            className={`w-auto object-contain transition-all duration-300 ${
                                logoSquare 
                                ? 'h-16 md:h-18' 
                                : 'h-8 md:h-10'  
                            }`}
                        />
                    </div>
                    )}

                    {/* COMPONENT 2: LABEL PILL */}
                    {(labelText || labelIconSrc) && (
                        <div className="gsap-hero-item inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-[2px] border border-neutral-900/5"> {/* Class GSAP */}
                        {labelIconSrc && (
                            <img 
                            src={labelIconSrc} 
                            alt="Icon" 
                            className="w-4 h-auto rounded-[1px] shadow-sm"
                            />
                        )}
                        {labelText && (
                            <span className={`text-caption-c1 font-medium tracking-wide ${isDark ? 'text-white' : 'text-black'}`}>
                                {labelText}
                            </span>
                        )}
                        </div>
                    )}

                    {/* COMPONENT 3: TITLE (Tidak diberi class GSAP karena sudah ditangani SplitText) */}
                    {title && (
                        <Tag className={`text-headline-h4 md:text-headline-h3 font-bold tracking-tight drop-shadow-sm ${isDark ? 'text-white text-shadow-md' : 'text-black'}`}>
                            <SplitText
                                text={title.replace(/<br\s*\/?>/gi, '\n')} 
                                delay={240}
                                duration={0.5}
                                ease="power3.out"
                                splitType="lines"
                                from={{ opacity: 0, y: 40 }}
                                to={{ opacity: 1, y: 0 }}
                                threshold={0.1}
                                textAlign="left"
                                className='whitespace-pre-line' 
                            />
                        </Tag>
                    )}

                    {/* COMPONENT 4: DESCRIPTION */}
                    {description && (
                        <div className="gsap-hero-item flex items-start gap-3 max-w-[95%] md:max-w-[85%]"> {/* Class GSAP */}
                            <p className={`text-body-b5 md:text-body-b5 font-regular ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                                {description}
                            </p>
                        </div>
                    )}

                    {/* COMPONENT 5: CTA BUTTON (LINK) */}
                    {ctaText && (
                        <div className="mt-4 gsap-hero-item"> {/* Class GSAP */}
                            <LinknetLink 
                                href={ctaLink}
                                variant={isDark ? "secondary-outline--white" : "secondary-outline--black"} 
                                size="lg"
                                target={ctaTarget}
                                className="transition-all duration-300 group flex"
                            >
                                <span>{ctaText}</span>
                            </LinknetLink>
                        </div>
                    )}

                </div>
            </div>
            
        </div>
    </div>
  );
}