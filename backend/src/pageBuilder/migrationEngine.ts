import {
  deepClone,
  getComponentSchema,
  getDefaultValues,
  isRecord,
} from './schemaRegistry';

export interface ComponentDataEnvelope {
  _component: string;
  _schema_version: number;
  data: Record<string, any>;
  _synced_at?: string;
  _synced_by?: string;
  _migration_log?: MigrationLogEntry[];
  _migration_errors?: string[];
}

export interface MigrationLogEntry {
  component: string;
  fromVersion: number;
  toVersion: number;
  description: string;
  operations: string[];
  migratedAt: string;
}

export interface ComponentSyncResult {
  instance: ComponentDataEnvelope;
  latestVersion: number;
  originalVersion: number;
  wasOutdated: boolean;
  changed: boolean;
  logs: MigrationLogEntry[];
  errors: string[];
  schemaDiffs: string[];
}

export interface ComponentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface MigrationContext {
  componentType: string;
  fromVersion: number;
  toVersion: number;
  logs: string[];
}

type MigrationOperation =
  | { type: 'addField'; path: string; value: any; overwrite?: boolean }
  | { type: 'renameField'; from: string; to: string; keepSource?: boolean }
  | { type: 'removeField'; path: string; preserve?: boolean }
  | { type: 'transform'; description: string; run: (data: Record<string, any>, context: MigrationContext) => void }
  | { type: 'convertType'; path: string; to: 'boolean' | 'number' | 'string' }
  | { type: 'repeater'; path: string; itemOperations: MigrationOperation[] };

interface ComponentMigration {
  toVersion: number;
  description: string;
  operations: MigrationOperation[];
}

export interface SyncComponentOptions {
  persistAudit?: boolean;
  syncedBy?: string;
}

const HERO_DESKTOP_IMAGE = '/assets/herosliders/mission-desktop.jpg';
const HERO_MOBILE_IMAGE = '/assets/herosliders/mission-mobile.jpg';

function splitPath(path: string): string[] {
  return path.split('.').map((part) => part.trim()).filter(Boolean);
}

function getAtPath(source: Record<string, any>, path: string): any {
  let cursor: any = source;
  for (const part of splitPath(path)) {
    if (!isRecord(cursor) && !Array.isArray(cursor)) return undefined;
    cursor = (cursor as any)[part];
  }
  return cursor;
}

function hasAtPath(source: Record<string, any>, path: string): boolean {
  return getAtPath(source, path) !== undefined;
}

function setAtPath(source: Record<string, any>, path: string, value: any): void {
  const parts = splitPath(path);
  if (parts.length === 0) return;

  let cursor: Record<string, any> = source;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!part) return;
    if (!isRecord(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }

  const leaf = parts[parts.length - 1];
  if (leaf) {
    cursor[leaf] = value;
  }
}

function unsetAtPath(source: Record<string, any>, path: string): void {
  const parts = splitPath(path);
  if (parts.length === 0) return;

  let cursor: any = source;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const part = parts[index];
    if (!isRecord(cursor) || !part) return;
    cursor = cursor[part];
  }

  const leaf = parts[parts.length - 1];
  if (isRecord(cursor) && leaf) {
    delete cursor[leaf];
  }
}

function coerceValue(value: any, targetType: 'boolean' | 'number' | 'string'): any {
  if (targetType === 'boolean') {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    return Boolean(value);
  }

  if (targetType === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value == null) return '';
  return typeof value === 'string' ? value : String(value);
}

function deepMergePreservingCustom(defaults: any, value: any): any {
  if (Array.isArray(defaults)) {
    return Array.isArray(value) ? value : deepClone(defaults);
  }

  if (isRecord(defaults)) {
    const merged: Record<string, any> = { ...deepClone(defaults) };
    if (!isRecord(value)) return merged;

    for (const [key, nextValue] of Object.entries(value)) {
      merged[key] = key in defaults
        ? deepMergePreservingCustom(defaults[key], nextValue)
        : nextValue;
    }

    return merged;
  }

  return value === undefined ? deepClone(defaults) : value;
}

