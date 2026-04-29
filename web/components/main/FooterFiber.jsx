'use client';

import React from 'react';
import ClosingSentence from './ClosingSentence';
import FooterMain from './FooterMain';

export default function FooterFiber({ className = "" }) {
  return (
    <footer className={`pt-16 md:pt-20 ${className}`}>
      <ClosingSentence name="fiberPreview" />
      <FooterMain name="fiberPreview" />
    </footer>
  );
}
