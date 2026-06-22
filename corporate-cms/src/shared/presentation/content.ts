import {
  asArray,
  getField,
  normalizeIntroData,
  type PresentationMapperOptions,
  readText,
} from './utils';

export interface SharedContactItem {
  id?: string;
  type?: string;
  icon?: string;
  label: string;
  value: string;
  href?: string;
  target?: string;
}

export interface SharedDocumentItem {
  id?: string;
  title: string;
  filename: string;
  date?: string;
  url?: string;
}

export interface SharedDocumentSection {
  id?: string;
  title: string;
  documents: SharedDocumentItem[];
}

export interface SharedInformationArticle {
  id?: string;
  title: string;
  url?: string;
}

export interface SharedInformationSection {
  id?: string;
  title: string;
  contents: string;
  relatedArticles: SharedInformationArticle[];
  documents: SharedDocumentItem[];
  ctaList: Array<{ id?: string; text: string; href?: string }>;
}

function normalizeExplicitCtaList(
  source: Record<string, any> | undefined,
  options?: PresentationMapperOptions,
): Array<{ id?: string; text: string; href?: string }> {
  const items = asArray<Record<string, any>>(
    getField(source, ['ctaList', 'cta_list', 'ctaButtons', 'cta_buttons'], options),
  );

  return items
    .map((item) => ({
      id: readText(item, ['id'], options) || undefined,
      text: readText(item, ['text', 'label', 'title', 'cta_text', 'button_text'], options),
      href: readText(item, ['href', 'url', 'link', 'action', 'cta_link', 'button_link'], options) || undefined,
    }))
    .filter((item) => item.text);
}

function mapDocumentItem(
  item: Record<string, any>,
  options?: PresentationMapperOptions,
): SharedDocumentItem {
  return {
    id: readText(item, ['id'], options) || undefined,
    title: readText(item, ['title', 'documentName', 'name'], options),
    filename: readText(item, ['filename', 'file_name', 'name'], options),
    date: readText(item, ['date', 'subDesc', 'published_at', 'created_at'], options) || undefined,
    url: readText(item, ['url', 'href', 'link', 'download_url'], options) || undefined,
  };
}

export function mapInfoContactsPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): { introData: ReturnType<typeof normalizeIntroData>; items: SharedContactItem[] } {
  const items = asArray<Record<string, any>>(
    getField(settings, ['contact_items', 'contactItems', 'items', 'contacts'], options),
  ).map((item) => ({
    id: readText(item, ['id'], options) || undefined,
    type: readText(item, ['type'], options) || undefined,
    icon: readText(item, ['icon'], options) || undefined,
    label: readText(item, ['label', 'title', 'name'], options),
    value: readText(item, ['value', 'text', 'description'], options),
    href: readText(item, ['url', 'href', 'link'], options) || undefined,
    target: readText(item, ['target'], options) || undefined,
  }));

  return {
    introData: normalizeIntroData(settings, options),
    items,
  };
}

export function mapInformationListPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): { introData: ReturnType<typeof normalizeIntroData>; items: SharedInformationSection[] } {
  const items = asArray<Record<string, any>>(
    getField(settings, ['info_sections', 'infoSections', 'sections', 'items'], options),
  ).map((item) => ({
    id: readText(item, ['id'], options) || undefined,
    title: readText(item, ['title', 'name'], options),
    contents: readText(item, ['contents', 'content', 'description', 'body'], options),
    relatedArticles: asArray<Record<string, any>>(
      getField(item, ['relatedArticles', 'related_articles', 'articles'], options),
    ).map((article) => ({
      id: readText(article, ['id', 'articleId'], options) || undefined,
      title: readText(article, ['title', 'articleName', 'name', 'text'], options),
      url: readText(article, ['url', 'href', 'link'], options) || undefined,
    })),
    documents: asArray<Record<string, any>>(
      getField(item, ['documents', 'document_list', 'documentList'], options),
    ).map((document) => mapDocumentItem(document, options)),
    ctaList: normalizeExplicitCtaList(item, options),
  }));

  return {
    introData: normalizeIntroData(settings, options),
    items,
  };
}

export function mapDocumentListPresentation(
  settings: Record<string, any>,
  options?: PresentationMapperOptions,
): {
  title: string;
  documents: SharedDocumentItem[];
  sections: SharedDocumentSection[];
} {
  const documents = asArray<Record<string, any>>(
    getField(settings, ['documents', 'document_list', 'documentList', 'items'], options),
  ).map((item) => mapDocumentItem(item, options));

  const sections = asArray<Record<string, any>>(
    getField(settings, ['sections', 'document_sections', 'documentSections'], options),
  ).map((section) => ({
    id: readText(section, ['id'], options) || undefined,
    title: readText(section, ['title', 'name'], options),
    documents: asArray<Record<string, any>>(
      getField(section, ['documents', 'items', 'document_list'], options),
    ).map((document) => mapDocumentItem(document, options)),
  }));

  return {
    title:
      readText(settings, ['title'], options) ||
      normalizeIntroData(settings, options).title,
    documents,
    sections,
  };
}