function ensureConfig(data: Record<string, any>): Record<string, any> {
  if (!isRecord(data.config)) data.config = {};
  return data.config;
}

function ensureIntro(data: Record<string, any>): Record<string, any> {
  const intro = data.introData || data.sectionIntro || data.intro;
  if (!isRecord(intro)) {
    data.introData = {};
  } else {
    data.introData = intro;
  }
  delete data.sectionIntro;
  delete data.intro;
  return data.introData;
}

function normalizeLegacyCta(data: Record<string, any>): void {
  const ctaSource = data.ctaList || data.cta_list || data.ctaButtons || data.cta_buttons || data.buttons;
  if (Array.isArray(ctaSource)) {
    data.ctaList = ctaSource.map((item: Record<string, any>, index: number) => ({
      id: item.id || `cta-${index + 1}`,
      ...item,
      label: item.label ?? item.text ?? item.cta_text ?? item.button_text ?? '',
      text: item.text ?? item.label ?? item.cta_text ?? item.button_text ?? '',
      href: item.href ?? item.url ?? item.cta_link ?? item.button_link ?? item.action ?? '',
      action: item.action ?? item.actionModal ?? item.action_modal ?? '',
      action_modal: item.action_modal ?? item.actionModal ?? item.action ?? '',
      iconLeft: item.iconLeft ?? item.icon_left ?? '',
      iconRight: item.iconRight ?? item.icon_right ?? item.icon ?? '',
      variant: item.variant ?? 'primary',
      size: item.size ?? 'lg',
      link_type: item.link_type ?? item.linkType ?? 'url',
      target: item.target ?? '_self',
    }));
  } else {
    const label = data.cta_label ?? data.button_label ?? data.cta_text ?? data.button_text ?? data.textCTA ?? data.ctaText;
    const href = data.cta_href ?? data.button_href ?? data.cta_link ?? data.button_link ?? data.cta_url ?? data.ctaLink;
    if (label || href) {
      data.ctaList = [{
        id: 'cta-1',
        label,
        text: label,
        href: href || '#',
        action: data.cta_action ?? data.button_action ?? data.cta_action_modal ?? data.button_action_modal ?? '',
        action_modal: data.cta_action_modal ?? data.button_action_modal ?? data.cta_action ?? data.button_action ?? '',
        variant: data.cta_variant ?? data.button_variant ?? 'primary',
        size: data.cta_size ?? data.button_size ?? 'lg',
        link_type: data.cta_link_type ?? data.button_link_type ?? 'url',
        target: data.cta_target ?? data.button_target ?? '_self',
      }];
    }
  }
}

function normalizeHero(data: Record<string, any>): void {
  const config = ensureConfig(data);
  const intro = ensureIntro(data);

  config.bgImage = config.bgImage || data.bgImage || data.bg_image || data.background_image || HERO_DESKTOP_IMAGE;
  config.bgImageMobile = config.bgImageMobile || data.bgImageMobile || data.bg_image_mobile || data.background_image_mobile || HERO_MOBILE_IMAGE;
  config.bgPositionClasses = config.bgPositionClasses || data.bg_position_classes || '';
  config.bgSizeClass = config.bgSizeClass || data.bg_size_class || '';

  intro.label = intro.label ?? data.labelText ?? data.pill_text ?? '';
  intro.title = intro.title ?? data.title ?? '';
  intro.description = intro.description ?? data.description ?? '';
  intro.as = intro.as || data.as || 'h2';
  intro.align = intro.align || 'left';

  normalizeLegacyCta(data);
}

