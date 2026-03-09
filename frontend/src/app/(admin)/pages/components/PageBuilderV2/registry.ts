/**
 * PAGE BUILDER V2 - Component Registry
 * 
 * Registry loads component types from the backend API.
 * Also maintains a static fallback list of all known types.
 */

import { ComponentRegistryEntry } from './types';

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
    defaultData: withCommon({ content: '<p>Enter your content here...</p>' }),
  },
  {
    type: 'image', name: 'Image', description: 'Single image with caption', icon: 'FaImage', category: 'basic',
    defaultData: withCommon({ image_url: '', alt_text: 'Image', caption: '', link_url: '', alignment: 'center' }),
  },
  {
    type: 'hero_section', name: 'Hero Section', description: 'Full-width hero banner', icon: 'FaStar', category: 'basic',
    defaultData: withCommon({ background_image: '', title: { en: 'Welcome to LinkNet', id: 'Selamat Datang di LinkNet' }, description: { en: 'Connecting Indonesia.', id: 'Menghubungkan Indonesia.' }, pill_text: { en: '', id: '' }, button_text: { en: 'Get Started', id: 'Mulai' }, button_link: '#', theme: 'dark', gradient_visible: true }),
  },
  {
    type: 'sliders_hero', name: 'Hero Slider', description: 'Hero carousel with slides', icon: 'FaSlidersH', category: 'basic',
    defaultData: withCommon({ slides: [{ image: '', title: { en: 'Slide 1', id: 'Slide 1' }, description: { en: 'Description', id: 'Deskripsi' }, button_text: { en: 'More', id: 'Lainnya' }, button_link: '#', pill_text: { en: '', id: '' }, indicator_label: { en: 'Slide 1', id: 'Slide 1' } }], autoplay: true, autoplay_speed: 5000, theme: 'dark' }),
  },
  {
    type: 'usp_grid', name: 'USP Grid', description: 'Grid of unique selling points', icon: 'FaTh', category: 'basic',
    defaultData: withCommon({ items: [{ icon: 'FaWifi', title: { en: 'Fast', id: 'Cepat' }, description: { en: 'High-speed', id: 'Kecepatan tinggi' } }] }),
  },
  {
    type: 'usp_grid_slider', name: 'USP Grid Slider', description: 'USP as slider/carousel', icon: 'FaThList', category: 'basic',
    defaultData: withCommon({ items: [{ icon: 'FaWifi', title: { en: 'Fast', id: 'Cepat' }, description: { en: 'High-speed', id: 'Kecepatan tinggi' } }], autoplay: true, slides_per_view: 3 }),
  },
  {
    type: 'business_tab', name: 'Business Tab', description: 'Tabbed business segments', icon: 'FaBriefcase', category: 'basic',
    defaultData: withCommon({ tabs: [{ name: { en: 'Enterprise', id: 'Perusahaan' }, title: { en: 'Enterprise Solutions', id: 'Solusi Perusahaan' }, description: { en: 'Solutions for businesses.', id: 'Solusi untuk bisnis.' }, background_image: '', logo_image: '', cta_text: { en: 'More', id: 'Lainnya' }, cta_link: '#' }] }),
  },
  {
    type: 'tabs_with_card', name: 'Tabs with Cards', description: 'Tabs with card grids', icon: 'FaFolder', category: 'basic',
    defaultData: withCommon({ title: { en: 'Services', id: 'Layanan' }, tabs: [{ key: 'tab1', label: { en: 'Tab 1', id: 'Tab 1' } }], tab_panels: { tab1: { cards: [{ title: { en: 'Card', id: 'Kartu' }, description: { en: 'Desc', id: 'Desk' }, image: '', link: '#' }] } } }),
  },
  {
    type: 'key_highlight', name: 'Key Highlights', description: 'Key metrics slider', icon: 'FaChartBar', category: 'basic',
    defaultData: withCommon({ slides: [{ image: '', value: '1M+', delta: '+15%', caption: { en: 'Subscribers', id: 'Pelanggan' } }] }),
  },
  {
    type: 'about_with_marquee', name: 'About with Marquee', description: 'About section with photo marquee', icon: 'FaInfoCircle', category: 'basic',
    defaultData: withCommon({ intro: { title: { en: 'About Us', id: 'Tentang Kami' }, description: { en: 'Leading provider.', id: 'Penyedia terkemuka.' }, cta_text: { en: 'More', id: 'Lainnya' }, cta_link: '/about' }, photos: [{ url: '', alt: 'Photo 1' }], marquee_speed: 30, marquee_direction: 'left' }),
  },
  {
    type: 'join_first_squad', name: 'Join First Squad', description: 'Career recruitment carousel', icon: 'FaUserPlus', category: 'basic',
    defaultData: withCommon({ title: { en: 'Join Our Team', id: 'Bergabung dengan Tim Kami' }, slides: [{ title: { en: 'First Squad', id: 'First Squad' }, description: { en: 'Be part of our team.', id: 'Jadilah bagian tim kami.' }, image: '', cta_text: { en: 'Apply', id: 'Lamar' }, cta_link: '/careers' }] }),
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
    defaultData: withCommon({ title: { en: 'Initiatives', id: 'Inisiatif' }, description: { en: 'Making a difference.', id: 'Memberikan dampak.' }, initiatives: [{ title: { en: 'Digital Literacy', id: 'Literasi Digital' }, description: { en: 'Education', id: 'Pendidikan' }, image: '' }], community_logos: [{ url: '', alt: 'Partner' }] }),
  },
  {
    type: 'info_contacts', name: 'Contact Info', description: 'Contact details with icons', icon: 'FaAddressBook', category: 'basic',
    defaultData: withCommon({ title: { en: 'Contact', id: 'Kontak' }, contact_items: [{ type: 'phone', icon: 'FaPhone', label: { en: 'Phone', id: 'Telepon' }, value: '+62 21 2996 0808', url: 'tel:+622129960808' }] }),
  },
  {
    type: 'information_list', name: 'Information List', description: 'HTML + articles + docs', icon: 'FaListUl', category: 'basic',
    defaultData: withCommon({ info_sections: [{ title: { en: 'Info', id: 'Info' }, content: { en: '<p>Content</p>', id: '<p>Konten</p>' }, related_articles: [], documents: [] }] }),
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
    defaultData: withCommon({ vision: { title: { en: 'Our Vision', id: 'Visi Kami' }, description: { en: 'Leading provider.', id: 'Penyedia terkemuka.' }, image: '' }, missions: [{ title: { en: 'Mission 1', id: 'Misi 1' }, description: { en: 'Connecting Indonesia.', id: 'Menghubungkan Indonesia.' }, image: '' }], layout: 'grid', columns: 5 }),
  },
  {
    type: 'maps_coverage', name: 'Coverage Map', description: 'Interactive Indonesia map', icon: 'FaMapMarkedAlt', category: 'basic',
    defaultData: withCommon({ title: { en: 'Our Coverage', id: 'Jangkauan Kami' }, description: { en: 'Coverage across Indonesia.', id: 'Jangkauan di Indonesia.' }, show_search: true, show_legend: true, default_province: '' }),
  },
  {
    type: 'milestone', name: 'Milestone Timeline', description: 'Company timeline', icon: 'FaStream', category: 'basic',
    defaultData: withCommon({ title: { en: 'Our Journey', id: 'Perjalanan Kami' }, milestones: [{ year: '2000', title: { en: 'Founded', id: 'Didirikan' }, description: { en: 'Established.', id: 'Didirikan.' }, image: '' }] }),
  },
  {
    type: 'awards_marquee', name: 'Awards Marquee', description: 'Scrolling awards', icon: 'FaMedal', category: 'basic',
    defaultData: withCommon({ title: { en: 'Awards', id: 'Penghargaan' }, cta_text: { en: 'View All', id: 'Lihat Semua' }, cta_link: '/awards', marquee_speed: 30, marquee_direction: 'left' }),
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
    defaultData: withCommon({ title: { en: 'Latest News', id: 'Berita Terbaru' }, featured_count: 1, grid_count: 4, order: 'latest', show_category: true, show_date: true, cta_text: { en: 'View All', id: 'Lihat Semua' }, cta_link: '/news' }),
  },
  {
    type: 'news_list', name: 'News List', description: 'Paginated news listing', icon: 'FaList', category: 'main',
    defaultData: withCommon({ title: { en: 'News', id: 'Berita' }, source: 'all', category_id: null, max_data: 12, order: 'latest', show_pagination: true, show_search: true, show_category_filter: true, layout: 'grid' }),
  },
  {
    type: 'career_highlight', name: 'Career Highlights', description: 'Featured careers', icon: 'FaUserTie', category: 'main',
    defaultData: withCommon({ title: { en: 'Careers', id: 'Karir' }, description: { en: 'Join us.', id: 'Bergabunglah.' }, max_display: 6, show_department: true, show_location: true, cta_text: { en: 'All Careers', id: 'Semua Karir' }, cta_link: '/careers' }),
  },
  {
    type: 'career_list', name: 'Career List', description: 'Full career listing', icon: 'FaBriefcase', category: 'main',
    defaultData: withCommon({ title: { en: 'Open Positions', id: 'Posisi Terbuka' }, show_search: true, show_department_filter: true, show_location_filter: true, show_type_filter: true, show_pagination: true, per_page: 10 }),
  },
  {
    type: 'management_list', name: 'Management', description: 'Board/management listing', icon: 'FaUsers', category: 'main',
    defaultData: withCommon({ title: { en: 'Management', id: 'Manajemen' }, show_bio: true, show_photo: true, layout: 'grid', columns: 4, group_by_category: true }),
  },
  {
    type: 'announcement_list', name: 'Announcements', description: 'Announcements listing', icon: 'FaBullhorn', category: 'main',
    defaultData: withCommon({ title: { en: 'Announcements', id: 'Pengumuman' }, show_type_filter: true, show_section_filter: true, show_search: true, show_pagination: true, per_page: 10, order: 'latest' }),
  },
  {
    type: 'report_list', name: 'Reports', description: 'Financial/corporate reports', icon: 'FaFileInvoice', category: 'main',
    defaultData: withCommon({ title: { en: 'Reports', id: 'Laporan' }, report_type: null, show_year_filter: true, show_type_filter: true, show_search: true, layout: 'grid', per_page: 12 }),
  },
  {
    type: 'awards_list', name: 'Awards', description: 'Awards and achievements', icon: 'FaTrophy', category: 'main',
    defaultData: withCommon({ title: { en: 'Awards', id: 'Penghargaan' }, show_year_filter: true, show_image: true, layout: 'grid', columns: 3, order: 'latest' }),
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
