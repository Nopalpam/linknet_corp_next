import {
  asArray,
  getField,
  normalizeIntroData,
  type PresentationMapperOptions,
  readText,
} from './utils';

export interface SharedProductItem {
  id?: string;
  name: string;
  link?: string;
}

export interface SharedServiceItem {
  id?: string;
  title: string;
  description: string;
  link?: string;
  products: SharedProductItem[];
}

export interface SharedSummaryCard {
  id?: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
}

export interface SharedSummaryMetric {
  id?: string;
  label: string;
  value: string;
  change?: string;
}

export function mapListServicesPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): { introData: ReturnType<typeof normalizeIntroData>; services: SharedServiceItem[] } {
  const services = asArray<Record<string, any>>(
    getField(settings, ['services', 'items'], options),
  ).map((service) => ({
    id: readText(service, ['id'], options) || undefined,
    title: readText(service, ['title', 'name', 'label'], options),
    description: readText(service, ['description', 'desc', 'content'], options),
    link: readText(service, ['link', 'href', 'url'], options) || undefined,
    products: asArray<Record<string, any>>(
      getField(service, ['products', 'items'], options),
    ).map((product) => ({
      id: readText(product, ['id'], options) || undefined,
      name: readText(product, ['name', 'title', 'label'], options),
      link: readText(product, ['link', 'href', 'url'], options) || undefined,
    })),
  }));

  return {
    introData: normalizeIntroData(settings, options),
    services,
  };
}

export function mapCardsWithSummaryPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): {
  introData: ReturnType<typeof normalizeIntroData>;
  cards: SharedSummaryCard[];
  highlight: { title: string; metrics: SharedSummaryMetric[] };
} {
  const highlightSource = (getField(settings, ['highlight', 'summary'], options) ?? {}) as Record<string, any>;

  return {
    introData: normalizeIntroData(settings, options),
    cards: asArray<Record<string, any>>(
      getField(settings, ['cards', 'items'], options),
    ).map((card) => ({
      id: readText(card, ['id'], options) || undefined,
      title: readText(card, ['title', 'name', 'label'], options),
      description: readText(card, ['description', 'desc', 'content'], options),
      image: readText(card, ['image', 'imageUrl', 'background_image'], options) || undefined,
      link: readText(card, ['link', 'href', 'url'], options) || undefined,
    })),
    highlight: {
      title: readText(highlightSource, ['title', 'label'], options),
      metrics: asArray<Record<string, any>>(
        getField(highlightSource, ['metrics', 'items'], options),
      ).map((metric) => ({
        id: readText(metric, ['id'], options) || undefined,
        label: readText(metric, ['label', 'title', 'name'], options),
        value: readText(metric, ['value', 'amount'], options),
        change: readText(metric, ['change', 'delta'], options) || undefined,
      })),
    },
  };
}