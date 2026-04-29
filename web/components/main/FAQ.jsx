'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import faqData from '@/data/components/faq';
import Icon from '../base/Icon';
import Button from '../base/Button';
import Intro from '../base/section/Intro';

// Register Plugin
gsap.registerPlugin(ScrollTrigger);

export default function Faq({ cmsData = null }) {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const listRef = useRef(null);
  const btnRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sourceData = cmsData
    ? {
        config: cmsData.config || {},
        introData: cmsData.introData || {
          as: 'h2',
          label: cmsData.label,
          title: cmsData.title,
          description: cmsData.description,
          align: cmsData.align || 'left',
        },
        faqList: cmsData.faqList || cmsData.items || [],
        textCTA: cmsData.textCTA || 'See More',
        textCTA_collapse: cmsData.textCTA_collapse || 'Show Less',
      }
    : faqData;
  const { config, introData, faqList = [], textCTA, textCTA_collapse } = sourceData;

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const initialItemsCount = 5;
  const displayedFaqs = showAll ? faqList : faqList.slice(0, initialItemsCount);
  const getAnswerMarkup = (answer) =>
    answer
      .replaceAll('text-white underline', 'text-neutral-900 underline')
      .replaceAll('text-white', 'text-neutral-900');

  // --- 1. ANIMASI SCROLL (Initial Load) - DIPERLAMBAT ---
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {

      // 1. ANIMASI HEADER (Sangat Halus)
      gsap.fromTo(headerRef.current,
        { y: 60, opacity: 0, visibility: 'hidden' },
        {
          y: 0,
          opacity: 1,
          visibility: 'visible',
          duration: 1.5,      // DIPERLAMBAT (dari 0.8)
          ease: "power3.out", // Easing lebih smooth
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // 2. ANIMASI LIST ITEM (Staggered Slow)
      gsap.fromTo(".lnFaqItemInitial",
        { y: 80, opacity: 0, visibility: 'hidden' },
        {
          y: 0,
          opacity: 1,
          visibility: 'visible',
          duration: 1.2,      // DIPERLAMBAT (dari 0.6)
          stagger: 0.2,       // JEDA LEBIH LAMA (dari 0.1) biar bergelombang
          ease: "power3.out", // Pendaratan lebih halus
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 80%",
            once: true,
          }
        }
      );

      // 3. ANIMASI TOMBOL (See More)
      gsap.fromTo(btnRef.current,
        { y: 40, opacity: 0, visibility: 'hidden', scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          visibility: 'visible',
          scale: 1,
          duration: 1.0,      // DIPERLAMBAT (dari 0.5)
          delay: 0.4,         // Tunggu list agak naik dulu
          ease: "back.out(1.2)", // Membal sedikit saja (kurangi elastisitas)
          scrollTrigger: {
            trigger: listRef.current,
            start: "bottom 95%",
            once: true,
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- 2. ANIMASI SAAT SHOW MORE (Entry - Slow) ---
  useEffect(() => {
    if (showAll) {
      ScrollTrigger.refresh();
      gsap.fromTo(".lnFaqItemNew",
        { y: 50, opacity: 0, height: 0, marginTop: 0 },
        {
          y: 0, opacity: 1, height: "auto", marginTop: 0,
          duration: 0.8,      // DIPERLAMBAT (dari 0.5)
          stagger: 0.15,      // JEDA LEBIH LAMA
          ease: "power3.out",
          onComplete: () => ScrollTrigger.refresh()
        }
      );
    }
  }, [showAll]);

  // --- 3. ANIMASI SAAT SHOW LESS (Exit - Slow) ---
  const handleShowLess = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const itemsToRemove = containerRef.current.querySelectorAll('.lnFaqItemNew');

    gsap.to(itemsToRemove, {
      opacity: 0, height: 0, y: -30, marginTop: 0, padding: 0, border: 0,
      duration: 0.6,          // DIPERLAMBAT (dari 0.4)
      stagger: { amount: 0.3, from: "end" }, // Total waktu stagger diperlama
      ease: "power2.inOut",
      onComplete: () => {
        setShowAll(false);
        setIsAnimating(false);
        const initialList = containerRef.current.querySelectorAll('.lnFaqItemInitial');
        if (initialList.length > 0) {
            initialList[initialList.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => ScrollTrigger.refresh(), 500); // Delay refresh sedikit lebih lama
      }
    });
  };

  return (
    <section
      id={config.sectionId}
      ref={containerRef}
      className={`sectionProduct overflow-hidden bg-white text-neutral-950 ${config.className || ''}`}
    >
      <div className="container mx-auto px-6 max-w-4xl">

        {/* --- HEADER --- */}
        <div ref={headerRef} className="mb-12 invisible">
          <Intro
            label={introData.label}
            title={introData.title}
            description={introData.description}
            align={introData.align || 'center'}
            as={introData.as || 'h2'}
            labelClassName={introData.labelClassName || ''}
            titleClassName={introData.titleClassName || ''}
            descriptionClassName={introData.descriptionClassName || ''}
            className={introData.className || ''}
          />
        </div>

        {/* --- LIST CONTAINER --- */}
        <div ref={listRef} className="w-full mx-auto md:w-3/5 min-h-[100px]">
          {displayedFaqs.map((item, index) => {
            const isOpen = activeIndex === index;
            const isInitial = index < initialItemsCount;
            const animationClass = isInitial ? 'lnFaqItemInitial invisible' : 'lnFaqItemNew';

            return (
              <div
                key={item.id}
                className={`border-b border-secondary last:border-0 overflow-hidden ${animationClass}`}
              >
                {/* Header FAQ */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-6 flex items-center justify-between text-left group focus:outline-none"
                >
                  <span className="text-body-b3 font-medium pr-8 text-neutral-900 group-hover:text-neutral-700 transition-colors">
                    {item.question}
                  </span>
                  <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <Icon name="chevron-down" className="w-6 h-6 text-black" />
                  </span>
                </button>

                {/* Body FAQ */}
                <div
                  className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0 pb-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      dangerouslySetInnerHTML={{ __html: getAnswerMarkup(item.answer) }}
                      className="text-body-b4 text-neutral-600 leading-relaxed [&_a]:font-medium [&_a]:text-black [&_a]:underline [&_a]:underline-offset-2"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- CTA BUTTONS --- */}
        <div ref={btnRef} className="mt-12 flex justify-center invisible">
          {!showAll && faqList.length > initialItemsCount && (
            <Button variant="secondary-outline" size='lg'
              onClick={() => setShowAll(true)}
              className="transition-all duration-300 transform active:scale-95"
            >
              {textCTA}
            </Button>
          )}

          {showAll && (
             <Button variant='secondary-outline' size='lg'
               onClick={handleShowLess}
               disabled={isAnimating}
               className="transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isAnimating ? 'Collapsing...' : textCTA_collapse}
             </Button>
          )}
        </div>

      </div>
    </section>
  );
}
