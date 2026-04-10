/**
 * PAGE BUILDER V2 - Component Registry
 * 
 * Registry loads component types from the backend API.
 * Also maintains a static fallback list of all known types.
 * 
 * Default templates are sourced from web/data/components/*.js to ensure
 * CMS data structure is consistent with the public website.
 */

import { ComponentRegistryEntry } from './types';
import { COMPONENT_DEFAULT_TEMPLATES } from './componentDefaultTemplates';

// =============================================================================
// STATIC COMPONENT TYPE LIST (fallback when API is unavailable)
// =============================================================================

const COMMON_FIELDS = {
  custom_id: '',
  custom_class: '',
  bg_type: 'color',
  bg_color: '',
  bg_image: '',
  bg_position: 'center',
};

function withCommon(data: Record<string, any>): Record<string, any> {
  return { ...COMMON_FIELDS, ...data };
}

export const STATIC_COMPONENT_TYPES: ComponentRegistryEntry[] = [
  // BASIC
  {
    type: 'text_block', name: 'Text Block', description: 'Text section with title, description, CTA', icon: 'FaAlignLeft', category: 'basic',
    defaultData: withCommon({ label: '', title: { en: 'Section Title', id: 'Judul Bagian' }, description: { en: 'Description here.', id: 'Deskripsi di sini.' }, cta_text: { en: 'Learn More', id: 'Selengkapnya' }, cta_link: '#', text_position: 'left' }),
  },
  {
    type: 'ckeditor', name: 'Rich Text Editor', description: 'WYSIWYG HTML content', icon: 'FaEdit', category: 'basic',
    defaultData: withCommon({ content: '<p>Enter your content here...</p>', content_id: '<p>Masukkan konten Anda di sini...</p>' }),
  },
  {
    type: 'image', name: 'Image', description: 'Single image with caption', icon: 'FaImage', category: 'basic',
    defaultData: withCommon({ image_url: '', alt_text: 'Image', caption: '', link_url: '', alignment: 'center' }),
  },
  {
    type: 'hero_section', name: 'Hero Section', description: 'Full-width hero banner', icon: 'FaStar', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['hero_section'],
  },
  {
    type: 'sliders_hero', name: 'Hero Slider', description: 'Hero carousel with slides', icon: 'FaSlidersH', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['sliders_hero'],
  },
  {
    type: 'usp_grid', name: 'USP Grid', description: 'Grid of unique selling points', icon: 'FaTh', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['usp_grid'],
  },
  {
    type: 'usp_grid_slider', name: 'USP Grid Slider', description: 'USP as slider/carousel', icon: 'FaThList', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['usp_grid_slider'],
  },
  {
    type: 'business_tab', name: 'Business Tab', description: 'Tabbed business segments', icon: 'FaBriefcase', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['business_tab'],
  },
  {
    type: 'tabs_with_card', name: 'Tabs with Cards', description: 'Tabs with card grids', icon: 'FaFolder', category: 'basic',
    defaultData: withCommon({ title: { en: 'Services', id: 'Layanan' }, tabs: [{ key: 'tab1', label: { en: 'Tab 1', id: 'Tab 1' } }], tab_panels: { tab1: { cards: [{ title: { en: 'Card', id: 'Kartu' }, description: { en: 'Desc', id: 'Desk' }, image: '', link: '#' }] } } }),
  },
  {
    type: 'key_highlight', name: 'Key Highlights', description: 'Key metrics slider', icon: 'FaChartBar', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['key_highlight'],
  },
  {
    type: 'about_with_marquee', name: 'About with Marquee', description: 'About section with photo marquee', icon: 'FaInfoCircle', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['about_with_marquee'],
  },
  {
    type: 'join_first_squad', name: 'Join First Squad', description: 'Career recruitment carousel', icon: 'FaUserPlus', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['join_first_squad'],
  },
  {
    type: 'list_services', name: 'List Services', description: 'Service listing with products', icon: 'FaConciergeBell', category: 'basic',
    defaultData: withCommon({ title: { en: 'Services', id: 'Layanan' }, services: [{ icon: 'FaGlobe', title: { en: 'Internet', id: 'Internet' }, description: { en: 'High-speed internet.', id: 'Internet cepat.' }, products: [{ name: { en: 'Fiber 50', id: 'Fiber 50' }, link: '#' }] }] }),
  },
  {
    type: 'card_with_highlight_summary', name: 'Cards + Highlights', description: 'Cards with key metrics', icon: 'FaIdCard', category: 'basic',
    defaultData: withCommon({ title: { en: 'Highlights', id: 'Sorotan' }, cards: [{ title: { en: 'Card 1', id: 'Kartu 1' }, description: { en: 'Description', id: 'Deskripsi' }, image: '', link: '#' }], highlight: { title: { en: 'Metrics', id: 'Metrik' }, metrics: [{ label: { en: 'Revenue', id: 'Pendapatan' }, value: 'Rp 2.5T', change: '+12%' }] } }),
  },
  {
    type: 'highlighting_real_initiatives', name: 'Real Initiatives', description: 'CSR/community initiatives', icon: 'FaHandHoldingHeart', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['highlighting_real_initiatives'],
  },
  {
    type: 'info_contacts', name: 'Contact Info', description: 'Contact details with icons', icon: 'FaAddressBook', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['info_contacts'],
  },
  {
    type: 'information_list', name: 'Information List', description: 'HTML + articles + docs', icon: 'FaListUl', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['information_list'],
  },
  {
    type: 'contact_us', name: 'Contact Us', description: 'Contact form section', icon: 'FaEnvelopeOpen', category: 'basic',
    defaultData: withCommon({ title: { en: 'Get in Touch', id: 'Hubungi Kami' }, description: { en: 'Questions?', id: 'Pertanyaan?' }, email: 'info@linknet.co.id', phone: '+62 21 2996 0808', address: { en: 'Jakarta, Indonesia', id: 'Jakarta, Indonesia' }, show_form: true }),
  },
  {
    type: 'document_list', name: 'Document List', description: 'Document downloads', icon: 'FaFileAlt', category: 'basic',
    defaultData: withCommon({ title: { en: 'Documents', id: 'Dokumen' }, sections: [{ title: { en: 'Reports', id: 'Laporan' }, documents: [{ title: { en: 'Report 2024', id: 'Laporan 2024' }, url: '#', file_type: 'pdf', file_size: '5 MB', year: 2024 }] }] }),
  },
  {
    type: 'accordion', name: 'Accordion', description: 'Collapsible FAQ/content', icon: 'FaListAlt', category: 'basic',
    defaultData: withCommon({ style: 'default', allow_multiple: false, items: [{ title: { en: 'Question?', id: 'Pertanyaan?' }, content: { en: '<p>Answer</p>', id: '<p>Jawaban</p>' }, expanded: false }] }),
  },
  {
    type: 'tradingview_symbol_overview', name: 'TradingView Chart', description: 'Stock chart widget', icon: 'FaChartLine', category: 'basic',
    defaultData: withCommon({ symbol: 'IDX:LINK', interval: 'D', theme: 'light', chart_type: 'area', width: '100%', height: '400', show_toolbar: true, show_volume: true, locale: 'en' }),
  },
  // New components (from web design)
  {
    type: 'vision_mission', name: 'Vision & Mission', description: 'Vision and mission grid', icon: 'FaEye', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['vision_mission'],
  },
  {
    type: 'maps_coverage', name: 'Coverage Map', description: 'Interactive Indonesia map', icon: 'FaMapMarkedAlt', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['maps_coverage'],
  },
  {
    type: 'milestone', name: 'Milestone Timeline', description: 'Company timeline', icon: 'FaStream', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['milestone'],
  },
  {
    type: 'awards_marquee', name: 'Awards Marquee', description: 'Scrolling awards', icon: 'FaMedal', category: 'basic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['awards_marquee'],
  },
  {
    type: 'product_showcase', name: 'Product Showcase', description: 'Product with specs', icon: 'FaBox', category: 'basic',
    defaultData: withCommon({ product_name: { en: 'Product', id: 'Produk' }, product_description: { en: 'Description.', id: 'Deskripsi.' }, product_image: '', logo_image: '', usp_items: [{ icon: '', title: { en: 'Feature', id: 'Fitur' }, description: { en: 'Desc', id: 'Desk' } }], cta_text: { en: 'Order Now', id: 'Pesan' }, cta_link: '#', show_specs: true }),
  },
  {
    type: 'usp_strip', name: 'USP Strip', description: 'Horizontal USP taglines', icon: 'FaGripLines', category: 'basic',
    defaultData: withCommon({ items: [{ text: { en: 'Fast', id: 'Cepat' } }, { text: { en: 'Reliable', id: 'Andal' } }, { text: { en: 'Secure', id: 'Aman' } }] }),
  },
  {
    type: 'closing_cta', name: 'Closing CTA', description: 'Full-screen video CTA', icon: 'FaBullseye', category: 'basic',
    defaultData: withCommon({ title: { en: 'Ready?', id: 'Siap?' }, description: { en: 'Contact us.', id: 'Hubungi kami.' }, cta_text: { en: 'Get Started', id: 'Mulai' }, cta_link: '#', video_url: '', bg_image: '' }),
  },
  {
    type: 'video_section', name: 'Video Section', description: 'Expanding video section', icon: 'FaPlayCircle', category: 'basic',
    defaultData: withCommon({ video_url: '', poster_image: '', autoplay: false }),
  },
  // MAIN (DB-driven)
  {
    type: 'news_highlight', name: 'News Highlights', description: 'Featured news from DB', icon: 'FaNewspaper', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['news_highlight'],
  },
  {
    type: 'news_list', name: 'News List', description: 'Paginated news listing', icon: 'FaList', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['news_list'],
  },
  {
    type: 'career_highlight', name: 'Career Highlights', description: 'Featured careers', icon: 'FaUserTie', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['career_highlight'],
  },
  {
    type: 'career_list', name: 'Career List', description: 'Full career listing', icon: 'FaBriefcase', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['career_list'],
  },
  {
    type: 'management_list', name: 'Management', description: 'Board/management listing', icon: 'FaUsers', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['management_list'],
  },
  {
    type: 'announcement_list', name: 'Announcements', description: 'Announcements listing', icon: 'FaBullhorn', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['announcement_list'],
  },
  {
    type: 'report_list', name: 'Reports', description: 'Financial/corporate reports', icon: 'FaFileInvoice', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['report_list'],
  },
  {
    type: 'awards_list', name: 'Awards', description: 'Awards and achievements', icon: 'FaTrophy', category: 'main',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['awards_list'],
  },
];

