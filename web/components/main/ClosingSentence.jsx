'use client';

import { useRef, useLayoutEffect } from 'react';
import { useTranslations } from 'next-intl';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../base/Button'; 
import Icon from '../base/Icon';     

import { useModalRegistry } from '../hooks/useModalRegistry';

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

export default function ClosingSentence({ cmsData = null }) {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);

  const { activeModalId, closeModal, openModal, isModalOpen } = useModalRegistry();

  const t = useTranslations('global');
  const closingSentence = cmsData || t.raw('closingSentence');

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // Ambil semua elemen dengan class 'fade-up-item'
      const items = contentRef.current.querySelectorAll('.fade-up-item');

      // Animasi Fade In Up Staggered
      gsap.fromTo(items, 
        { 
          y: 50,       // Posisi awal: turun 50px
          opacity: 0   // Transparan
        },
        {
          y: 0,        // Posisi akhir: normal
          opacity: 1,  // Terlihat
          duration: 1,
          stagger: 0.3, // Jeda 0.3 detik antar item (muncul 1 per 1)
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%", // Mulai saat section masuk 75% layar
            toggleActions: "play none none reverse"
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="h-screen w-full flex items-center justify-center overflow-hidden relative bg-[#131313]"
    >
      
      {/* --- 1. VIDEO BACKGROUND --- */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-[0.56] scale-[1.25] md:scale-[1]"
      >
        <source src={closingSentence.video_url || "https://d2fsl11s4twg7t.cloudfront.net/assets/video/GettyImages-1314927774.mp4"} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* --- 2. DARK OVERLAY --- */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#131313] via-transparent to-black/80" />

      {/* --- 3. CONTENT --- */}
      <div 
        ref={contentRef}
        className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center justify-center"
      >
        
        {/* Item 1: Hashtag */}
        <p className="fade-up-item text-body-b3 text-white font-medium animate-pulse mb-4 opacity-0">
            #EntertainmentElevated
        </p>

        {/* Item 2: Headline */}
        <h2 dangerouslySetInnerHTML={{ __html: closingSentence.text }}  className="fade-up-item text-headline-h1 md:text-6xl lg:text-7xl font-bold text-white mb-10 leading-tight max-w-4xl opacity-0">
        </h2>

        {/* Item 3: Button Wrapper */}
        {/* Dibungkus div agar animasi GSAP (translateY) tidak konflik dengan hover scale tombol */}
        <div className="fade-up-item opacity-0">
          <Button 
            variant='primary' 
            size='lg' 
            iconRight={<Icon name="chevron-right" className="w-5 h-5" />}
             onClick={() => openModal('get-started')}
          >
             { closingSentence.textCTA }
          </Button>
        </div>

      </div>

    </section>
  );
}