'use client';

import React from 'react';
import ClosingSentence from './ClosingSentence';
import FooterMain from './FooterMain';

export default function FooterMedia({ className = '' }) {
  return (
    <footer className={`pt-16 md:pt-20 ${className}`}>
      <ClosingSentence name="mediaPreview" />
      <FooterMain name="mediaPreview" />
    </footer>
  );
}
