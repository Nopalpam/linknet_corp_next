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

export function resolveIntroTextValue(value: any, locale: 'id' | 'en' = 'id'): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value !== 'object') return '';

  const localized = value[locale] || value.id || value.en || value.label || value.title || value.name;
  return localized == null || typeof localized === 'object' ? '' : String(localized);
}

export function hasIntroContent(introData?: SharedIntroData | null): boolean {
  return Boolean(
    resolveIntroTextValue(introData?.label) ||
    resolveIntroTextValue(introData?.title) ||
    resolveIntroTextValue(introData?.description)
  );
}

export function buildSharedIntroData(
  data: Record<string, any> | undefined,
  resolveField: PresentationFieldResolver,
  introData?: SharedIntroData
): SharedIntroData {
  const introSource = introData || data?.introData || data?.sectionIntro || data?.intro;
  const introRecord = introSource && typeof introSource === 'object'
    ? introSource as Record<string, any>
    : undefined;
  const hasIntroSourceContent = Boolean(
    resolveField(introRecord, 'label') ||
    resolveField(introRecord, 'title') ||
    resolveField(introRecord, 'description')
  );

  if (introRecord && hasIntroSourceContent) {
    return {
      as: typeof introRecord.as === 'string' && introRecord.as ? introRecord.as : 'h2',
      label: resolveField(introRecord, 'label'),
      title: resolveField(introRecord, 'title'),
      description: resolveField(introRecord, 'description'),
      align: typeof introRecord.align === 'string' && introRecord.align ? introRecord.align : 'left',
      fluid: Boolean(introRecord.fluid),
      labelClassName: typeof introRecord.labelClassName === 'string' ? introRecord.labelClassName : '',
      titleClassName: typeof introRecord.titleClassName === 'string' ? introRecord.titleClassName : '',
      descriptionClassName: typeof introRecord.descriptionClassName === 'string' ? introRecord.descriptionClassName : '',
      className: typeof introRecord.className === 'string' ? introRecord.className : '',
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
