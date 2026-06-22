import heroSection from './hero-section.json';
import textBlock from './text-block.json';
import imageGallery from './image-gallery.json';
import callToAction from './call-to-action.json';
import videoEmbed from './video-embed.json';
import accordion from './accordion.json';
import tabs from './tabs.json';
import testimonials from './testimonials.json';
import teamGrid from './team-grid.json';
import statsCounter from './stats-counter.json';
import pricingTable from './pricing-table.json';
import contactForm from './contact-form.json';
import latestNews from './latest-news.json';
import customHtml from './custom-html.json';

export interface ComponentType {
  type: string;
  name: string;
  description: string;
  icon: string;
  schema: any;
  category: string;
}

export const COMPONENT_SCHEMAS: Record<string, any> = {
  'hero-section': heroSection,
  'text-block': textBlock,
  'image-gallery': imageGallery,
  'call-to-action': callToAction,
  'video-embed': videoEmbed,
  'accordion': accordion,
  'tabs': tabs,
  'testimonials': testimonials,
  'team-grid': teamGrid,
  'stats-counter': statsCounter,
  'pricing-table': pricingTable,
  'contact-form': contactForm,
  'latest-news': latestNews,
  'custom-html': customHtml,
};

export const COMPONENT_TYPES: ComponentType[] = [
  {
    type: 'hero-section',
    name: 'Hero Section',
    description: 'Hero banner with title, subtitle, background image, and CTA',
    icon: 'FaImage',
    category: 'Layout',
    schema: heroSection,
  },
  {
    type: 'text-block',
    name: 'Text Block',
    description: 'Rich text content with WYSIWYG editor',
    icon: 'FaAlignLeft',
    category: 'Content',
    schema: textBlock,
  },
  {
    type: 'image-gallery',
    name: 'Image Gallery',
    description: 'Gallery of images with captions',
    icon: 'FaImages',
    category: 'Media',
    schema: imageGallery,
  },
  {
    type: 'call-to-action',
    name: 'Call to Action',
    description: 'Prominent CTA section with button',
    icon: 'FaBullhorn',
    category: 'Marketing',
    schema: callToAction,
  },
  {
    type: 'video-embed',
    name: 'Video Embed',
    description: 'Embedded video player with poster image',
    icon: 'FaVideo',
    category: 'Media',
    schema: videoEmbed,
  },
  {
    type: 'accordion',
    name: 'Accordion',
    description: 'Collapsible accordion panels',
    icon: 'FaListAlt',
    category: 'Interactive',
    schema: accordion,
  },
  {
    type: 'tabs',
    name: 'Tabs',
    description: 'Tabbed content sections',
    icon: 'FaFolder',
    category: 'Interactive',
    schema: tabs,
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    description: 'Customer testimonials carousel or grid',
    icon: 'FaQuoteLeft',
    category: 'Marketing',
    schema: testimonials,
  },
  {
    type: 'team-grid',
    name: 'Team Grid',
    description: 'Team members display grid',
    icon: 'FaUsers',
    category: 'Content',
    schema: teamGrid,
  },
  {
    type: 'stats-counter',
    name: 'Stats Counter',
    description: 'Animated statistics counters',
    icon: 'FaChartLine',
    category: 'Marketing',
    schema: statsCounter,
  },
  {
    type: 'pricing-table',
    name: 'Pricing Table',
    description: 'Product or service pricing plans',
    icon: 'FaDollarSign',
    category: 'Marketing',
    schema: pricingTable,
  },
  {
    type: 'contact-form',
    name: 'Contact Form',
    description: 'Contact form embed reference',
    icon: 'FaEnvelope',
    category: 'Forms',
    schema: contactForm,
  },
  {
    type: 'latest-news',
    name: 'Latest News',
    description: 'Display latest news or blog posts',
    icon: 'FaNewspaper',
    category: 'Content',
    schema: latestNews,
  },
  {
    type: 'custom-html',
    name: 'Custom HTML',
    description: 'Custom HTML code block',
    icon: 'FaCode',
    category: 'Advanced',
    schema: customHtml,
  },
];

export default COMPONENT_SCHEMAS;
