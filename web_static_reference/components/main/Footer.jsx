'use client';

import React from 'react';
import ClosingSentence from './ClosingSentence'; // Sesuaikan path
import FooterMain from './FooterMain'; // Sesuaikan path

export default function Footer({ className = "" }) {
  return (
    // Background utama abu-abu muda 
    <footer className={`pt-16 md:pt-20 ${className}`}>
      
      {/* 1. Bagian Call to Action di atas */}
      <ClosingSentence />

      {/* 2. Kartu Putih Menu & Copyright di bawah */}
      <FooterMain />

    </footer>
  );
}