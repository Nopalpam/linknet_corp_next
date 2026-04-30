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
import {
  mapDocumentListPresentation,
  mapInfoContactsPresentation,
  mapInformationListPresentation,
} from '../../shared/presentation/content';
import {
  mapBusinessTabPresentation,
  mapUspGridPresentation,
} from '../../shared/presentation/sections';
import {
  mapCardsWithSummaryPresentation,
  mapListServicesPresentation,
} from '../../shared/presentation/solutions';

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
    if (typeof field === 'object') {
      return field[lang] || field['id'] || field['en'] || '';
    }
    return String(field);
  };
}

/**
 * Extract localized text from item-level fields.
 * Handles both formats:
 *   Format A (flat): title="English", title_id="Indonesian"
 *   Format B (object): title={en:"English", id:"Indonesian"}
 */
function localizeField(
  item: Record<string, any>,
  field: string,
  t: (f: any) => string,
  locale: string
): string {
  const value = item[field];
  // If it's a multilingual object {en, id}, use t()
  if (value && typeof value === 'object') return t(value);
  // If it's a string, check for _id suffix field for Indonesian
  if (typeof value === 'string') {
    if (locale === 'id') {
      const idValue = item[`${field}_id`];
      if (idValue && typeof idValue === 'string') return idValue;
    }
    return value;
  }
  return t(value);
}

/**
 * Extract intro data from CMS component data.
 * Handles both nested (data.intro.title) and flat (data.intro_title) formats.
 */
function extractIntro(
  data: Record<string, any>,
  t: (f: any) => string,
  locale: string
): Record<string, any> | undefined {
  const introSource = data.sectionIntro || data.intro;
  const hasIntroContent = Boolean(
    t(introSource?.label) ||
    t(introSource?.title) ||
    t(introSource?.description)
  );

  if (introSource && typeof introSource === 'object' && hasIntroContent) {
    return {
      as: introSource.as || 'h2',
      label: t(introSource.label),
      title: t(introSource.title),
      description: t(introSource.description),
      align: introSource.align || 'left',
      fluid: Boolean(introSource.fluid),
      labelClassName: introSource.labelClassName || '',
      titleClassName: introSource.titleClassName || '',
      descriptionClassName: introSource.descriptionClassName || '',
      className: introSource.className || '',
    };
  }

  // Format B: nested intro object
  if (data.intro) {
    return {
      as: 'h2',
      label: t(data.intro.label),
      title: t(data.intro.title),
      description: t(data.intro.description),
      align: data.intro.align || 'left',
    };
  }
  // Format A: flat intro_title, intro_label, intro_description
  const hasIntro = data.intro_title || data.intro_label || data.intro_description;
  if (hasIntro) {
    return {
      as: 'h2',
      label: localizeField(data, 'intro_label', t, locale),
      title: localizeField(data, 'intro_title', t, locale),
      description: localizeField(data, 'intro_description', t, locale),
      align: data.intro_align || 'left',
    };
  }
  return undefined;
}

function backgroundPositionToClasses(position: string | undefined): string {
  const normalizedPosition = position || 'center';

  if (normalizedPosition.includes('bg-')) {
    return normalizedPosition;
  }

  const className = `bg-${normalizedPosition}`;
  return `${className} md:${className}`;
}

