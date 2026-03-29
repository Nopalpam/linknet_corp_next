// import { Geist, Geist_Mono } from "next/font/google";
import "../dev/styles/main.sass";
import "./globals.css";

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';


import Navbar from "@/components/main/Navbar";
import Footer from "@/components/main/Footer";
import ModalCookies from "@/components/base/modals/ModalCookies";
import OmniChannelWidget from "@/components/main/OmniChannelWidget";
import VisitorTracker from "@/components/VisitorTracker";
import { getHeaderMenus, getFooterMenus, getPublicSettings } from "@/lib/cmsApi";


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
  const [menuData, footerMenus, publicSettings] = await Promise.all([
    getHeaderMenus(),
    getFooterMenus(),
    getPublicSettings(),
  ]);

  // 5. Assemble footer data dari settings + menu
  const cmsFooterData = {
    logo: publicSettings.footer_logo || '/assets/logos/logo-linknet-white.svg',
    slogan: publicSettings.footer_slogan || '',
    address: publicSettings.footer_address || '',
    contact: {
      email: publicSettings.footer_email || publicSettings.contact_email || '',
      phone: publicSettings.footer_phone || publicSettings.contact_phone || '',
    },
    menus: footerMenus || [],
    socials: (() => {
      try {
        const raw = publicSettings.footer_socials;
        return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
      } catch { return []; }
    })(),
    copyright: publicSettings.footer_copyright || `© ${new Date().getFullYear()} PT Link Net Tbk. All rights reserved.`,
  };

  // 6. Assemble closing sentence data
  const cmsClosingData = {
    introData: {
      overline: publicSettings.closing_overline || '',
      title: publicSettings.closing_title || '',
      description: publicSettings.closing_description || '',
    },
    videoSrc: publicSettings.closing_video_src || '',
    ctaButtons: (() => {
      try {
        const raw = publicSettings.closing_cta_buttons;
        return typeof raw === 'string' ? JSON.parse(raw) : (Array.isArray(raw) ? raw : []);
      } catch { return []; }
    })(),
  };

  // 7. Assemble cookies modal data
  const cookiesData = {
    enabled: publicSettings.cookies_enabled === true || publicSettings.cookies_enabled === 'true',
    title: publicSettings.cookies_title || 'We use cookies',
    description: publicSettings.cookies_description || 'This website uses cookies to ensure you get the best experience.',
    acceptLabel: publicSettings.cookies_accept_label || 'Accept',
    moreInfoLabel: publicSettings.cookies_more_info_label || 'More Info',
    moreInfoUrl: publicSettings.cookies_more_info_url || '/privacy-policy',
    iconUrl: publicSettings.cookies_icon_url || '',
  };

  return (
    <html lang={locale}>
      <GoogleTagManager gtmId="GTM-5BND42TQ" />
      <GoogleAnalytics gaId="G-Q51QMD6Y10" />
      <body>
        {/* 8. Bungkus semua komponen dengan Provider */}
        <NextIntlClientProvider messages={messages} locale={locale}>
          <VisitorTracker />
          <Navbar menuData={menuData} />
          {children}
          <Footer cmsClosingData={cmsClosingData} cmsFooterData={cmsFooterData} />
          <ModalCookies cmsData={cookiesData} />
          <OmniChannelWidget cmsData={{
            enabled: publicSettings.omnichannel_enabled === true || publicSettings.omnichannel_enabled === 'true',
            title: publicSettings.omnichannel_title || undefined,
            subtitle: publicSettings.omnichannel_subtitle || undefined,
            whatsappUrl: publicSettings.omnichannel_whatsapp_url || undefined,
            submitEndpoint: publicSettings.omnichannel_submit_endpoint || undefined,
          }} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
