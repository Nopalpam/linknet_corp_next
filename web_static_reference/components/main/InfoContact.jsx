'use client';

import React from 'react';
import Intro from '../base/section/Intro'; // Sesuaikan path jika berbeda
import Icon from '../base/Icon'; // Sesuaikan path jika berbeda

import { INFO_CONTACT_DATA } from '@/data/components/infoContact';

export default function InfoContact({ 
  name = 'enterprise', // Default mengambil data enterprise
  className = "" 
}) {
  const sectionData = INFO_CONTACT_DATA[name];

  if (!sectionData) return null;

  const { introData, items } = sectionData;

  return (
    <section className={`py-16 md:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4 md:px-0">
        
        {/* ========================================= */}
        {/* HEADER SECTION (Menggunakan Intro) */}
        {/* ========================================= */}
        {introData && (
          <div className="mb-10">
            <Intro 
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}

        {/* ========================================= */}
        {/* CONTACT BUTTONS (PILL STYLE) */}
        {/* ========================================= */}
        {items && items.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {items.map((item, index) => (
              <a 
                key={index} 
                href={item.href} 
                target={item.target || "_self"}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                // Desain Pill: Background off-white, padding lebar, rounded-full
                className="flex items-center gap-4 px-6 md:px-8 py-3 bg-light-1 hover:!bg-neutral-50 transition-colors duration-300 rounded-[32px] md:rounded-full border border-transparent hover:border-neutral-200 w-full sm:w-auto group"
              >
                {/* Icon Section */}
                <div className="flex-shrink-0">
                  <Icon 
                    name={item.icon} 
                    style={{ '--icon-size': '24px' }} 
                    className="text-neutral-700 group-hover:text-yellow-500 transition-colors" 
                  />
                </div>
                
                {/* Text Section */}
                <div className="flex flex-col text-left">
                  <span className="text-caption-c1 text-neutral-400 mb-0.5">
                    {item.label}
                  </span>
                  <span className="text-body-b4 font-bold text-neutral-900 group-hover:text-neutral-900">
                    {item.value}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}