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
    mapProps: ({ data, t, styleProps }) => ({
      cmsSlides: Array.isArray(data.slides) 
        ? data.slides.map((slide: any) => ({
            image: slide.image || '',
            image_mobile: slide.image_mobile || '',
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        uspVariant: data.usp_variant || 'card',
        bgColor: data.bg_color || '',
        isSlider: data.is_slider !== undefined ? data.is_slider : false,
        bgImage: data.bg_image || '',
        bgImageMobile: data.bg_image_mobile || '',
        bgPositionClasses: 'bg-right-top md:bg-right',
        bgSizeClass: 'bg-cover',
        introData: data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          description: t(data.intro.description),
          align: data.intro.align || 'left',
        } : undefined,
        uspList: Array.isArray(data.items)
          ? data.items.map((item: any) => ({
              iconURL: item.icon || '',
              title: t(item.title),
              description: t(item.description),
            }))
          : [],
        ctaList: Array.isArray(data.cta_list)
          ? data.cta_list.map((cta: any) => ({
              text: t(cta.text),
              variant: cta.variant || 'primary',
              size: cta.size || 'lg',
              href: cta.href || '#',
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  usp_grid_slider: {
    component: AboutValues,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          description: t(data.intro.description),
          align: data.intro.align || 'left',
        } : undefined,
        valuesList: Array.isArray(data.items)
          ? data.items.map((item: any, idx: number) => ({
              id: `value-${idx}`,
              logo: item.icon || '',
              title: t(item.title),
              bodyTitle: t(item.description),
              list: Array.isArray(item.list)
                ? item.list.map((li: any) => ({ icon: li.icon || '', text: t(li.text) }))
                : [],
            }))
          : [],
      },
      slidesPerViewDesktop: data.slides_per_view || 4,
      slidesPerViewMobile: 1.4,
      ...styleProps,
    }),
  },

  about_with_marquee: {
    component: AboutWithRunningPhotos,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
          as: 'h2',
          label: t(data.intro?.label),
          title: t(data.intro?.title),
          description: t(data.intro?.description),
          align: data.intro?.align || 'left',
        },
        photos: Array.isArray(data.photos)
          ? data.photos.map((p: any) => (typeof p === 'string' ? p : p.url || ''))
          : [],
      },
      ...styleProps,
    }),
  },

  // ── Business / Tabs ─────────────────────────────────────────────

  business_tab: {
    component: TabBusiness,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          description: t(data.intro.description),
          align: data.intro.align || 'left',
        } : undefined,
        items: Array.isArray(data.tabs)
          ? data.tabs.map((tab: any, idx: number) => ({
              id: `tab-${idx}`,
              label: t(tab.name),
              tagline: '',
              title: t(tab.title),
              desc: t(tab.description),
              image: tab.background_image || '',
              logoSrc: tab.logo_image || '',
              textCTA: t(tab.cta_text),
              href: tab.cta_link || '#',
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  tabs_with_card: {
    component: BusinessTab,
    mapProps: ({ data, t, styleProps }) => ({
      introData: data.intro ? {
        as: 'h2',
        label: t(data.intro.label),
        title: t(data.intro.title),
        description: t(data.intro.description),
        align: data.intro.align || 'left',
      } : { as: 'h2', title: t(data.title), align: 'left' },
      items: Array.isArray(data.tabs)
        ? data.tabs.map((tab: any) => {
            const panelData = data.tab_panels?.[tab.key];
            return {
              id: tab.key,
              label: t(tab.label),
              tagline: '',
              title: t(tab.label),
              desc: '',
              image: panelData?.cards?.[0]?.image || '',
              logoSrc: '',
              textCTA: '',
              href: '#',
              cards: Array.isArray(panelData?.cards)
                ? panelData.cards.map((card: any) => ({
                    title: t(card.title),
                    description: t(card.description),
                    image: card.image || '',
                    link: card.link || '#',
                  }))
                : [],
            };
          })
        : [],
      ...styleProps,
    }),
  },

  // ── Highlights / Features ───────────────────────────────────────

  key_highlight: {
    component: KeyHighlightWithImage,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          description: t(data.intro.description),
          align: data.intro.align || 'left',
        } : undefined,
        items: Array.isArray(data.slides)
          ? data.slides.map((slide: any, idx: number) => ({
              id: `highlight-${idx}`,
              image: slide.image || '',
              value: slide.value || '',
              delta: slide.delta || '',
              caption: t(slide.caption),
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  highlighting_real_initiatives: {
    component: HighlightingRealInitiatives,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
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
              image: ini.image || '',
              title: t(ini.title),
              desc: t(ini.description),
              date: '',
              url: ini.link || '#',
            }))
          : [],
        partnerText: t(data.partner_text),
        partnerLogos: Array.isArray(data.community_logos)
          ? data.community_logos.map((logo: any) => (typeof logo === 'string' ? logo : logo.url || ''))
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
          as: 'h2',
          title: t(data.title),
          description: t(data.description),
          align: 'left',
        },
        items: Array.isArray(data.contact_items)
          ? data.contact_items.map((item: any) => ({
              icon: item.icon || '',
              label: t(item.label),
              value: item.value || '',
              href: item.url || '',
              target: item.target || '_blank',
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  information_list: {
    component: InformationList,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          description: t(data.intro.description),
          align: data.intro.align || 'left',
        } : undefined,
        items: Array.isArray(data.info_sections)
          ? data.info_sections.map((section: any, idx: number) => ({
              id: `info-${idx}`,
              title: t(section.title),
              contents: t(section.content),
              relatedArticles: Array.isArray(section.related_articles)
                ? section.related_articles.map((art: any) => ({
                    text: t(art.title),
                    url: art.url || '#',
                  }))
                : [],
              documents: Array.isArray(section.documents)
                ? section.documents.map((doc: any) => ({
                    title: t(doc.title),
                    date: doc.date || '',
                    icon: doc.file_type || 'pdf',
                    url: doc.url || '#',
                  }))
                : [],
            }))
          : [],
      },
      ...styleProps,
    }),
  },

  contact_us: {
    component: ContactUs,
  },

  // ── Career ──────────────────────────────────────────────────────

  join_first_squad: {
    component: JoinFirstSquad,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
          as: 'h2',
          label: '',
          title: t(data.title),
          align: 'left',
        },
        items: Array.isArray(data.slides)
          ? data.slides.map((slide: any, idx: number) => ({
              id: `squad-${idx}`,
              image: slide.image || '',
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
    component: NewsTeaser,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        category: data.category_id || null,
        categorySlug: data.category_slug || null,
        limit: data.max_data || 6,
        introData: {
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: data.items ? {
        label: t(data.label),
        title: t(data.title),
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: data.intro ? {
          as: 'h2',
          label: t(data.intro.label),
          title: t(data.intro.title),
          description: t(data.intro.description),
          align: data.intro.align || 'left',
        } : undefined,
        items: [
          ...(data.vision
            ? [{
                id: 'vision',
                label: 'VISION',
                title: t(data.vision.title),
                description: t(data.vision.description),
                image: data.vision.image || '',
                align: 'left' as const,
              }]
            : []),
          ...(Array.isArray(data.missions)
            ? data.missions.map((m: any, idx: number) => ({
                id: `mission-${idx}`,
                label: 'MISSION',
                title: t(m.title),
                description: t(m.description),
                image: m.image || '',
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        introData: {
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
              image: ms.image || '',
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
        product_image: data.product_image || '',
        logo_image: data.logo_image || '',
        usp_items: Array.isArray(data.usp_items)
          ? data.usp_items.map((item: any) => ({
              icon: item.icon || '',
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
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        text: t(data.title),
        description: t(data.description),
        cta_text: t(data.cta_text),
        cta_link: data.cta_link || '#',
        video_url: data.video_url || '',
        bg_image: data.bg_image || '',
      },
      ...styleProps,
    }),
  },

  video_section: {
    component: Tvc,
    mapProps: ({ data, t, styleProps }) => ({
      cmsData: {
        video_url: data.video_url || '',
        poster_image: data.poster_image || '',
        title: t(data.title),
        autoplay: data.autoplay || false,
      },
      ...styleProps,
    }),
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
