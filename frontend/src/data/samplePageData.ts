/**
 * Sample Page Data Generator
 * 
 * Use this to create sample pages with pre-populated components
 * for testing the Page Builder features
 */

import { ComponentSchema } from '../app/(admin)/pages/components/PageBuilder/SimpleEnhancedContext';

/**
 * Sample Hero Section
 */
export const sampleHeroSection: ComponentSchema = {
  id: 'hero_1',
  type: 'section',
  props: {
    className: 'relative py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden',
  },
  children: [
    {
      id: 'hero_heading',
      type: 'heading',
      props: {
        level: '1',
        text: 'Welcome to Linknet Corporation',
        className: 'text-5xl md:text-6xl font-bold text-center mb-6 animate-fade-in',
      },
    },
    {
      id: 'hero_text',
      type: 'text',
      props: {
        content: 'Experience the future of connectivity with our cutting-edge fiber optic solutions. Fast, reliable, and built for tomorrow.',
        className: 'text-xl text-center max-w-3xl mx-auto mb-10 text-white/90',
      },
    },
    {
      id: 'hero_button',
      type: 'button',
      props: {
        text: 'Get Started Today',
        variant: 'primary',
        className: 'mx-auto block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-2xl',
      },
    },
  ],
};

/**
 * Sample Features Section
 */