function normalizeListReportHome(data: Record<string, any>): void {
  if (!Array.isArray(data.tabs) || data.tabs.length === 0) {
    data.tabs = [
      { label: { en: 'Report', id: 'Laporan' }, value: 'report' },
      { label: { en: 'Announcement', id: 'Pengumuman' }, value: 'announcement' },
    ];
  }

  if (!isRecord(data.items)) {
    data.items = {
      report: [],
      announcement: [],
    };
  }

  for (const tab of data.tabs) {
    const tabValue = isRecord(tab) ? String(tab.value || '').trim() : '';
    if (tabValue && !Array.isArray(data.items[tabValue])) {
      data.items[tabValue] = [];
    }
    if (tabValue && Array.isArray(data.items[tabValue])) {
      data.items[tabValue] = data.items[tabValue].map((item: Record<string, any>, index: number) => {
        const ctaSource = Array.isArray(item.ctaList)
          ? item.ctaList
          : Array.isArray(item.cta_list)
            ? item.cta_list
            : [];

        return {
          id: item.id || `${tabValue}-${index + 1}`,
          title: item.title ?? '',
          desc: item.desc ?? item.description ?? '',
          ctaList: ctaSource,
          year: item.year ?? '',
          ...(item.iconSrc || item.icon_src || item.icon ? { iconSrc: item.iconSrc || item.icon_src || item.icon } : {}),
        };
      });
    }
  }
}

function normalizeContactUsComponent(data: Record<string, any>): void {
  const intro = ensureIntro(data);

  data.show = data.show !== false;
  intro.title = intro.title ?? data.title ?? { en: "We're Here to Help", id: 'Kami Siap Membantu' };
  intro.description = intro.description ?? data.description ?? {
    en: "We're here to assist you with any questions, concerns, or feedback you may have. Connect with us today!",
    id: 'Kami siap membantu pertanyaan, kebutuhan, atau masukan Anda. Hubungi kami hari ini!',
  };
  intro.align = intro.align || 'left';

  ['title', 'description', 'email', 'phone', 'address', 'show_form', 'contact_items'].forEach((key) => {
    if (data[key] !== undefined) delete data[key];
  });
}

function normalizeBusinessTabImages(data: Record<string, any>): void {
  if (!Array.isArray(data.tabs)) return;
  data.tabs = data.tabs.map((tab: Record<string, any>) => ({
    ...tab,
    background_image_mobile: tab.background_image_mobile ?? tab.backgroundImageMobile ?? '',
  }));
}

function normalizeInformationList(data: Record<string, any>): void {
  const sections = Array.isArray(data.info_sections)
    ? data.info_sections
    : Array.isArray(data.sections)
      ? data.sections
      : [];

  data.info_sections = sections.map((section: Record<string, any>, sectionIndex: number) => {
    const documents = Array.isArray(section.documents)
      ? section.documents
      : Array.isArray(section.documentList)
        ? section.documentList
        : [];
    const articles = Array.isArray(section.related_articles)
      ? section.related_articles
      : Array.isArray(section.articles)
        ? section.articles
        : [];

    return {
      id: section.id || `info-section-${sectionIndex + 1}`,
      ...section,
      content: section.content || { en: '', id: '' },
      documents: documents.map((document: Record<string, any>, documentIndex: number) => ({
        id: document.id || `document-${sectionIndex + 1}-${documentIndex + 1}`,
        documentName: document.documentName ?? document.document_name ?? document.title ?? document.name ?? '',
        subDesc: document.subDesc ?? document.sub_desc ?? document.description ?? document.date ?? '',
        url: document.url ?? document.href ?? document.file_url ?? document.fileUrl ?? '#',
      })),
      related_articles: articles.map((article: Record<string, any>, articleIndex: number) => ({
        id: article.id || `article-${sectionIndex + 1}-${articleIndex + 1}`,
        source: article.source || (article.articleId || article.article_id ? 'database' : 'manual'),
        articleId: article.articleId ?? article.article_id ?? '',
        articleName: article.articleName ?? article.article_name ?? article.title ?? article.name ?? '',
        url: article.url ?? article.href ?? article.slug ?? '#',
      })),
      ctaList: Array.isArray(section.ctaList || section.cta_list)
        ? (section.ctaList || section.cta_list)
        : [],
    };
  });
}

