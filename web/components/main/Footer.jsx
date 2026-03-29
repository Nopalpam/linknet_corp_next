'use client';

import React from 'react';
import ClosingSentence from './ClosingSentence';
import FooterMain from './FooterMain';

/**
 * Footer — CMS-driven footer component.
 * 
 * Composed of:
 * 1. ClosingSentence (CTA section above footer)
 * 2. FooterMain (white card with menu, contact, socials, copyright)
 * 
 * Data flows:
 * - cmsClosingData → from CMS settings or page component data
 * - cmsFooterData → from CMS Menu Management (FOOTER position) + settings
 * 
 * Both datasets are fetched server-side in layout.tsx and passed down.
 */
export default function Footer({ 
  cmsClosingData = null, 
  cmsFooterData = null, 
  className = "" 
}) {
  return (
    <footer className={`pt-16 md:pt-20 ${className}`}>
      
      {/* 1. Closing CTA Section */}
      {cmsClosingData && <ClosingSentence cmsData={cmsClosingData} />}

      {/* 2. Footer Main Card with Menus & Copyright */}
      <FooterMain cmsFooterData={cmsFooterData} />

    </footer>
  );
}