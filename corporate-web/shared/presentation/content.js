import { buildSharedIntroData, resolveIntroTextValue } from './intro';

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

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

function normalizeExplicitCtaList(source, resolveField) {
  const rawList = getCollection(source, ['ctaList', 'cta_list', 'ctaButtons', 'cta_buttons']);

  return rawList
    .map((item) => {
      const label = resolveFirstField(item, ['label', 'text', 'cta_text', 'button_text', 'title'], resolveField);

      return {
        ...item,
        label,
        text: label,
        href: resolveIntroTextValue(item?.href ?? item?.url ?? item?.link ?? item?.cta_link ?? item?.button_link),
        target: resolveIntroTextValue(item?.target) || '_self',
        variant: resolveIntroTextValue(item?.variant) || 'primary',
        size: resolveIntroTextValue(item?.size) || 'lg',
        iconLeft: resolveIntroTextValue(item?.iconLeft ?? item?.icon_left ?? item?.icon),
        iconRight: resolveIntroTextValue(item?.iconRight ?? item?.icon_right),
      };
    })
    .filter((item) => item.label || item.text);
}

function normalizeDocument(item, resolveField, index) {
  return {
    ...item,
    id: item?.id || `document-${index}`,
    title: resolveFirstField(item, ['title', 'documentName', 'document_name', 'name', 'label', 'filename'], resolveField),
    filename: resolveFirstField(item, ['filename', 'file_name', 'name', 'title', 'documentName', 'document_name'], resolveField),
    url: resolveIntroTextValue(item?.url ?? item?.href ?? item?.file ?? item?.file_url ?? item?.download_url),
    date: resolveFirstField(item, ['date', 'subDesc', 'sub_desc', 'publish_date', 'published_at'], resolveField),
    description: resolveFirstField(item, ['description', 'summary', 'subDesc', 'sub_desc'], resolveField),
  };
}

function normalizeRelatedArticle(item, resolveField, index) {
  const text = resolveFirstField(item, ['text', 'title', 'articleName', 'article_name', 'label', 'name'], resolveField);

  return {
    ...item,
    id: item?.id || `related-article-${index}`,
    text,
    title: text,
    url: resolveIntroTextValue(item?.url ?? item?.href ?? item?.link) || '#',
  };
}

export function mapDocumentListPresentation(data, options = {}) {
  const { resolveField } = options;
  const directDocuments = getCollection(data, ['documents', 'items', 'files', 'document_list']);
  const documentSections = getCollection(data, ['document_sections', 'documentSections']);
  const legacyDocuments = documentSections.filter((item) => (
    !getCollection(item, ['documents', 'items', 'files', 'document_list']).length
  ));
  const documents = [...directDocuments, ...legacyDocuments].map((item, index) => (
    normalizeDocument(item, resolveField, index)
  ));
  const nestedSections = documentSections.filter((item) => (
    getCollection(item, ['documents', 'items', 'files', 'document_list']).length > 0
  ));
  const sections = [...getCollection(data, ['sections']), ...nestedSections].map((section, sectionIndex) => ({
    ...section,
    id: section?.id || `document-section-${sectionIndex}`,
    title: resolveFirstField(section, ['title', 'name', 'heading'], resolveField),
    documents: getCollection(section, ['documents', 'items', 'files', 'document_list']).map((item, index) => (
      normalizeDocument(item, resolveField, index)
    )),
  }));

  return {
    title: resolveFirstField(data, ['title', 'intro_title', 'heading'], resolveField),
    documents,
    sections,
  };
}

export function mapInfoContactsPresentation(data, options = {}) {
  const { resolveField, introData } = options;
  const items = getCollection(data, ['items', 'contacts', 'infoContacts', 'contact_items']).map((item, index) => ({
    ...item,
    id: item?.id || `info-contact-${index}`,
    label: resolveFirstField(item, ['label', 'title', 'name'], resolveField),
    value: resolveFirstField(item, ['value', 'text', 'description', 'content'], resolveField),
    href: resolveIntroTextValue(item?.href ?? item?.url ?? item?.link) || '#',
    target: resolveIntroTextValue(item?.target) || '_self',
    icon: resolveIntroTextValue(item?.icon ?? item?.iconLeft ?? item?.icon_left),
    iconLeft: resolveIntroTextValue(item?.iconLeft ?? item?.icon_left ?? item?.icon),
    iconRight: resolveIntroTextValue(item?.iconRight ?? item?.icon_right),
  }));

  return {
    introData: introData || buildSharedIntroData(data, resolveField),
    items,
  };
}

export function mapInformationListPresentation(data, options = {}) {
  const { resolveField, introData } = options;
  const items = getCollection(data, ['info_sections', 'infoSections', 'items', 'sections', 'information_list', 'informationList']).map((item, index) => ({
    ...item,
    id: item?.id || `information-item-${index}`,
    title: resolveFirstField(item, ['title', 'heading', 'name'], resolveField),
    contents: resolveFirstField(item, ['contents', 'content', 'html', 'description', 'body'], resolveField),
    relatedArticles: getCollection(item, ['relatedArticles', 'related_articles', 'articles']).map((article, articleIndex) => (
      normalizeRelatedArticle(article, resolveField, articleIndex)
    )),
    documents: getCollection(item, ['documents', 'files', 'document_list']).map((document, documentIndex) => (
      normalizeDocument(document, resolveField, documentIndex)
    )),
    ctaList: normalizeExplicitCtaList(item, resolveField),
  }));

  return {
    introData: introData || buildSharedIntroData(data, resolveField),
    items,
  };
}
