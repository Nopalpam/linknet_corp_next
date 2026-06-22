'use client';

import Icon from '@/components/base/Icon';
import SectionIntro from '@/components/base/section/Intro';
import CTAList from '@/components/base/section/CTAList';
import SafeHtml from '@/components/base/SafeHtml';
import { hasIntroContent } from '@/shared/presentation/intro';

/**
 * Built-in generic CMS section components.
 * 
 * These handle CMS types that don't have dedicated component files—
 * they render data directly from the CMS component_data JSON.
 * Registered in componentMap.ts alongside the heavier components.
 */

/* eslint-disable @next/next/no-img-element */

// ─── TextBlock ──────────────────────────────────────────────────────

export function TextBlock({ label, title, description, introData, ctaList = [], className }: {
  label?: string;
  title?: string;
  description?: string;
  introData?: IntroData;
  ctaList?: Array<Record<string, any>>;
  className?: string;
}) {
  const resolvedIntroData = resolveIntroData(introData, title, description);
  const shouldUseLegacyLabel = introData === undefined;
  const introForRender = {
    ...resolvedIntroData,
    label: resolvedIntroData?.label || (shouldUseLegacyLabel ? label : ''),
  };
  const shouldRenderIntro = hasIntroContent(introForRender);

  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {shouldRenderIntro && (
          <SectionIntro
            as={introForRender.as || 'h2'}
            label={introForRender.label || ''}
            title={introForRender.title || ''}
            description={introForRender.description || ''}
            align={introForRender.align || 'left'}
          />
        )}
        <CTAList
          ctaList={ctaList}
          align={resolvedIntroData.align || 'left'}
          className={shouldRenderIntro ? 'mt-6' : ''}
          defaultSize="lg"
        />
      </div>
    </section>
  );
}

// ─── CKEditor (Rich HTML) ───────────────────────────────────────────

export function CKEditorBlock({ content, className }: {
  content?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        <SafeHtml className="detail-post rich-text-content" html={content || ''} />
      </div>
    </section>
  );
}

// ─── Image ──────────────────────────────────────────────────────────

export function ImageBlock({ imageUrl, altText, caption, alignment, className }: {
  imageUrl?: string;
  altText?: string;
  caption?: string;
  alignment?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container" style={{ textAlign: (alignment as any) || 'center' }}>
        {imageUrl && (
          <img src={imageUrl} alt={altText || ''} className="max-w-full rounded-lg" />
        )}
        {caption && <p className="text-caption-c1 text-secondary mt-2">{caption}</p>}
      </div>
    </section>
  );
}

// ─── DocumentList ───────────────────────────────────────────────────

type DocumentItem = {
  id?: string;
  title?: string;
  filename?: string;
  url?: string;
  date?: string;
  description?: string;
};

function DocumentRows({ documents }: { documents: DocumentItem[] }) {
  return documents.map((doc, index) => (
    <div key={doc.id || index} className="flex items-start gap-3 py-4 border-b border-gray-200">
      <div className="min-w-0">
        <div className="text-body-b4 font-bold">{doc.title || doc.filename}</div>
        {(doc.description || doc.date) && (
          <div className="text-body-b5 text-secondary mt-1">{doc.description || doc.date}</div>
        )}
      </div>
      {doc.url && (
        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline ml-auto">
          Download
        </a>
      )}
    </div>
  ));
}

export function DocumentList({ title, documents = [], sections = [], className }: {
  title?: string;
  documents?: DocumentItem[];
  sections?: Array<{ id?: string; title?: string; documents?: DocumentItem[] }>;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && (
          <SectionIntro
            as="h2"
            label=""
            title={title}
            description=""
            align="left"
            className="mb-6"
          />
        )}
        {sections.map((section, index) => (
          <div key={section.id || index} className="mb-8 last:mb-0">
            {section.title && <h3 className="text-headline-h5 mb-3">{section.title}</h3>}
            <DocumentRows documents={Array.isArray(section.documents) ? section.documents : []} />
          </div>
        ))}
        {documents.length > 0 && <DocumentRows documents={documents} />}
      </div>
    </section>
  );
}

// ─── GenericSection (reusable for list_services, card_with_highlight_summary, etc.) ─

type IntroData = {
  as?: string;
  label?: string;
  title?: string;
  description?: string;
  align?: string;
};

type ServiceProduct = {
  id?: string;
  name?: string;
  link?: string;
};

