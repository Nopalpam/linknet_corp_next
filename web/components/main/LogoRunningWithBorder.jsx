'use client';

import React, { useEffect, useRef } from 'react';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Komponen & Data
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import { LOGO_RUNNING_BORDER_DATA } from '@/data/components/logoRunningWithBorder'; 

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function LogoRunningWithBorder({ 
  name = 'default', 
  className = "" 
}) {
  const containerRef = useRef(null);
  const sectionData = LOGO_RUNNING_BORDER_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapRunningItem');

      if (gsapElements.length > 0) {
        gsap.from(gsapElements, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%', 
            toggleActions: 'play none none reverse',
          },
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2, 
          ease: 'power3.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [sectionData]);

  if (!sectionData) return null;

  const { config, introData, logos, ctaList } = sectionData;
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

  const duplicatedLogos = logos ? [...logos, ...logos, ...logos] : [];

  return (
    <section 
      id={sectionId}
      ref={containerRef}
      className={`lnSection__logoRunningWithBorder
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      
      {/* Efek Marquee CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes running-marquee-logos {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .lnAnimateRunningMarqueeLogos {
          display: flex;
          width: max-content;
          animation: running-marquee-logos 25s linear infinite;
        }
        .lnAnimateRunningMarqueeLogos:hover {
          animation-play-state: paused;
        }
      `}} />

      <div className="container">
        <div className="py-8 md:py-8 px-6 md:px-12 bg-white border border-neutral rounded-[16px] md:rounded-[24px] overflow-hidden flex flex-col items-start gap-10 md:gap-14 w-full">
        
            {/* HEADER SECTION DENGAN COMPONENT INTRO */}
            {introData && (
            <div className="lnGsapRunningItem w-full">
                <Intro 
                as={introData.as || "h2"}
                label={introData.label}
                title={introData.title}
                description={introData.description}
                align={introData.align || "left"} 
                titleClassName={introData.titleClassName}
                />
            </div>
            )}

            {/* LOGO MARQUEE SECTION */}
            {duplicatedLogos.length > 0 && (
            <div className="lnGsapRunningItem w-full overflow-hidden relative [mask-image:_linear-gradient(to_right,transparent_0,_black_150px,_black_calc(100%-150px),transparent_100%)]">
                <div className="lnAnimateRunningMarqueeLogos items-center gap-12 md:gap-20">
                {duplicatedLogos.map((logo, idx) => (
                    <img 
                    key={`${logo.name}-${idx}`} 
                    src={logo.img} 
                    alt={logo.name} 
                    title={logo.name}
                    className="h-8 md:h-10 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer grayscale-0 opacity-90 hover:opacity-100" 
                    />
                ))}
                </div>
            </div>
            )}

            {/* CTA LIST SECTION */}
            {ctaList && ctaList.length > 0 && (
              <div className="lnGsapRunningItem w-full">
                <CTAList
                  ctaList={ctaList}
                  align="left"
                  stackOnMobile
                  ctaClassName="w-full sm:w-auto"
                  className="justify-center sm:justify-start gap-5"
                  defaultSize="lg"
                />
              </div>
            )}

        </div>

      </div>
    </section>
  );
}
