'use client';

import React from 'react';
import Intro from '../base/section/Intro';
import LinknetLink from '../base/Link';

/**
 * ClosingSentence — CTA section above footer.
 * 
 * UI follows web_static_reference: gradient background, Intro heading, LinknetLink buttons.
 * Data comes from CMS (cmsData prop from layout.tsx settings) or falls back to defaults.
 */
export default function ClosingSentence({ 
  cmsData = null,
  className = "" 
}) {
  // Build introData from CMS or defaults
  const introData = cmsData?.introData || {};
  const ctaButtons = cmsData?.ctaButtons || [];

  const intro = {
    as: "h2",
    label: introData.overline || "",
    title: introData.title || "Have questions about Linknet?",
    description: introData.description || "Empowering your business with reliable solutions and innovation for a connected, future-ready enterprise.",
    align: "center",
  };

  // Default CTA if none provided from CMS
  const ctaList = ctaButtons.length > 0
    ? ctaButtons
    : [{ text: "Send Us a Message", variant: "secondary-outline", size: "lg", href: "/contact" }];

  return (
    <div id='footerTopMessage' className='bg-gradient-to-t from-[#FAFAFA] to-transparent'>
      <div className={`container mx-auto px-4 md:px-0 max-w-4xl text-center pb-16 md:pb-20 ${className}`}>

        {/* Intro Section */}
        <div className="mb-8 md:mb-10">
          <Intro
            as={intro.as}
            label={intro.label}
            title={intro.title}
            description={intro.description}
            align={intro.align}
          />
        </div>

        {/* CTA Buttons */}
        {ctaList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            {ctaList.map((cta, index) => (
              <LinknetLink
                key={index}
                variant={cta.variant || 'primary'}
                size={cta.size || 'lg'}
                href={cta.href || '#'}
                className="w-full sm:w-auto"
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