export function normalizeComponentData(data: Record<string, any> | undefined): Record<string, any> {
  const source = data || {};
  const config = source.config && typeof source.config === 'object' ? source.config : {};

  return {
    ...source,
    custom_id: source.custom_id ?? config.sectionId ?? '',
    custom_class: source.custom_class ?? config.className ?? '',
    bg_image: source.bg_image ?? config.bgImage ?? '',
    bg_image_mobile: source.bg_image_mobile ?? config.bgImageMobile ?? '',
    bg_position_classes: source.bg_position_classes ?? config.bgPositionClasses ?? '',
    bg_size_class: source.bg_size_class ?? config.bgSizeClass ?? '',
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
const NewsList = dynamic(() => import('@/components/main/NewsList'));
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
const ExtendableArticle = dynamic(() => import('@/components/main/ExtendableArticle'));
const StockInformation = dynamic(() => import('@/components/main/StockInformation'));
const Testimonials = dynamic(() => import('@/components/main/Testimonials'));

const AnnouncementListCMS = dynamic(() => import('@/components/main/AnnouncementList'));
const FormRegistrationEnterprise = dynamic(() => import('@/components/main/FormRegistrationEnterprise'));
const FormRegistrationFiber = dynamic(() => import('@/components/main/FormRegistrationFiber'));
const FormRegistrationMedia = dynamic(() => import('@/components/main/FormRegistrationMedia'));
const CoverageCheckFiber = dynamic(() => import('@/components/main/CoverageCheckFiber'));
const CareerDetail = dynamic(() => import('@/components/main/CareerDetail'));
const CheckCoverage = dynamic(() => import('@/components/main/CheckCoverage'));
const ContentHighlights = dynamic(() => import('@/components/main/ContentHighlights'));
const EventContent = dynamic(() => import('@/components/main/EventContent'));
const EventDetail = dynamic(() => import('@/components/main/EventDetail'));
const EventHero = dynamic(() => import('@/components/main/EventHero'));
const EventRegistrationForm = dynamic(() => import('@/components/main/EventRegistrationForm'));
const EventRelated = dynamic(() => import('@/components/main/EventRelated'));
const EventRelatedNews = dynamic(() => import('@/components/main/EventRelatedNews'));
const EventsList = dynamic(() => import('@/components/main/EventsList'));
const Footer = dynamic(() => import('@/components/main/Footer'));
const FooterFiber = dynamic(() => import('@/components/main/FooterFiber'));
const FooterMain = dynamic(() => import('@/components/main/FooterMain'));
const FooterMedia = dynamic(() => import('@/components/main/FooterMedia'));
const FormRegistration = dynamic(() => import('@/components/main/FormRegistration'));
const FormRegistrationIncomplete = dynamic(() => import('@/components/main/FormRegistrationIncomplete'));
const FormRegistrationSuccess = dynamic(() => import('@/components/main/FormRegistrationSuccess'));
const HeroSlidersTVHighlight = dynamic(() => import('@/components/main/HeroSlidersTVHighlight'));
const Hospitality = dynamic(() => import('@/components/main/Hospitality'));
const LayoutChrome = dynamic(() => import('@/components/main/LayoutChrome'));
const ListReportHome = dynamic(() => import('@/components/main/ListReportHome'));
const LogoRunning = dynamic(() => import('@/components/main/LogoRunning'));
const LogoRunningWithBorder = dynamic(() => import('@/components/main/LogoRunningWithBorder'));
const MapsCoverageV1 = dynamic(() => import('@/components/main/MapsCoverage-v1'));
const Navbar = dynamic(() => import('@/components/main/Navbar'));
const NavbarFiber = dynamic(() => import('@/components/main/NavbarFiber'));
const NavbarMedia = dynamic(() => import('@/components/main/NavbarMedia'));
const NavbarNewsroom = dynamic(() => import('@/components/main/NavbarNewsroom'));
const NewsDetail = dynamic(() => import('@/components/main/NewsDetail'));
const NewsFeed = dynamic(() => import('@/components/main/NewsFeed'));
const NewsRelated = dynamic(() => import('@/components/main/NewsRelated'));
const OmniChannelWidget = dynamic(() => import('@/components/main/OmniChannelWidget'));
const OneStreamPlus = dynamic(() => import('@/components/main/OneStreamPlus'));
const PackageList = dynamic(() => import('@/components/main/PackageList'));
const ReportGrid = dynamic(() => import('@/components/main/ReportGrid'));
const ReportListPart = dynamic(() => import('@/components/main/ReportListPart'));
const SolutionServicesHome = dynamic(() => import('@/components/main/SolutionServicesHome'));
const SolutionsFiltered = dynamic(() => import('@/components/main/SolutionsFiltered'));
const SolutionsServicesWithBackground = dynamic(() => import('@/components/main/SolutionsServicesWithBackground'));
const TVChannelList = dynamic(() => import('@/components/main/TVChannelList'));
const TVChannelSneakPeek = dynamic(() => import('@/components/main/TVChannelSneakPeek'));
const TVHighlightSliders = dynamic(() => import('@/components/main/TVHighlightSliders'));
const TVHighlightSneekPeak = dynamic(() => import('@/components/main/TVHighlightSneekPeak'));

// Built-in generic section components (no separate file needed per type)
import {
  TextBlock,
  CKEditorBlock,
  ImageBlock,
  DocumentList,
  GenericSection,
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
    mapProps: ({ data, t, locale }) => ({
      title: localizeField(data, 'title', t, locale),
      description: localizeField(data, 'description', t, locale),
      labelText: t(data.pill_text),
      labelWithBg: false,
      logoSquare: data.minilogo_visible === 'true' || data.minilogo_visible === true,
      logoSrc: data.minilogo_image || undefined,
      ctaText: localizeField(data, 'button_text', t, locale),
      ctaLink: data.button_link,
      bgImageDesktop: data.background_image || undefined,
      bgImageMobile: data.background_image_mobile || undefined,
      heroSize: data.size_hero === 'lnHero__small' ? 'sm' : 'md',
      theme: data.theme || 'dark',
      bgOverlay: data.gradient_visible === 'true' || data.gradient_visible === true,
      className: data.custom_class || '',
      note: null,
    }),
  },

  sliders_hero: {
    component: HeroSliders,
    mapProps: ({ data, t, styleProps }) => ({
      cmsSlides: Array.isArray(data.slides) 
        ? data.slides.map((slide: any) => ({
            image: slide.image || undefined,
            image_mobile: slide.image_mobile || undefined,
            title: t(slide.title),
            description: t(slide.description),
            button_text: t(slide.button_text),
            button_link: slide.button_link || '#',
            pill_text: t(slide.pill_text),
            indicator_label: t(slide.indicator_label),
            theme: slide.theme || data.theme || 'dark',
          }))
        : null,
      autoplay: data.autoplay !== false,
      autoplaySpeed: data.autoplay_speed || null,
      theme: data.theme || 'dark',
      ...styleProps,
    }),
  },

  // ── About / USP ─────────────────────────────────────────────────

  usp_grid: {
    component: AboutWithUSP,
    mapProps: ({ data, t, styleProps, locale }) => {
      const presentation = mapUspGridPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
        introData: extractIntro(data, t, locale),
      });

      return {
        cmsData: {
          uspVariant: presentation.uspVariant,
          bgColor: presentation.bgColor,
          isSlider: presentation.isSlider,
          bgImage: presentation.bgImage,
          bgImageMobile: presentation.bgImageMobile,
          bgPositionClasses: presentation.bgPositionClasses,
          bgSizeClass: presentation.bgSizeClass,
          introData: presentation.introData,
          uspList: presentation.uspList,
          ctaList: presentation.ctaList,
        },
        slidesPerViewDesktop: presentation.slidesPerViewDesktop,
        slidesPerViewMobile: presentation.slidesPerViewMobile,
        gridColsDesktop: presentation.gridColsDesktop,
        gridColsMobile: presentation.gridColsMobile,
        ...styleProps,
      };
    },
  },

  usp_grid_slider: {
    component: AboutValues,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale),
        valuesList: Array.isArray(data.items)
          ? data.items.map((item: any, idx: number) => ({
              id: `value-${idx}`,
              logo: item.logo || (typeof item.icon === 'string' && item.icon.startsWith('/') ? item.icon : undefined),
              title: localizeField(item, 'title', t, locale),
              desc: localizeField(item, 'desc', t, locale),
              bodyTitle: localizeField(item, 'bodyTitle', t, locale) || localizeField(item, 'description', t, locale),
              iconListDefault: item.iconListDefault || undefined,
              list: Array.isArray(item.list)
                ? item.list.map((li: any) => ({ icon: li.icon || item.iconListDefault || undefined, text: t(li.text) }))
                : [],
            }))
          : [],
      },
      slidesPerViewDesktop: data.slides_per_view_desktop ?? data.slides_per_view ?? 4,
      slidesPerViewMobile: data.slides_per_view_mobile ?? 1.4,
      ...styleProps,
    }),
  },

  about_with_marquee: {
    component: AboutWithRunningPhotos,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: t(data.intro?.label),
          title: t(data.intro?.title),
          description: t(data.intro?.description),
          align: data.intro?.align || 'left',
        },
        photos: Array.isArray(data.photos)
          ? data.photos.map((p: any) => (typeof p === 'string' ? p : p.url || undefined)).filter(Boolean)
          : [],
      },
      ...styleProps,
    }),
  },

  // ── Business / Tabs ─────────────────────────────────────────────

  business_tab: {
    component: TabBusiness,
    mapProps: ({ data, t, styleProps, locale }) => {
      const presentation = mapBusinessTabPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
        introData: extractIntro(data, t, locale),
      });

      return {
        cmsData: {
          introData: presentation.introData,
          items: presentation.items,
        },
        ...styleProps,
      };
    },
  },

  tabs_with_card: {
    component: BusinessTab,
    mapProps: ({ data, t, styleProps, locale }) => ({
      introData: extractIntro(data, t, locale) || (data.title ? { as: 'h2', title: t(data.title), align: 'left' } : undefined),
      tabs: Array.isArray(data.tabs)
        ? data.tabs.map((tab: any, idx: number) => {
            const tabKey = tab.key || tab.id || `tab-${idx}`;
            // Support both formats: cards inside tab OR in tab_panels
            const rawCards = Array.isArray(tab.cards) ? tab.cards : (data.tab_panels?.[tabKey]?.cards || []);
            return {
              id: tabKey,
              label: localizeField(tab, 'label', t, locale),
              cards: rawCards.map((card: any, cIdx: number) => ({
                id: `${tabKey}-card-${cIdx}`,
                iconSrc: card.icon || undefined,
                title: localizeField(card, 'title', t, locale),
                description: localizeField(card, 'description', t, locale),
                ctaText: localizeField(card, 'button_text', t, locale),
                ctaLink: card.button_url || card.button_link || card.link || '#',
                image: card.image || undefined,
              })),
            };
          })
        : [],
      ...styleProps,
    }),
  },

  // ── Highlights / Features ───────────────────────────────────────

  key_highlight: {
    component: KeyHighlightWithImage,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale),
        items: Array.isArray(data.slides)
          ? data.slides.map((slide: any, idx: number) => ({
              id: `highlight-${idx}`,
              image: slide.image || undefined,
              value: t(slide.value),
              delta: t(slide.delta),
              caption: t(slide.caption),
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  highlighting_real_initiatives: {
    component: HighlightingRealInitiatives,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: t(data.title),
          description: t(data.description),
          align: 'left',
        },
        items: Array.isArray(data.initiatives)
          ? data.initiatives.map((ini: any, idx: number) => ({
              id: `initiative-${idx}`,
              topLogo: '',
              image: ini.image || undefined,
              title: t(ini.title),
              desc: t(ini.description),
              date: '',
              url: ini.link || '#',
            }))
          : [],
        partnerText: t(data.partner_text),
        partnerLogos: Array.isArray(data.community_logos)
          ? data.community_logos.map((logo: any) => (typeof logo === 'string' ? logo : logo.url || undefined))
          : [],
        ctaList: Array.isArray(data.cta_list)
          ? data.cta_list.map((cta: any) => ({
              text: t(cta.text),
              href: cta.href || '#',
              variant: cta.variant || 'primary',
              size: cta.size || 'lg',
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  // ── Contact / Info ──────────────────────────────────────────────

  info_contacts: {
    component: InfoContact,
    mapProps: ({ data, t, styleProps, locale }) => {
      const presentation = mapInfoContactsPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
        introData: extractIntro(data, t, locale),
      });

      return {
        cmsData: {
          introData: presentation.introData,
          items: presentation.items,
        },
        ...styleProps,
      };
    },
  },

  information_list: {
    component: InformationList,
    mapProps: ({ data, t, styleProps, locale }) => {
      const presentation = mapInformationListPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
        introData: extractIntro(data, t, locale),
      });

      return {
        cmsData: {
          introData: presentation.introData,
          items: presentation.items,
        },
        ...styleProps,
      };
    },
  },

  contact_us: {
    component: ContactUs,
  },

  // ── Career ──────────────────────────────────────────────────────

  join_first_squad: {
    component: JoinFirstSquad,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: t(data.title),
          align: 'left',
        },
        items: Array.isArray(data.slides)
          ? data.slides.map((slide: any, idx: number) => ({
              id: `squad-${idx}`,
              image: slide.image || undefined,
              roleLabel: '',
              roleTitle: t(slide.title),
              headline: '',
              desc: t(slide.description),
              ctaText: t(slide.cta_text),
              ctaUrl: slide.cta_link || '#',
            }))
          : [],
      },
      ...styleProps,
    }),
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
    component: NewsList,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: localizeField(data, 'intro_label', t, locale),
          title: t(data.title),
          description: localizeField(data, 'intro_text', t, locale),
          align: data.intro_align || 'left',
        },
        subDescription: localizeField(data, 'sub_description', t, locale),
        limit: data.max_data || 12,
        showPagination: data.show_pagination !== false,
        showSearch: data.show_search !== false,
        showCategoryFilter: data.show_category_filter !== false,
        searchPlaceholder: t(data.search_placeholder) || (locale === 'id' ? 'Cari berita...' : 'Search news...'),
        searchButtonText: t(data.search_button_text) || (locale === 'id' ? 'Cari' : 'Search'),
        category: data.category_id || null,
        ctaList: data.cta_text
          ? [{
              text: t(data.cta_text),
              href: data.cta_link || '#',
              variant: 'primary',
              size: 'lg',
            }]
          : [],
      },
      mainData: data.mainData || null,
      ...styleProps,
    }),
  },

  // ── Management ──────────────────────────────────────────────────

  management_list: {
    component: Management,
  },

  // ── Reports ─────────────────────────────────────────────────────

  report_list: {
    component: ReportList,
    mapProps: ({ data, styleProps }) => ({
      name: 'financial-statement',
      showTypeFilter: true,
      showStatusFilter: true,
      showYearFilter: true,
      mainData: data.mainData || null,
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
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: t(data.title),
          description: '',
          align: 'left',
        },
        ctaList: data.cta_text
          ? [{
              text: t(data.cta_text),
              href: data.cta_link || '#',
              variant: 'primary',
              size: 'lg',
            }]
          : [],
      },
      ...styleProps,
    }),
  },

  // ── Other sections ──────────────────────────────────────────────

  accordion: {
    component: FAQ,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: data.items ? {
        label: localizeField(data, 'label', t, locale) || localizeField(data, 'intro_label', t, locale),
        title: localizeField(data, 'title', t, locale) || localizeField(data, 'intro_title', t, locale),
        description: localizeField(data, 'description', t, locale) || localizeField(data, 'intro_description', t, locale),
        items: Array.isArray(data.items)
          ? data.items.map((item: any, idx: number) => ({
              id: `faq-${idx}`,
              question: t(item.title),
              answer: t(item.content),
            }))
          : [],
      } : null,
      ...styleProps,
    }),
  },

  vision_mission: {
    component: VisionMission,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale),
        items: [
          ...(data.vision
            ? [{
                id: 'vision',
                label: 'VISION',
                title: t(data.vision.title),
                description: t(data.vision.description),
                image: data.vision.image || undefined,
                align: 'left' as const,
              }]
            : []),
          ...(Array.isArray(data.missions)
            ? data.missions.map((m: any, idx: number) => ({
                id: `mission-${idx}`,
                label: 'MISSION',
                title: t(m.title),
                description: t(m.description),
                image: m.image || undefined,
                align: idx % 2 === 0 ? 'right' : 'left',
              }))
            : []),
        ],
      },
      className: data.custom_class || '',
      ...styleProps,
    }),
  },

  maps_coverage: {
    component: MapsCoverage,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: t(data.title),
          description: t(data.description),
          align: 'left',
        },
        widgetData: data.widget ? {
          instructionText: t(data.widget.instruction_text),
          statusCovered: t(data.widget.status_covered),
          statusNotCovered: t(data.widget.status_not_covered),
          title: t(data.widget.title),
          regionLabel: t(data.widget.region_label),
          searchPlaceholder: t(data.widget.search_placeholder),
          noCityFound: t(data.widget.no_city_found),
          ctaText: t(data.widget.cta_text),
          notCoveredMessage: t(data.widget.not_covered_message),
        } : undefined,
      },
      ...styleProps,
    }),
  },

  milestone: {
    component: Milestone,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: t(data.title),
          description: '',
          align: 'left',
        },
        items: Array.isArray(data.milestones)
          ? data.milestones.map((ms: any, idx: number) => ({
              id: `milestone-${idx}`,
              year: ms.year || '',
              image: ms.image || undefined,
              description: t(ms.description),
              list: Array.isArray(ms.list) ? ms.list.map((item: any) => t(item)) : [],
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  product_showcase: {
    component: OneStream,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        product_name: t(data.product_name),
        product_description: t(data.product_description),
        product_image: data.product_image || undefined,
        logo_image: data.logo_image || undefined,
        usp_items: Array.isArray(data.usp_items)
          ? data.usp_items.map((item: any) => ({
              icon: item.icon || undefined,
              title: t(item.title),
              desc: t(item.description),
            }))
          : null,
        cta_text: t(data.cta_text),
        cta_link: data.cta_link || '#',
      },
      ...styleProps,
    }),
  },

  usp_strip: {
    component: USP,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        items: Array.isArray(data.items)
          ? data.items.map((item: any) => ({
              title: t(item.text),
              desc: '',
            }))
          : null,
      },
      ...styleProps,
    }),
  },

  closing_cta: {
    component: ClosingSentence,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: {
          overline: localizeField(data, 'overline', t, locale),
          title: localizeField(data, 'title', t, locale),
          description: localizeField(data, 'description', t, locale),
        },
        ctaButtons: Array.isArray(data.cta_buttons)
          ? data.cta_buttons.map((cta: any) => ({
              text: t(cta.text),
              variant: cta.variant || 'secondary-outline',
              size: cta.size || 'lg',
              href: cta.href || data.cta_link || '#',
            }))
          : data.cta_text
            ? [{ text: t(data.cta_text), variant: 'secondary-outline', size: 'lg', href: data.cta_link || '#' }]
            : [],
      },
      ...styleProps,
    }),
  },

  video_section: {
    component: Tvc,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        video_url: data.video_url || '',
        poster_image: data.poster_image || undefined,
        title: t(data.title),
        autoplay: data.autoplay || false,
      },
      ...styleProps,
    }),
  },

  extendable_article: {
    component: ExtendableArticle,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        id: data.custom_id || 'extendable-article',
        introData: extractIntro(data, t, locale) || (data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          align: data.intro.align || 'center',
        } : undefined),
        content: t(data.content),
        buttonLabels: {
          expand: t(data.button_expand) || 'Read More',
          collapse: t(data.button_collapse) || 'Show Less',
        },
      },
      ...styleProps,
    }),
  },

  stock_information: {
    component: StockInformation,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        title: t(data.title),
        symbol: data.symbol || 'LINK.JK',
      },
      ...styleProps,
    }),
  },

  testimonials: {
    component: Testimonials,
    mapProps: ({ data, t, styleProps, locale }) => ({
      cmsData: {
        introData: extractIntro(data, t, locale),
        testimonialList: Array.isArray(data.testimonials)
          ? data.testimonials.map((item, idx) => ({
              id: `testimonial-${idx}`,
              image: item.image || undefined,
              companyLogo: item.companyLogo || item.company_logo || undefined,
              companyName: item.companyName || item.company_name || '',
              quote: t(item.quote),
              tags: Array.isArray(item.tags) ? item.tags : [],
              readMoreUrl: item.readMoreUrl || item.read_more_url || '#',
              name: item.name || '',
              role: item.role || '',
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  // ── Built-in generic sections ───────────────────────────────────

  text_block: {
    component: TextBlock,
    mapProps: ({ data, t, locale }) => ({
      label: localizeField(data, 'label', t, locale) || localizeField(data, 'intro_label', t, locale),
      title: localizeField(data, 'title', t, locale) || localizeField(data, 'intro_title', t, locale),
      description: localizeField(data, 'description', t, locale) || localizeField(data, 'intro_description', t, locale),
      className: data?.custom_class || '',
    }),
  },

  ckeditor: {
    component: CKEditorBlock,
    mapProps: ({ data, t, locale }) => ({
      content: localizeField(data, 'content', t, locale),
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
    mapProps: ({ data, t, locale }) => {
      const presentation = mapDocumentListPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
      });

      return {
        title: presentation.title,
        documents: presentation.documents,
        className: data?.custom_class || '',
      };
    },
  },

  list_services: {
    component: GenericSection,
    mapProps: ({ data, t, locale, styleProps }) => ({
      ...mapListServicesPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
        introData: extractIntro(data, t, locale),
      }),
      className: data?.custom_class || '',
      ...styleProps,
    }),
  },

  card_with_highlight_summary: {
    component: GenericSection,
    mapProps: ({ data, t, locale, styleProps }) => ({
      ...mapCardsWithSummaryPresentation(data, {
        resolveField: (item, field) => localizeField(item || {}, field, t, locale),
        introData: extractIntro(data, t, locale),
      }),
      className: data?.custom_class || '',
      ...styleProps,
    }),
  },

  announcement_list: {
    component: AnnouncementListCMS,
    mapProps: ({ data, t, locale }) => ({
      title: localizeField(data, 'title', t, locale) || localizeField(data, 'intro_title', t, locale),
      mainData: data.mainData || null,
      className: data?.custom_class || '',
    }),
  },

  tradingview_symbol_overview: {
    component: StockInformation,
    mapProps: ({ data, t, locale }) => ({
      cmsData: {
        symbol: data.symbol || 'IDX:LINK',
        title: localizeField(data, 'title', t, locale) || localizeField(data, 'intro_title', t, locale),
        interval: data.interval || '1D',
        widgetHeight: data.widget_height || 500,
        theme: data.theme || 'light',
        locale: data.locale || 'en',
        chartType: data.chart_type || 'area',
        lineType: data.line_type || '0',
        lineWidth: data.line_width || 2,
        hideDateRanges: data.hide_date_ranges || false,
        hideMarketStatus: data.hide_market_status || false,
        hideSymbolLogo: data.hide_symbol_logo || false,
      },
      className: data?.custom_class || '',
    }),
  },

  // ── Form Registration (Page Builder components) ──────────────────

  form_registration_enterprise: {
    component: FormRegistrationEnterprise,
    mapProps: ({ data, t, locale, styleProps }) => ({
      data: {
        title: localizeField(data, 'title', t, locale),
        description: localizeField(data, 'description', t, locale),
        event_name: data.event_name || '',
        event_promo: data.event_promo || '',
        event_page: data.event_page || '',
        max_participants: data.max_participants || 5,
      },
      ...styleProps,
    }),
  },

  form_registration_fiber: {
    component: FormRegistrationFiber,
    mapProps: ({ data, t, locale, styleProps }) => ({
      data: {
        title: localizeField(data, 'title', t, locale),
        description: localizeField(data, 'description', t, locale),
        event_name: data.event_name || '',
        event_promo: data.event_promo || '',
        event_page: data.event_page || '',
        max_participants: data.max_participants || 5,
      },
      ...styleProps,
    }),
  },

  form_registration_media: {
    component: FormRegistrationMedia,
    mapProps: ({ data, t, locale, styleProps }) => ({
      data: {
        title: localizeField(data, 'title', t, locale),
        description: localizeField(data, 'description', t, locale),
        event_name: data.event_name || '',
        event_promo: data.event_promo || '',
        event_page: data.event_page || '',
        max_participants: data.max_participants || 5,
      },
      ...styleProps,
    }),
  },

  coverage_check_fiber: {
    component: CoverageCheckFiber,
    mapProps: ({ data, t, locale, styleProps }) => {
      const config = data.config && typeof data.config === 'object' ? data.config : {};
      const introData = extractIntro(data, t, locale) || {
        as: 'h2',
        label: localizeField(data, 'intro_label', t, locale),
        title: localizeField(data, 'title', t, locale),
        description: localizeField(data, 'description', t, locale),
        align: data.intro_align || 'left',
      };

      return {
        cmsData: {
          config: {
            sectionId: config.sectionId || data.custom_id || '',
            className: config.className || data.custom_class || '',
            bgImage: config.bgImage || data.bg_image || '',
            bgImageMobile: config.bgImageMobile || data.bg_image_mobile || '',
            bgPositionClasses: config.bgPositionClasses || data.bg_position_classes || backgroundPositionToClasses(data.bg_position),
            bgSizeClass: config.bgSizeClass || data.bg_size_class || 'bg-cover',
          },
          introData,
          content: {
            title: localizeField(data, 'title', t, locale),
            description: localizeField(data, 'description', t, locale),
          },
        },
        data: {
        title: localizeField(data, 'title', t, locale),
        description: localizeField(data, 'description', t, locale),
        coverage_title: localizeField(data, 'coverage_title', t, locale),
        coverage_description: localizeField(data, 'coverage_description', t, locale),
        request_title: localizeField(data, 'request_title', t, locale),
        request_description: localizeField(data, 'request_description', t, locale),
        form_title: localizeField(data, 'form_title', t, locale),
        form_description: localizeField(data, 'form_description', t, locale),
        summary_title: localizeField(data, 'summary_title', t, locale),
        summary_description: localizeField(data, 'summary_description', t, locale),
        cms_title: localizeField(data, 'cms_title', t, locale),
        cms_description: localizeField(data, 'cms_description', t, locale),
        submit_label: localizeField(data, 'submit_label', t, locale),
        submitting_label: localizeField(data, 'submitting_label', t, locale),
        success_title: localizeField(data, 'success_title', t, locale),
        success_description: localizeField(data, 'success_description', t, locale),
        business_unit: data.business_unit || 'fiber',
        form_slug: data.form_slug || 'fiber-inquiry',
      },
      ...styleProps,
      };
    },
  },

  // Synced one-to-one registrations from web/components/main
  hero: { component: Hero },
  career_detail: {
    component: CareerDetail,
    mapProps: ({ data, styleProps }) => ({
      career: data.career || data.item || null,
      relatedCareers: data.relatedCareers || data.related_careers || [],
      ...styleProps,
    }),
  },
  check_coverage: { component: CheckCoverage },
  content_highlights: {
    component: ContentHighlights,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'home', ...styleProps }),
  },
  event_content: {
    component: EventContent,
    mapProps: ({ data }) => ({ event: data.event || data.item || null }),
  },
  event_detail: {
    component: EventDetail,
    mapProps: ({ data, locale }) => ({ event: data.event || data.item || null, locale }),
  },
  event_hero: { component: EventHero },
  event_registration_form: {
    component: EventRegistrationForm,
    mapProps: ({ data }) => ({ event: data.event || data.item || null }),
  },
  event_related: {
    component: EventRelated,
    mapProps: ({ data, styleProps }) => ({
      currentEvent: data.currentEvent || data.current_event || null,
      events: data.events || [],
      ...styleProps,
    }),
  },
  event_related_news: {
    component: EventRelatedNews,
    mapProps: ({ data, locale }) => ({ articles: data.articles || [], locale }),
  },
  events_list: {
    component: EventsList,
    mapProps: ({ data, locale }) => ({ events: data.events || data.mainData || [], locale }),
  },
  footer: { component: Footer },
  footer_fiber: { component: FooterFiber },
  footer_main: { component: FooterMain },
  footer_media: { component: FooterMedia },
  form_registration: { component: FormRegistration },
  form_registration_incomplete: { component: FormRegistrationIncomplete },
  form_registration_success: { component: FormRegistrationSuccess },
  hero_sliders_tv_highlight: { component: HeroSlidersTVHighlight },
  hospitality: { component: Hospitality },
  layout_chrome: { component: LayoutChrome },
  list_report_home: {
    component: ListReportHome,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'home', ...styleProps }),
  },
  logo_running: {
    component: LogoRunning,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'default', ...styleProps }),
  },
  logo_running_with_border: {
    component: LogoRunningWithBorder,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'default', ...styleProps }),
  },
  maps_coverage_v1: { component: MapsCoverageV1 },
  navbar: { component: Navbar },
  navbar_fiber: { component: NavbarFiber },
  navbar_media: { component: NavbarMedia },
  navbar_newsroom: { component: NavbarNewsroom },
  news_detail: {
    component: NewsDetail,
    mapProps: ({ data }) => ({ article: data.article || data.item || null }),
  },
  news_feed: {
    component: NewsFeed,
    mapProps: ({ data, styleProps }) => ({ categorySlug: data.categorySlug || data.category_slug || 'latest', ...styleProps }),
  },
  news_related: {
    component: NewsRelated,
    mapProps: ({ data, styleProps }) => ({ articles: data.articles || data.items || [], ...styleProps }),
  },
  news_teaser: { component: NewsTeaser },
  omni_channel_widget: {
    component: OmniChannelWidget,
    mapProps: ({ data, styleProps }) => ({ cmsData: data.cmsData || data, ...styleProps }),
  },
  one_stream_plus: { component: OneStreamPlus },
  package_list: {
    component: PackageList,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'enterprise', ...styleProps }),
  },
  report_grid: {
    component: ReportGrid,
    mapProps: ({ data, styleProps }) => ({ data: data.data || data.mainData || [], ...styleProps }),
  },
  report_list_part: {
    component: ReportListPart,
    mapProps: ({ data, styleProps }) => ({
      data: data.data || data.mainData || null,
      config: data.config || null,
      ...styleProps,
    }),
  },
  solution_services_home: {
    component: SolutionServicesHome,
    mapProps: ({ data, styleProps }) => ({
      name: data.name || 'home',
      hideTabs: data.hideTabs || data.hide_tabs || false,
      ...styleProps,
    }),
  },
  solutions_filtered: {
    component: SolutionsFiltered,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'enterprise', ...styleProps }),
  },
  solutions_services_with_background: { component: SolutionsServicesWithBackground },
  tv_channel_list: {
    component: TVChannelList,
    mapProps: ({ data, styleProps }) => ({ name: data.name || 'enterprise', ...styleProps }),
  },
  tv_channel_sneak_peek: { component: TVChannelSneakPeek },
  tv_highlight_sliders: { component: TVHighlightSliders },
  tv_highlight_sneek_peak: { component: TVHighlightSneekPeak },
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
