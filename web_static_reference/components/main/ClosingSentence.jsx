'use client';

import React from 'react';
import Intro from '../base/section/Intro'; 
import LinknetLink from '../base/Link'; 
import { CLOSING_SENTENCE_DATA } from '@/data/components/closingSentence';

export default function ClosingSentence({ 
  name = 'default', 
  className = "" 
}) {
  const data = CLOSING_SENTENCE_DATA[name];

  if (!data) return null;

  const { introData, ctaList } = data;

  return (
    <div className='bg-gradient-to-t from-[#FAFAFA] to-transparent'>
      <div className={`container mx-auto px-4 md:px-0 max-w-4xl text-center pb-16 md:pb-20 ${className}`}>
      
        {/* Menggunakan Komponen Intro */}
        {introData && (
          <div className="mb-8 md:mb-10">
            <Intro 
              as={introData.as || "h2"}
              label={introData.label}
              title={introData.title}
              description={introData.description}
              align={introData.align || "center"}
            />
          </div>
        )}

        {/* Area Tombol CTA menggunakan Mapping ctaList */}
        {ctaList && ctaList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            {ctaList.map((cta, index) => (
              <LinknetLink 
                key={index} 
                variant={cta.variant || 'primary'}
                size={cta.size || 'lg'} 
                href={cta.href}
                className="w-full sm:w-auto" // Memastikan full-width di mobile, auto di desktop
              >
                {cta.text}
              </LinknetLink>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}