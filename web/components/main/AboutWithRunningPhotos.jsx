'use client';

import React from 'react';
import Intro from '../base/section/Intro'; // Sesuaikan path jika berbeda
import { ABOUT_RUNNING_PHOTOS_DATA } from '@/data/components/aboutRunningPhotos'; // Sesuaikan path

export default function AboutWithRunningPhotos({
  name = 'default',
  cmsData = null,
  className = ""
}) {
  const sectionData = cmsData || ABOUT_RUNNING_PHOTOS_DATA[name];

  if (!sectionData) return null;

  const { config = {}, id, introData, photos = [] } = sectionData;
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

  // Duplikasi array foto agar animasi marquee tidak pernah terputus (infinite loop)
  // Kalikan 3 atau 4 kali agar cukup panjang menutupi layar lebar
  const duplicatedPhotos = photos ? [...photos, ...photos, ...photos, ...photos] : [];

  // Array kemiringan (rotasi) agar foto terlihat estetik dan tidak kaku
  const rotations = ['-rotate-2', 'rotate-3', '-rotate-1', 'rotate-2', '-rotate-3'];

  return (
    <section
      id={sectionId}
      className={`lnSection__aboutWithRunningPhotos py-16 md:py-24 bg-white overflow-hidden
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >

      {/* ========================================= */}
      {/* EFEK MARQUEE CSS (Inject Style) */}
      {/* ========================================= */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes photo-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Bergeser 50% karena kita menduplikasi array cukup banyak */
        }
        .animate-photo-marquee {
          display: flex;
          width: max-content;
          animation: photo-marquee 35s linear infinite;
        }
        .animate-photo-marquee:hover {
          animation-play-state: paused; /* Berhenti saat di-hover */
        }
      `}} />

      <div className="container mx-auto px-4 md:px-0">

        {/* ========================================= */}
        {/* HEADER SECTION (Menggunakan Intro) */}
        {/* ========================================= */}
        {introData && (
          <div className="mb-8 md:mb-12">
            <Intro
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "left"}
            />
          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* RUNNING PHOTOS SECTION (Full Width) */}
      {/* ========================================= */}
      {duplicatedPhotos.length > 0 && (
        <div className="w-full relative pb-10 pt-4">

          {/* Efek fade out (masking) di kiri dan kanan layar */}
          <div className="absolute inset-0 z-10 pointer-events-none [mask-image:_linear-gradient(to_right,white_0%,transparent_5%,transparent_95%,white_100%)] bg-white/50 hidden md:block"></div>

          <div className="animate-photo-marquee gap-6 md:gap-10 px-4 md:px-0 items-center">
            {duplicatedPhotos.map((photo, index) => {
              // Ambil rotasi secara bergantian berdasarkan index
              const rotateClass = rotations[index % rotations.length];

              return (
                <div
                  key={index}
                  className={`flex-shrink-0 transition-transform duration-300 hover:scale-105 hover:z-20 ${rotateClass}`}
                >
                  {/* POLAROID STYLE CARD */}
                  <div className="bg-white p-2 pb-8 md:p-3 md:pb-12 shadow-lg rounded-sm w-[240px] md:w-[320px]">
                    <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                      <img
                        src={photo}
                        alt={`Linknet Activity ${index}`}
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </section>
  );
}
