'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import Intro from '../base/section/Intro';
import Button from '../base/Button'; 

/**
 * ExtendableArticle — Expandable/collapsible rich text article section.
 * 
 * CMS-driven: receives all data via cmsData prop.
 * Falls back to default collapsed height of 280px.
 */
export default function ExtendableArticle({ cmsData = null, className = "" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentWrapperRef = useRef(null);
  const sectionRef = useRef(null);
  
  // GSAP Expand / Collapse
  useEffect(() => {
    if (!cmsData || !contentWrapperRef.current) return;

    if (isExpanded) {
      gsap.to(contentWrapperRef.current, {
        height: "auto",
        duration: 0.6,
        ease: "power2.inOut",
      });
    } else {
      gsap.to(contentWrapperRef.current, {
        height: 280,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  }, [isExpanded, cmsData]);

  if (!cmsData) return null;

  const { 
    introData, 
    content, 
    buttonLabels = { expand: 'Read More', collapse: 'Show Less' },
    id 
  } = cmsData;

  const buttonAlignmentClass = introData?.align === 'center' ? 'justify-center' : 'justify-start';

  const handleToggle = () => {
    if (isExpanded) {
      if (sectionRef.current) {
        const yOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
      }
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <section ref={sectionRef} id={id} className={`py-16 md:py-24 bg-white ${className}`}>
      <div className="container">
        
        {/* Intro */}
        {introData && (
          <div className="mb-8">
            <Intro 
              as={introData.as || "h2"}
              title={introData.title}
              align={introData.align || "center"}
              label={introData.label} 
            />
          </div>
        )}

        {/* Content Area */}
        <div className="relative md:max-w-4xl mx-auto text-center">
          <div 
            ref={contentWrapperRef}
            className="overflow-hidden"
            style={{ height: 280 }}
          >
            <div 
              className="text-body-b4 text-secondary [&>p]:mb-6 last:[&>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: content || '' }} 
            />
          </div>

          {/* White gradient fade */}
          <div 
            className={`absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10 transition-opacity duration-500 ${
              isExpanded ? 'opacity-0' : 'opacity-100'
            }`} 
          />
        </div>

        {/* Toggle Button */}
        <div className={`mt-8 flex ${buttonAlignmentClass} relative z-20`}>
          <Button
            onClick={handleToggle}
            variant='secondary-outline'
            size='lg'
            className="bg-white"
          >
            {isExpanded ? buttonLabels.collapse : buttonLabels.expand}
          </Button>
        </div>

      </div>
    </section>
  );
}
