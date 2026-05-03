'use client';

import React, { useEffect, useRef } from 'react';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Komponen & Data
import Intro from '../base/section/Intro'; // Sesuaikan path jika berbeda
import { LOGO_RUNNING_DATA } from '@/data/components/logoRunning'; 

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function LogoRunning({ 
  name = 'default', 
  className = "",
  cmsData = null
}) {
  const containerRef = useRef(null);
  const sectionData = cmsData || LOGO_RUNNING_DATA[name];

  // =========================================
  // SETUP ANIMASI GSAP
  // =========================================
  useEffect(() => {
    if (!sectionData) return;

    let ctx = gsap.context(() => {
      const gsapElements = gsap.utils.toArray('.lnGsapLogoItem');

      if (gsapElements.length > 0) {
        gsap.from(gsapElements, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%', 
            toggleActions: 'play none none reverse',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.2, // Jeda antara header dan marquee logo
          ease: 'power3.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [sectionData]);

  if (!sectionData) return null;

  const { config, introData, logos } = sectionData;
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

  // Duplikasi logo array agar animasi marquee tidak terputus (seamless loop)
  const duplicatedLogos = logos ? [...logos, ...logos, ...logos] : [];

  return (
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__logoRunning py-16 md:py-24 bg-white overflow-hidden
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

      <div className="container mx-auto px-4 md:px-0">
        
        {/* HEADER SECTION DENGAN COMPONENT INTRO */}
        {introData && (
          <div className="lnGsapLogoItem mb-8 md:mb-10">
            <Intro 
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
              titleClassName={introData.titleClassName}
            />
          </div>
        )}

        {/* LOGO MARQUEE SECTION */}
        {duplicatedLogos.length > 0 && (
          <div className="lnGsapLogoItem w-full overflow-hidden relative [mask-image:_linear-gradient(to_right,transparent_0,_black_150px,_black_calc(100%-150px),transparent_100%)]">
            <div className="lnAnimateRunningMarqueeLogos items-center gap-12 md:gap-20">
              {duplicatedLogos.map((logo, idx) => (
                <img 
                  key={`${logo.name}-${idx}`} 
                  src={logo.img} 
                  alt={logo.name} 
                  title={logo.name}
                  className="h-8 md:h-8.5 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer" 
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
