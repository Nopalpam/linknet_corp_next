/**
 * Component Registry for Public Website
 * 
 * Maps CMS Page Builder component types to their React component implementations.
 * This file is the bridge between the CMS (backend/frontend) and the public website (web).
 * 
 * When a page is fetched from CMS API, each component has a `type` field (e.g., 'hero_section').
 * This registry maps those types to the actual React components that render them.
 */

export interface CMSComponent {
  id: string;
  type: string;
  order: number;
  data: Record<string, any>;
  isVisible: boolean;
}

/**
 * All supported CMS component type identifiers.
 * Must match the types defined in:
 * - backend/src/constants/componentDefaults.ts
 * - frontend/src/app/(admin)/pages/components/PageBuilderV2/registry.ts
 */
export const CMS_COMPONENT_TYPES = {
  // Basic (data from component_data JSON)
  TEXT_BLOCK: 'text_block',
  CKEDITOR: 'ckeditor',
  IMAGE: 'image',
  HERO_SECTION: 'hero_section',
  SLIDERS_HERO: 'sliders_hero',
  USP_GRID: 'usp_grid',
  USP_GRID_SLIDER: 'usp_grid_slider',
  BUSINESS_TAB: 'business_tab',
  TABS_WITH_CARD: 'tabs_with_card',
  KEY_HIGHLIGHT: 'key_highlight',
  ABOUT_WITH_MARQUEE: 'about_with_marquee',
  JOIN_FIRST_SQUAD: 'join_first_squad',
  LIST_SERVICES: 'list_services',
  CARD_WITH_HIGHLIGHT_SUMMARY: 'card_with_highlight_summary',
  HIGHLIGHTING_REAL_INITIATIVES: 'highlighting_real_initiatives',
  INFO_CONTACTS: 'info_contacts',
  INFORMATION_LIST: 'information_list',
  CONTACT_US: 'contact_us',
  DOCUMENT_LIST: 'document_list',
  ACCORDION: 'accordion',
  TRADINGVIEW_SYMBOL_OVERVIEW: 'tradingview_symbol_overview',
  // Main (DB-driven)
  NEWS_HIGHLIGHT: 'news_highlight',
  NEWS_LIST: 'news_list',
  CAREER_HIGHLIGHT: 'career_highlight',
  CAREER_LIST: 'career_list',
  MANAGEMENT_LIST: 'management_list',
  ANNOUNCEMENT_LIST: 'announcement_list',
  REPORT_LIST: 'report_list',
  AWARDS_LIST: 'awards_list',
  // New types (from web_static_reference)
  VISION_MISSION: 'vision_mission',
  MAPS_COVERAGE: 'maps_coverage',
  MILESTONE: 'milestone',
  AWARDS_MARQUEE: 'awards_marquee',
  PRODUCT_SHOWCASE: 'product_showcase',
  USP_STRIP: 'usp_strip',
  CLOSING_CTA: 'closing_cta',
  VIDEO_SECTION: 'video_section',
  EXTENDABLE_ARTICLE: 'extendable_article',
  STOCK_INFORMATION: 'stock_information',
  TESTIMONIALS: 'testimonials',
  FORM_REGISTRATION_ENTERPRISE: 'form_registration_enterprise',
  FORM_REGISTRATION_FIBER: 'form_registration_fiber',
  FORM_REGISTRATION_MEDIA: 'form_registration_media',
  COVERAGE_CHECK_FIBER: 'coverage_check_fiber',
} as const;

export type CMSComponentType = typeof CMS_COMPONENT_TYPES[keyof typeof CMS_COMPONENT_TYPES];
