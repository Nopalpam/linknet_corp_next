// import { Geist, Geist_Mono } from "next/font/google";
import "../dev/styles/main.sass";
import "./globals.css";

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';


import Navbar from "@/components/main/Navbar";
import { getHeaderMenus } from "@/lib/cmsApi";


export const metadata = {
  // Update Base URL sesuai domain Anda
  metadataBase: new URL('https://onestream.co.id'), 

  title: {
    default: "PT Link Net Tbk - We LINK the nation for better lives",
    template: "%s - PT Link Net Tbk"
  },

  // Deskripsi digabung agar efisien:
  description: "Hadirkan bioskop di rumah dengan One Stream. Tersedia varian Smart Box Android TV praktis dan One Stream+ dengan Audio by Bang & Olufsen & Dolby Vision-Atmos.",

  keywords: [
    "One Stream",
    "One Stream+",
    "Android TV Box", 
    "Smart TV Box", 
    "Audio by Bang & Olufsen", // Keyword Premium
    "Dolby Vision Atmos",   // Keyword Premium
    "Google Certified TV Box",
    "Set Top Box Premium"
  ],

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/assets/logos/favicon-onestream.svg", // Pastikan path ini benar di project
  },

  twitter: {
    card: 'summary_large_image',
    title: "One Stream & One Stream+ Solusi OTT Fleksibel untuk Bisnis dan Hiburan di Rumah",
    description: "Hadirkan bioskop di rumah dengan One Stream. Audio by Bang & Olufsen & Dolby Vision-Atmos.",
    images: ['/assets/img/og_image.jpg'], // Gunakan gambar yang sama
  },

  openGraph: {
    title: "One Stream & One Stream+ Solusi OTT Fleksibel untuk Bisnis dan Hiburan di Rumah",
    description: "Mendorong pertumbuhan bisnis sekaligus menghadirkan pengalaman menonton kelas dunia dengan teknologi hiburan premium tanpa batas.",
    url: 'https://onestream.co.id',
    siteName: 'One Stream',
    images: [
      {
        url: '/assets/img/og_image.jpg', // Ganti dengan foto yang menampilkan kedua box
        width: 1200,
        height: 630,
        alt: 'One Stream and One Stream+ Devices',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  
  alternates: {
    canonical: '/',
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "One Stream",
      "url": "https://onestream.co.id",
      "logo": "/assets/logos/logo-onestream.svg"
    },
    
    // --- PRODUK 1: ONE STREAM (Standard) ---
    {
      "@type": "Product",
      "name": "One Stream",
      "image": "/assets/devices/stb.png", // Sesuaikan path gambar
      "description": "One Stream Smart Box hadir sebagai solusi hiburan praktis. Didukung Android TV, kompatibel dengan Play Store untuk streaming, game, hingga browsing di TV Anda.",
      "brand": { "@type": "Brand", "name": "One Stream" },
      "sku": "OS-STD", 
      "offers": {
        "@type": "Offer",
        "url": "https://onestream.co.id/id?modal=get-onestream", // Direct Link ke Action
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "One Stream"
        }
      }
    },

    // --- PRODUK 2: ONE STREAM+ (Premium) ---
    {
      "@type": "Product",
      "name": "One Stream+", 
      "image": "/assets/devices/device-osplus-full.png", // Sesuaikan path gambar
      "description": "One Stream+ menghadirkan pengalaman menonton kelas dunia. Dilengkapi Audio by Bang & Olufsen, Dolby Vision-Atmos, dan ribuan aplikasi Google Certified Android TV.",
      "brand": { "@type": "Brand", "name": "One Stream" },
      "sku": "OS-PLUS", 
      "offers": {
        "@type": "Offer",
        "url": "https://onestream.co.id/id?modal=get-onestreamplus", // Direct Link ke Action
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "One Stream"
        }
      }
    }
]}
    

export default async function RootLayout({ children, params }) {
  // 1. Ambil locale dari params (gunakan await untuk amannya di Next.js terbaru)
  const { locale } = await params;

  // 2. Validasi locale agar tidak sembarang URL diterima
  const locales = ['en', 'id'];
  if (!locales.includes(locale)) {
    notFound();
  }

  // 3. Ambil pesan/kumpulan kata dari folder messages/ via i18n/request.ts
  const messages = await getMessages();

  // 4. Fetch menu data dari CMS API (server-side)
  const menuData = await getHeaderMenus();

  return (
    <html lang={locale}>
      <GoogleTagManager gtmId="GTM-5BND42TQ" />
      <GoogleAnalytics gaId="G-Q51QMD6Y10" />
      <body>
        {/* 5. Bungkus semua komponen dengan Provider */}
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Navbar menuData={menuData} />
          {children}
          
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
