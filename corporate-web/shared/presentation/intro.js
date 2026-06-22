function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toTrimmedString(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  return '';
}

export function resolveIntroTextValue(value) {
  const directValue = toTrimmedString(value);
  if (directValue) return directValue;

  if (Array.isArray(value)) {
    for (const entry of value) {
      const resolvedEntry = resolveIntroTextValue(entry);
      if (resolvedEntry) return resolvedEntry;
    }
    return '';
  }

  if (!isRecord(value)) {
    return '';
  }

  const priorityKeys = [
    'id',
    'en',
    'label',
    'title',
    'description',
    'desc',
    'text',
    'name',
    'value',
    'content',
  ];

  for (const key of priorityKeys) {
    const resolvedValue = resolveIntroTextValue(value[key]);
    if (resolvedValue) return resolvedValue;
  }

  for (const entry of Object.values(value)) {
    const resolvedValue = resolveIntroTextValue(entry);
    if (resolvedValue) return resolvedValue;
  }

  return '';
}

function resolveFieldValue(source, field, resolveField) {
  if (!field) return '';

  if (typeof resolveField === 'function') {
    const resolvedByCallback = resolveField(source || {}, field);
    const resolvedText = resolveIntroTextValue(resolvedByCallback);
    if (resolvedText) return resolvedText;
  }

  return resolveIntroTextValue(source?.[field]);
}

function resolveIntroCandidate(source, resolveField, candidates) {
  for (const field of candidates) {
    const resolvedValue = resolveFieldValue(source, field, resolveField);
    if (resolvedValue) return resolvedValue;
  }

  return '';
}

export function buildSharedIntroData(source, resolveField, explicitIntro) {
  const introSource = isRecord(explicitIntro) ? explicitIntro : (isRecord(source?.introData) ? source.introData : undefined);

  if (introSource) {
    return {
      as: resolveIntroCandidate(introSource, resolveField, ['as']) || 'h2',
      label: resolveIntroCandidate(introSource, resolveField, ['label', 'pill_text', 'pillText']),
      title: resolveIntroCandidate(introSource, resolveField, ['title', 'heading', 'headline']),
      description: resolveIntroCandidate(introSource, resolveField, ['description', 'desc', 'summary']),
      align: resolveIntroCandidate(introSource, resolveField, ['align']) || 'left',
    };
  }

  if (!isRecord(source)) {
    return undefined;
  }

  const label = resolveIntroCandidate(source, resolveField, ['intro_label', 'label', 'pill_text', 'pillText']);
  const title = resolveIntroCandidate(source, resolveField, ['intro_title', 'title', 'heading', 'headline']);
  const description = resolveIntroCandidate(source, resolveField, ['intro_description', 'description', 'desc', 'summary']);
  const as = resolveIntroCandidate(source, resolveField, ['intro_as', 'as']) || 'h2';
  const align = resolveIntroCandidate(source, resolveField, ['intro_align', 'align']) || 'left';

  if (!label && !title && !description) {
    return undefined;
  }

  return {
    as,
    label,
    title,
    description,
    align,
  };
}

export function hasIntroContent(introData) {
  if (!isRecord(introData)) return false;

  return ['label', 'title', 'description'].some((field) => Boolean(resolveIntroTextValue(introData[field])));
}