// =============================================================================
// COMPONENT REGISTRY (indexed by type)
// =============================================================================

export const COMPONENT_REGISTRY: Record<string, ComponentRegistryEntry> = {};
STATIC_COMPONENT_TYPES.forEach((entry) => {
  COMPONENT_REGISTRY[entry.type] = entry;
});

// =============================================================================
// REGISTRY HELPERS
// =============================================================================

export function isRegisteredType(type: string): boolean {
  return type in COMPONENT_REGISTRY;
}

export function getRegistryEntry(type: string): ComponentRegistryEntry | null {
  return COMPONENT_REGISTRY[type] || null;
}

export function getDefaultSettings(type: string): Record<string, any> | null {
  const entry = getRegistryEntry(type);
  return entry ? JSON.parse(JSON.stringify(entry.defaultData)) : null;
}

export function getRegisteredComponents(): ComponentRegistryEntry[] {
  return STATIC_COMPONENT_TYPES;
}

export function getComponentsByCategory(): Record<string, ComponentRegistryEntry[]> {
  return STATIC_COMPONENT_TYPES.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = [];
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, ComponentRegistryEntry[]>);
}

export function validateComponent(type: string, settings: Record<string, any>): string | null {
  if (!isRegisteredType(type)) return `Unknown component type: ${type}`;
  return null;
}

export function normalizeComponentType(type: string): string | null {
  if (isRegisteredType(type)) return type;
  // Legacy aliases
  const aliases: Record<string, string> = {
    'hero-section': 'hero_section',
    'hero': 'hero_section',
    'pricing-section': 'tabs_with_card',
    'pricing': 'tabs_with_card',
    'pricing_section': 'tabs_with_card',
    'text-block': 'text_block',
    'call-to-action': 'text_block',
    'custom-html': 'ckeditor',
    'contact-form': 'contact_us',
    'latest-news': 'news_highlight',
    'team-grid': 'management_list',
    'image-gallery': 'image',
    'video-embed': 'ckeditor',
    'stats-counter': 'key_highlight',
    'testimonials': 'text_block',
    'pricing-table': 'tabs_with_card',
  };
  return aliases[type] || type; // Return original if no alias match
}
