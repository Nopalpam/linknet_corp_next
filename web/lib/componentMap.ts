/**
 * Auto Component Registry
 * 
 * Central registry that maps CMS Page Builder component types to their
 * React component implementations and prop transformations.
 * 
 * HOW TO ADD A NEW COMPONENT:
 * 1. Create your React component in components/main/
 * 2. Add ONE entry below in COMPONENT_MAP
 * 3. Done — PageRenderer will pick it up automatically
 * 
 * Each entry can optionally include a `mapProps` function to transform
 * CMS data into the props your component expects. If omitted, the
 * component receives { data, locale, styleProps } directly.
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

// ─── Types ──────────────────────────────────────────────────────────

export interface ComponentMapEntry {
  /** Lazy-loaded React component */
  component: ComponentType<any>;
  /** 
   * Optional prop transformer. Receives raw CMS data + locale helpers,
   * returns the props to pass to the component.
   * If omitted, component receives `styleProps` only (className from custom_class).
   */
  mapProps?: (ctx: PropMapperContext) => Record<string, any>;
}

export interface PropMapperContext {
  data: Record<string, any>;
  locale: string;
  /** Helper: extracts localized text from {en, id} objects */
  t: (field: any) => string;
  /** Pre-built style props from CMS (className from custom_class) */
  styleProps: Record<string, any>;
}

// ─── Helper for localized text ──────────────────────────────────────

export function createLocalizer(locale: string) {
  const lang = (locale === 'id' || locale === 'en') ? locale : 'id';
  return (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field['id'] || field['en'] || '';
  };
}

// ─── Dynamic Imports (code-split per component) ─────────────────────

const Hero = dynamic(() => import('@/components/main/Hero'));
const HeroSliders = dynamic(() => import('@/components/main/HeroSliders'));
const HeroStatic = dynamic(() => import('@/components/main/HeroStatic'));
const AboutWithUSP = dynamic(() => import('@/components/main/AboutWithUSP'));
const AboutValues = dynamic(() => import('@/components/main/AboutValues'));
const AboutWithRunningPhotos = dynamic(() => import('@/components/main/AboutWithRunningPhotos'));
const TabBusiness = dynamic(() => import('@/components/main/TabBusiness'));
const BusinessTab = dynamic(() => import('@/components/main/BusinessTab'));
const MapsCoverage = dynamic(() => import('@/components/main/MapsCoverage'));
const NewsFeatured = dynamic(() => import('@/components/main/NewsFeatured'));
const NewsTeaser = dynamic(() => import('@/components/main/NewsTeaser'));
const InformationList = dynamic(() => import('@/components/main/InformationList'));
const KeyHighlightWithImage = dynamic(() => import('@/components/main/KeyHighlightWithImage'));
const HighlightingRealInitiatives = dynamic(() => import('@/components/main/HighlightingRealInitiatives'));
const InfoContact = dynamic(() => import('@/components/main/InfoContact'));
const ContactUs = dynamic(() => import('@/components/main/ContactUs'));
const JoinFirstSquad = dynamic(() => import('@/components/main/JoinFirstSquad'));
const ReportList = dynamic(() => import('@/components/main/ReportList'));
const CareerSneakPeek = dynamic(() => import('@/components/main/CareerSneakPeek'));
const Career = dynamic(() => import('@/components/main/Career'));
const Management = dynamic(() => import('@/components/main/Management'));
const VisionMission = dynamic(() => import('@/components/main/VisionMission'));
const Milestone = dynamic(() => import('@/components/main/Milestone'));
const AwardsFeed = dynamic(() => import('@/components/main/AwardsFeed'));
const AwardSneakPeek = dynamic(() => import('@/components/main/AwardSneakPeek'));
const FAQ = dynamic(() => import('@/components/main/FAQ'));
const OneStream = dynamic(() => import('@/components/main/OneStream'));
const ClosingSentence = dynamic(() => import('@/components/main/ClosingSentence'));
const Tvc = dynamic(() => import('@/components/main/Tvc'));
const USP = dynamic(() => import('@/components/main/USP'));

