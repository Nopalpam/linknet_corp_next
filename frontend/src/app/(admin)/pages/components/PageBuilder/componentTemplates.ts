/**
 * Component Templates - Simplified Version (NO ERRORS)
 * 
 * Pre-made component structures that users can quickly add to their pages.
 * Templates are JSON-based and generate with unique IDs on instantiation.
 */

import { ComponentSchema } from './SimpleEnhancedContext';

/**
 * Helper: Generate unique component ID
 */
function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Template schema type (without IDs)
 */
type TemplateSchema = Omit<ComponentSchema, 'id' | 'children'> & {
  children?: TemplateSchema[];
};

/**
 * Helper: Add IDs to template schema recursively
 */
function instantiateTemplate(schema: TemplateSchema): ComponentSchema {
  return {
    ...schema,
    id: generateId(),
    children: schema.children?.map(instantiateTemplate),
  };
}

/**
 * Template category type
 */
export type TemplateCategory = 'hero' | 'content' | 'cta' | 'feature' | 'testimonial' | 'other';

/**
 * Template interface
 */
export interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  schema: TemplateSchema[]; // Array of components without IDs
}

/**
 * All available templates
 */
export const componentTemplates: ComponentTemplate[] = [
  {
    id: 'hero-centered',
    name: 'Hero - Centered',
    description: 'Centered hero section with heading, text, and button',
    category: 'hero',
    schema: [
      {
        type: 'section',
        props: {
          className: 'py-20 text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white',
        },
        children: [
          {
            type: 'heading',
            props: {
              level: '1',
              text: 'Welcome to Our Amazing Service',
              className: 'text-5xl font-bold mb-6',
            },
          },
          {
            type: 'text',
            props: {
              content: 'Discover the future of web development with our cutting-edge platform',
              className: 'text-xl mb-8 max-w-2xl mx-auto',
            },
          },
          {
            type: 'button',
            props: {
              text: 'Get Started',
              variant: 'primary',
              className: 'bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold',
            },
          },
        ],
      },
    ],
  },
  
  {
    id: 'two-column-image-text',
    name: 'Two Column - Image & Text',
    description: 'Side-by-side layout with image and text content',
    category: 'content',
    schema: [
      {
        type: 'section',
        props: {
          className: 'grid grid-cols-2 gap-12 items-center py-16',
        },
        children: [
          {
            type: 'image',
            props: {
              src: 'https://via.placeholder.com/600x400',
              alt: 'Feature image',
              className: 'rounded-lg shadow-lg',
            },
          },
          {
            type: 'section',
            props: {
              className: 'space-y-6',
            },
            children: [
              {
                type: 'heading',
                props: {
                  level: '2',
                  text: 'Powerful Features',
                  className: 'text-3xl font-bold',
                },
              },
              {
                type: 'text',
                props: {
                  content: 'Our platform provides everything you need to build modern web applications. Fast, reliable, and easy to use.',
                  className: 'text-gray-600 text-lg',
                },
              },
              {
                type: 'button',
                props: {
                  text: 'Learn More',
                  variant: 'secondary',
                  className: 'bg-blue-600 text-white px-6 py-2 rounded',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  
  {
    id: 'cta-simple',
    name: 'Call to Action - Simple',
    description: 'Simple CTA section with heading and button',
    category: 'cta',
    schema: [
      {
        type: 'section',
        props: {
          className: 'bg-blue-600 text-white text-center py-16 rounded-lg',
        },
        children: [
          {
            type: 'heading',
            props: {
              level: '2',
              text: 'Ready to Get Started?',
              className: 'text-4xl font-bold mb-4',
            },
          },
          {
            type: 'text',
            props: {
              content: 'Join thousands of satisfied customers today',
              className: 'text-xl mb-8',
            },
          },
          {
            type: 'button',
            props: {
              text: 'Start Your Free Trial',
              variant: 'primary',
              className: 'bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold',
            },
          },
        ],
      },
    ],
  },
  
  {
    id: 'feature-grid-3',
    name: 'Feature Grid - 3 Columns',
    description: 'Grid layout with 3 feature cards',
    category: 'feature',
    schema: [
      {
        type: 'section',
        props: {
          className: 'py-16',
        },
        children: [
          {
            type: 'heading',
            props: {
              level: '2',
              text: 'Why Choose Us',
              className: 'text-3xl font-bold text-center mb-12',
            },
          },
          {
            type: 'section',
            props: {
              className: 'grid grid-cols-3 gap-8',
            },
            children: [
              {
                type: 'section',
                props: {
                  className: 'text-center p-6 border rounded-lg',
                },
                children: [
                  {
                    type: 'heading',
                    props: {
                      level: '3',
                      text: '⚡ Fast',
                      className: 'text-xl font-bold mb-4',
                    },
                  },
                  {
                    type: 'text',
                    props: {
                      content: 'Lightning-fast performance that your users will love',
                      className: 'text-gray-600',
                    },
                  },
                ],
              },
              {
                type: 'section',
                props: {
                  className: 'text-center p-6 border rounded-lg',
                },
                children: [
                  {
                    type: 'heading',
                    props: {
                      level: '3',
                      text: '🔒 Secure',
                      className: 'text-xl font-bold mb-4',
                    },
                  },
                  {
                    type: 'text',
                    props: {
                      content: 'Enterprise-grade security to protect your data',
                      className: 'text-gray-600',
                    },
                  },
                ],
              },
              {
                type: 'section',
                props: {
                  className: 'text-center p-6 border rounded-lg',
                },
                children: [
                  {
                    type: 'heading',
                    props: {
                      level: '3',
                      text: '💎 Reliable',
                      className: 'text-xl font-bold mb-4',
                    },
                  },
                  {
                    type: 'text',
                    props: {
                      content: '99.9% uptime guaranteed with 24/7 support',
                      className: 'text-gray-600',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    description: 'Single testimonial with quote and author',
    category: 'testimonial',
    schema: [
      {
        type: 'section',
        props: {
          className: 'bg-gray-50 p-8 rounded-lg shadow-md max-w-2xl mx-auto',
        },
        children: [
          {
            type: 'text',
            props: {
              content: '"This product has completely transformed how we work. Highly recommended!"',
              className: 'text-xl italic text-gray-700 mb-6',
            },
          },
          {
            type: 'divider',
            props: {
              className: 'my-4',
            },
          },
          {
            type: 'heading',
            props: {
              level: '4',
              text: 'John Doe',
              className: 'font-semibold',
            },
          },
          {
            type: 'text',
            props: {
              content: 'CEO, Example Company',
              className: 'text-gray-500',
            },
          },
        ],
      },
    ],
  },
];

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: TemplateCategory): ComponentTemplate[] {
  return componentTemplates.filter(t => t.category === category);
}

/**
 * Get all categories
 */
export function getAllCategories(): TemplateCategory[] {
  return ['hero', 'content', 'cta', 'feature', 'testimonial', 'other'];
}

/**
 * Find template by ID
 */
export function getTemplateById(id: string): ComponentTemplate | undefined {
  return componentTemplates.find(t => t.id === id);
}

/**
 * Instantiate template (add IDs to all components)
 * Returns array of ComponentSchema ready to add to page
 */
export function instantiateTemplateById(id: string): ComponentSchema[] {
  const template = getTemplateById(id);
  if (!template) return [];
  
  return template.schema.map(instantiateTemplate);
}

/**
 * Example usage:
 * 
 * import { instantiateTemplateById } from './componentTemplates';
 * 
 * const components = instantiateTemplateById('hero-centered');
 * components.forEach(comp => addComponent(comp));
 */
