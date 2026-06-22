'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import Intro from '../base/section/Intro';
import Button from '../base/Button';

import { EXTENDABLE_ARTICLE_DATA } from '@/data/components/extendableArticle';

export default function ExtendableArticle({ className = "", name = "business-highlights", cmsData = null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentWrapperRef = useRef(null); // Ref untuk animasi GSAP
  const sectionRef = useRef(null); // Ref untuk scroll ke atas

  // Ambil data spesifik berdasarkan props name
  const data = cmsData || EXTENDABLE_ARTICLE_DATA[name];

  // Efek GSAP untuk Expand / Collapse
  useEffect(() => {
    if (!contentWrapperRef.current) return;

    if (isExpanded) {
      // Animate ke ukuran aslinya (auto)
      gsap.to(contentWrapperRef.current, {
        height: "auto",
        duration: 0.6,
        ease: "power2.inOut",
      });
    } else {
      // Animate menciut ke 280px
      gsap.to(contentWrapperRef.current, {
        height: 280,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  }, [isExpanded]);

  // Safeguard jika name tidak ditemukan
  if (!data) return null;

  const { config = {}, id, introData, content, buttonLabels } = data;
  const {
    sectionId = id,
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
  const buttonAlignmentClass = introData.align === 'center' ? 'justify-center' : 'justify-start';

  // Fungsi untuk menangani klik tombol
  const handleToggle = () => {
    if (isExpanded) {
      // Jika sedang terbuka dan mau ditutup (Show Less), scroll ke atas komponen
      if (sectionRef.current) {
        // Ambil posisi elemen dari atas dokumen, kurangi 100px agar tidak tertutup sticky header/navbar
        const yOffset = sectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
      }
    }
    // Ubah state setelah perintah scroll dijalankan
    setIsExpanded(!isExpanded);
  };

  return (
    <section
      id={sectionId}
      ref={sectionRef}
      className={`lnSection__extendableArticle py-16 md:py-24 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container">

        {/* --- INTRO COMPONENT --- */}
        <div className="mb-8">
          <Intro
            as={introData.as}
            title={introData.title}
            align={introData.align || "center"}
            label={introData.label}
          />
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="relative md:max-w-4xl mx-auto text-center">
          {/* Wrapper Konten yang dianimasikan GSAP */}
          <div
            ref={contentWrapperRef}
            className="overflow-hidden"
            style={{ height: 280 }} // Initial state sebelum GSAP berjalan
          >
            <div
              className="text-body-b4 text-secondary [&>p]:mb-6 last:[&>p]:mb-0"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>

          {/* --- GRADIENT PUTIH --- */}
          <div
            className={`absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none z-10 transition-opacity duration-500 ${
              isExpanded ? 'opacity-0' : 'opacity-100'
            }`}
          />
        </div>

        {/* --- TOMBOL READ MORE / SHOW LESS --- */}
        <div className={`mt-8 flex ${buttonAlignmentClass} relative z-20`}>
          <Button
            onClick={handleToggle} // Gunakan fungsi handleToggle di sini
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