function normalizeMapCoverageSettings(data: Record<string, any>): void {
  data.name = data.name || 'home';
  data.source = 'cms_map_coverage';
  if (!isRecord(data.widgetData)) data.widgetData = {};
  const detailedKeys = ['businessUnits', 'business_units', 'provinceMap', 'province_map', 'mapData', 'coverageData'];
  const deprecated = isRecord(data._deprecated) ? data._deprecated : {};
  detailedKeys.forEach((key) => {
    if (data[key] !== undefined) {
      deprecated[key] = data[key];
      delete data[key];
    }
  });
  if (Object.keys(deprecated).length > 0) data._deprecated = deprecated;
}

function normalizeGridCards(data: Record<string, any>): void {
  if (data.layout === 'grid' || data.card_style === undefined) {
    data.card_style = 'cover';
  }
  if (data.type === 'grid') {
    data.card_style = 'cover';
  }
}

function normalizeMilestoneSettings(data: Record<string, any>): void {
  const milestones = Array.isArray(data.milestones)
    ? data.milestones
    : Array.isArray(data.items)
      ? data.items
      : [];

  data.milestones = milestones.map((milestone: Record<string, any>, index: number) => {
    const list = Array.isArray(milestone.list)
      ? milestone.list.map((item: any) => {
        if (isRecord(item)) {
          const text = item.text ?? (
            item.en || item.id
              ? { en: item.en || '', id: item.id || '' }
              : { en: '', id: '' }
          );
          return { text };
        }

        return { text: { en: String(item || ''), id: String(item || '') } };
      })
      : [];

    return {
      ...milestone,
      id: milestone.id || `milestone-${index + 1}`,
      list,
    };
  });
}

function normalizeAboutValuesSettings(data: Record<string, any>): void {
  const items = Array.isArray(data.items) ? data.items : [];

  data.items = items.map((item: Record<string, any>) => {
    const fallbackIcon = item.iconListDefault || 'key';
    const ctaList = Array.isArray(item.ctaList)
      ? item.ctaList
      : Array.isArray(item.cta_list)
        ? item.cta_list
        : [];

    const list = Array.isArray(item.list)
      ? item.list.map((listItem: any) => {
        if (isRecord(listItem)) {
          return {
            icon: listItem.icon || fallbackIcon,
            text: listItem.text ?? { en: '', id: '' },
          };
        }

        return {
          icon: fallbackIcon,
          text: { en: String(listItem || ''), id: String(listItem || '') },
        };
      })
      : [];

    return {
      ...item,
      ctaList,
      list,
    };
  });
}

function normalizeStockInformationSettings(data: Record<string, any>): void {
  data.symbol = typeof data.symbol === 'string' && data.symbol.trim()
    ? data.symbol.trim().toUpperCase()
    : 'LINK.JK';
}

