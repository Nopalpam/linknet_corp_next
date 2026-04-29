'use client';

import React from 'react';
import ClosingSentence from './ClosingSentence';
import FooterMain from './FooterMain';

export default function Footer({
  cmsClosingData = null,
  cmsFooterData = null,
  className = "",
}) {
  return (
    // Background utama abu-abu muda
    <footer className={`pt-16 md:pt-20 ${className}`}>

      {/* 1. Bagian Call to Action di atas */}
      {cmsClosingData ? <ClosingSentence cmsData={cmsClosingData} /> : <ClosingSentence />}

      {/* 2. Kartu Putih Menu & Copyright di bawah */}
      <FooterMain cmsFooterData={cmsFooterData} />

    </footer>
  );
}
