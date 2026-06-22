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

function normalizeServiceProduct(item, resolveField, index) {
  return {
    ...item,
    id: item?.id || `service-product-${index}`,
    name: resolveFirstField(item, ['name', 'title', 'label'], resolveField),
    link: resolveIntroTextValue(item?.link ?? item?.href ?? item?.url),
  };
}

export function mapListServicesPresentation(data, options = {}) {
  const { resolveField, introData } = options;
  const services = getCollection(data, ['services', 'items', 'cards']).map((item, index) => ({
    ...item,
    id: item?.id || `service-${index}`,
    icon: resolveIntroTextValue(item?.icon ?? item?.icon_url),
    title: resolveFirstField(item, ['title', 'name', 'heading'], resolveField),
    description: resolveFirstField(item, ['description', 'desc', 'content', 'body'], resolveField),
    link: resolveIntroTextValue(item?.link ?? item?.href ?? item?.url ?? item?.cta_link ?? item?.button_link),
    ctaText: resolveFirstField(item, ['ctaText', 'cta_label', 'button_text', 'cta_text'], resolveField),
    products: getCollection(item, ['products', 'product_list', 'children']).map((product, productIndex) => (
      normalizeServiceProduct(product, resolveField, productIndex)
    )),
  }));

  return {
    variant: 'list-services',
    introData: introData || buildSharedIntroData(data, resolveField),
    services,
  };
}

function normalizeSummaryMetric(item, resolveField, index) {
  return {
    ...item,
    id: item?.id || `summary-metric-${index}`,
    label: resolveFirstField(item, ['label', 'title', 'name'], resolveField),
    value: resolveFirstField(item, ['value', 'amount', 'stat'], resolveField),
    change: resolveFirstField(item, ['change', 'delta', 'caption'], resolveField),
  };
}

export function mapCardsWithSummaryPresentation(data, options = {}) {
  const { resolveField, introData } = options;
  const cards = getCollection(data, ['cards', 'items', 'slides']).map((item, index) => ({
    ...item,
    id: item?.id || `summary-card-${index}`,
    title: resolveFirstField(item, ['title', 'name', 'heading'], resolveField),
    description: resolveFirstField(item, ['description', 'desc', 'content', 'body'], resolveField),
    image: resolveIntroTextValue(item?.image ?? item?.thumbnail ?? item?.background_image),
    link: resolveIntroTextValue(item?.link ?? item?.href ?? item?.url ?? item?.cta_link ?? item?.button_link),
  }));

  const rawHighlight = data?.highlight || data?.summaryHighlight || data?.summary_highlight || {};
  const metrics = getCollection(rawHighlight, ['metrics', 'items', 'stats']).map((item, index) => (
    normalizeSummaryMetric(item, resolveField, index)
  ));

  return {
    variant: 'card-with-highlight-summary',
    introData: introData || buildSharedIntroData(data, resolveField),
    cards,
    highlight: {
      title: resolveFirstField(rawHighlight, ['title', 'heading', 'name'], resolveField),
      metrics,
    },
  };
}