const MIGRATIONS: Record<string, Record<number, ComponentMigration>> = {
  announcement_list: {
    1: {
      toVersion: 1,
      description: 'Normalize announcement list card settings.',
      operations: [{ type: 'transform', description: 'Use cover cards for grid layouts.', run: normalizeGridCards }],
    },
    2: {
      toVersion: 2,
      description: 'Inject schema-safe announcement defaults.',
      operations: [{ type: 'addField', path: 'card_style', value: 'document' }],
    },
  },
  hero: {
    1: {
      toVersion: 1,
      description: 'Move legacy hero fields into canonical intro/config/CTA structures.',
      operations: [{ type: 'transform', description: 'Normalize hero layout and CTA fields.', run: normalizeHero }],
    },
    2: {
      toVersion: 2,
      description: 'Add desktop and mobile hero background image fields.',
      operations: [
        { type: 'addField', path: 'config.bgImage', value: HERO_DESKTOP_IMAGE },
        { type: 'addField', path: 'config.bgImageMobile', value: HERO_MOBILE_IMAGE },
      ],
    },
  },
  hero_section: {
    1: {
      toVersion: 1,
      description: 'Normalize legacy static hero background fields.',
      operations: [
        { type: 'renameField', from: 'background_image', to: 'config.bgImage' },
        { type: 'renameField', from: 'background_image_mobile', to: 'config.bgImageMobile' },
        { type: 'transform', description: 'Normalize hero section intro fields.', run: normalizeHero },
      ],
    },
    2: {
      toVersion: 2,
      description: 'Ensure mobile background image exists.',
      operations: [{ type: 'addField', path: 'config.bgImageMobile', value: HERO_MOBILE_IMAGE }],
    },
  },
  information_list: {
    1: {
      toVersion: 1,
      description: 'Normalize information sections into reusable document/article/CTA structures.',
      operations: [{ type: 'transform', description: 'Normalize information list items.', run: normalizeInformationList }],
    },
    2: {
      toVersion: 2,
      description: 'Inject reusable item-builder defaults.',
      operations: [{ type: 'addField', path: 'info_sections', value: [] }],
    },
  },
  contact_us: {
    1: {
      toVersion: 1,
      description: 'Move Contact Us copy into intro and use centralized contact settings.',
      operations: [{ type: 'transform', description: 'Remove local contact detail fields.', run: normalizeContactUsComponent }],
    },
  },
  business_tab: {
    1: {
      toVersion: 1,
      description: 'Add responsive desktop and mobile background image fields.',
      operations: [{ type: 'transform', description: 'Ensure mobile background image fields exist on tabs.', run: normalizeBusinessTabImages }],
    },
  },
  list_report_home: {
    1: {
      toVersion: 1,
      description: 'Add modular tabs and child item containers.',
      operations: [{ type: 'transform', description: 'Normalize tabs and items by tab value.', run: normalizeListReportHome }],
    },
    2: {
      toVersion: 2,
      description: 'Keep database filters while supporting manual child items.',
      operations: [{ type: 'addField', path: 'source', value: 'cms_reports_announcements' }],
    },
    3: {
      toVersion: 3,
      description: 'Normalize child items to title, desc, CTA list, and year.',
      operations: [{ type: 'transform', description: 'Normalize List Report Home child item fields.', run: normalizeListReportHome }],
    },
  },
  maps_coverage_v1: {
    1: {
      toVersion: 1,
      description: 'Keep Page Builder settings general and move detail data to management module.',
      operations: [{ type: 'transform', description: 'Normalize map coverage general settings.', run: normalizeMapCoverageSettings }],
    },
    2: {
      toVersion: 2,
      description: 'Inject CMS map coverage source flag.',
      operations: [{ type: 'addField', path: 'source', value: 'cms_map_coverage', overwrite: true }],
    },
  },
  milestone: {
    2: {
      toVersion: 2,
      description: 'Normalize milestone repeater list text shape and remove icon-only list defaults.',
      operations: [{ type: 'transform', description: 'Normalize milestone list items.', run: normalizeMilestoneSettings }],
    },
  },
  report_grid: {
    1: {
      toVersion: 1,
      description: 'Normalize report grid cover card settings.',
      operations: [{ type: 'transform', description: 'Use cover card variant for grid.', run: normalizeGridCards }],
    },
    2: {
      toVersion: 2,
      description: 'Inject grid display defaults.',
      operations: [
        { type: 'addField', path: 'card_style', value: 'cover' },
        { type: 'addField', path: 'display_image', value: true },
      ],
    },
  },
  stock_information: {
    2: {
      toVersion: 2,
      description: 'Ensure stock information uses a normalized IDX symbol.',
      operations: [{ type: 'transform', description: 'Normalize stock symbol.', run: normalizeStockInformationSettings }],
    },
  },
  usp_grid_slider: {
    2: {
      toVersion: 2,
      description: 'Add reusable CTA list and per-list-item icon defaults for About Values.',
      operations: [{ type: 'transform', description: 'Normalize About Values items.', run: normalizeAboutValuesSettings }],
    },
  },
};

