'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useTranslations } from 'next-intl';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { faqData } from '../../messages/faqData-en'; 
import Icon from '../base/Icon'; 
import Button from '../base/Button';

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

  const t = useTranslations('faq');
  const faqListRaw = t.raw('faqList');
  const faqList = cmsData?.items || faqListRaw;

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const initialItemsCount = 5;
  const displayedFaqs = showAll ? faqList : faqList.slice(0, initialItemsCount);

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
      gsap.fromTo(".faq-item-initial", 
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
      gsap.fromTo(".faq-item-new", 
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
    const itemsToRemove = containerRef.current.querySelectorAll('.faq-item-new');

    gsap.to(itemsToRemove, {
      opacity: 0, height: 0, y: -30, marginTop: 0, padding: 0, border: 0,
      duration: 0.6,          // DIPERLAMBAT (dari 0.4)
      stagger: { amount: 0.3, from: "end" }, // Total waktu stagger diperlama
      ease: "power2.inOut",
      onComplete: () => {
        setShowAll(false);
        setIsAnimating(false);
        const initialList = containerRef.current.querySelectorAll('.faq-item-initial');
        if (initialList.length > 0) {
            initialList[initialList.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setTimeout(() => ScrollTrigger.refresh(), 500); // Delay refresh sedikit lebih lama
      }
    });
  };

  return (
    <section id='faq' ref={containerRef} className="text-white sectionProduct overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        
        {/* --- HEADER --- */}
        <div ref={headerRef} className="text-center mb-12 invisible"> 
          <p className="text-sm font-bold tracking-widest text-neutral-400 uppercase mb-3">
            {cmsData?.label || t('label')}
          </p>
          <h2 className="text-headline-h3 md:text-headline-h2 font-bold whitespace-pre-line leading-tight">
            {cmsData?.title || t('title')}
          </h2>
        </div>

        {/* --- LIST CONTAINER --- */}
        <div ref={listRef} className="w-full mx-auto md:w-3/5 min-h-[100px]">
          {displayedFaqs.map((item, index) => {
            const isOpen = activeIndex === index;
            const isInitial = index < initialItemsCount;
            const animationClass = isInitial ? 'faq-item-initial invisible' : 'faq-item-new';

            return (
              <div 
                key={item.id} 
                className={`border-b border-white/10 last:border-0 overflow-hidden ${animationClass}`}
              >
                {/* Header FAQ */}
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-6 flex items-center justify-between text-left group focus:outline-none"
                >
                  <span className="text-body-b3 font-medium pr-8 group-hover:text-neutral-200 transition-colors">
                    {item.question}
                  </span>
                  <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <Icon name="chevron-down" className="w-6 h-6 text-white" />
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
                      dangerouslySetInnerHTML={{ __html: item.answer }} 
                      className="text-body-b4 text-neutral-400 leading-relaxed" 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- CTA BUTTONS --- */}
        <div ref={btnRef} className="mt-12 flex justify-center invisible">
          {!showAll && faqData.faqList.length > initialItemsCount && (
            <Button variant="secondary-outline" size='lg'
              onClick={() => setShowAll(true)}
              className="transition-all duration-300 transform active:scale-95"
            >
              {t('textCTA')}
            </Button>
          )}
          
          {showAll && (
             <Button variant='secondary-outline' size='lg'
               onClick={handleShowLess}
               disabled={isAnimating}
               className="transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isAnimating ? 'Collapsing...' : t('textCTA_collapse')}
             </Button>
          )}
        </div>

      </div>
    </section>
  );
}