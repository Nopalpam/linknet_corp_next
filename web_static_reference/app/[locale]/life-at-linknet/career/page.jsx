// src/app/news/page.jsx

import React from 'react';
import Hero from '@/components/main/Hero';
import Career from '@/components/main/Career';


// Anda bisa menambahkan metadata untuk SEO di sini
export const metadata = {
  title: "Let's Discover the Possibilities Together!",
  description: 'Kumpulan berita, siaran pers, dan program CSR terbaru dari Link Net.',
};

export default function CareerPage() {
  return (
    <main> {/* Tambahkan padding top (pt) agar tidak tertutup navbar */}
      
      {/* Panggil komponen NewsFeed kita di sini! */}
      <Hero name="career" />

      <Career name="" />
      
    </main>
  );
}