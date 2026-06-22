import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import prisma from '@config/database';
import { AppError, ErrorCode } from '../types/error.types';
import { COMPONENT_SCHEMAS } from '@/schemas/components';
import { sanitizeComponentByType } from '../utils/componentSanitizer';
import {
  COMPONENT_TYPE_MAP,
  ALL_COMPONENT_TYPES,
  getDefaultComponentData,
} from '../constants/componentDefaults';
import { syncComponentInstance } from '../pageBuilder/migrationEngine';
import { getComponentSchema } from '../pageBuilder/schemaRegistry';
import { ComponentVisibilityService } from './componentVisibility.service';
import { isSafeObjectKey } from '../utils/securityInput.util';

// Initialize Ajv
const ajv = new Ajv({ allErrors: false, verbose: false });
addFormats(ajv);

// Compile all schemas
const compiledSchemas = new Map<string, ValidateFunction>();
Object.keys(COMPONENT_SCHEMAS).forEach((key) => {
  if (isSafeObjectKey(key)) {
    compiledSchemas.set(key, ajv.compile(COMPONENT_SCHEMAS[key]));
  }
});

const getCompiledSchema = (componentType: string): ValidateFunction | undefined => {
  switch (componentType) {
    case 'hero-section': return compiledSchemas.get('hero-section');
    case 'text-block': return compiledSchemas.get('text-block');
    case 'image-gallery': return compiledSchemas.get('image-gallery');
    case 'call-to-action': return compiledSchemas.get('call-to-action');
    case 'video-embed': return compiledSchemas.get('video-embed');
    case 'accordion': return compiledSchemas.get('accordion');
    case 'tabs': return compiledSchemas.get('tabs');
    case 'testimonials': return compiledSchemas.get('testimonials');
    case 'team-grid': return compiledSchemas.get('team-grid');
    case 'stats-counter': return compiledSchemas.get('stats-counter');
    case 'pricing-table': return compiledSchemas.get('pricing-table');
    case 'contact-form': return compiledSchemas.get('contact-form');
    case 'latest-news': return compiledSchemas.get('latest-news');
    case 'custom-html': return compiledSchemas.get('custom-html');
    default: return undefined;
  }
};

const assertComponentDataBounds = (root: unknown): void => {
  const stack: Array<{ value: unknown; depth: number }> = [{ value: root, depth: 0 }];
  const visited = new WeakSet<object>();
  let nodeCount = 0;

  while (stack.length > 0) {
    const current = stack.pop()!;
    nodeCount += 1;

    if (nodeCount > 5000 || current.depth > 20) {
      throw new AppError('Component data is too large or deeply nested', 400);
    }

    if (typeof current.value === 'string' && current.value.length > 1_000_000) {
      throw new AppError('Component text value is too large', 400);
    }

    if (current.value === null || typeof current.value !== 'object') continue;
    if (visited.has(current.value)) {
      throw new AppError('Component data must not contain circular references', 400);
    }
    visited.add(current.value);

    const values = Array.isArray(current.value)
      ? current.value
      : Object.values(current.value as Record<string, unknown>);

    if (values.length > 500) {
      throw new AppError('Component data contains too many items', 400);
    }

    for (const value of values) {
      stack.push({ value, depth: current.depth + 1 });
    }
  }
};

export interface GetComponentsQuery {
  pageId: string;
  includeHidden?: boolean;
}

export interface CreateComponentDTO {
  pageId: string;
  componentType: string;
  componentData: any;
  order?: number;
  isVisible?: boolean;
}

export interface UpdateComponentDTO {
  componentType?: string;
  componentData?: any;
  order?: number;
  isVisible?: boolean;
}

export interface ReorderComponentsDTO {
  components: Array<{ id: string; order: number }>;
}

export class ComponentService {
  /**
   * Validate component data against schema
   * Falls back to basic validation for new component types without JSON schema
   */
  static validateComponentData(componentType: string, data: any): void {
    if (!isSafeObjectKey(componentType) || !Object.prototype.hasOwnProperty.call(COMPONENT_TYPE_MAP, componentType)) {
      throw new AppError(`Unknown component type: ${componentType}`, 400);
    }

    assertComponentDataBounds(data);
    const validate = getCompiledSchema(componentType);
    
    if (!validate) {
      // For new page builder component types, do basic validation
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new AppError('Component data must be an object', 400);
      }
      return; // Pass - component type is registered
    }

    const valid = validate(data);
    