export const sampleFeaturesSection: ComponentSchema = {
  id: 'features_1',
  type: 'section',
  props: {
    className: 'py-20 bg-gray-50 dark:bg-gray-900',
  },
  children: [
    {
      id: 'features_heading',
      type: 'heading',
      props: {
        level: '2',
        text: 'Why Choose Linknet?',
        className: 'text-4xl font-bold text-center text-gray-900 dark:text-white mb-4',
      },
    },
    {
      id: 'features_description',
      type: 'text',
      props: {
        content: 'We provide the best internet solutions for your business and home',
        className: 'text-center text-gray-600 dark:text-gray-400 mb-16 text-lg',
      },
    },
    {
      id: 'features_grid',
      type: 'section',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4',
      },
      children: [
        {
          id: 'feature_1',
          type: 'section',
          props: {
            className: 'bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center',
          },
          children: [
            {
              id: 'feature_1_icon',
              type: 'heading',
              props: {
                level: '3',
                text: '⚡ Lightning Fast',
                className: 'text-2xl font-bold mb-4 text-blue-600',
              },
            },
            {
              id: 'feature_1_text',
              type: 'text',
              props: {
                content: 'Up to 1 Gbps fiber optic internet speeds. Stream, game, and work without lag.',
                className: 'text-gray-600 dark:text-gray-300',
              },
            },
          ],
        },
        {
          id: 'feature_2',
          type: 'section',
          props: {
            className: 'bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center',
          },
          children: [
            {
              id: 'feature_2_icon',
              type: 'heading',
              props: {
                level: '3',
                text: '🔒 Ultra Secure',
                className: 'text-2xl font-bold mb-4 text-purple-600',
              },
            },
            {
              id: 'feature_2_text',
              type: 'text',
              props: {
                content: 'Enterprise-grade security with 24/7 monitoring. Your data is always protected.',
                className: 'text-gray-600 dark:text-gray-300',
              },
            },
          ],
        },
        {
          id: 'feature_3',
          type: 'section',
          props: {
            className: 'bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition text-center',
          },
          children: [
            {
              id: 'feature_3_icon',
              type: 'heading',
              props: {
                level: '3',
                text: '💎 99.9% Uptime',
                className: 'text-2xl font-bold mb-4 text-pink-600',
              },
            },
            {
              id: 'feature_3_text',
              type: 'text',
              props: {
                content: 'Guaranteed reliability with redundant connections. Stay online when it matters most.',
                className: 'text-gray-600 dark:text-gray-300',
              },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Sample Image + Text Section
 */
export const sampleContentSection: ComponentSchema = {
  id: 'content_1',
  type: 'section',
  props: {
    className: 'py-20 px-4',
  },
  children: [
    {
      id: 'content_grid',
      type: 'section',
      props: {
        className: 'grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto',
      },
      children: [
        {
          id: 'content_image',
          type: 'image',
          props: {
            src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
            alt: 'Modern fiber optic technology',
            className: 'rounded-2xl shadow-2xl w-full object-cover',
          },
        },
        {
          id: 'content_text_section',
          type: 'section',
          props: {
            className: 'space-y-6',
          },
          children: [
            {
              id: 'content_heading',
              type: 'heading',
              props: {
                level: '2',
                text: 'Next-Generation Technology',
                className: 'text-3xl font-bold text-gray-900 dark:text-white',
              },
            },
            {
              id: 'content_text',
              type: 'text',
              props: {
                content: 'Our state-of-the-art fiber optic network delivers unprecedented speeds and reliability. Built with the latest technology to support your digital lifestyle.',
                className: 'text-lg text-gray-600 dark:text-gray-300 leading-relaxed',
              },
            },
            {
              id: 'content_divider',
              type: 'divider',
              props: {
                className: 'my-6',
              },
            },
            {
              id: 'content_list',
              type: 'text',
              props: {
                content: '✓ Symmetrical upload/download speeds\n✓ No data caps or throttling\n✓ Free installation & setup\n✓ 24/7 customer support',
                className: 'text-gray-700 dark:text-gray-300 space-y-2 whitespace-pre-line',
              },
            },
            {
              id: 'content_cta',
              type: 'button',
              props: {
                text: 'Learn More About Our Plans',
                variant: 'secondary',
                className: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition',
              },
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Sample CTA Section
 */
export const sampleCTASection: ComponentSchema = {
  id: 'cta_1',
  type: 'section',
  props: {
    className: 'py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
  },
  children: [
    {
      id: 'cta_content',
      type: 'section',
      props: {
        className: 'text-center max-w-4xl mx-auto px-4',
      },
      children: [
        {
          id: 'cta_heading',
          type: 'heading',
          props: {
            level: '2',
            text: 'Ready to Experience Ultra-Fast Internet?',
            className: 'text-4xl font-bold mb-6',
          },
        },
        {
          id: 'cta_text',
          type: 'text',
          props: {
            content: 'Join thousands of satisfied customers who have already made the switch. Special offer: Get 3 months free when you sign up today!',
            className: 'text-xl mb-10 text-white/90',
          },
        },
        {
          id: 'cta_button',
          type: 'button',
          props: {
            text: 'Start Your Free Trial',
            variant: 'primary',
            className: 'bg-white text-indigo-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition shadow-2xl inline-block',
          },
        },
      ],
    },
  ],
};

/**
 * Sample Testimonial Section
 */
export const sampleTestimonialSection: ComponentSchema = {
  id: 'testimonial_1',
  type: 'section',
  props: {
    className: 'py-20 bg-white dark:bg-gray-900',
  },
  children: [
    {
      id: 'testimonial_heading',
      type: 'heading',
      props: {
        level: '2',
        text: 'What Our Customers Say',
        className: 'text-4xl font-bold text-center text-gray-900 dark:text-white mb-16',
      },
    },
    {
      id: 'testimonial_card',
      type: 'section',
      props: {
        className: 'max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-10 rounded-2xl shadow-xl',
      },
      children: [
        {
          id: 'testimonial_quote',
          type: 'text',
          props: {
            content: '"Switching to Linknet was the best decision we made for our business. The speed is incredible, and the customer service is top-notch. Highly recommended!"',
            className: 'text-2xl italic text-gray-700 dark:text-gray-300 mb-8 leading-relaxed',
          },
        },
        {
          id: 'testimonial_divider',
          type: 'divider',
          props: {
            className: 'my-6',
          },
        },
        {
          id: 'testimonial_author',
          type: 'heading',
          props: {
            level: '4',
            text: 'Budi Santoso',
            className: 'text-xl font-bold text-gray-900 dark:text-white',
          },
        },
        {
          id: 'testimonial_position',
          type: 'text',
          props: {
            content: 'CEO, Tech Startup Indonesia',
            className: 'text-gray-600 dark:text-gray-400',
          },
        },
      ],
    },
  ],
};

/**
 * Complete sample page with all sections
 */
export const completeSamplePage: ComponentSchema[] = [
  sampleHeroSection,
  sampleFeaturesSection,
  sampleContentSection,
  sampleCTASection,
  sampleTestimonialSection,
];

/**
 * Helper function to get sample page JSON string
 */
export function getSamplePageJSON(): string {
  return JSON.stringify(completeSamplePage, null, 2);
}

/**
 * Empty starter templates
 */
export const emptyPage: ComponentSchema[] = [];

export const basicPage: ComponentSchema[] = [
  {
    id: 'basic_section',
    type: 'section',
    props: {
      className: 'py-16 px-4',
    },
    children: [
      {
        id: 'basic_heading',
        type: 'heading',
        props: {
          level: '1',
          text: 'Your Page Title',
          className: 'text-4xl font-bold text-center text-gray-900 dark:text-white mb-6',
        },
      },
      {
        id: 'basic_text',
        type: 'text',
        props: {
          content: 'Start building your page by adding components from the left panel.',
          className: 'text-center text-gray-600 dark:text-gray-400',
        },
      },
    ],
  },
];
