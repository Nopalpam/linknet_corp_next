import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { prisma } from '@config/database';
import { AppError } from '@/middleware/error.middleware';
import { COMPONENT_SCHEMAS, COMPONENT_TYPES } from '@/schemas/components';

// Initialize Ajv
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Compile all schemas
const compiledSchemas: Record<string, any> = {};
Object.keys(COMPONENT_SCHEMAS).forEach((key) => {
  compiledSchemas[key] = ajv.compile(COMPONENT_SCHEMAS[key]);
});

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
   */
  static validateComponentData(componentType: string, data: any): void {
    const validate = compiledSchemas[componentType];
    
    if (!validate) {
      throw new AppError(`Unknown component type: ${componentType}`, 400);
    }

    const valid = validate(data);
    
    if (!valid) {
      const errors = validate.errors?.map((err: any) => ({
        field: err.instancePath || err.dataPath,
        message: err.message,
        params: err.params,
      }));
      
      throw new AppError('Component data validation failed', 400, errors);
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

    return components;
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

    return component;
  }

  /**
   * Create new component
   */
  static async createComponent(data: CreateComponentDTO) {
    // Validate component type
    if (!compiledSchemas[data.componentType]) {
      throw new AppError(`Unknown component type: ${data.componentType}`, 400);
    }

    // Validate component data against schema
    this.validateComponentData(data.componentType, data.componentData);

    // Check if page exists
    const page = await prisma.page.findUnique({
      where: { id: data.pageId },
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
        data: data.componentData,
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
    const componentData = data.componentData || existing.data;

    if (data.componentType || data.componentData) {
      this.validateComponentData(componentType, componentData);
    }

    // Update component
    const component = await prisma.pageComponent.update({
      where: { id },
      data: {
        ...(data.componentType && { type: data.componentType }),
        ...(data.componentData && { data: data.componentData }),
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
   * Get available component types with schemas
   */
  static getComponentTypes() {
    return COMPONENT_TYPES;
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
