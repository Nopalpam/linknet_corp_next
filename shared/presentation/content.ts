import type { PresentationFieldResolver, SharedIntroData } from './solutions';

type ContentPresentationOptions = {
  resolveField: PresentationFieldResolver;
  introData?: SharedIntroData;
};

export type SharedDocumentItem = {
  id?: string;
  title?: string;
  filename?: string;
  url?: string;
  date?: string;
  icon?: string;
  fileType?: string;
  year?: string;
};

export type SharedDocumentSection = {
  id?: string;
  title?: string;
  documents: SharedDocumentItem[];
};

export type SharedContactItem = {
  id?: string;
  icon?: string;
  label?: string;
  value?: string;
  href?: string;
  target?: string;
};

export type SharedRelatedArticle = {
  id?: string;
  text?: string;
  url?: string;
};

export type SharedCtaItem = {
  id?: string;
  text?: string;
  href?: string;
  variant?: string;
  size?: string;
};

export type SharedInformationSection = {
  id?: string;
  title?: string;
  contents?: string;
  relatedArticles: SharedRelatedArticle[];
  documents: SharedDocumentItem[];
  ctaList: SharedCtaItem[];
};

export type DocumentListPresentation = {
  title?: string;
  documents: SharedDocumentItem[];
  sections: SharedDocumentSection[];
};

export type InfoContactsPresentation = {
  introData: SharedIntroData;
  items: SharedContactItem[];
};

export type InformationListPresentation = {
  introData: SharedIntroData;
  items: SharedInformationSection[];
};

function buildIntroData(
  data: Record<string, any> | undefined,
  resolveField: PresentationFieldResolver,
  introData?: SharedIntroData
): SharedIntroData {
  if (introData) {
    return introData;
  }

  const introSource = data?.sectionIntro || data?.intro;
  const hasIntroContent = Boolean(
    resolveField(introSource, 'label') ||
    resolveField(introSource, 'title') ||
    resolveField(introSource, 'description')
  );

  if (introSource && typeof introSource === 'object' && hasIntroContent) {
    return {
      as: typeof introSource.as === 'string' && introSource.as ? introSource.as : 'h2',
      label: resolveField(introSource, 'label'),
      title: resolveField(introSource, 'title'),
      description: resolveField(introSource, 'description'),
      align: typeof introSource.align === 'string' && introSource.align ? introSource.align : 'left',
      fluid: Boolean(introSource.fluid),
      labelClassName: typeof introSource.labelClassName === 'string' ? introSource.labelClassName : '',
      titleClassName: typeof introSource.titleClassName === 'string' ? introSource.titleClassName : '',
      descriptionClassName: typeof introSource.descriptionClassName === 'string' ? introSource.descriptionClassName : '',
      className: typeof introSource.className === 'string' ? introSource.className : '',
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

function mapDocumentItem(
  document: Record<string, any> | undefined,
  resolveField: PresentationFieldResolver,
  fallbackId: string
): SharedDocumentItem {
  const fileType = typeof document?.file_type === 'string' ? document.file_type : '';

  return {
    id: document?.id || fallbackId,
    title: resolveField(document, 'title') || (typeof document?.filename === 'string' ? document.filename : ''),
    filename: typeof document?.filename === 'string' ? document.filename : '',
    url: typeof document?.url === 'string' ? document.url : '',
    date: typeof document?.date === 'string' ? document.date : '',
    icon: typeof document?.icon === 'string' ? document.icon : fileType || 'pdf',
    fileType,
    year: document?.year != null ? String(document.year) : '',
  };
}

export function mapDocumentListPresentation(
  data: Record<string, any> | undefined,
  options: ContentPresentationOptions
): DocumentListPresentation {
  const { resolveField } = options;
  const directDocuments = Array.isArray(data?.documents) ? data.documents : [];
  const sections = Array.isArray(data?.sections)
    ? data.sections.map((section: Record<string, any>, index: number) => ({
        id: section.id || `document-section-${index}`,
        title: resolveField(section, 'title') || `Section ${index + 1}`,
        documents: Array.isArray(section.documents)
          ? section.documents.map((document: Record<string, any>, documentIndex: number) => (
              mapDocumentItem(document, resolveField, `document-section-${index}-item-${documentIndex}`)
            ))
          : [],
      }))
    : [];

  const documents = directDocuments.length > 0
    ? directDocuments.map((document: Record<string, any>, index: number) => (
        mapDocumentItem(document, resolveField, `document-item-${index}`)
      ))
    : sections.flatMap((section) => section.documents);

  return {
    title: resolveField(data, 'title') || resolveField(data, 'intro_title'),
    documents,
    sections,
  };
}

export function mapInfoContactsPresentation(
  data: Record<string, any> | undefined,
  options: ContentPresentationOptions
): InfoContactsPresentation {
  const { resolveField, introData } = options;

  return {
    introData: buildIntroData(data, resolveField, introData),
    items: Array.isArray(data?.contact_items)
      ? data.contact_items.map((item: Record<string, any>, index: number) => ({
          id: item.id || `contact-item-${index}`,
          icon: typeof item.icon === 'string' ? item.icon : '',
          label: resolveField(item, 'label'),
          value: resolveField(item, 'value'),
          href: (typeof item.url === 'string' && item.url) || (typeof item.href === 'string' && item.href) || '',
          target: typeof item.target === 'string' && item.target ? item.target : '_blank',
        }))
      : [],
  };
}

export function mapInformationListPresentation(
  data: Record<string, any> | undefined,
  options: ContentPresentationOptions
): InformationListPresentation {
  const { resolveField, introData } = options;

  return {
    introData: buildIntroData(data, resolveField, introData),
    items: Array.isArray(data?.info_sections)
      ? data.info_sections.map((section: Record<string, any>, index: number) => ({
          id: section.id || `info-${index}`,
          title: resolveField(section, 'title'),
          contents: resolveField(section, 'content'),
          relatedArticles: Array.isArray(section.related_articles)
            ? section.related_articles.map((article: Record<string, any>, articleIndex: number) => ({
                id: article.id || `info-${index}-article-${articleIndex}`,
                text: resolveField(article, 'title') || resolveField(article, 'text'),
                url: (typeof article.url === 'string' && article.url) || (typeof article.href === 'string' && article.href) || '#',
              }))
            : [],
          documents: Array.isArray(section.documents)
            ? section.documents.map((document: Record<string, any>, documentIndex: number) => (
                mapDocumentItem(document, resolveField, `info-${index}-document-${documentIndex}`)
              ))
            : [],
          ctaList: Array.isArray(section.cta_list || section.ctaList)
            ? (section.cta_list || section.ctaList).map((cta: Record<string, any>, ctaIndex: number) => ({
                id: cta.id || `info-${index}-cta-${ctaIndex}`,
                text: resolveField(cta, 'text'),
                href: (typeof cta.href === 'string' && cta.href) || (typeof cta.url === 'string' && cta.url) || '#',
                variant: typeof cta.variant === 'string' ? cta.variant : 'primary',
                size: typeof cta.size === 'string' ? cta.size : 'lg',
              }))
            : [],
        }))
      : [],
  };
}