function applyOperation(data: Record<string, any>, operation: MigrationOperation, context: MigrationContext): void {
  if (operation.type === 'addField') {
    if (operation.overwrite || !hasAtPath(data, operation.path)) {
      setAtPath(data, operation.path, deepClone(operation.value));
      context.logs.push(`add ${operation.path}`);
    }
    return;
  }

  if (operation.type === 'renameField') {
    const value = getAtPath(data, operation.from);
    if (value !== undefined && !hasAtPath(data, operation.to)) {
      setAtPath(data, operation.to, value);
      if (operation.keepSource === false) unsetAtPath(data, operation.from);
      context.logs.push(`rename ${operation.from} -> ${operation.to}`);
    }
    return;
  }

  if (operation.type === 'removeField') {
    const value = getAtPath(data, operation.path);
    if (value !== undefined) {
      if (operation.preserve !== false) {
        const deprecated = isRecord(data._deprecated) ? data._deprecated : {};
        deprecated[operation.path] = value;
        data._deprecated = deprecated;
      }
      unsetAtPath(data, operation.path);
      context.logs.push(`remove ${operation.path}`);
    }
    return;
  }

  if (operation.type === 'convertType') {
    const value = getAtPath(data, operation.path);
    if (value !== undefined) {
      setAtPath(data, operation.path, coerceValue(value, operation.to));
      context.logs.push(`convert ${operation.path} to ${operation.to}`);
    }
    return;
  }

  if (operation.type === 'repeater') {
    const items = getAtPath(data, operation.path);
    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (isRecord(item)) {
          operation.itemOperations.forEach((nestedOperation) => applyOperation(item, nestedOperation, context));
        }
      });
      context.logs.push(`migrate repeater ${operation.path}`);
    }
    return;
  }

  operation.run(data, context);
  context.logs.push(operation.description);
}

function isEnvelope(value: any): value is ComponentDataEnvelope {
  return isRecord(value) && typeof value._component === 'string' && 'data' in value && '_schema_version' in value;
}

function readVersion(value: any): number {
  const rawVersion = Number(value);
  return Number.isFinite(rawVersion) && rawVersion >= 0 ? Math.trunc(rawVersion) : 0;
}

function typesCompatible(expected: string, value: any): boolean {
  if (expected === 'null' || expected === 'unknown') return true;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'boolean') return typeof value === 'boolean';
  if (expected === 'number') return typeof value === 'number';
  if (expected === 'object') return isRecord(value) || typeof value === 'string';
  if (expected === 'string') return typeof value === 'string' || isRecord(value);
  return true;
}

function compareSchemaStructure(
  componentType: string,
  data: Record<string, any>,
): string[] {
  const schema = getComponentSchema(componentType);
  if (!schema) return [];

  const diffs: string[] = [];

  for (const field of schema.fields) {
    const value = getAtPath(data, field.path);
    if (value === undefined) {
      diffs.push(`missing field ${field.path}`);
      continue;
    }

    if (!typesCompatible(field.type, value)) {
      diffs.push(`type mismatch ${field.path}: expected ${field.type}`);
    }
  }

  return diffs;
}

export function unwrapComponentData(componentType: string, payload: any): Record<string, any> {
  if (isEnvelope(payload)) {
    return isRecord(payload.data) ? deepClone(payload.data) : {};
  }

  if (isRecord(payload?.data) && payload?._component === componentType) {
    return deepClone(payload.data);
  }

  return isRecord(payload) ? deepClone(payload) : {};
}

