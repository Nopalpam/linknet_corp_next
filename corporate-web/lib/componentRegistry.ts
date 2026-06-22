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
  mainData?: Record<string, any> | null;
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
  HERO: 'hero',
  CAREER_DETAIL: 'career_detail',
  CHECK_COVERAGE: 'check_coverage',
  CONTENT_HIGHLIGHTS: 'content_highlights',
  EVENT_CONTENT: 'event_content',
  EVENT_DETAIL: 'event_detail',
  EVENT_HERO: 'event_hero',
  EVENT_REGISTRATION_FORM: 'event_registration_form',
  EVENT_RELATED: 'event_related',
  EVENT_RELATED_NEWS: 'event_related_news',
  EVENTS_LIST: 'events_list',
  FOOTER: 'footer',
  FOOTER_FIBER: 'footer_fiber',
  FOOTER_MAIN: 'footer_main',
  FOOTER_MEDIA: 'footer_media',
  FORM_REGISTRATION: 'form_registration',
  FORM_REGISTRATION_INCOMPLETE: 'form_registration_incomplete',
  FORM_REGISTRATION_SUCCESS: 'form_registration_success',
  HERO_SLIDERS_TV_HIGHLIGHT: 'hero_sliders_tv_highlight',
  HOSPITALITY: 'hospitality',
  LAYOUT_CHROME: 'layout_chrome',
  LIST_REPORT_HOME: 'list_report_home',
  LOGO_RUNNING: 'logo_running',
  LOGO_RUNNING_WITH_BORDER: 'logo_running_with_border',
  MAPS_COVERAGE_V1: 'maps_coverage_v1',
  NAVBAR: 'navbar',
  NAVBAR_FIBER: 'navbar_fiber',
  NAVBAR_MEDIA: 'navbar_media',
  NAVBAR_NEWSROOM: 'navbar_newsroom',
  NEWS_DETAIL: 'news_detail',
  NEWS_FEED: 'news_feed',
  NEWS_RELATED: 'news_related',
  NEWS_TEASER: 'news_teaser',
  OMNI_CHANNEL_WIDGET: 'omni_channel_widget',
  ONE_STREAM_PLUS: 'one_stream_plus',
  PACKAGE_LIST: 'package_list',
  REPORT_GRID: 'report_grid',
  REPORT_LIST_PART: 'report_list_part',
  SOLUTION_SERVICES_HOME: 'solution_services_home',
  SOLUTIONS_FILTERED: 'solutions_filtered',
  SOLUTIONS_SERVICES_WITH_BACKGROUND: 'solutions_services_with_background',
  TV_CHANNEL_LIST: 'tv_channel_list',
  TV_CHANNEL_SNEAK_PEEK: 'tv_channel_sneak_peek',
  TV_HIGHLIGHT_SLIDERS: 'tv_highlight_sliders',
  TV_HIGHLIGHT_SNEEK_PEAK: 'tv_highlight_sneek_peak',
} as const;

export type CMSComponentType = typeof CMS_COMPONENT_TYPES[keyof typeof CMS_COMPONENT_TYPES];
