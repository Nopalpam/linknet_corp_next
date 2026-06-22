import { ALL_COMPONENT_TYPES } from '../constants/componentDefaults';

export type ComponentFieldType =
  | 'array'
  | 'boolean'
  | 'null'
  | 'number'
  | 'object'
  | 'string'
  | 'unknown';

export interface ComponentFieldDefinition {
  path: string;
  type: ComponentFieldType;
  required: boolean;
  defaultValue: any;
  metadata?: Record<string, any>;
}

export interface ComponentSchemaDefinition {
  component: string;
  name: string;
  version: number;
  fields: ComponentFieldDefinition[];
  defaultValues: Record<string, any>;
  metadata: {
    category: string;
    componentPath?: string;
    description: string;
    icon: string;
    source: 'componentDefaults';
    updatedAt: string;
  };
}

const LATEST_SCHEMA_VERSIONS: Record<string, number> = {
  announcement_list: 2,
  hero: 2,
  hero_section: 3,
  info_contacts: 2,
  information_list: 2,
  list_report_home: 4,
  logo_running: 2,
  logo_running_with_border: 2,
  milestone: 2,
  maps_coverage_v1: 2,
  report_grid: 2,
  solutions_list: 1,
  stock_information: 2,
  tv_channel_list: 2,
  tv_channel_sneak_peek: 2,
  tv_highlight_sliders: 2,
  tv_highlight_sneek_peak: 2,
  usp_grid_slider: 2,
  vision_mission: 2,
};

const REGISTRY_UPDATED_AT = '2026-05-10T00:00:00.000Z';

export function deepClone<T>(value: T): T {
  if (value === undefined || value === null) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

export function isRecord(value: any): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function inferFieldType(value: any): ComponentFieldType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') return 'string';
  if (typeof value === 'object') return 'object';
  return 'unknown';
}

function walkFields(value: any, prefix = ''): ComponentFieldDefinition[] {
  if (!isRecord(value)) return [];

  return Object.entries(value).flatMap(([key, nestedValue]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const definition: ComponentFieldDefinition = {
      path,
      type: inferFieldType(nestedValue),
      required: false,
      defaultValue: deepClone(nestedValue),
    };

    if (isRecord(nestedValue)) {
      return [definition, ...walkFields(nestedValue, path)];
    }

    return [definition];
  });
}

export function getSchemaVersion(componentType: string): number {
  return LATEST_SCHEMA_VERSIONS[componentType] || 1;
}

export function getComponentSchema(componentType: string): ComponentSchemaDefinition | null {
  const component = ALL_COMPONENT_TYPES.find((entry) => entry.type === componentType);
  if (!component) return null;

  const defaultValues = deepClone(component.defaultData || {});

  return {
    component: component.type,
    name: component.name,
    version: getSchemaVersion(component.type),
    fields: walkFields(defaultValues),
    defaultValues,
    metadata: {
      category: component.category,
      componentPath: component.componentPath,
      description: component.description,
      icon: component.icon,
      source: 'componentDefaults',
      updatedAt: REGISTRY_UPDATED_AT,
    },
  };
}

export function getComponentSchemaRegistry(): ComponentSchemaDefinition[] {
  return ALL_COMPONENT_TYPES.map((entry) => getComponentSchema(entry.type)).filter(
    (schema): schema is ComponentSchemaDefinition => Boolean(schema),
  );
}

export function getDefaultValues(componentType: string): Record<string, any> {
  return deepClone(getComponentSchema(componentType)?.defaultValues || {});
}
