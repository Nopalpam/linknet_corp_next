// Registry of all available components for the Page Builder
import React from 'react';
import { 
    FaHeading, 
    FaImage, 
    FaParagraph, 
    FaSquare, 
    FaColumns, 
    FaLink,
    FaBullhorn,
    FaTh,
    FaVideo,
    FaQuoteRight
} from 'react-icons/fa';

export type FieldType = 'text' | 'textarea' | 'image' | 'color' | 'select' | 'number' | 'toggle';

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

export interface ComponentSchema {
  type: string;
  label: string;
  icon: any;
  defaultData: any;
  fields: FieldSchema[];
  category: 'layout' | 'content' | 'media' | 'cta';
}

export const COMPONENT_REGISTRY: Record<string, ComponentSchema> = {
  'hero-section': {
    type: 'hero-section',
    label: 'Hero Section',
    icon: FaBullhorn,
    category: 'layout',
    defaultData: {
      title: 'Welcome to Our Website',
      subtitle: 'We provide the best solutions for your business.',
      backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
      ctaText: 'Get Started',
      ctaLink: '/contact'
    },
    fields: [
      { name: 'title', label: 'Headline', type: 'text' },
      { name: 'subtitle', label: 'Sub Headline', type: 'textarea' },
      { name: 'backgroundImage', label: 'Background Image URL', type: 'image' },
      { name: 'ctaText', label: 'Button Text', type: 'text' },
      { name: 'ctaLink', label: 'Button Link', type: 'text' }
    ]
  },
  'text-block': {
    type: 'text-block',
    label: 'Text Block',
    icon: FaParagraph,
    category: 'content',
    defaultData: {
      content: '<h3>Your heading here</h3><p>Enter your content here. You can format text, add links, and more.</p>'
    },
    fields: [
      { name: 'content', label: 'Content (HTML)', type: 'textarea' }
    ]
  },
  'features-grid': {
    type: 'features-grid',
    label: 'Features Grid',
    icon: FaTh,
    category: 'content',
    defaultData: {
        title: 'Our Amazing Features',
        columns: 3
    },
    fields: [
        { name: 'title', label: 'Section Title', type: 'text' },
        { name: 'columns', label: 'Number of Columns', type: 'number', defaultValue: 3 }
    ]
  },
  'call-to-action': {
    type: 'call-to-action',
    label: 'Call to Action',
    icon: FaLink,
    category: 'cta',
    defaultData: {
        title: 'Ready to Get Started?',
        description: 'Contact us today to learn more about our services',
        buttonText: 'Contact Us Now',
        buttonLink: '/contact',
        backgroundColor: '#f6f8fa'
    },
    fields: [
        { name: 'title', label: 'CTA Title', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'buttonText', label: 'Button Text', type: 'text' },
        { name: 'buttonLink', label: 'Button Link', type: 'text' },
        { name: 'backgroundColor', label: 'Background Color', type: 'color' }
    ]
  }
};

export const COMPONENT_CATEGORIES = [
    { id: 'layout', label: 'Layout' },
    { id: 'content', label: 'Content' },
    { id: 'media', label: 'Media' },
    { id: 'cta', label: 'Call to Action' }
];