export function validateComponentInstance(componentType: string, payload: any): ComponentValidationResult {
  const schema = getComponentSchema(componentType);
  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown component type: ${componentType}`],
      warnings: [],
    };
  }

  const data = unwrapComponentData(componentType, payload);
  const warnings: string[] = [];

  schema.fields.forEach((field) => {
    const value = getAtPath(data, field.path);
    if (value === undefined) return;
    if (field.type === 'null' || field.type === 'unknown') return;
    if (field.type === 'object' && typeof value === 'string') return;
    if (field.type === 'string' && isRecord(value)) return;
    if (field.type === 'array' && !Array.isArray(value)) warnings.push(`${field.path} should be an array`);
    if (field.type === 'boolean' && typeof value !== 'boolean') warnings.push(`${field.path} should be a boolean`);
    if (field.type === 'number' && typeof value !== 'number') warnings.push(`${field.path} should be a number`);
  });

  return {
    valid: true,
    errors: [],
    warnings,
  };
}

export function syncComponentInstance(
  componentType: string,
  payload: any,
  options: SyncComponentOptions = {},
): ComponentSyncResult {
  const schema = getComponentSchema(componentType);
  const now = new Date().toISOString();
  const latestVersion = schema?.version || 1;
  const existingEnvelope = isEnvelope(payload) ? payload : null;
  const defaults = getDefaultValues(componentType);
  let data = unwrapComponentData(componentType, payload);
  const initialSchemaDiffs = compareSchemaStructure(componentType, data);
  const originalVersion = existingEnvelope
    ? readVersion(existingEnvelope._schema_version)
    : initialSchemaDiffs.length > 0
      ? 0
      : latestVersion;
  const before = JSON.stringify({
    _component: existingEnvelope?._component || componentType,
    _schema_version: originalVersion,
    data,
  });
  const logs: MigrationLogEntry[] = [];
  const errors: string[] = [];

  for (let nextVersion = originalVersion + 1; nextVersion <= latestVersion; nextVersion += 1) {
    const migration = MIGRATIONS[componentType]?.[nextVersion];
    if (!migration) continue;

    const context: MigrationContext = {
      componentType,
      fromVersion: nextVersion - 1,
      toVersion: migration.toVersion,
      logs: [],
    };

    try {
      migration.operations.forEach((operation) => applyOperation(data, operation, context));
      logs.push({
        component: componentType,
        fromVersion: nextVersion - 1,
        toVersion: migration.toVersion,
        description: migration.description,
        operations: context.logs,
        migratedAt: now,
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  data = deepMergePreservingCustom(defaults, data);
  const finalSchemaDiffs = compareSchemaStructure(componentType, data);

  const instance: ComponentDataEnvelope = {
    _component: componentType,
    _schema_version: latestVersion,
    data,
  };

  if (options.persistAudit) {
    instance._synced_at = now;
    instance._synced_by = options.syncedBy || 'system';
    if (logs.length > 0) instance._migration_log = logs;
    if (errors.length > 0) instance._migration_errors = errors;
  } else if (existingEnvelope?._migration_log && existingEnvelope._migration_log.length > 0) {
    instance._migration_log = existingEnvelope._migration_log;
  }

  const after = JSON.stringify({
    _component: instance._component,
    _schema_version: instance._schema_version,
    data: instance.data,
  });
  const dataChanged = before !== after && initialSchemaDiffs.length > 0;
  const wasOutdated = originalVersion < latestVersion || initialSchemaDiffs.length > 0;

  return {
    instance,
    latestVersion,
    originalVersion,
    wasOutdated,
    changed: dataChanged || finalSchemaDiffs.length > 0,
    logs,
    errors,
    schemaDiffs: finalSchemaDiffs.length > 0 ? finalSchemaDiffs : initialSchemaDiffs,
  };
}
