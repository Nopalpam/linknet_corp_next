// import { Geist, Geist_Mono } from "next/font/google";
import "../dev/styles/main.sass";
import "./globals.css";

import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { GoogleTagManager, GoogleAnalytics } from '@next/third-parties/google';
import { locales } from '@/i18n/config';


import Navbar from "@/components/main/Navbar";
import NavbarFiber from '@/components/main/NavbarFiber';
import Footer from "@/components/main/Footer";
import ModalCookies from "@/components/base/modals/ModalCookies";
import OmniChannelWidget from "@/components/main/OmniChannelWidget";
import VisitorTracker from "@/components/VisitorTracker";
import { getHeaderMenus, getFooterMenus, getPublicSettings } from "@/lib/cmsApi";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  normalizeKeywords,
  resolveMetadataBase,
} from "@/lib/seo";

const toBoolean = (value: unknown) => value === true || value === 'true';
const localizedValue = (value: any, locale: string, fallback = '') => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[locale] || value.en || value.id || fallback;
  }

  return value || fallback;
};


const fallbackMetadata = {
  // Update Base URL sesuai domain Anda
  metadataBase: new URL('https://www.linknet.co.id'),

  title: {
    default: DEFAULT_SITE_TITLE,
    template: "%s - PT Link Net Tbk"
  },

  // Deskripsi digabung agar efisien:
  description: DEFAULT_SITE_DESCRIPTION,

  keywords: [
    "Link Net",
    "PT Link Net Tbk",
    "internet",
    "broadband",
    "connectivity"
  ],

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/assets/logos/favicon.png", // Pastikan path ini benar di project
  },

  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },

  openGraph: {
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    url: 'https://www.linknet.co.id',
    siteName: DEFAULT_SITE_TITLE,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: DEFAULT_SITE_TITLE,
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
    

export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params;
  const publicSettings = await getPublicSettings();
  const generalBranding = publicSettings.general_branding || {};
  const seo = publicSettings.seo || {};
  const analytics = publicSettings.analytics || {};

  const siteTitle = localizedValue(generalBranding.site?.title, locale, DEFAULT_SITE_TITLE);
  const titleSuffix = localizedValue(generalBranding.site?.title_suffix, locale, '- PT Link Net Tbk');
  const metaTitle = localizedValue(seo.meta_title, locale, siteTitle);
  const metaDescription = localizedValue(seo.meta_description, locale, localizedValue(generalBranding.site?.description, locale, fallbackMetadata.description));
  const keywords = normalizeKeywords(seo.meta_keywords) || fallbackMetadata.keywords;
  const thumbnail = seo.thumbnail || fallbackMetadata.openGraph.images?.[0]?.url;
  const favicon = generalBranding.branding?.favicon || fallbackMetadata.icons.icon;

  return {
    metadataBase: resolveMetadataBase(publicSettings),
    title: {
      default: metaTitle,
      template: `%s ${titleSuffix}`.trim(),
    },
    description: metaDescription,
    keywords,
    robots: fallbackMetadata.robots,
    icons: { icon: favicon },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: thumbnail ? [thumbnail] : undefined,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: fallbackMetadata.openGraph.url,
      siteName: siteTitle,
      images: thumbnail ? [{ url: thumbnail, width: 1200, height: 630, alt: metaTitle }] : undefined,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      type: 'website',
    },
    alternates: fallbackMetadata.alternates,
    other: analytics.google_analytics_id ? { 'google-analytics-id': analytics.google_analytics_id } : undefined,
  };
}

export default async function RootLayout({ children, params }) {
  // 1. Ambil locale dari params (gunakan await untuk amannya di Next.js terbaru)
  const { locale } = await params;

  // 2. Validasi locale agar tidak sembarang URL diterima
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 3. Ambil pesan/kumpulan kata dari folder messages/ via i18n/request.ts
  const messages = await getMessages();

  // 4. Fetch menu data dari CMS API (server-side)
  const [menuData, footerMenus, publicSettings] = await Promise.all([
    getHeaderMenus(),
    getFooterMenus(locale),
    getPublicSettings(),
  ]);

  const generalBranding = publicSettings.general_branding || {};
  const contact = publicSettings.contact || {};
  const footer = publicSettings.footer || {};
  const cookies = publicSettings.cookies || {};
  const analytics = publicSettings.analytics || {};
  const phoneNumbers = Array.isArray(contact.phone_numbers) ? contact.phone_numbers : [];

  // 5. Assemble footer data dari settings + menu
  const cmsFooterData = {
    logo: generalBranding.branding?.logo || '/assets/logos/logo-linknet-white.svg',
    slogan: localizedValue(generalBranding.site?.slogan, locale),
    address: localizedValue(generalBranding.site?.address, locale),
    contact: {
      email: contact.email || '',
      phoneNumbers,
    },
    menus: footerMenus || [],
    socials: Array.isArray(contact.socials)
      ? contact.socials.map((social) => ({
          ...social,
          iconName: social.icon || social.platform,
          href: social.url,
        }))
      : [],
    copyright: publicSettings.footer_copyright || `© ${new Date().getFullYear()} PT Link Net Tbk. All rights reserved.`,
  };

  cmsFooterData.copyright = footer.copyright || cmsFooterData.copyright;

  // 6. Assemble closing sentence data
  const isClosingHidden = toBoolean(publicSettings.closing_hidden);
  const closing = footer.closingSentence_default || {};
  const cmsClosingData = isClosingHidden ? null : {
    introData: {
      overline: closing.overline || '',
      title: localizedValue(closing.title, locale),
      description: localizedValue(closing.description, locale),
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
    enabled: toBoolean(cookies.enabled),
    title: localizedValue(cookies.title, locale, 'We use cookies'),
    description: localizedValue(cookies.description, locale, 'This website uses cookies to ensure you get the best experience.'),
    acceptLabel: 'Accept',
    moreInfoLabel: localizedValue(cookies.more_info?.title, locale, 'More Info'),
    moreInfoUrl: cookies.more_info?.url || '/privacy-policy',
    iconUrl: cookies.icon || '',
  };

  return (
    <html lang={locale}>
      <GoogleTagManager gtmId="GTM-5BND42TQ" />
      <GoogleAnalytics gaId={analytics.google_analytics_id || "G-Q51QMD6Y10"} />
      <body>
        {/* 8. Bungkus semua komponen dengan Provider */}
        <NextIntlClientProvider messages={messages} locale={locale}>
          <VisitorTracker />
          <Navbar menuData={menuData} defaultLocale={publicSettings.default_locale || 'en'} settings={publicSettings} />
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
