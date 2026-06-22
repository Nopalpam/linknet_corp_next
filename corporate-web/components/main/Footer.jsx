'use client';

import React from 'react';
import FooterMain from './FooterMain';

export default function Footer({
  cmsFooterData = null,
  className = "",
}) {
  return (
    // Background utama abu-abu muda
    <footer className={`${className}`}>

      <FooterMain cmsFooterData={cmsFooterData} />

    </footer>
  );
}
