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
import { buildSharedIntroData } from '../../shared/presentation/intro';

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
  pageContext?: Record<string, any>;
}

// ─── Helper for localized text ──────────────────────────────────────

export function createLocalizer(locale: string) {
  const lang = (locale === 'id' || locale === 'en') ? locale : 'id';
  return (field: any): string => {
    if (field == null) return '';
    if (typeof field === 'string') return field.trim();
    if (typeof field === 'object') {
      const localized = field[lang] || field.id || field.en || field.label || field.title || field.name || '';
      return localized == null || typeof localized === 'object' ? '' : String(localized).trim();
    }
    return String(field).trim();
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
  if (value && typeof value === 'object') {
    const localizedValue = t(value);
    if (localizedValue || (field !== 'title' && field !== 'description')) {
      return localizedValue;
    }
  }

  const introSource = item?.introData || item?.sectionIntro || item?.intro;
  const shouldFallbackToIntro = (
    field === 'title' ||
    field === 'description'
  ) && (
    value == null ||
    (typeof value === 'string' && !value.trim())
  ) && introSource && typeof introSource === 'object' && !Array.isArray(introSource);

  if (shouldFallbackToIntro) {
    const introValue = introSource[field];
    if (introValue && typeof introValue === 'object') return t(introValue);
    if (typeof introValue === 'string') return introValue;
  }

  if (locale === 'id' && typeof item[`${field}_id`] === 'string' && item[`${field}_id`]) {
    return item[`${field}_id`];
  }

  if (locale === 'en' && typeof item[`${field}_en`] === 'string' && item[`${field}_en`]) {
    return item[`${field}_en`];
  }

  if (typeof value === 'string') {
    return value.trim();
  }

  if (value == null || typeof value === 'object') {
    return '';
  }

  return String(value).trim();
}

function extractIntro(
  data: Record<string, any>,
  t: (f: any) => string,
  locale: string
) {
  const explicitIntroKey = ['introData', 'sectionIntro', 'intro'].find((key) => (
    Object.prototype.hasOwnProperty.call(data || {}, key) &&
    data?.[key] !== undefined
  ));
  const introSource = explicitIntroKey ? data?.[explicitIntroKey] : undefined;

  if (explicitIntroKey) {
    const introRecord = introSource && typeof introSource === 'object' && !Array.isArray(introSource)
      ? introSource
      : {};

    return buildSharedIntroData(undefined, (item, field) => localizeField(item || {}, field, t, locale), introRecord);
  }

  const hasIntro = data?.intro_title || data?.intro_label || data?.intro_description;
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

function normalizeLinkType(data: Record<string, any>): string {
  if (data.cta_link_type || data.button_link_type || data.link_type || data.linkType) {
    return data.cta_link_type || data.button_link_type || data.link_type || data.linkType;
  }
  return data.cta_action || data.button_action || data.action || data.cta_action_modal || data.button_action_modal || data.action_modal || data.actionModal
    ? 'action-modal'
    : 'url';
}

function normalizeCtaItem(
  cta: Record<string, any>,
  t?: (f: any) => string,
  index = 0
): Record<string, any> {
  const labelSource = cta.label ?? cta.text ?? cta.button_text ?? cta.cta_text ?? '';
  const label = t ? t(labelSource) : labelSource;
  const href = cta.href ?? cta.url ?? cta.action ?? cta.cta_link ?? cta.button_link ?? '#';
  const linkType = cta.linkType || cta.link_type || (cta.action || cta.action_modal || cta.actionModal ? 'action-modal' : 'url');

  return {
    ...cta,
    id: cta.id || `cta-${index}`,
    label,
    text: label,
    href,
    action: cta.action || cta.actionModal || cta.action_modal || '',
    variant: cta.variant || 'primary',
    size: cta.size || 'lg',
    iconLeft: cta.iconLeft || cta.icon_left || '',
    iconRight: cta.iconRight || cta.icon_right || cta.icon || '',
    linkType,
    link_type: linkType,
    actionModal: cta.actionModal || cta.action_modal || cta.action || '',
    action_modal: cta.action_modal || cta.actionModal || cta.action || '',
    target: cta.target || '_self',
  };
}

function getRawCtaList(data: Record<string, any>): Record<string, any>[] {
  const ctaList = data.ctaList || data.cta_list || data.ctaButtons || data.cta_buttons || data.buttons;
  if (Array.isArray(ctaList)) return ctaList;

  const single = mapSingleCta(data, (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object') return field.id || field.en || field.label || '';
    return String(field);
  });

  return single ? [single] : [];
}

function mapSingleCta(
  data: Record<string, any>,
  t: (f: any) => string,
  textKeys: string[] = ['cta_label', 'button_label', 'label', 'cta_text', 'button_text', 'textCTA', 'ctaText'],
  linkKeys: string[] = ['cta_href', 'button_href', 'href', 'cta_link', 'button_link', 'button_url', 'cta_url', 'ctaLink', 'action']
): Record<string, any> | null {
  const textSource = textKeys.map((key) => data[key]).find((value) => t(value));
  const text = t(textSource);

  if (!text) return null;

  const href = linkKeys.map((key) => data[key]).find((value) => typeof value === 'string' && value) || '#';

  return {
    label: text,
    text,
    href,
    action: data.cta_action || data.button_action || data.action || data.cta_action_modal || data.button_action_modal || data.action_modal || data.actionModal || '',
    variant: data.cta_variant || data.button_variant || data.variant || 'primary',
    size: data.cta_size || data.button_size || data.size || 'lg',
    iconLeft: data.cta_icon_left || data.button_icon_left || data.iconLeft || data.icon_left || '',
    iconRight: data.cta_icon_right || data.button_icon_right || data.iconRight || data.icon_right || data.icon || '',
    linkType: normalizeLinkType(data),
    actionModal: data.cta_action_modal || data.button_action_modal || data.action_modal || data.actionModal || data.cta_action || data.button_action || data.action || '',
    target: data.cta_target || data.button_target || data.target || '_self',
  };
}

function mapAwardItem(award: Record<string, any>, t: (f: any) => string, locale: string) {
  const title = locale === 'id'
    ? award.titleId || award.title_id || award.title
    : award.titleEn || award.title_en || award.title;
  const desc = locale === 'id'
    ? award.descriptionId || award.description_id || award.description
    : award.descriptionEn || award.description_en || award.description;

  return {
    id: award.id,
    topLogo: award.topLogo || award.logo || '',
    image: award.image || '',
    title: t(title),
    desc: t(desc),
    date: award.date || award.issueDate || award.issue_date || (award.year ? `${award.year}-01-01` : ''),
    url: award.url || award.link || '#',
    year: award.year,
  };
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
  const rawSource = data || {};
  const source = rawSource?._component && rawSource?.data && typeof rawSource.data === 'object'
    ? {
        ...rawSource.data,
        ...(rawSource.mainData !== undefined ? { mainData: rawSource.mainData } : {}),
      }
    : rawSource;
  const config = source.config && typeof source.config === 'object' ? source.config : {};
  const introData = source.introData || source.sectionIntro || source.intro;
  const rawCtaList = getRawCtaList(source);
  const ctaList = rawCtaList.map((cta, index) => normalizeCtaItem(cta, undefined, index));
  const introTitle = introData && typeof introData === 'object' ? introData.title : undefined;
  const introDescription = introData && typeof introData === 'object' ? introData.description : undefined;

  return {
    ...source,
    ...(introData ? { introData } : {}),
    ...(ctaList.length > 0 ? { ctaList } : {}),
    ...(source.title === undefined && introTitle !== undefined ? { title: introTitle } : {}),
    ...(source.description === undefined && introDescription !== undefined ? { description: introDescription } : {}),
    custom_id: source.custom_id ?? config.sectionId ?? '',
    custom_class: source.custom_class ?? config.className ?? '',
    bg_image: source.bg_image ?? config.bgImage ?? '',
    bg_image_mobile: source.bg_image_mobile ?? config.bgImageMobile ?? '',
    bg_position_classes: source.bg_position_classes ?? config.bgPositionClasses ?? '',
    bg_size_class: source.bg_size_class ?? config.bgSizeClass ?? '',
  };
}

function optionalString(value: any): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function resolveCmsData(data: Record<string, any>): Record<string, any> {
  const explicitCmsData = data.cmsData || data.cms_data;

  if (explicitCmsData && typeof explicitCmsData === 'object' && !Array.isArray(explicitCmsData)) {
    return explicitCmsData;
  }

  return data;
}

function hasRenderableCmsValue(value: any): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.some((entry) => hasRenderableCmsValue(entry));
  if (typeof value === 'object') return Object.values(value).some((entry) => hasRenderableCmsValue(entry));
  return false;
}

function hasRenderableCmsData(data: Record<string, any>): boolean {
  return Object.entries(data).some(([key, value]) => {
    if (['name', 'custom_id', 'custom_class'].includes(key)) return false;
    return hasRenderableCmsValue(value);
  });
}

function passCmsData(
  data: Record<string, any>,
  styleProps: Record<string, any> = {},
  extraProps: Record<string, any> = {},
  t?: (f: any) => string,
  locale = 'id'
): Record<string, any> {
  const resolvedData = resolveCmsData(data);
  const introData = extractIntro(resolvedData, t || createLocalizer(locale), locale);
  const ctaList = getRawCtaList(resolvedData).map((cta, index) => normalizeCtaItem(cta, t, index));
  const normalizedData = {
    ...resolvedData,
    ...(introData ? { introData } : {}),
    ...(ctaList.length > 0 ? { ctaList } : {}),
  };
  const cmsData = hasRenderableCmsData(normalizedData) ? normalizedData : null;

  return {
    data: normalizedData,
    cmsData,
    ...extraProps,
    ...styleProps,
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
const SolutionsList = dynamic(() => import('@/components/main/SolutionsList'));
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
    mapProps: ({ data, t, locale, styleProps }) => ({
      cmsSlides: Array.isArray(data.slides) 
        ? data.slides.map((slide: any, index: number) => {
            const rawCtaList = getRawCtaList(slide);
            // Fall back to button_text/button_link if no ctaList found
            const ctaList = rawCtaList.length > 0
              ? rawCtaList.map((cta, idx) => normalizeCtaItem(cta, t, idx))
              : (t(slide.button_text) ? [normalizeCtaItem({ text: t(slide.button_text), href: slide.button_link || '#', target: '_self' }, t, 0)] : []);
            return {
              id: slide.id || `cms-hero-slide-${index}`,
              image: slide.image || undefined,
              image_mobile: slide.image_mobile || undefined,
              introData: extractIntro(slide, t, locale) || {
                label: t(slide.pill_text),
                title: t(slide.title),
                description: t(slide.description),
                as: 'h2',
                align: 'left',
              },
              // backward-compat flat fields
              labelText: t(slide.pill_text),
              title: t(slide.title),
              description: t(slide.description),
              ctaList,
              config: {
                ...(slide.config && typeof slide.config === 'object' ? slide.config : {}),
                tabTitle: t(slide.config?.tabTitle) || t(slide.indicator_label) || t(slide.title),
                bgImage: slide.image || slide.config?.bgImage || '',
                bgImageMobile: slide.image_mobile || slide.config?.bgImageMobile || '',
              },
              theme: slide.theme || data.theme || 'dark',
            };
          })
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
          config: {
            ...(data.config && typeof data.config === 'object' ? data.config : {}),
            layoutVariant: presentation.layoutVariant,
            image: presentation.image,
            usp: {
              ...(data.config?.usp && typeof data.config.usp === 'object' ? data.config.usp : {}),
              variant: presentation.uspVariant,
              isSlider: presentation.isSlider,
              slidesPerViewDesktop: presentation.slidesPerViewDesktop,
              slidesPerViewMobile: presentation.slidesPerViewMobile,
              gridColsDesktop: presentation.gridColsDesktop,
              gridColsMobile: presentation.gridColsMobile,
            },
          },
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
          ? data.items.map((item: any, idx: number) => {
              const ctaList = getRawCtaList(item)
                .map((cta, index) => normalizeCtaItem(cta, t, index))
                .filter((cta) => cta.text && cta.href);

              return {
                id: item.id || `value-${idx}`,
                logo: item.logo || (typeof item.icon === 'string' && item.icon.startsWith('/') ? item.icon : undefined),
                title: localizeField(item, 'title', t, locale),
                desc: localizeField(item, 'desc', t, locale),
                ctaList,
                bodyTitle: localizeField(item, 'bodyTitle', t, locale) || localizeField(item, 'description', t, locale),
                iconListDefault: item.iconListDefault || undefined,
                list: Array.isArray(item.list)
                  ? item.list
                      .map((li: any) => ({
                        icon: li?.icon || item.iconListDefault || undefined,
                        text: t(li?.text ?? li),
                      }))
                      .filter((li: any) => li.text)
                  : [],
              };
            })
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
        ctaList: getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index)),
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
    mapProps: ({ data, t, locale, styleProps, pageContext }) => ({
      cmsData: {
        show: data.show !== false,
        introData: extractIntro(data, t, locale),
        form_fields: data.form_fields || data.formFields || null,
      },
      settings: pageContext?.publicSettings || null,
      locale,
      ...styleProps,
    }),
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
          ? data.slides.map((slide: any, idx: number) => {
              const rawCtaList = getRawCtaList(slide);
              const ctaList = rawCtaList.length > 0
                ? rawCtaList.map((cta, i) => normalizeCtaItem(cta, t, i))
                : (t(slide.cta_text) ? [normalizeCtaItem({ text: t(slide.cta_text), href: slide.cta_link || '#', target: '_self', variant: 'secondary-outline', size: 'lg' }, t, 0)] : []);
              return {
                id: `squad-${idx}`,
                image: slide.image || undefined,
                roleLabel: '',
                roleTitle: t(slide.title),
                headline: '',
                desc: t(slide.description),
                ctaList,
              };
            })
          : [],
      },
      ...styleProps,
    }),
  },

  career_highlight: {
    component: CareerSneakPeek,
    mapProps: ({ data, t, locale, styleProps }) => ({
      ...passCmsData(data, styleProps, { name: data.name || 'home', mainData: data.mainData || null }, t, locale),
      locale,
    }),
  },

  career_list: {
    component: Career,
  },

  // ── News ────────────────────────────────────────────────────────

  news_highlight: {
    component: NewsFeatured,
    mapProps: ({ data, t, locale, styleProps }) => {
      const rawHeroCtaList = data.ctaList || data.cta_list || data.ctaButtons || data.cta_buttons || data.buttons;
      const ctaList = Array.isArray(rawHeroCtaList)
        ? rawHeroCtaList
            .filter((cta) => {
              const label = t(cta?.label ?? cta?.text ?? cta?.button_text ?? cta?.cta_text);
              const href = cta?.href || cta?.url || cta?.action || cta?.cta_link || cta?.button_link;
              return Boolean(label && href);
            })
            .map((cta, index) => normalizeCtaItem(cta, t, index))
        : [];
      const introData = extractIntro(data, t, locale) || {
        as: 'h2',
        title: localizeField(data, 'title', t, locale),
        align: data.intro_align || 'left',
      };

      return {
        cmsData: {
          ...data,
          source: data.source || 'cms_highlights',
          introData,
          ctaList,
        },
        mainData: data.mainData || null,
        ...styleProps,
      };
    },
  },

  news_featured: {
    component: NewsFeatured,
    mapProps: ({ data, t, locale, styleProps }) => {
      const ctaList = getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index));
      const introData = extractIntro(data, t, locale) || {
        as: 'h2',
        title: localizeField(data, 'title', t, locale),
        align: data.intro_align || 'left',
      };

      return {
        cmsData: {
          ...data,
          source: data.source || 'cms_highlights',
          introData,
          ctaList,
        },
        mainData: data.mainData || null,
        ...styleProps,
      };
    },
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
        limit: data.limit || data.max_data || 12,
        sortBy: data.sort_by || data.sortBy || 'news_date',
        sortDirection: data.sort_direction || data.sortDirection || data.sort_order || 'desc',
        showPagination: data.show_pagination !== false,
        showSearch: data.show_search !== false,
        showCategoryFilter: data.show_category_filter !== false,
        displayImage: data.display_image !== false,
        displayDescription: data.display_description !== false,
        showDate: data.show_date !== false,
        showCategory: data.show_category !== false,
        searchPlaceholder: t(data.search_placeholder) || (locale === 'id' ? 'Cari berita...' : 'Search news...'),
        searchButtonText: t(data.search_button_text) || (locale === 'id' ? 'Cari' : 'Search'),
        category: data.category_id || null,
        ctaList: getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index)),
      },
      mainData: data.mainData || null,
      ...styleProps,
    }),
  },

  // ── Management ──────────────────────────────────────────────────

  management_list: {
    component: Management,
    mapProps: ({ data, t, locale, styleProps }) => ({
      cmsData: {
        ...data,
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: localizeField(data, 'title', t, locale),
          description: localizeField(data, 'description', t, locale),
          align: data.intro_align || 'left',
        },
      },
      mainData: data.mainData || null,
      locale,
      ...styleProps,
    }),
  },

  // ── Reports ─────────────────────────────────────────────────────

  report_list: {
    component: ReportList,
    mapProps: ({ data, t, locale, styleProps }) => ({
      cmsData: {
        ...data,
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: localizeField(data, 'title', t, locale),
          description: localizeField(data, 'description', t, locale),
          align: data.intro_align || 'left',
        },
      },
      name: data.name || data.report_type || 'financial-statement',
      showTypeFilter: data.show_type_filter !== false,
      showSectionFilter: data.show_section_filter !== false,
      showStatusFilter: data.show_status_filter !== false,
      showYearFilter: data.show_year_filter !== false,
      showPagination: data.show_pagination !== false,
      layout: data.layout || 'list',
      cardStyle: data.card_style || 'default',
      displayImage: data.display_image !== false,
      displayDescription: data.display_description !== false,
      mainData: data.mainData || null,
      ...styleProps,
    }),
  },

  // ── Awards ──────────────────────────────────────────────────────

  awards_list: {
    component: AwardsFeed,
    mapProps: ({ data, t, styleProps, locale }) => {
      const awards = Array.isArray(data.mainData?.awards)
        ? data.mainData.awards
        : (Array.isArray(data.items) ? data.items : []);

      return {
        name: data.name || 'awards-list',
        cmsData: {
          config: data.config || {},
          introData: extractIntro(data, t, locale) || {
            as: 'h2',
            label: localizeField(data, 'intro_label', t, locale),
            title: localizeField(data, 'title', t, locale),
            description: localizeField(data, 'description', t, locale),
            align: data.intro_align || 'center',
          },
          items: awards.map((award: any) => mapAwardItem(award, t, locale)),
          perPage: data.limit || data.per_page || data.max_data || 9,
          showPagination: data.show_pagination !== false,
          showYearFilter: data.show_year_filter !== false,
          showImage: data.show_image !== false,
          sortOrder: data.sort_direction || data.order || data.sort_order || 'desc',
          columns: data.columns || 3,
        },
        mainData: data.mainData || null,
        ...styleProps,
      };
    },
  },

  awards_marquee: {
    component: AwardSneakPeek,
    mapProps: ({ data, t, styleProps, locale }) => {
      const selectedAwardIds = Array.isArray(data.award_ids || data.awardIds)
        ? data.award_ids || data.awardIds
        : [];
      const allAwards = Array.isArray(data.mainData?.awards)
        ? data.mainData.awards
        : (Array.isArray(data.items) ? data.items : []);
      const sourceAwards = selectedAwardIds
        .map((id: string) => allAwards.find((award: any) => String(award.id) === String(id)))
        .filter(Boolean);
      const ctaList = getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index));

      return {
        cmsData: {
          config: data.config || {},
          introData: extractIntro(data, t, locale) || {
            as: 'h2',
            label: '',
            title: t(data.title),
            description: '',
            align: 'left',
          },
          items: sourceAwards.map((award: any) => mapAwardItem(award, t, locale)),
          ctaList,
        },
        ...styleProps,
      };
    },
  },

  // ── Other sections ──────────────────────────────────────────────

  accordion: {
    component: FAQ,
    mapProps: ({ data, t, styleProps, locale }) => {
      // extractIntro handles sectionIntro (CMS storage format via withCommon),
      // falling back to nested intro or flat intro_* fields.
      const introData = extractIntro(data, t, locale) || {
        as: 'h2',
        label: localizeField(data, 'label', t, locale) || localizeField(data, 'intro_label', t, locale),
        title: localizeField(data, 'title', t, locale) || localizeField(data, 'intro_title', t, locale),
        description: localizeField(data, 'description', t, locale) || localizeField(data, 'intro_description', t, locale),
        align: data.align || data.intro_align || 'center',
      };

      // Support CMS format (title/content multilingual objects) and
      // legacy static format (question/answer flat strings).
      const rawItems = Array.isArray(data.items) ? data.items : [];
      const rawFaqList = Array.isArray(data.faqList) ? data.faqList : [];
      const sourceList = rawItems.length > 0 ? rawItems : rawFaqList;

      const faqList = sourceList.map((item: any, idx: number) => ({
        id: item.id || `faq-${idx}`,
        question: t(item.title) || item.question || '',
        answer: t(item.content) || item.answer || '',
      }));

      const ctaList = getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index));

      return {
        cmsData: {
          introData,
          faqList,
          config: data.config || {},
          ...(ctaList.length > 0 ? { ctaList } : {}),
          textCTA: t(data.textCTA) || t(data.cta_text) || 'See More',
          textCTA_collapse: t(data.textCTA_collapse) || t(data.cta_text_collapse) || 'Show Less',
        },
        ...styleProps,
      };
    },
  },

  vision_mission: {
    component: VisionMission,
    mapProps: ({ data, t, styleProps, locale }) => {
      const directItems = Array.isArray(data.items)
        ? data.items.map((item: any, idx: number) => ({
            id: item.id || `vision-mission-${idx}`,
            label: t(item.label) || (idx === 0 ? 'OUR VISION' : 'OUR MISSION'),
            title: t(item.title),
            description: t(item.description),
            image: item.image || item.imageUrl || item.image_url || undefined,
            align: item.align || (idx === 0 ? 'left' : 'right'),
          }))
        : [];

      const legacyItems = directItems.length > 0 ? [] : [
        ...(data.vision
          ? [{
              id: 'vision',
              label: t(data.vision.label) || 'OUR VISION',
              title: t(data.vision.title),
              description: t(data.vision.description),
              image: data.vision.image || undefined,
              align: data.vision.align || 'left',
            }]
          : []),
        ...(Array.isArray(data.missions)
          ? data.missions.map((m: any, idx: number) => ({
              id: `mission-${idx}`,
              label: t(m.label) || 'OUR MISSION',
              title: t(m.title),
              description: t(m.description),
              image: m.image || undefined,
              align: m.align || (idx % 2 === 0 ? 'right' : 'left'),
            }))
          : []),
      ];

      return {
        cmsData: {
          introData: extractIntro(data, t, locale),
          items: directItems.length > 0 ? directItems : legacyItems,
          config: data.config || {},
        },
        className: data.custom_class || '',
        ...styleProps,
      };
    },
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
    mapProps: ({ data, t, styleProps, locale }) => {
      const milestones = Array.isArray(data.milestones)
        ? data.milestones
        : Array.isArray(data.items)
          ? data.items
          : [];

      return {
        cmsData: {
          introData: extractIntro(data, t, locale) || {
            as: 'h2',
            label: '',
            title: t(data.title),
            description: '',
            align: 'left',
          },
          items: milestones.map((ms: any, idx: number) => ({
            id: ms.id || `milestone-${idx}`,
            year: ms.year || '',
            image: ms.image || undefined,
            description: t(ms.description),
            list: Array.isArray(ms.list)
              ? ms.list
                  .map((item: any) => t(item?.text ?? item))
                  .filter(Boolean)
              : [],
          })),
        },
        ...styleProps,
      };
    },
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
        introData: extractIntro(data, t, locale) || {
          overline: localizeField(data, 'overline', t, locale),
          title: localizeField(data, 'title', t, locale),
          description: localizeField(data, 'description', t, locale),
        },
        ctaList: getRawCtaList(data).map((cta, index) => ({
          ...normalizeCtaItem(cta, t, index),
          variant: cta.variant || 'secondary-outline',
        })),
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
      introData: extractIntro(data, t, locale),
      ctaList: getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index)),
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
    mapProps: ({ data, t, locale, styleProps }) => ({
      cmsData: {
        ...data,
        introData: extractIntro(data, t, locale) || {
          as: 'h2',
          label: '',
          title: localizeField(data, 'title', t, locale) || localizeField(data, 'intro_title', t, locale),
          description: localizeField(data, 'description', t, locale),
          align: data.intro_align || 'left',
        },
      },
      mainData: data.mainData || null,
      ...styleProps,
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
            bgImage: config.bgImage || data.bg_image || data.background_image || '',
            bgImageMobile: config.bgImageMobile || data.bg_image_mobile || data.background_image_mobile || '',
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
  hero: {
    component: Hero,
    mapProps: ({ data, t, locale, styleProps }) => {
      const config = data.config && typeof data.config === 'object' ? data.config : {};
      const parentProduct = data.parentProduct || data.parent_product || null;
      const introData = extractIntro(data, t, locale) || {
        as: data.as || 'h2',
        label: '',
        title: localizeField(data, 'title', t, locale),
        description: localizeField(data, 'description', t, locale),
        align: 'left',
      };
      const ctaList = getRawCtaList(data).map((cta, index) => normalizeCtaItem(cta, t, index));

      return {
        name: data.name || undefined,
        data: {
          ...data,
          config: {
            sectionId: config.sectionId || data.custom_id || '',
            className: config.className || data.custom_class || '',
            bgImage: config.bgImage || data.bg_image || '',
            bgImageMobile: config.bgImageMobile || data.bg_image_mobile || '',
            bgPositionClasses: config.bgPositionClasses || data.bg_position_classes || '',
            bgSizeClass: config.bgSizeClass || data.bg_size_class || '',
            theme: config.theme || data.theme || 'light',
            bgOverlay: typeof config.bgOverlay === 'boolean' ? config.bgOverlay : Boolean(data.bgOverlay || data.bg_overlay),
          },
          parentProduct: parentProduct ? {
            iconImage: parentProduct.iconImage || parentProduct.icon_image || '',
            productName: t(parentProduct.productName || parentProduct.product_name),
          } : undefined,
          introData,
          ctaList: ctaList.length > 0 ? ctaList : undefined,
          title: introData.title || '',
          description: introData.description || '',
        },
        ...styleProps,
      };
    },
  },
  career_detail: {
    component: CareerDetail,
    mapProps: ({ data, styleProps }) => ({
      career: data.career || data.item || null,
      relatedCareers: data.relatedCareers || data.related_careers || [],
      ...styleProps,
    }),
  },
  check_coverage: {
    component: CheckCoverage,
    mapProps: ({ data, t, locale, styleProps }) => {
      const cmsData = data.cmsData || data.cms_data || data;
      const introData = cmsData.introData || extractIntro(cmsData, t, locale);

      return {
        name: data.name || 'enterprise',
        cmsData: {
          ...cmsData,
          introData: introData ? {
            ...introData,
            label: t(introData.label),
            title: t(introData.title),
            description: t(introData.description),
          } : undefined,
        },
        ...styleProps,
      };
    },
  },
  content_highlights: {
    component: ContentHighlights,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(
      data,
      styleProps,
      { name: data.name || 'home', mainData: data.mainData || null },
      t,
      locale
    ),
  },
  event_content: {
    component: EventContent,
    mapProps: ({ data }) => ({ event: data.event || data.item || null }),
  },
  event_detail: {
    component: EventDetail,
    mapProps: ({ data, locale }) => ({ event: data.event || data.item || null, locale }),
  },
  event_hero: {
    component: EventHero,
    mapProps: ({ data, t, locale, styleProps }) => {
      const config = data.config && typeof data.config === 'object' ? data.config : {};
      const introData = extractIntro(data, t, locale) || {
        as: 'h1',
        label: 'FIND YOUR NEXT EXPERIENCE',
        title: 'Discover & Promote Upcoming Event',
        description: '',
        align: 'left',
      };

      return {
        variant: data.variant || data.source || 'event_grid',
        introData,
        config: {
          sectionId: config.sectionId || data.custom_id || '',
          className: config.className || data.custom_class || '',
          bgImage: config.bgImage || data.bg_image || '',
          bgImageMobile: config.bgImageMobile || data.bg_image_mobile || '',
        },
        posterSrc: optionalString(data.posterSrc || data.poster_src),
        posterAlt: localizeField(data, 'posterAlt', t, locale) || localizeField(data, 'poster_alt', t, locale) || 'Event Poster',
        thumbnailSrc: optionalString(data.thumbnailSrc || data.thumbnail_src),
        thumbnailMobileSrc: optionalString(data.thumbnailMobileSrc || data.thumbnail_mobile_src),
        badgeText: localizeField(data, 'badgeText', t, locale) || localizeField(data, 'badge_text', t, locale),
        status: data.status || 'upcoming',
        title: localizeField(data, 'title', t, locale),
        location: localizeField(data, 'location', t, locale),
        dateLabel: localizeField(data, 'dateLabel', t, locale) || localizeField(data, 'date_label', t, locale),
        timeLabel: localizeField(data, 'timeLabel', t, locale) || localizeField(data, 'time_label', t, locale),
        ctaText: localizeField(data, 'ctaText', t, locale) || localizeField(data, 'cta_text', t, locale),
        ctaLink: data.ctaLink || data.cta_link || '#',
        ctaTarget: data.ctaTarget || data.cta_target || '_self',
        ctaModalPayload: data.ctaModalPayload || data.cta_modal_payload || null,
        ...styleProps,
      };
    },
  },
  event_registration_form: {
    component: EventRegistrationForm,
    mapProps: ({ data }) => ({ event: data.event || data.item || null }),
  },
  event_related: {
    component: EventRelated,
    mapProps: ({ data, t, locale, styleProps }) => ({
      currentEvent: data.currentEvent || data.current_event || null,
      events: data.mainData?.events || data.events || null,
      type: (data.type as string) || (data.order as string) || 'latest',
      state: (data.state as string) || 'all',
      limit: Number(data.limit) || 4,
      introData: extractIntro(data, t, locale) || {
        as: 'h2',
        title: locale === 'id' ? 'Event Lainnya' : 'Other Events',
        align: 'left',
      },
      ...styleProps,
    }),
  },
  event_related_news: {
    component: EventRelatedNews,
    mapProps: ({ data, locale }) => ({ articles: data.articles || [], locale }),
  },
  events_list: {
    component: EventsList,
    mapProps: ({ data, t, locale, styleProps }) => ({
      events: data.mainData?.events || data.events || null,
      pagination: data.mainData?.pagination || data.pagination || null,
      state: (data.state as string) || 'all',
      limit: Number(data.limit) || 12,
      sortBy: data.sort_by || data.sortBy || 'start_date',
      sortDirection: data.sort_direction || data.sortDirection || data.sort_order || 'asc',
      itemsPerRow: Number(data.itemsPerRow || data.items_per_row) || 3,
      showPagination: data.showPagination !== false && data.show_pagination !== false && data.pagination !== false,
      introData: extractIntro(data, t, locale),
      locale,
      ...styleProps,
    }),
  },
  footer: {
    component: Footer,
    mapProps: ({ data, styleProps }) => ({
      cmsClosingData: data.cmsClosingData || data.cms_closing_data || null,
      cmsFooterData: data.cmsFooterData || data.cms_footer_data || null,
      ...styleProps,
    }),
  },
  footer_fiber: { component: FooterFiber },
  footer_main: {
    component: FooterMain,
    mapProps: ({ data, styleProps }) => ({
      cmsFooterData: data.cmsFooterData || data.cms_footer_data || null,
      ...styleProps,
    }),
  },
  footer_media: { component: FooterMedia },
  form_registration: { component: FormRegistration },
  form_registration_incomplete: { component: FormRegistrationIncomplete },
  form_registration_success: { component: FormRegistrationSuccess },
  hero_sliders_tv_highlight: {
    component: HeroSlidersTVHighlight,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'today-highlight' }, t, locale),
  },
  hospitality: { component: Hospitality },
  layout_chrome: { component: LayoutChrome },
  list_report_home: {
    component: ListReportHome,
    mapProps: ({ data, t, locale, styleProps }) => {
      const introData = extractIntro(data, t, locale);
      const mainData = data.mainData && typeof data.mainData === 'object' ? data.mainData : null;
      const source = mainData || data;
      const tabs: Record<string, any>[] = Array.isArray(source.tabs)
        ? source.tabs.map((tab: Record<string, any>, index: number) => ({
            ...tab,
            label: t(tab.label) || tab.label || tab.value || `Tab ${index + 1}`,
            value: typeof tab.value === 'string' ? tab.value : `tab-${index + 1}`,
          }))
        : [];
      const rawItems: Record<string, any[]> = source.items && typeof source.items === 'object' && !Array.isArray(source.items)
        ? source.items
        : {};
      const items = tabs.reduce((acc: Record<string, any[]>, tab: Record<string, any>) => {
        const tabValue = tab.value || '';
        if (!tabValue) return acc;
        const tabItems = Array.isArray(rawItems[tabValue]) ? rawItems[tabValue] : [];

        acc[tabValue] = tabItems.map((item: Record<string, any>, itemIndex: number) => ({
          ...item,
          id: item.id || `${tabValue}-${itemIndex}`,
          iconSrc: item.iconSrc || item.icon_src || item.icon || undefined,
          title: localizeField(item, 'title', t, locale),
          desc: localizeField(item, 'desc', t, locale) || localizeField(item, 'description', t, locale),
          description: localizeField(item, 'description', t, locale) || localizeField(item, 'desc', t, locale),
          year: item.year == null ? '' : String(item.year),
          ctaList: getRawCtaList(item).map((cta, ctaIndex) => normalizeCtaItem(cta, t, ctaIndex)),
        }));

        return acc;
      }, {});

      return {
        data,
        cmsData: {
          ...source,
          tabs,
          items,
          config: data.config || source.config || {},
          ...(introData ? { introData } : {}),
        },
        name: data.name || 'home',
        ...styleProps,
      };
    },
  },
  logo_running: {
    component: LogoRunning,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'default' }, t, locale),
  },
  logo_running_with_border: {
    component: LogoRunningWithBorder,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'default' }, t, locale),
  },
  maps_coverage_v1: {
    component: MapsCoverageV1,
    mapProps: ({ data, t, locale, styleProps }) => {
      const mapped = passCmsData(data, styleProps, { name: data.name || 'home' }, t, locale);
      return {
        ...mapped,
        cmsData: {
          ...(mapped.cmsData || {}),
          mapData: data.mainData || data.mapData || data.coverageData || null,
        },
      };
    },
  },
  navbar: {
    component: Navbar,
    mapProps: ({ data, pageContext }) => ({
      menuData: data.menuData || data.menu_data || undefined,
      defaultLocale: data.defaultLocale || data.default_locale || 'en',
      settings: pageContext?.publicSettings || null,
    }),
  },
  navbar_fiber: {
    component: NavbarFiber,
    mapProps: ({ data }) => ({
      menuData: data.menuData || data.menu_data || undefined,
      defaultLocale: data.defaultLocale || data.default_locale || 'en',
    }),
  },
  navbar_media: { component: NavbarMedia },
  navbar_newsroom: {
    component: NavbarNewsroom,
    mapProps: ({ data, t }) => ({
      label: t(data.label) || 'News',
      categorySortBy: data.category_sort_by || data.categorySortBy || 'default',
    }),
  },
  news_detail: {
    component: NewsDetail,
    mapProps: ({ data }) => ({ article: data.article || data.item || null }),
  },
  news_feed: {
    component: NewsFeed,
    mapProps: ({ data, t, locale, styleProps }) => ({
      categorySlug: data.categorySlug || data.category_slug || 'latest',
      cmsData: {
        ...data,
        introData: extractIntro(data, t, locale),
      },
      mainData: data.mainData || null,
      layout: data.layout || 'list',
      ...styleProps,
    }),
  },
  news_related: {
    component: NewsRelated,
    mapProps: ({ data, styleProps }) => ({ articles: data.articles || data.items || [], ...styleProps }),
  },
  news_teaser: {
    component: NewsTeaser,
    mapProps: ({ data, t, locale, styleProps }) => {
      const cmsData = data.cmsData || data.cms_data || data;
      const introData = extractIntro(cmsData, t, locale);
      const ctaList = getRawCtaList(cmsData).map((cta, index) => normalizeCtaItem(cta, t, index));

      return {
        name: data.name || 'press-release',
        cmsData: {
          ...cmsData,
          ...(introData ? { introData } : {}),
          ctaList,
        },
        mainData: data.mainData || null,
        locale,
        ...styleProps,
      };
    },
  },
  omni_channel_widget: {
    component: OmniChannelWidget,
    mapProps: ({ data, t, styleProps }) => {
      const cmsData = data.cmsData || data;

      return {
        cmsData: {
          ...cmsData,
          title: t(cmsData.title),
          subtitle: t(cmsData.subtitle),
        },
        ...styleProps,
      };
    },
  },
  one_stream_plus: { component: OneStreamPlus },
  package_list: {
    component: PackageList,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'enterprise' }, t, locale),
  },
  report_grid: {
    component: ReportGrid,
    mapProps: ({ data, t, locale, styleProps }) => ({
      data: {
        ...(data.mainData && typeof data.mainData === 'object' ? data.mainData : {}),
        ...(data.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : {}),
        config: data.config || data.mainData?.config || {},
        introData: extractIntro(data, t, locale),
        items: data.mainData?.items || data.data?.items || (Array.isArray(data.data) ? data.data : []),
      },
      ...styleProps,
    }),
  },
  report_list_part: {
    component: ReportListPart,
    mapProps: ({ data, styleProps }) => ({
      data: data.data || data.mainData || null,
      config: data.config || null,
      ...styleProps,
    }),
  },
  solutions_list: {
    component: SolutionsList,
    mapProps: ({ data, t, locale, styleProps }) => ({
      cmsData: {
        ...data,
        introData: extractIntro(data, t, locale),
      },
      mainData: data.mainData || null,
      locale,
      ...styleProps,
    }),
  },
  solution_services_home: {
    component: SolutionServicesHome,
    mapProps: ({ data, t, locale, styleProps }) => ({
      ...passCmsData(data, styleProps, {}, t, locale),
      name: data.name || 'home',
      hideTabs: data.hideTabs || data.hide_tabs || false,
    }),
  },
  solutions_filtered: {
    component: SolutionsFiltered,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'enterprise' }, t, locale),
  },
  solutions_services_with_background: {
    component: SolutionsServicesWithBackground,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'enterprise' }, t, locale),
  },
  tv_channel_list: {
    component: TVChannelList,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'enterprise' }, t, locale),
  },
  tv_channel_sneak_peek: {
    component: TVChannelSneakPeek,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'home' }, t, locale),
  },
  tv_highlight_sliders: {
    component: TVHighlightSliders,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'today-highlight' }, t, locale),
  },
  tv_highlight_sneek_peak: {
    component: TVHighlightSneekPeak,
    mapProps: ({ data, t, locale, styleProps }) => passCmsData(data, styleProps, { name: data.name || 'home' }, t, locale),
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
