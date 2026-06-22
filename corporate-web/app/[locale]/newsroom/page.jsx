// src/app/news/page.jsx

import React from 'react';
import NavbarNewsroom from '@/components/main/NavbarNewsroom';
import NewsFeatured from '@/components/main/NewsFeatured';
import NewsTeaser from '@/components/main/NewsTeaser'; // Sesuaikan path jika perlu


// Anda bisa menambahkan metadata untuk SEO di sini
export const metadata = {
  title: 'Newsroom',
  description: 'Kumpulan berita, siaran pers, dan program CSR terbaru dari Link Net.',
};

export default function NewsPage() {
  return (
    <main> {/* Tambahkan padding top (pt) agar tidak tertutup navbar */}
      <NavbarNewsroom />
      
      {/* Panggil komponen NewsFeed kita di sini! */}
      <NewsFeatured className="bg__lightGradient !py-6 md:!py-10" hideCta />
      
      <NewsTeaser name="press-release" />
      
      <NewsTeaser name="csr-programs" />
      
    </main>
  );
}