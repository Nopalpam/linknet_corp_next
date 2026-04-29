'use client';

import React from 'react';
import Intro from '../base/section/Intro';
import CTAList from '../base/section/CTAList';
import { CLOSING_SENTENCE_DATA } from '@/data/components/closingSentence';

export default function ClosingSentence({
  name = 'default',
  cmsData = null,
  className = ""
}) {
  const data = cmsData || CLOSING_SENTENCE_DATA[name];

  if (!data) return null;

  const { introData, ctaList, ctaButtons } = data;
  const normalizedIntroData = introData
    ? {
        as: introData.as || 'h2',
        label: introData.label || introData.overline,
        title: introData.title,
        description: introData.description,
        align: introData.align || 'center',
      }
    : null;
  const normalizedCtaList = ctaList || ctaButtons || [];

  return (
    <div className='bg-gradient-to-t from-[#FAFAFA] to-transparent'>
      <div className={`container mx-auto px-4 md:px-0 max-w-4xl text-center pb-16 md:pb-20 ${className}`}>

        {/* Menggunakan Komponen Intro */}
        {normalizedIntroData && (
          <div className="mb-8 md:mb-10">
            <Intro
              as={normalizedIntroData.as}
              label={normalizedIntroData.label}
              title={normalizedIntroData.title}
              description={normalizedIntroData.description}
              align={normalizedIntroData.align}
            />
          </div>
        )}

        {/* Area Tombol CTA menggunakan Mapping ctaList */}
        <CTAList
          ctaList={normalizedCtaList}
          align="center"
          stackOnMobile
          ctaClassName="w-full sm:w-auto"
          defaultSize="lg"
        />

      </div>
    </div>
  );
}
