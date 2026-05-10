export type PresentationFieldResolver = (source: Record<string, any> | undefined, field: string) => string;

export type SharedIntroData = {
  as?: string;
  label?: string;
  title?: string;
  description?: string;
  align?: string;
  fluid?: boolean;
  labelClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
};

export const DEFAULT_INTRO_DATA = {
  label: { en: '', id: '' },
  title: { en: '', id: '' },
  description: { en: '', id: '' },
};

export const DEFAULT_SECTION_INTRO = {
  ...DEFAULT_INTRO_DATA,
  as: 'h2',
  align: 'left',
  fluid: false,
  labelClassName: '',
  titleClassName: '',
  descriptionClassName: '',
  className: '',
};

function isIntroRecord(value: any): value is Record<string, any> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function cleanIntroText(value: any): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

export function resolveIntroTextValue(value: any, locale: 'id' | 'en' = 'id'): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (typeof value !== 'object') return '';

  const localized = value[locale] || value.id || value.en || value.label || value.title || value.name;
  return localized == null || typeof localized === 'object' ? '' : String(localized).trim();
}

export function hasIntroContent(introData?: SharedIntroData | null): boolean {
  return Boolean(
    resolveIntroTextValue(introData?.label) ||
    resolveIntroTextValue(introData?.title) ||
    resolveIntroTextValue(introData?.description)
  );
}

function normalizeIntroRecord(
  introRecord: Record<string, any>,
  resolveField: PresentationFieldResolver
): SharedIntroData {
  return {
    as: typeof introRecord.as === 'string' && introRecord.as ? introRecord.as : 'h2',
    label: cleanIntroText(resolveField(introRecord, 'label')),
    title: cleanIntroText(resolveField(introRecord, 'title')),
    description: cleanIntroText(resolveField(introRecord, 'description')),
    align: typeof introRecord.align === 'string' && introRecord.align ? introRecord.align : 'left',
    fluid: Boolean(introRecord.fluid),
    labelClassName: typeof introRecord.labelClassName === 'string' ? introRecord.labelClassName : '',
    titleClassName: typeof introRecord.titleClassName === 'string' ? introRecord.titleClassName : '',
    descriptionClassName: typeof introRecord.descriptionClassName === 'string' ? introRecord.descriptionClassName : '',
    className: typeof introRecord.className === 'string' ? introRecord.className : '',
  };
}

export function buildSharedIntroData(
  data: Record<string, any> | undefined,
  resolveField: PresentationFieldResolver,
  introData?: SharedIntroData
): SharedIntroData {
  const introSource = introData ?? data?.introData ?? data?.sectionIntro ?? data?.intro;

  if (isIntroRecord(introSource)) {
    return normalizeIntroRecord(introSource, resolveField);
  }

  return {
    as: 'h2',
    label: cleanIntroText(resolveField(data, 'label') || resolveField(data, 'intro_label')),
    title: cleanIntroText(resolveField(data, 'title') || resolveField(data, 'intro_title') || resolveField(data, 'name')),
    description: cleanIntroText(resolveField(data, 'description') || resolveField(data, 'intro_description') || resolveField(data, 'content')),
    align: typeof data?.intro_align === 'string' && data.intro_align ? data.intro_align : 'left',
  };
}