// Built-in generic section components (no separate file needed per type)
import {
  TextBlock,
  CKEditorBlock,
  ImageBlock,
  DocumentList,
  GenericSection,
  AnnouncementList,
  TradingViewWidget,
} from '@/components/cms/BuiltinSections';

// ─── COMPONENT MAP ──────────────────────────────────────────────────
// 
// To add a new CMS component, add an entry here:
//   'cms_type_name': { component: MyComponent, mapProps: (ctx) => ({...}) }
//
// mapProps is optional. Without it, the component just gets styleProps.
// ─────────────────────────────────────────────────────────────────────

export const COMPONENT_MAP: Record<string, ComponentMapEntry> = {

  // ── Hero variants ───────────────────────────────────────────────

  hero_section: {
    component: HeroStatic,
    mapProps: ({ data, t }) => ({
      title: t(data.title),
      description: t(data.description),
      labelText: t(data.pill_text),
      labelWithBg: false,
      logoSquare: false,
      ctaText: t(data.button_text),
      ctaLink: data.button_link,
      bgImageDesktop: data.background_image,
      theme: data.theme || 'dark',
      className: data.custom_class || '',
      note: null,
    }),
  },

  sliders_hero: {
    component: HeroSliders,
    mapProps: ({ styleProps }) => ({ name: 'home', ...styleProps }),
  },

  // ── About / USP ─────────────────────────────────────────────────

  usp_grid: {
    component: AboutWithUSP,
    mapProps: ({ styleProps }) => ({
      name: 'home',
      gridColsDesktop: 4,
      gridColsMobile: 1,
      ...styleProps,
    }),
  },

  usp_grid_slider: {
    component: AboutValues,
    mapProps: ({ styleProps }) => ({
      name: 'corporate-values',
      slidesPerViewDesktop: 4,
      slidesPerViewMobile: 1.4,
      ...styleProps,
    }),
  },

  about_with_marquee: {
    component: AboutWithRunningPhotos,
    mapProps: ({ styleProps }) => ({ name: 'career', ...styleProps }),
  },

  // ── Business / Tabs ─────────────────────────────────────────────

  business_tab: {
    component: TabBusiness,
    mapProps: ({ styleProps }) => ({ name: 'home', ...styleProps }),
  },

  tabs_with_card: {
    component: BusinessTab,
    mapProps: ({ styleProps }) => ({ name: 'services', ...styleProps }),
  },

  // ── Highlights / Features ───────────────────────────────────────

  key_highlight: {
    component: KeyHighlightWithImage,
    mapProps: ({ styleProps }) => ({ name: 'impact', ...styleProps }),
  },

  highlighting_real_initiatives: {
    component: HighlightingRealInitiatives,
    mapProps: ({ styleProps }) => ({ name: 'csr-programs', ...styleProps }),
  },

  // ── Contact / Info ──────────────────────────────────────────────

  info_contacts: {
    component: InfoContact,
    mapProps: ({ styleProps }) => ({ name: 'esg', ...styleProps }),
  },

  information_list: {
    component: InformationList,
    mapProps: ({ styleProps }) => ({ name: 'media', ...styleProps }),
  },

  contact_us: {
    component: ContactUs,
  },

  // ── Career ──────────────────────────────────────────────────────

  join_first_squad: {
    component: JoinFirstSquad,
    mapProps: ({ styleProps }) => ({ name: 'career', ...styleProps }),
  },

  career_highlight: {
    component: CareerSneakPeek,
  },

  career_list: {
    component: Career,
  },

  // ── News ────────────────────────────────────────────────────────

  news_highlight: {
    component: NewsFeatured,
  },

  news_list: {
    component: NewsTeaser,
    mapProps: ({ styleProps }) => ({ name: 'press-release', ...styleProps }),
  },

  // ── Management ──────────────────────────────────────────────────

  management_list: {
    component: Management,
  },

  // ── Reports ─────────────────────────────────────────────────────

  report_list: {
    component: ReportList,
    mapProps: ({ styleProps }) => ({
      name: 'financial-statement',
      showTypeFilter: true,
      showStatusFilter: true,
      showYearFilter: true,
      ...styleProps,
    }),
  },

  // ── Awards ──────────────────────────────────────────────────────

  awards_list: {
    component: AwardsFeed,
    mapProps: ({ styleProps }) => ({ name: 'awards-list', ...styleProps }),
  },

  awards_marquee: {
    component: AwardSneakPeek,
    mapProps: ({ styleProps }) => ({ name: 'default', ...styleProps }),
  },

  // ── Other sections ──────────────────────────────────────────────

  accordion: {
    component: FAQ,
  },

  vision_mission: {
    component: VisionMission,
  },

  maps_coverage: {
    component: MapsCoverage,
    mapProps: ({ styleProps }) => ({ name: 'home', ...styleProps }),
  },

  milestone: {
    component: Milestone,
    mapProps: ({ styleProps }) => ({ name: 'history', ...styleProps }),
  },

  product_showcase: {
    component: OneStream,
  },

  usp_strip: {
    component: USP,
  },

  closing_cta: {
    component: ClosingSentence,
  },

  video_section: {
    component: Tvc,
  },

  // ── Built-in generic sections ───────────────────────────────────

  text_block: {
    component: TextBlock,
    mapProps: ({ data, t }) => ({
      label: t(data?.label),
      title: t(data?.title),
      description: t(data?.description),
      className: data?.custom_class || '',
    }),
  },

  ckeditor: {
    component: CKEditorBlock,
    mapProps: ({ data, t }) => ({
      content: t(data?.content),
      className: data?.custom_class || '',
    }),
  },

  image: {
    component: ImageBlock,
    mapProps: ({ data }) => ({
      imageUrl: data?.image_url,
      altText: data?.alt_text || '',
      caption: data?.caption,
      alignment: data?.alignment,
      className: data?.custom_class || '',
    }),
  },

  document_list: {
    component: DocumentList,
    mapProps: ({ data, t }) => ({
      title: t(data?.title),
      documents: Array.isArray(data?.documents)
        ? data.documents.map((doc: any) => ({
            title: t(doc.title) || doc.filename,
            filename: doc.filename,
            url: doc.url,
          }))
        : [],
      className: data?.custom_class || '',
    }),
  },

  list_services: {
    component: GenericSection,
    mapProps: ({ data, t }) => ({
      title: t(data?.title),
      description: t(data?.description),
      className: data?.custom_class || '',
    }),
  },

  card_with_highlight_summary: {
    component: GenericSection,
    mapProps: ({ data, t }) => ({
      title: t(data?.title),
      description: t(data?.description),
      className: data?.custom_class || '',
    }),
  },

  announcement_list: {
    component: AnnouncementList,
    mapProps: ({ data, t }) => ({
      title: t(data?.title),
      className: data?.custom_class || '',
    }),
  },

  tradingview_symbol_overview: {
    component: TradingViewWidget,
    mapProps: ({ data, t }) => ({
      title: t(data?.title),
      className: data?.custom_class || '',
    }),
  },
};

// ─── Registry helpers ────────────────────────────────────────────────

/** Check if a CMS component type has a registered renderer */
export function isRegistered(type: string): boolean {
  return type in COMPONENT_MAP;
}

/** Get all registered component type names */
export function getRegisteredTypes(): string[] {
  return Object.keys(COMPONENT_MAP);
}

/** Get the registry entry for a component type (or undefined) */
export function getEntry(type: string): ComponentMapEntry | undefined {
  return COMPONENT_MAP[type];
}
