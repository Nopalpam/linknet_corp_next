export type PresentationFieldResolver = (source: Record<string, any> | undefined, field: string) => string;

export type SharedIntroData = {
  as?: string;
  label?: string;
  title?: string;
  description?: string;
  align?: string;
};

export type SharedServiceProduct = {
  id?: string;
  name?: string;
  link?: string;
};

export type SharedServiceItem = {
  id?: string;
  icon?: string;
  title?: string;
  description?: string;
  link?: string;
  ctaText?: string;
  products?: SharedServiceProduct[];
};

export type SharedSummaryCard = {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
};

export type SharedSummaryMetric = {
  id?: string;
  label?: string;
  value?: string;
  change?: string;
};

export type SharedSummaryHighlight = {
  title?: string;
  metrics?: SharedSummaryMetric[];
} | null;

export type ListServicesPresentation = {
  variant: 'list-services';
  introData: SharedIntroData;
  title?: string;
  description?: string;
  services: SharedServiceItem[];
};

export type CardsWithSummaryPresentation = {
  variant: 'card-with-highlight-summary';
  introData: SharedIntroData;
  title?: string;
  description?: string;
  cards: SharedSummaryCard[];
  highlight: SharedSummaryHighlight;
};

type SolutionsPresentationOptions = {
  resolveField: PresentationFieldResolver;
  introData?: SharedIntroData;
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

export function mapListServicesPresentation(
  data: Record<string, any> | undefined,
  options: SolutionsPresentationOptions
): ListServicesPresentation {
  const { resolveField, introData } = options;
  const normalizedIntro = buildIntroData(data, resolveField, introData);

  return {
    variant: 'list-services',
    introData: normalizedIntro,
    title: normalizedIntro.title || resolveField(data, 'title') || resolveField(data, 'intro_title'),
    description: normalizedIntro.description || resolveField(data, 'description') || resolveField(data, 'intro_description'),
    services: Array.isArray(data?.services)
      ? data.services.map((service: Record<string, any>, index: number) => ({
          id: service.id || `service-${index}`,
          icon: typeof service.icon === 'string' ? service.icon : '',
          title: resolveField(service, 'title'),
          description: resolveField(service, 'description'),
          link: (typeof service.link === 'string' && service.link) || (typeof service.href === 'string' && service.href) || '',
          ctaText: resolveField(service, 'cta_text'),
          products: Array.isArray(service.products)
            ? service.products.map((product: Record<string, any>, productIndex: number) => ({
                id: product.id || `service-${index}-product-${productIndex}`,
                name: resolveField(product, 'name'),
                link: (typeof product.link === 'string' && product.link) || (typeof product.href === 'string' && product.href) || '',
              }))
            : [],
        }))
      : [],
  };
}

export function mapCardsWithSummaryPresentation(
  data: Record<string, any> | undefined,
  options: SolutionsPresentationOptions
): CardsWithSummaryPresentation {
  const { resolveField, introData } = options;
  const normalizedIntro = buildIntroData(data, resolveField, introData);
  const highlightSource = data?.highlight && typeof data.highlight === 'object' ? data.highlight : null;

  return {
    variant: 'card-with-highlight-summary',
    introData: normalizedIntro,
    title: normalizedIntro.title || resolveField(data, 'title') || resolveField(data, 'intro_title'),
    description: normalizedIntro.description || resolveField(data, 'description') || resolveField(data, 'intro_description'),
    cards: Array.isArray(data?.cards)
      ? data.cards.map((card: Record<string, any>, index: number) => ({
          id: card.id || `summary-card-${index}`,
          title: resolveField(card, 'title'),
          description: resolveField(card, 'description'),
          image: typeof card.image === 'string' ? card.image : '',
          link: (typeof card.link === 'string' && card.link) || (typeof card.href === 'string' && card.href) || '',
        }))
      : [],
    highlight: highlightSource
      ? {
          title: resolveField(highlightSource, 'title'),
          metrics: Array.isArray(highlightSource.metrics)
            ? highlightSource.metrics.map((metric: Record<string, any>, index: number) => ({
                id: metric.id || `summary-metric-${index}`,
                label: resolveField(metric, 'label'),
                value: typeof metric.value === 'string' ? metric.value : metric.value != null ? String(metric.value) : '',
                change: typeof metric.change === 'string' ? metric.change : metric.change != null ? String(metric.change) : '',
              }))
            : [],
        }
      : null,
  };
}