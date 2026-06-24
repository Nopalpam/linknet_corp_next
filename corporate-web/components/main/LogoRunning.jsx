'use client';

import React, { useEffect, useRef } from 'react';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Komponen & Data
import Intro from '../base/section/Intro'; // Sesuaikan path jika berbeda
import CTAList from '../base/section/CTAList';
import { LOGO_RUNNING_DATA } from '@/data/components/logoRunning'; 
import { hasIntroContent } from '@/shared/presentation/intro';
import { getResponsiveBackgroundProps } from '@/lib/responsiveBackground';

// Register Plugin GSAP
gsap.registerPlugin(ScrollTrigger);

function normalizeLogoItem(logo = {}, index = 0) {
  const resolveText = (value, fallback = '') => {
    if (value && typeof value === 'object') return value.en || value.id || fallback;
    return typeof value === 'string' ? value : fallback;
  };
  const image = logo.image || logo.img || logo.src || logo.url || '';
  const altImage = resolveText(logo.altImage || logo.alt_image || logo.alt || logo.name || logo.title, `Logo ${index + 1}`);

  return {
    id: logo.id || `${altImage}-${index}`,
    image,
    altImage,
  };
}

function normalizeCtaList(sectionData = {}) {
  const ctaSource = sectionData.ctaList
    || sectionData.cta_list
    || sectionData.ctaButtons
    || sectionData.cta_buttons
    || sectionData.buttons;

  if (Array.isArray(ctaSource)) return ctaSource;

  const text = sectionData.cta_text || sectionData.ctaText || sectionData.button_text || sectionData.buttonText;
  const href = sectionData.cta_link || sectionData.ctaLink || sectionData.cta_url || sectionData.ctaUrl || sectionData.button_link || sectionData.buttonLink;

  if (!text && !href) return [];

  return [{
    text,
    href: href || '#',
    variant: sectionData.cta_variant || sectionData.ctaVariant || sectionData.button_variant || 'primary',
    size: sectionData.cta_size || sectionData.ctaSize || sectionData.button_size || 'lg',
    iconLeft: sectionData.cta_icon_left || sectionData.ctaIconLeft || sectionData.button_icon_left || '',
    iconRight: sectionData.cta_icon_right || sectionData.ctaIconRight || sectionData.button_icon_right || '',
    link_type: sectionData.cta_link_type || sectionData.ctaLinkType || sectionData.link_type || 'url',
    action_modal: sectionData.cta_action_modal || sectionData.ctaActionModal || sectionData.action_modal || '',
    target: sectionData.cta_target || sectionData.ctaTarget || sectionData.target,
  }];
}

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

  const { config, introData } = sectionData;
  const ctaList = normalizeCtaList(sectionData);
  const logos = (Array.isArray(sectionData.logos)
    ? sectionData.logos
    : Array.isArray(sectionData.items)
      ? sectionData.items
      : Array.isArray(sectionData.logo_items)
        ? sectionData.logo_items
        : []
  ).map(normalizeLogoItem).filter((logo) => logo.image);
  const {
    sectionId,
    className: configClassName = "",
    bgImage = "",
    bgImageMobile = "",
    bgPositionClasses = "bg-center md:bg-center",
    bgSizeClass = "bg-cover",
  } = config || {};

  const { backgroundStyle, backgroundImageClassName } = getResponsiveBackgroundProps(bgImage, bgImageMobile);

  // Duplikasi logo array agar animasi marquee tidak terputus (seamless loop)
  const duplicatedLogos = logos.length > 0 ? [...logos, ...logos, ...logos] : [];

  return (
    <section
      id={sectionId}
      ref={containerRef}
      className={`lnSection__logoRunning py-16 md:py-24 bg-white overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        ${backgroundImageClassName}
        ${configClassName} ${className}`}
      style={backgroundStyle}
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
        {hasIntroContent(introData) && (
          <div className="lnGsapLogoItem mb-8 md:mb-12">
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
                  key={`${logo.id}-${idx}`}
                  src={logo.image}
                  alt={logo.altImage}
                  title={logo.altImage}
                  className="h-7 md:h-10 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              ))}
            </div>
          </div>
        )}

        {ctaList && ctaList.length > 0 && (
          <div className="lnGsapLogoItem mt-8 flex justify-center md:mt-10">
            <CTAList
              ctaList={ctaList}
              align="center"
              stackOnMobile
              ctaClassName="w-full sm:w-auto"
              className="justify-center gap-5"
              defaultSize="lg"
            />
          </div>
        )}

      </div>
    </section>
  );
}
