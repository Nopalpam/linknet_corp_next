import type { SharedCtaItem } from './content';
import { buildSharedIntroData } from './intro';
import type { PresentationFieldResolver, SharedIntroData } from './intro';

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
  layoutVariant: string;
  image?: {
    src?: string;
    alt?: string;
  };
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

function mapCtaList(
  ctaItems: any,
  resolveField: PresentationFieldResolver,
  prefix: string
): SharedCtaItem[] {
  return Array.isArray(ctaItems)
    ? ctaItems.map((cta: Record<string, any>, index: number) => ({
        id: cta.id || `${prefix}-cta-${index}`,
        label: resolveField(cta, 'label') || resolveField(cta, 'text'),
        text: resolveField(cta, 'label') || resolveField(cta, 'text'),
        href: (typeof cta.href === 'string' && cta.href) || (typeof cta.url === 'string' && cta.url) || (typeof cta.action === 'string' && cta.action) || '#',
        variant: typeof cta.variant === 'string' ? cta.variant : 'primary',
        size: typeof cta.size === 'string' ? cta.size : 'lg',
        icon: typeof cta.icon === 'string' ? cta.icon : '',
        iconLeft: typeof cta.iconLeft === 'string' ? cta.iconLeft : (typeof cta.icon_left === 'string' ? cta.icon_left : ''),
        iconRight: typeof cta.iconRight === 'string' ? cta.iconRight : (typeof cta.icon_right === 'string' ? cta.icon_right : ''),
        linkType: typeof cta.linkType === 'string'
          ? cta.linkType
          : (typeof cta.link_type === 'string' ? cta.link_type : (typeof cta.action === 'string' && cta.action ? 'action-modal' : 'url')),
        action: typeof cta.action === 'string' ? cta.action : '',
        actionModal: typeof cta.actionModal === 'string' ? cta.actionModal : (typeof cta.action_modal === 'string' ? cta.action_modal : (typeof cta.action === 'string' ? cta.action : '')),
        target: typeof cta.target === 'string' ? cta.target : undefined,
      }))
    : [];
}

export function mapUspGridPresentation(
  data: Record<string, any> | undefined,
  options: SectionPresentationOptions
): UspGridPresentation {
  const { resolveField, introData } = options;

  return {
    introData: buildSharedIntroData(data, resolveField, introData),
    uspVariant: typeof data?.config?.usp?.variant === 'string' && data.config.usp.variant
      ? data.config.usp.variant
      : (typeof data?.usp_variant === 'string' && data.usp_variant ? data.usp_variant : 'default'),
    isSlider: data?.config?.usp?.isSlider !== undefined
      ? Boolean(data.config.usp.isSlider)
      : (data?.is_slider !== undefined ? Boolean(data.is_slider) : false),
    layoutVariant: typeof data?.config?.layoutVariant === 'string' && data.config.layoutVariant
      ? data.config.layoutVariant
      : (typeof data?.layoutVariant === 'string' && data.layoutVariant
        ? data.layoutVariant
        : (typeof data?.layout_variant === 'string' && data.layout_variant ? data.layout_variant : 'default')),
    image: {
      src: typeof data?.config?.image?.src === 'string' ? data.config.image.src : (typeof data?.image?.src === 'string' ? data.image.src : ''),
      alt: typeof data?.config?.image?.alt === 'string' ? data.config.image.alt : (typeof data?.image?.alt === 'string' ? data.image.alt : ''),
    },
    bgColor: typeof data?.bg_color === 'string' ? data.bg_color : '',
    bgImage: typeof data?.config?.bgImage === 'string' && data.config.bgImage ? data.config.bgImage : (typeof data?.bg_image === 'string' && data.bg_image ? data.bg_image : undefined),
    bgImageMobile: typeof data?.config?.bgImageMobile === 'string' && data.config.bgImageMobile ? data.config.bgImageMobile : (typeof data?.bg_image_mobile === 'string' && data.bg_image_mobile ? data.bg_image_mobile : undefined),
    bgPositionClasses: typeof data?.config?.bgPositionClasses === 'string' && data.config.bgPositionClasses ? data.config.bgPositionClasses : (typeof data?.bg_position_classes === 'string' && data.bg_position_classes ? data.bg_position_classes : 'bg-right-top md:bg-right'),
    bgSizeClass: typeof data?.config?.bgSizeClass === 'string' && data.config.bgSizeClass ? data.config.bgSizeClass : (typeof data?.bg_size_class === 'string' && data.bg_size_class ? data.bg_size_class : 'bg-cover'),
    uspList: Array.isArray(data?.items)
      ? data.items.map((item: Record<string, any>, index: number) => ({
          id: item.id || `usp-item-${index}`,
          iconURL: (typeof item.iconURL === 'string' && item.iconURL)
            || (typeof item.iconUrl === 'string' && item.iconUrl)
            || (typeof item.icon_url === 'string' && item.icon_url)
            || (typeof item.icon === 'string' ? item.icon : undefined),
          title: resolveField(item, 'title'),
          description: resolveField(item, 'description'),
        }))
      : [],
    ctaList: mapCtaList(data?.cta_list || data?.ctaList, resolveField, 'usp-grid'),
    slidesPerViewDesktop: data?.config?.usp?.slidesPerViewDesktop ?? data?.slides_per_view_desktop ?? 4,
    slidesPerViewMobile: data?.config?.usp?.slidesPerViewMobile ?? data?.slides_per_view_mobile ?? 1.2,
    gridColsDesktop: data?.config?.usp?.gridColsDesktop ?? data?.grid_cols_desktop ?? 4,
    gridColsMobile: data?.config?.usp?.gridColsMobile ?? data?.grid_cols_mobile ?? 1,
  };
}

export function mapBusinessTabPresentation(
  data: Record<string, any> | undefined,
  options: SectionPresentationOptions
): BusinessTabPresentation {
  const { resolveField, introData } = options;

  return {
    introData: buildSharedIntroData(data, resolveField, introData),
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
