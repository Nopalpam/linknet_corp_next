import { buildSharedIntroData, resolveIntroTextValue } from './intro';

function getCollection(source, keys) {
  for (const key of keys) {
    const value = source?.[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function resolveFieldValue(source, field, resolveField) {
  if (!field) return '';

  if (typeof resolveField === 'function') {
    const resolvedValue = resolveField(source || {}, field);
    const resolvedText = resolveIntroTextValue(resolvedValue);
    if (resolvedText) return resolvedText;
  }

  return resolveIntroTextValue(source?.[field]);
}

function resolveFirstField(source, fields, resolveField) {
  for (const field of fields) {
    const resolvedValue = resolveFieldValue(source, field, resolveField);
    if (resolvedValue) return resolvedValue;
  }

  return '';
}

function normalizeCtaList(source, resolveField) {
  const rawList = getCollection(source, ['ctaList', 'cta_list', 'buttons', 'ctaButtons']);
  if (!rawList.length) {
    const label = resolveFirstField(source, ['cta_label', 'button_label', 'cta_text', 'button_text'], resolveField);
    const href = resolveIntroTextValue(source?.cta_href ?? source?.button_href ?? source?.cta_link ?? source?.button_link ?? source?.href ?? source?.url);

    if (!label && !href) return [];

    return [{
      label,
      text: label,
      href: href || '#',
      target: resolveIntroTextValue(source?.target ?? source?.cta_target ?? source?.button_target) || '_self',
      variant: resolveIntroTextValue(source?.variant ?? source?.cta_variant ?? source?.button_variant) || 'primary',
      size: resolveIntroTextValue(source?.size ?? source?.cta_size ?? source?.button_size) || 'lg',
      iconLeft: resolveIntroTextValue(source?.iconLeft ?? source?.icon_left ?? source?.cta_icon_left ?? source?.button_icon_left),
      iconRight: resolveIntroTextValue(source?.iconRight ?? source?.icon_right ?? source?.cta_icon_right ?? source?.button_icon_right ?? source?.icon),
    }];
  }

  return rawList.map((item) => {
    const label = resolveFirstField(item, ['label', 'text', 'cta_text', 'button_text', 'title'], resolveField);

    return {
      ...item,
      label,
      text: label,
      href: resolveIntroTextValue(item?.href ?? item?.url ?? item?.link ?? item?.cta_link ?? item?.button_link) || '#',
      target: resolveIntroTextValue(item?.target) || '_self',
      variant: resolveIntroTextValue(item?.variant) || 'primary',
      size: resolveIntroTextValue(item?.size) || 'lg',
      iconLeft: resolveIntroTextValue(item?.iconLeft ?? item?.icon_left ?? item?.icon),
      iconRight: resolveIntroTextValue(item?.iconRight ?? item?.icon_right),
    };
  });
}

function normalizeUspItem(item, resolveField, index) {
  return {
    ...item,
    id: item?.id || `usp-item-${index}`,
    iconURL: resolveIntroTextValue(item?.iconURL ?? item?.icon_url ?? item?.icon ?? item?.image ?? item?.logo),
    title: resolveFirstField(item, ['title', 'name', 'heading'], resolveField),
    description: resolveFirstField(item, ['description', 'desc', 'content', 'body'], resolveField),
  };
}

export function mapUspGridPresentation(data, options = {}) {
  const { resolveField, introData } = options;
  const uspSettings = data?.config?.usp && typeof data.config.usp === 'object' ? data.config.usp : {};
  const rawImage = data?.image || data?.config?.image || null;
  const image = typeof rawImage === 'string'
    ? { src: rawImage, alt: resolveFirstField(data, ['image_alt', 'title'], resolveField) || 'Section image' }
    : rawImage;

  return {
    layoutVariant: resolveIntroTextValue(data?.layoutVariant ?? data?.layout_variant ?? data?.config?.layoutVariant) || 'default',
    image,
    uspVariant: resolveIntroTextValue(data?.uspVariant ?? data?.usp_variant ?? uspSettings.variant) || 'default',
    isSlider: data?.isSlider ?? data?.is_slider ?? uspSettings.isSlider ?? false,
    slidesPerViewDesktop: Number(data?.slides_per_view_desktop ?? data?.slidesPerViewDesktop ?? uspSettings.slidesPerViewDesktop ?? 4),
    slidesPerViewMobile: Number(data?.slides_per_view_mobile ?? data?.slidesPerViewMobile ?? uspSettings.slidesPerViewMobile ?? 1.2),
    gridColsDesktop: Number(data?.grid_cols_desktop ?? data?.gridColsDesktop ?? uspSettings.gridColsDesktop ?? 4),
    gridColsMobile: Number(data?.grid_cols_mobile ?? data?.gridColsMobile ?? uspSettings.gridColsMobile ?? 1),
    bgColor: resolveIntroTextValue(data?.bgColor ?? data?.bg_color) || '',
    bgImage: resolveIntroTextValue(data?.bgImage ?? data?.bg_image ?? data?.config?.bgImage),
    bgImageMobile: resolveIntroTextValue(data?.bgImageMobile ?? data?.bg_image_mobile ?? data?.config?.bgImageMobile),
    bgPositionClasses: resolveIntroTextValue(data?.bgPositionClasses ?? data?.bg_position_classes ?? data?.config?.bgPositionClasses) || 'bg-center md:bg-center',
    bgSizeClass: resolveIntroTextValue(data?.bgSizeClass ?? data?.bg_size_class ?? data?.config?.bgSizeClass) || 'bg-cover',
    introData: introData || buildSharedIntroData(data, resolveField),
    uspList: getCollection(data, ['uspList', 'usp_list', 'items', 'cards']).map((item, index) => normalizeUspItem(item, resolveField, index)),
    ctaList: normalizeCtaList(data, resolveField),
  };
}

export function mapBusinessTabPresentation(data, options = {}) {
  const { resolveField, introData } = options;
  const items = getCollection(data, ['items', 'tabs', 'slides']).map((item, index) => ({
    ...item,
    id: item?.id || `business-tab-${index}`,
    label: resolveFirstField(item, ['label', 'indicator_label', 'name', 'title'], resolveField),
    title: resolveFirstField(item, ['title', 'heading', 'name'], resolveField),
    desc: resolveFirstField(item, ['desc', 'description', 'content', 'body'], resolveField),
    tagline: resolveFirstField(item, ['tagline', 'pill_text', 'subtitle'], resolveField),
    textCTA: resolveFirstField(item, ['textCTA', 'cta_label', 'button_text', 'cta_text'], resolveField),
    href: resolveIntroTextValue(item?.href ?? item?.url ?? item?.link ?? item?.button_link ?? item?.cta_link) || '#',
    image: resolveIntroTextValue(item?.image ?? item?.background_image),
    imageMobile: resolveIntroTextValue(item?.imageMobile ?? item?.background_image_mobile ?? item?.image_mobile ?? item?.mobile_image),
    logoSrc: resolveIntroTextValue(item?.logoSrc ?? item?.logo_image ?? item?.logoImage ?? item?.logo ?? item?.logo_src),
  }));

  return {
    introData: introData || buildSharedIntroData(data, resolveField),
    items,
  };
}
