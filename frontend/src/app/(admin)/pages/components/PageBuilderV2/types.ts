/**
 * PAGE BUILDER V2 - Type Definitions
 * 
 * All component types and their settings interfaces.
 */

// =============================================================================
// CORE COMPONENT TYPES
// =============================================================================

export interface PageComponent {
  id: string;
  type: string;
  order: number;
  settings: Record<string, any>;
  isVisible: boolean;
  schemaStatus?: {
    currentVersion: number;
    targetVersion: number;
    isOutdated: boolean;
    changed: boolean;
    operations: string[];
    errors: string[];
    warnings: string[];
  };
}

/**
 * All supported component types
 */
export type ComponentType =
  // Basic
  | 'text_block'
  | 'ckeditor'
  | 'image'
  | 'hero_section'
  | 'sliders_hero'
  | 'usp_grid'
  | 'usp_grid_slider'
  | 'business_tab'
  | 'key_highlight'
  | 'about_with_marquee'
  | 'join_first_squad'
  | 'list_services'
  | 'card_with_highlight_summary'
  | 'highlighting_real_initiatives'
  | 'info_contacts'
  | 'information_list'
  | 'contact_us'
  | 'document_list'
  | 'accordion'
  | 'tradingview_symbol_overview'
  // New components (from web design)
  | 'vision_mission'
  | 'maps_coverage'
  | 'milestone'
  | 'awards_marquee'
  | 'product_showcase'
  | 'usp_strip'
  | 'closing_cta'
  | 'video_section'
  | 'extendable_article'
  | 'stock_information'
  | 'testimonials'
  // Main (DB-driven)
  | 'news_highlight'
  | 'news_list'
  | 'career_highlight'
  | 'career_list'
  | 'management_list'
  | 'announcement_list'
  | 'report_list'
  | 'awards_list'
  | 'form_registration_enterprise'
  | 'form_registration_fiber'
  | 'form_registration_media'
  | 'coverage_check_fiber'
  | 'career_detail'
  | 'check_coverage'
  | 'content_highlights'
  | 'event_content'
  | 'event_detail'
  | 'event_hero'
  | 'event_registration_form'
  | 'event_related'
  | 'event_related_news'
  | 'events_list'
  | 'footer'
  | 'footer_fiber'
  | 'footer_main'
  | 'footer_media'
  | 'form_registration'
  | 'form_registration_incomplete'
  | 'form_registration_success'
  | 'hero_sliders_tv_highlight'
  | 'hospitality'
  | 'layout_chrome'
  | 'list_report_home'
  | 'logo_running'
  | 'logo_running_with_border'
  | 'maps_coverage_v1'
  | 'navbar'
  | 'navbar_fiber'
  | 'navbar_media'
  | 'navbar_newsroom'
  | 'news_detail'
  | 'news_feed'
  | 'news_related'
  | 'news_teaser'
  | 'omni_channel_widget'
  | 'one_stream_plus'
  | 'package_list'
  | 'report_grid'
  | 'report_list_part'
  | 'solutions_list'
  | 'solution_services_home'
  | 'solutions_filtered'
  | 'solutions_services_with_background'
  | 'tv_channel_list'
  | 'tv_channel_sneak_peek'
  | 'tv_highlight_sliders'
  | 'tv_highlight_sneek_peak'
  // Legacy
  | 'hero'
  | 'pricing';

export type ComponentSettings = Record<string, any>;

// Legacy defaults kept for backward compat
export interface HeroSettings {
  title: string;
  subtitle: string;
  backgroundImage: string;
  alignment: 'left' | 'center' | 'right';
  buttonText?: string;
  buttonLink?: string;
  showButton?: boolean;
  ctaList?: Record<string, any>[];
}

export const DEFAULT_HERO_SETTINGS: HeroSettings = {
  title: 'Welcome to Our Website',
  subtitle: 'Build amazing experiences with our platform',
  backgroundImage: '',
  alignment: 'center',
  buttonText: 'Get Started',
  buttonLink: '#',
  showButton: true,
  ctaList: [],
};

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isFeatured: boolean;
}

export interface PricingSettings {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
}

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  title: 'Choose Your Plan',
  subtitle: 'Select the perfect plan for your needs',
  plans: [],
};

// =============================================================================
// PAGE STATE
// =============================================================================

export interface PageState {
  pageId: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  components: PageComponent[];
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
}

// =============================================================================
// REGISTRY TYPES
// =============================================================================

export interface ComponentRegistryEntry {
  type: string;
  name: string;
  componentPath?: string;
  description: string;
  icon: string;
  category: string;
  schemaVersion?: number;
  fields?: any[];
  metadata?: Record<string, any>;
  defaultData: Record<string, any>;
}

// =============================================================================
// ACTION TYPES
// =============================================================================

export type PageBuilderAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; components: PageComponent[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ADD_COMPONENT'; componentType: string; index?: number; defaultData?: Record<string, any> }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'UPDATE_COMPONENT'; componentId: string; settings: ComponentSettings }
  | { type: 'MOVE_COMPONENT'; componentId: string; newIndex: number }
  | { type: 'TOGGLE_VISIBILITY'; componentId: string }
  | { type: 'SELECT_COMPONENT'; componentId: string | null }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS' }
  | { type: 'SAVE_ERROR'; error: string }
  | { type: 'CLEAR_ERROR' };

// =============================================================================
// DRAG & DROP TYPES
// =============================================================================

export interface DragItem {
  type: 'NEW_COMPONENT' | 'EXISTING_COMPONENT';
  componentType?: string;
  componentId?: string;
}

export const DRAG_TYPE = 'PAGE_BUILDER_COMPONENT';

// =============================================================================
// MULTILINGUAL HELPER
// =============================================================================

export interface MultilingualValue {
  en: string;
  id: string;
}

export function isMultilingual(value: any): value is MultilingualValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && ('en' in value || 'id' in value);
}

export function getLocalizedValue(value: any, locale: string = 'en'): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (isMultilingual(value)) {
    return value[locale as keyof MultilingualValue] || value.en || '';
  }
  return String(value);
}
