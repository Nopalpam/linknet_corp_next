'use client';

import React, { useEffect, useRef } from 'react';

// Import GSAP & ScrollTrigger
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import Komponen & Data
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import { LOGO_RUNNING_BORDER_DATA } from '@/data/components/logoRunningWithBorder'; 
import { hasIntroContent } from '@/shared/presentation/intro';

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

export default function LogoRunningWithBorder({ 
  name = 'default', 
  className = "",
  cmsData = null
}) {
  const containerRef = useRef(null);
  const sectionData = cmsData || LOGO_RUNNING_BORDER_DATA[name];

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

  const sectionStyle = {
    '--bg-image-desktop': bgImage ? `url('${bgImage}')` : 'none',
    '--bg-image-mobile': bgImageMobile ? `url('${bgImageMobile}')` : (bgImage ? `url('${bgImage}')` : 'none')
  };

  const duplicatedLogos = logos.length > 0 ? [...logos, ...logos, ...logos] : [];

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
        <div className="py-4 md:py-8 px-6 md:px-12 bg-white border border-neutral rounded-[16px] md:rounded-[24px] overflow-hidden flex flex-col items-start gap-10 md:gap-14 w-full">
        
            {/* HEADER SECTION DENGAN COMPONENT INTRO */}
            {hasIntroContent(introData) && (
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
                <div className="lnAnimateRunningMarqueeLogos items-center gap-12 md:gap-14">
                {duplicatedLogos.map((logo, idx) => (
                    <img 
                    key={`${logo.id}-${idx}`}
                    src={logo.image}
                    alt={logo.altImage}
                    title={logo.altImage}
                    className="h-8 md:h-10 object-contain hover:scale-105 transition-transform duration-300 cursor-pointer grayscale-0 opacity-90 hover:opacity-100" 
                    />
                ))}
                </div>
            </div>
            )}

            {/* CTA LIST SECTION */}
            {ctaList && ctaList.length > 0 && (
              <div className="lnGsapRunningItem">
                <CTAList
                  ctaList={ctaList}
                  align="left"
                  stackOnMobile
                  ctaClassName="w-full sm:w-auto"
                  className="justify-start gap-5"
                  defaultSize="lg"
                />
              </div>
            )}

        </div>

      </div>
    </section>
  );
}
