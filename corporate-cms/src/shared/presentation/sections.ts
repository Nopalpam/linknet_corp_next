import {
  asArray,
  getField,
  normalizeCtaList,
  normalizeIntroData,
  type PresentationMapperOptions,
  readText,
} from './utils';

export interface SharedUspItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface SharedBusinessTabItem {
  id?: string;
  label: string;
  title: string;
  desc: string;
  href?: string;
  backgroundImage?: string;
  logoImage?: string;
}

export function mapUspGridPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): {
  introData: ReturnType<typeof normalizeIntroData>;
  uspList: SharedUspItem[];
  ctaList: Array<{ id?: string; text: string; href?: string }>;
  isSlider: boolean;
  uspVariant: string;
} {
  const uspList = asArray<Record<string, any>>(
    getField(settings, ['items', 'uspList', 'usp_list'], options),
  ).map((item) => ({
    id: readText(item, ['id'], options) || undefined,
    title: readText(item, ['title', 'name', 'label'], options),
    description: readText(item, ['description', 'desc', 'content'], options),
    icon: readText(item, ['iconURL', 'icon', 'logo'], options) || undefined,
    image: readText(item, ['image', 'imageUrl', 'background_image'], options) || undefined,
  }));

  return {
    introData: normalizeIntroData(settings, options),
    uspList,
    ctaList: normalizeCtaList(settings, options),
    isSlider: Boolean(getField(settings, ['is_slider', 'isSlider'], options)),
    uspVariant: readText(settings, ['usp_variant', 'uspVariant', 'layoutVariant'], options),
  };
}

export function mapBusinessTabPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): { introData: ReturnType<typeof normalizeIntroData>; items: SharedBusinessTabItem[] } {
  const items = asArray<Record<string, any>>(
    getField(settings, ['tabs', 'items'], options),
  ).map((item) => ({
    id: readText(item, ['id'], options) || undefined,
    label: readText(item, ['name', 'label', 'title'], options),
    title: readText(item, ['title', 'name'], options),
    desc: readText(item, ['description', 'desc', 'content'], options),
    href: readText(item, ['cta_link', 'ctaLink', 'href', 'url', 'link'], options) || undefined,
    backgroundImage: readText(item, ['background_image', 'backgroundImage', 'image'], options) || undefined,
    logoImage: readText(item, ['logo_image', 'logoImage', 'logo'], options) || undefined,
  }));

  return {
    introData: normalizeIntroData(settings, options),
    items,
  };
}