'use client';

import React from 'react';
import Intro from '../base/section/Intro'; // Sesuaikan path jika berbeda
import Icon from '../base/Icon'; // Sesuaikan path jika berbeda
import { hasIntroContent } from '@/shared/presentation/intro';

import { INFO_CONTACT_DATA } from '@/data/components/infoContact';

export default function InfoContact({
  name = 'enterprise', // Default mengambil data enterprise
  cmsData = null,
  className = ""
}) {
  const sectionData = cmsData || INFO_CONTACT_DATA[name];

  if (!sectionData) return null;

  const { config = {}, id, introData, items = [] } = sectionData;
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

  return (
    <section
      id={sectionId}
      className={`lnSection__infoContact py-16 md:py-24 bg-white
        bg-no-repeat ${bgPositionClasses} ${bgSizeClass}
        bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]
        ${configClassName} ${className}`}
      style={sectionStyle}
    >
      <div className="container mx-auto px-4 md:px-0">

        {/* ========================================= */}
        {/* HEADER SECTION (Menggunakan Intro) */}
        {/* ========================================= */}
        {hasIntroContent(introData) && (
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
            {items.map((item, index) => {
              const iconLeft = item.iconLeft || item.icon_left || item.icon;
              const iconRight = item.iconRight || item.icon_right;

              return (
                <a
                  key={item.id || index}
                  href={item.href}
                  target={item.target || "_self"}
                  rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                  // Desain Pill: Background off-white, padding lebar, rounded-full
                  className="flex items-center gap-4 px-6 md:px-8 py-3 bg-light-1 hover:!bg-neutral-50 transition-colors duration-300 rounded-[32px] md:rounded-full border border-transparent hover:border-neutral-200 w-full sm:w-auto group"
                >
                  {/* Icon Section */}
                  {iconLeft && (
                    <div className="flex-shrink-0">
                      <Icon
                        name={iconLeft}
                        style={{ '--icon-size': '24px' }}
                        className="text-neutral-700 group-hover:text-yellow-500 transition-colors"
                      />
                    </div>
                  )}

                  {/* Text Section */}
                  <div className="flex flex-col text-left">
                    <span className="text-caption-c1 text-neutral-400 mb-0.5">
                      {item.label}
                    </span>
                    <span className="text-body-b4 font-bold text-neutral-900 group-hover:text-neutral-900">
                      {item.value}
                    </span>
                  </div>

                  {iconRight && (
                    <div className="flex-shrink-0">
                      <Icon
                        name={iconRight}
                        style={{ '--icon-size': '24px' }}
                        className="text-neutral-700 group-hover:text-yellow-500 transition-colors"
                      />
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
