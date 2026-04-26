import type { SharedCtaItem } from './content';
import type { PresentationFieldResolver, SharedIntroData } from './solutions';

type SectionPresentationOptions = {
  resolveField: PresentationFieldResolver;
  introData?: SharedIntroData;
};

export type SharedUspItem = {
  id?: string;
  iconURL?: string;
  title?: string;
  description?: string;
};

export type UspGridPresentation = {
  introData: SharedIntroData;
  uspVariant: string;
  isSlider: boolean;
  bgColor: string;
  bgImage?: string;
  bgImageMobile?: string;
  bgPositionClasses: string;
  bgSizeClass: string;
  uspList: SharedUspItem[];
  ctaList: SharedCtaItem[];
  slidesPerViewDesktop: number;
  slidesPerViewMobile: number;
  gridColsDesktop: number;
  gridColsMobile: number;
};

export type SharedBusinessTabItem = {
  id?: string;
  label?: string;
  tagline?: string;
  title?: string;
  desc?: string;
  image?: string;
  imageMobile?: string;
  logoSrc?: string;
  textCTA?: string;
  href?: string;
};

export type BusinessTabPresentation = {
  introData: SharedIntroData;
  items: SharedBusinessTabItem[];
};

function buildIntroData(
  data: Record<string, any> | undefined,
  resolveField: PresentationFieldResolver,
  introData?: SharedIntroData
): SharedIntroData {
  if (introData) {
    return introData;
  }

  if (data?.intro && typeof data.intro === 'object') {
    return {
      as: 'h2',
      label: resolveField(data.intro, 'label'),
      title: resolveField(data.intro, 'title'),
      description: resolveField(data.intro, 'description'),
      align: typeof data.intro.align === 'string' && data.intro.align ? data.intro.align : 'left',
    };
  }

  return {
    as: 'h2',
    label: resolveField(data, 'label') || resolveField(data, 'intro_label'),
    title: resolveField(data, 'title') || resolveField(data, 'intro_title') || resolveField(data, 'name'),
    description: resolveField(data, 'description') || resolveField(data, 'intro_description') || resolveField(data, 'content'),
    align: typeof data?.intro_align === 'string' && data.intro_align ? data.intro_align : 'left',
  };
}

function mapCtaList(
  ctaItems: any,
  resolveField: PresentationFieldResolver,
  prefix: string
): SharedCtaItem[] {
  return Array.isArray(ctaItems)
    ? ctaItems.map((cta: Record<string, any>, index: number) => ({
        id: cta.id || `${prefix}-cta-${index}`,
        text: resolveField(cta, 'text'),
        href: (typeof cta.href === 'string' && cta.href) || (typeof cta.url === 'string' && cta.url) || '#',
        variant: typeof cta.variant === 'string' ? cta.variant : 'primary',
        size: typeof cta.size === 'string' ? cta.size : 'lg',
      }))
    : [];
}

export function mapUspGridPresentation(
  data: Record<string, any> | undefined,
  options: SectionPresentationOptions
): UspGridPresentation {
  const { resolveField, introData } = options;

  return {
    introData: buildIntroData(data, resolveField, introData),
    uspVariant: typeof data?.usp_variant === 'string' && data.usp_variant ? data.usp_variant : 'card',
    isSlider: data?.is_slider !== undefined ? Boolean(data.is_slider) : false,
    bgColor: typeof data?.bg_color === 'string' ? data.bg_color : '',
    bgImage: typeof data?.bg_image === 'string' && data.bg_image ? data.bg_image : undefined,
    bgImageMobile: typeof data?.bg_image_mobile === 'string' && data.bg_image_mobile ? data.bg_image_mobile : undefined,
    bgPositionClasses: typeof data?.bg_position_classes === 'string' && data.bg_position_classes ? data.bg_position_classes : 'bg-right-top md:bg-right',
    bgSizeClass: typeof data?.bg_size_class === 'string' && data.bg_size_class ? data.bg_size_class : 'bg-cover',
    uspList: Array.isArray(data?.items)
      ? data.items.map((item: Record<string, any>, index: number) => ({
          id: item.id || `usp-item-${index}`,
          iconURL: typeof item.icon === 'string' ? item.icon : undefined,
          title: resolveField(item, 'title'),
          description: resolveField(item, 'description'),
        }))
      : [],
    ctaList: mapCtaList(data?.cta_list, resolveField, 'usp-grid'),
    slidesPerViewDesktop: data?.slides_per_view_desktop ?? 4,
    slidesPerViewMobile: data?.slides_per_view_mobile ?? 1.2,
    gridColsDesktop: data?.grid_cols_desktop ?? 4,
    gridColsMobile: data?.grid_cols_mobile ?? 1,
  };
}

export function mapBusinessTabPresentation(
  data: Record<string, any> | undefined,
  options: SectionPresentationOptions
): BusinessTabPresentation {
  const { resolveField, introData } = options;

  return {
    introData: buildIntroData(data, resolveField, introData),
    items: Array.isArray(data?.tabs)
      ? data.tabs.map((tab: Record<string, any>, index: number) => ({
          id: tab.id || `tab-${index}`,
          label: resolveField(tab, 'name') || resolveField(tab, 'label'),
          tagline: resolveField(tab, 'tagline'),
          title: resolveField(tab, 'title'),
          desc: resolveField(tab, 'description'),
          image: typeof tab.background_image === 'string' ? tab.background_image : undefined,
          imageMobile: typeof tab.background_image_mobile === 'string' ? tab.background_image_mobile : undefined,
          logoSrc: typeof tab.logo_image === 'string' ? tab.logo_image : undefined,
          textCTA: resolveField(tab, 'cta_text'),
          href: (typeof tab.cta_link === 'string' && tab.cta_link) || (typeof tab.href === 'string' && tab.href) || '#',
        }))
      : [],
  };
}