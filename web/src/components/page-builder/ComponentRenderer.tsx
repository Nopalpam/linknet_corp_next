/**
 * Component Renderer - Dispatch
 * 
 * Maps componentType to the appropriate React component for public rendering.
 * Uses a static registry for all 29 component types.
 */

import type { PageComponent } from '@/types';
import type { Locale } from '@/lib/i18n';

// Basic Components
import { TextBlockRenderer } from './renderers/TextBlockRenderer';
import { TextRenderer } from './renderers/TextRenderer';
import { StatsRenderer } from './renderers/StatsRenderer';
import { CKEditorRenderer } from './renderers/CKEditorRenderer';
import { ImageRenderer } from './renderers/ImageRenderer';
import { HeroSectionRenderer } from './renderers/HeroSectionRenderer';
import { SlidersHeroRenderer } from './renderers/SlidersHeroRenderer';
import { UspGridRenderer } from './renderers/UspGridRenderer';
import { UspGridSliderRenderer } from './renderers/UspGridSliderRenderer';
import { BusinessTabRenderer } from './renderers/BusinessTabRenderer';
import { TabsWithCardRenderer } from './renderers/TabsWithCardRenderer';
import { KeyHighlightRenderer } from './renderers/KeyHighlightRenderer';
import { AboutWithMarqueeRenderer } from './renderers/AboutWithMarqueeRenderer';
import { JoinFirstSquadRenderer } from './renderers/JoinFirstSquadRenderer';
import { ListServicesRenderer } from './renderers/ListServicesRenderer';
import { CardWithHighlightSummaryRenderer } from './renderers/CardWithHighlightSummaryRenderer';
import { HighlightingRealInitiativesRenderer } from './renderers/HighlightingRealInitiativesRenderer';
import { InfoContactsRenderer } from './renderers/InfoContactsRenderer';
import { InformationListRenderer } from './renderers/InformationListRenderer';
import { ContactUsRenderer } from './renderers/ContactUsRenderer';
import { DocumentListRenderer } from './renderers/DocumentListRenderer';
import { AccordionRenderer } from './renderers/AccordionRenderer';
import { TradingViewRenderer } from './renderers/TradingViewRenderer';

// Main (DB-driven) Components
import { NewsHighlightRenderer } from './renderers/NewsHighlightRenderer';
import { NewsListRenderer } from './renderers/NewsListRenderer';
import { CareerHighlightRenderer } from './renderers/CareerHighlightRenderer';
import { CareerListRenderer } from './renderers/CareerListRenderer';
import { ManagementListRenderer } from './renderers/ManagementListRenderer';
import { AnnouncementListRenderer } from './renderers/AnnouncementListRenderer';
import { ReportListRenderer } from './renderers/ReportListRenderer';
import { AwardsListRenderer } from './renderers/AwardsListRenderer';

// =============================================================================
// RENDERER MAP
// =============================================================================

const RENDERERS: Record<string, React.ComponentType<{ data: Record<string, any>; locale: Locale; mainData?: any }>> = {
  text_block: TextBlockRenderer,
  text: TextRenderer,
  stats: StatsRenderer,
  ckeditor: CKEditorRenderer,
  image: ImageRenderer,
  hero_section: HeroSectionRenderer,
  sliders_hero: SlidersHeroRenderer,
  usp_grid: UspGridRenderer,
  usp_grid_slider: UspGridSliderRenderer,
  business_tab: BusinessTabRenderer,
  tabs_with_card: TabsWithCardRenderer,
  key_highlight: KeyHighlightRenderer,
  about_with_marquee: AboutWithMarqueeRenderer,
  join_first_squad: JoinFirstSquadRenderer,
  list_services: ListServicesRenderer,
  card_with_highlight_summary: CardWithHighlightSummaryRenderer,
  highlighting_real_initiatives: HighlightingRealInitiativesRenderer,
  info_contacts: InfoContactsRenderer,
  information_list: InformationListRenderer,
  contact_us: ContactUsRenderer,
  document_list: DocumentListRenderer,
  accordion: AccordionRenderer,
  tradingview_symbol_overview: TradingViewRenderer,
  // Main
  news_highlight: NewsHighlightRenderer,
  news_list: NewsListRenderer,
  career_highlight: CareerHighlightRenderer,
  career_list: CareerListRenderer,
  management_list: ManagementListRenderer,
  announcement_list: AnnouncementListRenderer,
  report_list: ReportListRenderer,
  awards_list: AwardsListRenderer,
};

// =============================================================================
// COMPONENT RENDERER
// =============================================================================

interface ComponentRendererProps {
  component: PageComponent;
  locale: Locale;
}

export function ComponentRenderer({ component, locale }: ComponentRendererProps) {
  const Renderer = RENDERERS[component.componentType];

  if (!Renderer) {
    // Unknown component type — render nothing in production, debug info in dev
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="py-4 px-6 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm rounded-lg my-2">
          Unknown component: <strong>{component.componentType}</strong>
        </div>
      );
    }
    return null;
  }

  const data = component.componentData || {};

  // Build section wrapper styles from common fields
  const sectionStyle: React.CSSProperties = {};
  if (data.bg_type === 'color' && data.bg_color) {
    sectionStyle.backgroundColor = data.bg_color;
  }
  if (data.bg_type === 'image' && data.bg_image) {
    sectionStyle.backgroundImage = `url(${data.bg_image})`;
    sectionStyle.backgroundSize = 'cover';
    sectionStyle.backgroundPosition = data.bg_position || 'center';
  }

  return (
    <section
      id={data.custom_id || undefined}
      className={`page-component page-component--${component.componentType} ${data.custom_class || ''}`}
      style={sectionStyle}
    >
      <Renderer data={data} locale={locale} mainData={component.mainData} />
    </section>
  );
}