type ServiceItem = {
  id?: string;
  icon?: string;
  title?: string;
  description?: string;
  link?: string;
  ctaText?: string;
  products?: ServiceProduct[];
};

type SummaryCard = {
  id?: string;
  title?: string;
  description?: string;
  image?: string;
  link?: string;
};

type SummaryMetric = {
  id?: string;
  label?: string;
  value?: string;
  change?: string;
};

type SummaryHighlight = {
  title?: string;
  metrics?: SummaryMetric[];
} | null;

function resolveIntroData(introData?: IntroData, title?: string, description?: string): IntroData {
  if (introData !== undefined) {
    return introData || {
      as: 'h2',
      label: '',
      title: '',
      description: '',
      align: 'left',
    };
  }

  return {
    as: 'h2',
    label: '',
    title: title || '',
    description: description || '',
    align: 'left',
  };
}

function getInitials(value?: string) {
  if (!value) return 'S';
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('') || 'S';
}

function ServicesListSection({
  introData,
  services,
  className,
}: {
  introData: IntroData;
  services: ServiceItem[];
  className?: string;
}) {
  const shouldRenderIntro = hasIntroContent(introData);

  return (
    <section className={`lnSection lnSection__listServices bg-light py-16 md:py-24 ${className || ''}`}>
      <div className="container">
        {shouldRenderIntro && (
          <SectionIntro
            as={introData.as || 'h2'}
            label={introData.label || ''}
            title={introData.title || ''}
            description={introData.description || ''}
            align={introData.align || 'left'}
            className="!w-full"
          />
        )}

        <div className={`${shouldRenderIntro ? 'mt-8 md:mt-10' : ''} grid gap-5 md:grid-cols-2 xl:grid-cols-3`}>
          {services.map((service, index) => {
            const hasPrimaryLink = Boolean(service.link);

            return (
              <article
                key={service.id || `service-${index}`}
                className="group flex h-full flex-col rounded-[28px] border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(246,196,71,0.16)] text-sm font-semibold uppercase tracking-[0.14em] text-black">
                    {getInitials(service.title)}
                  </div>

                  {hasPrimaryLink ? (
                    <a
                      href={service.link}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white"
                      aria-label={service.ctaText || service.title || 'Open service'}
                    >
                      <Icon name="arrow-top-right" />
                    </a>
                  ) : null}
                </div>

                <div className="mt-6 flex-1">
                  {service.title ? (
                    <h3 className="text-headline-h5 font-bold text-black leading-tight">
                      {service.title}
                    </h3>
                  ) : null}

                  {service.description ? (
                    <p className="mt-3 text-body-b4 leading-relaxed text-secondary">
                      {service.description}
                    </p>
                  ) : null}
                </div>

                {Array.isArray(service.products) && service.products.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.products.map((product, productIndex) => {
                      const content = (
                        <>
                          <span>{product.name}</span>
                          {product.link ? <Icon name="arrow-top-right" className="text-[12px]" /> : null}
                        </>
                      );

                      return product.link ? (
                        <a
                          key={product.id || `service-${index}-product-${productIndex}`}
                          href={product.link}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-body-b5 font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black hover:text-white"
                        >
                          {content}
                        </a>
                      ) : (
                        <span
                          key={product.id || `service-${index}-product-${productIndex}`}
                          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-body-b5 font-medium text-black"
                        >
                          {product.name}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CardsWithSummarySection({
  introData,
  cards,
  highlight,
  className,
}: {
  introData: IntroData;
  cards: SummaryCard[];
  highlight: SummaryHighlight;
  className?: string;
}) {
  const hasHighlight = Boolean(highlight?.metrics && highlight.metrics.length > 0);
  const shouldRenderIntro = hasIntroContent(introData);

  return (
    <section className={`lnSection lnSection__cardsWithSummary bg-white py-16 md:py-24 ${className || ''}`}>
      <div className="container">
        <div className={`grid gap-8 lg:gap-10 ${hasHighlight ? 'xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)] xl:items-start' : ''}`}>
          <div>
            {shouldRenderIntro && (
              <SectionIntro
               as={introData.as || 'h2'}
                label={introData.label || ''}
                title={introData.title || ''}
                description={introData.description || ''}
                align={introData.align || 'left'}
                className="!w-full"
              />
            )}

            {cards.length > 0 ? (
              <div className={`${shouldRenderIntro ? 'mt-8 md:mt-10' : ''} grid gap-5 md:grid-cols-2`}>
                {cards.map((card, index) => {
                  const cardContent = (
                    <>
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={card.title || `Card ${index + 1}`}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(246,196,71,0.35),_transparent_45%),linear-gradient(135deg,_#1f2937,_#0f172a)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/85" />
                      <div className="relative flex min-h-[320px] flex-col justify-end p-6 md:p-8">
                        {card.title ? (
                          <h3 className="text-headline-h4 font-bold leading-tight text-white">
                            {card.title}
                          </h3>
                        ) : null}

                        {card.description ? (
                          <p className="mt-3 text-body-b4 leading-relaxed text-white/80">
                            {card.description}
                          </p>
                        ) : null}

                        {card.link ? (
                          <div className="mt-6 inline-flex items-center gap-2 text-body-b4 font-semibold text-white">
                            <span>Explore service</span>
                            <Icon name="arrow-top-right" />
                          </div>
                        ) : null}
                      </div>
                    </>
                  );

                  return card.link ? (
                    <a
                      key={card.id || `summary-card-${index}`}
                      href={card.link}
                      className="group relative block overflow-hidden rounded-[32px]"
                    >
                      {cardContent}
                    </a>
                  ) : (
                    <div
                      key={card.id || `summary-card-${index}`}
                      className="group relative overflow-hidden rounded-[32px]"
                    >
                      {cardContent}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {hasHighlight ? (
            <aside className="rounded-[32px] border border-neutral-200 bg-neutral-50 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.05)] md:p-8">
              {highlight?.title ? (
                <h3 className="text-headline-h5 font-bold text-black">
                  {highlight.title}
                </h3>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {highlight?.metrics?.map((metric, index) => (
                  <div
                    key={metric.id || `summary-metric-${index}`}
                    className="rounded-[24px] border border-neutral-200 bg-white p-5"
                  >
                    {metric.label ? (
                      <p className="text-caption-c1 font-semibold uppercase tracking-[0.12em] text-secondary">
                        {metric.label}
                      </p>
                    ) : null}

                    {metric.value ? (
                      <p className="mt-3 text-headline-h4 font-bold text-black">
                        {metric.value}
                      </p>
                    ) : null}

                    {metric.change ? (
                      <p className="mt-2 text-body-b5 font-medium text-[#047857]">
                        {metric.change}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function GenericSection({ title, description, className, variant, introData, services, cards, highlight }: {
  title?: string;
  description?: string;
  className?: string;
  variant?: string;
  introData?: IntroData;
  services?: ServiceItem[];
  cards?: SummaryCard[];
  highlight?: SummaryHighlight;
}) {
  const resolvedIntroData = resolveIntroData(introData, title, description);
  const shouldRenderIntro = hasIntroContent(resolvedIntroData);

  if (variant === 'list-services' && Array.isArray(services) && services.length > 0) {
    return (
      <ServicesListSection
        introData={resolvedIntroData}
        services={services}
        className={className}
      />
    );
  }

  if (
    variant === 'card-with-highlight-summary' &&
    ((Array.isArray(cards) && cards.length > 0) || (highlight?.metrics && highlight.metrics.length > 0))
  ) {
    return (
      <CardsWithSummarySection
        introData={resolvedIntroData}
        cards={Array.isArray(cards) ? cards : []}
        highlight={highlight || null}
        className={className}
      />
    );
  }

  if (!shouldRenderIntro) return null;

  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        <SectionIntro
          as={resolvedIntroData.as || 'h2'}
          label={resolvedIntroData.label || ''}
          title={resolvedIntroData.title || ''}
          description={resolvedIntroData.description || ''}
          align={resolvedIntroData.align || 'left'}
        />
      </div>
    </section>
  );
}

// ─── AnnouncementList ───────────────────────────────────────────────

export function AnnouncementList({ title, className }: {
  title?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && (
          <SectionIntro
            as="h2"
            label=""
            title={title}
            description=""
            align="left"
            className="mb-6"
          />
        )}
        <p className="text-body-b4 text-secondary">Announcements</p>
      </div>
    </section>
  );
}

// ─── TradingViewWidget ──────────────────────────────────────────────

export function TradingViewWidget({ title, className }: {
  title?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && (
          <SectionIntro
            as="h2"
            label=""
            title={title}
            description=""
            align="left"
            className="mb-4"
          />
        )}
        <p className="text-body-b4 text-secondary">Stock overview widget</p>
      </div>
    </section>
  );
}