    if (!valid) {
      const errors = validate.errors?.map((err: any) => ({
        field: String(err.instancePath || err.dataPath || err.schemaPath || ''),
        message: String(err.message || 'Invalid value'),
        params: JSON.stringify(err.params || {}),
      }));
      
      throw new AppError(
        'Component data validation failed',
        400,
        ErrorCode.VALIDATION_ERROR,
        true,
        { errors: errors || [] }
      );
    }
  }

  /**
   * Get all components for a page
   */
  static async getPageComponents(query: GetComponentsQuery) {
    const { pageId, includeHidden = false } = query;

    const where: any = {
      pageId,
      ...(includeHidden ? {} : { isVisible: true }),
    };

    const components = await prisma.pageComponent.findMany({
      where,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        type: true,
        data: true,
        order: true,
        isVisible: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();

    return components
      .filter((component) => !inactiveKeys.has(component.type))
      .map((component) => ({
        ...component,
        data: syncComponentInstance(component.type, component.data).instance,
      }));
  }

  /**
   * Get single component by ID
   */
  static async getComponentById(id: string) {
    const component = await prisma.pageComponent.findUnique({
      where: { id },
      include: {
        page: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!component) {
      throw new AppError('Component not found', 404);
    }

    return {
      ...component,
      data: syncComponentInstance(component.type, component.data).instance,
    };
  }

  /**
   * Create new component
   */
  static async createComponent(data: CreateComponentDTO) {
    // Validate component type - check both old schemas and new type map
    const hasSafeComponentType = isSafeObjectKey(data.componentType);
    const hasSchema = hasSafeComponentType && compiledSchemas.has(data.componentType);
    const hasTypeMap = hasSafeComponentType && Object.prototype.hasOwnProperty.call(COMPONENT_TYPE_MAP, data.componentType);
    
    if (!hasSchema && !hasTypeMap) {
      throw new AppError(`Unknown component type: ${data.componentType}`, 400);
    }

    await ComponentVisibilityService.assertComponentTypeActive(data.componentType);

    // If no component data provided, use defaults from the type map
    let componentData = data.componentData;
    if (!componentData || Object.keys(componentData).length === 0) {
      const defaults = getDefaultComponentData(data.componentType);
      if (defaults) {
        componentData = defaults;
      }
    }

    assertComponentDataBounds(componentData);

    // Sanitize component data before validation (only for old schema types)
    const sanitizedData = hasSchema
      ? sanitizeComponentByType(data.componentType, componentData)
      : componentData;

    // Validate component data against schema
    this.validateComponentData(data.componentType, sanitizedData);

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: data.pageId },
      select: { id: true },
    });

    if (!page) {
      throw new AppError('Page not found', 404);
    }

    // Get max order if not provided
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await prisma.pageComponent.findFirst({
        where: { pageId: data.pageId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      order = maxOrder ? maxOrder.order + 1 : 0;
    }

    // Create component
    const component = await prisma.pageComponent.create({
      data: {
        pageId: data.pageId,
        type: data.componentType,
        data: syncComponentInstance(data.componentType, sanitizedData, { persistAudit: true }).instance as any,
        order,
        isVisible: data.isVisible ?? true,
      },
    });

    return component;
  }

  /**
   * Update component
   */
  static async updateComponent(id: string, data: UpdateComponentDTO) {
    // Check if component exists
    const existing = await prisma.pageComponent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Component not found', 404);
    }

    // If updating component type or data, validate
    const componentType = data.componentType || existing.type;
    let componentData = data.componentData || existing.data;

    await ComponentVisibilityService.assertComponentTypeActive(componentType);

    // Sanitize component data if being updated
    if (data.componentData) {
      assertComponentDataBounds(data.componentData);
      componentData = sanitizeComponentByType(componentType, data.componentData);
    }

    if (data.componentType || data.componentData) {
      this.validateComponentData(componentType, componentData);
    }

    // Update component
    const component = await prisma.pageComponent.update({
      where: { id },
      data: {
        ...(data.componentType && { type: data.componentType }),
        ...(data.componentData && { data: syncComponentInstance(componentType, componentData, { persistAudit: true }).instance as any }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isVisible !== undefined && { isVisible: data.isVisible }),
      },
    });

    return component;
  }

  /**
   * Delete component
   */
  static async deleteComponent(id: string) {
    // Check if component exists
    const component = await prisma.pageComponent.findUnique({
      where: { id },
    });

    if (!component) {
      throw new AppError('Component not found', 404);
    }

    // Delete component
    await prisma.pageComponent.delete({
      where: { id },
    });

    // Reorder siblings (decrement order for components after deleted one)
    await prisma.pageComponent.updateMany({
      where: {
        pageId: component.pageId,
        order: { gt: component.order },
      },
      data: {
        order: { decrement: 1 },
      },
    });

    return { message: 'Component deleted successfully' };
  }

  /**
   * Reorder components (batch update)
   */
  static async reorderComponents(pageId: string, data: ReorderComponentsDTO) {
    // Verify all components belong to the page
    const components = await prisma.pageComponent.findMany({
      where: {
        id: { in: data.components.map((c) => c.id) },
        pageId,
      },
    });

    if (components.length !== data.components.length) {
      throw new AppError('Some components not found or do not belong to this page', 400);
    }

    // Update orders
    await Promise.all(
      data.components.map((comp) =>
        prisma.pageComponent.update({
          where: { id: comp.id },
          data: { order: comp.order },
        })
      )
    );

    return { message: 'Components reordered successfully' };
  }

  /**
   * Toggle component visibility
   */
  static async toggleVisibility(id: string) {
    const component = await prisma.pageComponent.findUnique({
      where: { id },
      select: { isVisible: true },
    });

    if (!component) {
      throw new AppError('Component not found', 404);
    }

    const updated = await prisma.pageComponent.update({
      where: { id },
      data: { isVisible: !component.isVisible },
    });

    return updated;
  }

  /**
   * Get available component types with schemas and defaults.
   * Filters out INACTIVE entries from ComponentVisibility table.
   * Components not in the table default to ACTIVE (backward compatible).
   */
  static async getComponentTypes() {
    const inactiveKeys = await ComponentVisibilityService.getInactiveComponentKeys();

    return ALL_COMPONENT_TYPES
      .filter((ct) => !inactiveKeys.has(ct.type))
      .map((ct) => ({
        type: ct.type,
        schemaVersion: getComponentSchema(ct.type)?.version || 1,
        fields: getComponentSchema(ct.type)?.fields || [],
        metadata: getComponentSchema(ct.type)?.metadata || {},
        name: ct.name,
        componentPath: ct.componentPath,
        description: ct.description,
        icon: ct.icon,
        category: ct.category,
        defaultData: ct.defaultData,
      }));
  }

  /**
   * Generate component preview HTML (placeholder for now)
   */
  static generatePreview(componentType: string, data: any): string {
    // This would use the same rendering logic as frontend
    // For now, return a simple preview
    return `
      <div class="component-preview" data-type="${componentType}">
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  }
}
