'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Button from './Button';
import Icon from './Icon';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  mobilePosition = 'bottom', 
  desktopPosition = 'center',
  className = "",
  maxWidth = "max-w-3xl"
}) {
  const overlayRef = useRef(null);
  const modalBoxRef = useRef(null);

  // 3. Efek Animasi GSAP (Masuk & Keluar)
  useEffect(() => {
    if (!overlayRef.current || !modalBoxRef.current) return;

    if (isOpen) {
      // --- KUNCI SCROLL BODY ---
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      // --- ANIMASI MASUK (Enter) ---
      // Latar Belakang (Fade in biasa)
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );

      // Kotak Modal (Fade in dari ATAS / Top)
      gsap.fromTo(
        modalBoxRef.current,
        { opacity: 0, y: 80 }, // Mulai dari posisi atas (-60px)
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power3.out', // Smooth melambat di akhir
          delay: 0.1 
        }
      );

    } else {
      // --- ANIMASI KELUAR (Exit) ---
      // Latar belakang memudar
      gsap.to(overlayRef.current, { 
        opacity: 0, 
        duration: 0.3, 
        ease: 'power2.in' 
      });

      // Kotak modal bergerak naik sedikit lalu menghilang
      gsap.to(modalBoxRef.current, {
        opacity: 0, 
        y: 80, // Bergerak balik ke atas
        duration: 0.3, 
        ease: 'power3.in'
      });

      document.body.style.paddingRight = '';
    }
  }, [isOpen]);

  // Cleanup untuk berjaga-jaga jika komponen dihancurkan paksa (unmount)
  useEffect(() => {
    return () => {
      document.body.style.paddingRight = '';
    };
  }, []);

  const mobileAlignMap = {
    'center': 'items-center',
    'top': 'items-start',
    'bottom': 'items-end'
  };
  
  const desktopAlignMap = {
    'center': 'md:items-center',
    'top': 'md:items-start',
    'bottom': 'md:items-end'
  };

  const getRadiusClass = () => {
    if (mobilePosition === 'bottom' && desktopPosition === 'center') {
      return 'rounded-t-[24px]';
    }
    return 'rounded-[24px]';
  };

  return (
    <div 
      ref={overlayRef} 
      aria-hidden={!isOpen}
      className={`modal fixed inset-0 z-[100] flex justify-center bg-black/50 backdrop-blur-sm overflow-hidden p-0 md:p-6 opacity-0 ${className} ${mobileAlignMap[mobilePosition]} ${desktopAlignMap[desktopPosition]} ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
    >
      
      {/* Overlay Background Click to Close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true"></div>

      {/* KOTAK MODAL */}
      <div 
        ref={modalBoxRef}
        className={`relative w-full ${maxWidth} flex flex-col max-h-[90vh] md:max-h-[85vh] shadow-2xl opacity-0 ${getRadiusClass()} ${className}`}
      >
        {/* HEADER (Sticky) */}
        <div className="sticky top-0 z-20 flex items-start justify-between px-6 py-5 !pb-4 md:px-6 md:py-6 bg-white rounded-t-[24px] shrink-0">
          <div className="flex-1 pr-4">
            {typeof title === 'string' ? (
              <h2 className="text-headline-h5 font-bold text-neutral-900">
                {title}
              </h2>
            ) : (
              title
            )}
          </div>
          <Button 
            onClick={onClose}
            variant='secondary-plain'
            size='lg'
            iconLeft={<Icon name="close" />}
            className="!w-10 !h-10 flex pr-0 shrink-0 !contents"
            aria-label="Close modal"

          >
          </Button>
        </div>

        {/* BODY (Scrollable) */}
        <div className="flex-1 bg-white overflow-y-auto px-6 py-2 !pb-6 md:px-6 md:py-2 custom-scrollbar">
          {children}
        </div>

        {/* FOOTER (Sticky) */}
        {/* {footer && (
          <div className="sticky bottom-0 z-20 bg-white border-t border-neutral-100 px-6 py-4 md:px-8 md:py-5 shrink-0">
            {footer}
          </div>
        )} */}
        <div className="sticky bottom-0 z-20 bg-white min-h-[10px] px-6 py-2 md:px-6 md:py-2 shrink-0 rounded-b-[24px]">
          {footer}
        </div>

      </div>
    </div>
  );
}