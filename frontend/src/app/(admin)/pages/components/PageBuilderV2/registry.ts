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
import { DEFAULT_SECTION_INTRO } from '../../../../../../../shared/presentation/intro';

// =============================================================================
// STATIC COMPONENT TYPE LIST (fallback when API is unavailable)
// =============================================================================

const DEFAULT_SECTION_CONFIG = {
  sectionId: '',
  className: '',
  bgImage: '',
  bgImageMobile: '',
  bgPositionClasses: '',
  bgSizeClass: '',
};

function withCommon(data: Record<string, any>): Record<string, any> {
  const {
    intro,
    introData,
    sectionIntro,
    ctaList,
    cta_list,
    ctaButtons,
    cta_buttons,
    config,
    custom_id,
    custom_class,
    bg_image,
    bg_image_mobile,
    bg_position_classes,
    bg_size_class,
    ...rest
  } = data;
  const ctaSource = ctaList || cta_list || ctaButtons || cta_buttons;
  const normalizedCtaList = Array.isArray(ctaSource)
    ? ctaSource.map((cta: Record<string, any>) => ({
        ...cta,
        label: cta.label ?? cta.text ?? '',
        text: cta.text ?? cta.label ?? '',
        href: cta.href ?? cta.url ?? cta.action ?? '',
        action: cta.action ?? cta.actionModal ?? cta.action_modal ?? '',
        iconLeft: cta.iconLeft ?? cta.icon_left ?? '',
        iconRight: cta.iconRight ?? cta.icon_right ?? cta.icon ?? '',
      }))
    : [];

  return {
    introData: {
      ...DEFAULT_SECTION_INTRO,
      ...(intro || {}),
      ...(sectionIntro || {}),
      ...(introData || {}),
    },
    ...(normalizedCtaList.length > 0 ? { ctaList: normalizedCtaList } : {}),
    ...rest,
    config: {
      ...DEFAULT_SECTION_CONFIG,
      ...(config || {}),
      sectionId: config?.sectionId ?? custom_id ?? '',
      className: config?.className ?? custom_class ?? '',
      bgImage: config?.bgImage ?? bg_image ?? '',
      bgImageMobile: config?.bgImageMobile ?? bg_image_mobile ?? '',
      bgPositionClasses: config?.bgPositionClasses ?? bg_position_classes ?? '',
      bgSizeClass: config?.bgSizeClass ?? bg_size_class ?? '',
    },
  };
}

function syncedMainComponent(
  type: string,
  name: string,
  componentPath: string,
  options: Partial<Pick<ComponentRegistryEntry, 'description' | 'icon' | 'category' | 'defaultData'>> = {}
): ComponentRegistryEntry {
  return {
    type,
    name,
    componentPath,
    description: options.description || `${name} component from web/components/main`,
    icon: options.icon || 'FaPuzzlePiece',
    category: options.category || 'basic',
    defaultData: options.defaultData || SYNCED_MAIN_DEFAULTS[type] || withCommon({
      name: 'default',
      title: { en: name, id: name },
      description: { en: '', id: '' },
    }),
  };
}

const SYNCED_MAIN_DEFAULTS: Record<string, Record<string, any>> = {
  hero: withCommon({
    name: 'mission',
    as: 'h2',
    parentProduct: {
      iconImage: '',
      productName: { en: '', id: '' },
    },
    logoSrc: '',
    logoSquare: false,
    labelText: { en: 'Our Mission', id: 'Misi Kami' },
    labelIconSrc: '',
    title: {
      en: 'Improving Lives and Supporting Indonesia\'s Digital Growth',
      id: 'Meningkatkan Kehidupan dan Mendukung Pertumbuhan Digital Indonesia',
    },
    description: {
      en: 'Linknet is dedicated to improving lives and supporting Indonesia\'s digital growth by delivering smart, reliable technology infrastructure.',
      id: 'Linknet berdedikasi untuk meningkatkan kehidupan dan mendukung pertumbuhan digital Indonesia melalui infrastruktur teknologi yang cerdas dan andal.',
    },
    ctaText: { en: 'Get to Know Us', id: 'Kenali Kami' },
    ctaLink: '/about-us',
    ctaTarget: '_self',
    bgColor: 'bg-[#FFB800]',
    heroSize: 'md',
    theme: 'light',
    bgOverlay: false,
  }),
  check_coverage: withCommon({
    name: 'enterprise',
    introData: {
      as: 'h2',
      label: { en: 'CHECK COVERAGE', id: 'CEK COVERAGE' },
      title: { en: 'Find Fiber Network from Linknet Fiber in Your Area', id: 'Temukan Jaringan Fiber dari Linknet Fiber di Area Anda' },
      description: { en: 'Check Coverage Availability Now & Discover service options in your location.', id: 'Cek Ketersediaan Coverage Sekarang & Temukan pilihan layanan di lokasi Anda.' },
      align: 'left',
    },
  }),
  event_hero: withCommon({
    variant: 'event_grid',
    introData: {
      as: 'h1',
      label: { en: 'FIND YOUR NEXT EXPERIENCE', id: 'TEMUKAN PENGALAMAN BERIKUTNYA' },
      title: { en: 'Discover & Promote Upcoming Event', id: 'Temukan & Promosikan Event Mendatang' },
      description: { en: '', id: '' },
      align: 'left',
    },
    config: {
      sectionId: 'featured-event',
      className: '',
    },
  }),
  footer: withCommon({
    cmsClosingData: null,
    cmsFooterData: null,
  }),
  footer_fiber: withCommon({}),
  footer_main: withCommon({
    cmsFooterData: null,
  }),
  footer_media: withCommon({}),
  form_registration: withCommon({}),
  form_registration_incomplete: withCommon({}),
  form_registration_success: withCommon({}),
  hero_sliders_tv_highlight: withCommon({
    name: 'today-highlight',
  }),
  hospitality: withCommon({}),
  layout_chrome: withCommon({}),
  maps_coverage_v1: withCommon({
    name: 'home',
  }),
  navbar: withCommon({
    menuData: [],
    defaultLocale: 'en',
  }),
  navbar_fiber: withCommon({
    menuData: [],
    defaultLocale: 'en',
  }),
  navbar_media: withCommon({}),
  navbar_newsroom: {
    label: { en: 'News', id: 'Berita' },
    category_sort_by: 'default',
  },
  news_teaser: withCommon({
    name: 'press-release',
    category_id: '',
    limit: 6,
    ctaList: [
      {
        text: { en: 'See More', id: 'Lihat Lainnya' },
        variant: 'secondary-outline',
        size: 'lg',
        iconLeft: '',
        iconRight: '',
        href: '',
        link_type: 'url',
        action_modal: '',
      },
    ],
  }),
  omni_channel_widget: withCommon({
    enabled: true,
    title: { en: 'Let\'s start new chat', id: 'Mulai percakapan baru' },
    subtitle: { en: 'How can we help you today?', id: 'Apa yang bisa kami bantu hari ini?' },
    whatsappUrl: 'https://wa.me/628111700700',
    submitEndpoint: '',
    sendToSalesForce: false,
  }),
  one_stream_plus: withCommon({}),
  report_grid: withCommon({
    data: [],
  }),
  solutions_services_with_background: withCommon({
    name: 'enterprise',
  }),
  tv_channel_sneak_peek: withCommon({
    name: 'home',
  }),
  tv_highlight_sliders: withCommon({
    name: 'today-highlight',
  }),
  tv_highlight_sneek_peak: withCommon({
    name: 'home',
  }),
};

const SYNCED_MAIN_COMPONENTS: ComponentRegistryEntry[] = [
  syncedMainComponent('hero', 'Hero', '@/components/main/Hero', { icon: 'FaStar' }),
  syncedMainComponent('career_detail', 'Career Detail', '@/components/main/CareerDetail', { icon: 'FaUserTie', category: 'main', defaultData: withCommon({ career: null, relatedCareers: [] }) }),
  syncedMainComponent('check_coverage', 'Check Coverage', '@/components/main/CheckCoverage', { icon: 'FaMapMarkedAlt' }),
  syncedMainComponent('content_highlights', 'Content Highlights', '@/components/main/ContentHighlights', { icon: 'FaLayerGroup', defaultData: withCommon({ name: 'home' }) }),
  syncedMainComponent('event_content', 'Event Content', '@/components/main/EventContent', { icon: 'FaCalendarAlt', category: 'main', defaultData: withCommon({ event: null }) }),
  syncedMainComponent('event_detail', 'Event Detail', '@/components/main/EventDetail', { icon: 'FaCalendarAlt', category: 'main', defaultData: withCommon({ event: null }) }),
  syncedMainComponent('event_hero', 'Event Hero', '@/components/main/EventHero', { icon: 'FaCalendarAlt' }),
  syncedMainComponent('event_registration_form', 'Event Registration Form', '@/components/main/EventRegistrationForm', { icon: 'FaWpforms', defaultData: withCommon({ event: null }) }),
  syncedMainComponent('event_related', 'Event Related', '@/components/main/EventRelated', {
    icon: 'FaCalendarAlt',
    defaultData: withCommon({
      introData: {
        as: 'h2',
        label: { en: 'MORE EVENTS', id: 'EVENT LAINNYA' },
        title: { en: 'Other Events', id: 'Event Lainnya' },
        description: { en: '', id: '' },
        align: 'left',
      },
      order: 'latest',
      state: 'all',
      limit: 4,
    }),
  }),
  syncedMainComponent('event_related_news', 'Event Related News', '@/components/main/EventRelatedNews', { icon: 'FaNewspaper', defaultData: withCommon({ articles: [] }) }),
  syncedMainComponent('events_list', 'Events List', '@/components/main/EventsList', {
    icon: 'FaCalendarAlt',
    category: 'main',
    defaultData: withCommon({
      introData: {
        as: 'h2',
        label: { en: 'FIND YOUR NEXT EXPERIENCE', id: 'TEMUKAN PENGALAMAN BERIKUTNYA' },
        title: { en: 'Discover & Promote Upcoming Event', id: 'Temukan & Promosikan Event Mendatang' },
        description: { en: '', id: '' },
        align: 'left',
      },
      state: 'all',
      limit: 12,
      itemsPerRow: 3,
      showPagination: true,
    }),
  }),
  syncedMainComponent('footer', 'Footer', '@/components/main/Footer', { icon: 'FaGripLines' }),
  syncedMainComponent('footer_fiber', 'Footer Fiber', '@/components/main/FooterFiber', { icon: 'FaGripLines' }),
  syncedMainComponent('footer_main', 'Footer Main', '@/components/main/FooterMain', { icon: 'FaGripLines' }),
  syncedMainComponent('footer_media', 'Footer Media', '@/components/main/FooterMedia', { icon: 'FaGripLines' }),
  syncedMainComponent('form_registration', 'Form Registration', '@/components/main/FormRegistration', { icon: 'FaWpforms' }),
  syncedMainComponent('form_registration_incomplete', 'Form Registration Incomplete', '@/components/main/FormRegistrationIncomplete', { icon: 'FaWpforms' }),
  syncedMainComponent('form_registration_success', 'Form Registration Success', '@/components/main/FormRegistrationSuccess', { icon: 'FaWpforms' }),
  syncedMainComponent('hero_sliders_tv_highlight', 'Hero Sliders TV Highlight', '@/components/main/HeroSlidersTVHighlight', { icon: 'FaSlidersH' }),
  syncedMainComponent('hospitality', 'Hospitality', '@/components/main/Hospitality', { icon: 'FaTh' }),
  syncedMainComponent('layout_chrome', 'Layout Chrome', '@/components/main/LayoutChrome', { icon: 'FaThList' }),
  syncedMainComponent('list_report_home', 'List Report Home', '@/components/main/ListReportHome', { icon: 'FaFileInvoice', defaultData: withCommon({ name: 'home' }) }),
  syncedMainComponent('logo_running', 'Logo Running', '@/components/main/LogoRunning', { icon: 'FaImage', defaultData: withCommon({ name: 'default' }) }),
  syncedMainComponent('logo_running_with_border', 'Logo Running With Border', '@/components/main/LogoRunningWithBorder', { icon: 'FaImage', defaultData: withCommon({ name: 'default' }) }),
  syncedMainComponent('maps_coverage_v1', 'Maps Coverage V1', '@/components/main/MapsCoverage-v1', { icon: 'FaMapMarkedAlt' }),
  syncedMainComponent('navbar', 'Navbar', '@/components/main/Navbar', { icon: 'FaListAlt' }),
  syncedMainComponent('navbar_fiber', 'Navbar Fiber', '@/components/main/NavbarFiber', { icon: 'FaListAlt' }),
  syncedMainComponent('navbar_media', 'Navbar Media', '@/components/main/NavbarMedia', { icon: 'FaListAlt' }),
  syncedMainComponent('navbar_newsroom', 'Navbar Newsroom', '@/components/main/NavbarNewsroom', { icon: 'FaListAlt' }),
  syncedMainComponent('news_detail', 'News Detail', '@/components/main/NewsDetail', { icon: 'FaNewspaper', category: 'main', defaultData: withCommon({ article: null }) }),
  syncedMainComponent('news_feed', 'News Feed', '@/components/main/NewsFeed', { icon: 'FaNewspaper', category: 'main', defaultData: withCommon({ categorySlug: 'latest' }) }),
  syncedMainComponent('news_related', 'News Related', '@/components/main/NewsRelated', { icon: 'FaNewspaper', defaultData: withCommon({ articles: [] }) }),
  syncedMainComponent('news_teaser', 'News Teaser', '@/components/main/NewsTeaser', { icon: 'FaNewspaper', category: 'main' }),
  syncedMainComponent('omni_channel_widget', 'Omni Channel Widget', '@/components/main/OmniChannelWidget', { icon: 'FaEdit' }),
  syncedMainComponent('one_stream_plus', 'One Stream Plus', '@/components/main/OneStreamPlus', { icon: 'FaBox' }),
  syncedMainComponent('package_list', 'Package List', '@/components/main/PackageList', { icon: 'FaBox', defaultData: withCommon({ name: 'enterprise' }) }),
  syncedMainComponent('report_grid', 'Report Grid', '@/components/main/ReportGrid', { icon: 'FaFileInvoice', category: 'main' }),
  syncedMainComponent('report_list_part', 'Report List Part', '@/components/main/ReportListPart', { icon: 'FaFileInvoice', category: 'main', defaultData: withCommon({ data: null, config: null }) }),
  syncedMainComponent('solution_services_home', 'Solution Services Home', '@/components/main/SolutionServicesHome', { icon: 'FaConciergeBell', defaultData: withCommon({ name: 'home', hideTabs: false }) }),
  syncedMainComponent('solutions_filtered', 'Solutions Filtered', '@/components/main/SolutionsFiltered', { icon: 'FaListUl', defaultData: withCommon({ name: 'enterprise' }) }),
  syncedMainComponent('solutions_services_with_background', 'Solutions Services With Background', '@/components/main/SolutionsServicesWithBackground', { icon: 'FaConciergeBell' }),
  syncedMainComponent('tv_channel_list', 'TV Channel List', '@/components/main/TVChannelList', { icon: 'FaPlayCircle', defaultData: withCommon({ name: 'enterprise' }) }),
  syncedMainComponent('tv_channel_sneak_peek', 'TV Channel Sneak Peek', '@/components/main/TVChannelSneakPeek', { icon: 'FaPlayCircle' }),
  syncedMainComponent('tv_highlight_sliders', 'TV Highlight Sliders', '@/components/main/TVHighlightSliders', { icon: 'FaSlidersH' }),
  syncedMainComponent('tv_highlight_sneek_peak', 'TV Highlight Sneek Peak', '@/components/main/TVHighlightSneekPeak', { icon: 'FaPlayCircle' }),
];

export const STATIC_COMPONENT_TYPES: ComponentRegistryEntry[] = [
  // BASIC
  {
    type: 'text_block', name: 'Text Block', description: 'Text section with title, description, CTA', icon: 'FaAlignLeft', category: 'basic',
    defaultData: withCommon({
      introData: {
        label: '',
        title: { en: 'Section Title', id: 'Judul Bagian' },
        description: { en: 'Description here.', id: 'Deskripsi di sini.' },
      },
      cta_text: { en: 'Learn More', id: 'Selengkapnya' },
      cta_link: '#',
      text_position: 'left',
    }),
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
    type: 'hero_section', name: 'Hero Static', description: 'Full-width hero banner', icon: 'FaStar', category: 'basic',
    componentPath: '@/components/main/HeroStatic',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['hero_section'],
  },
  {
    type: 'sliders_hero', name: 'Hero Sliders', description: 'Hero carousel with slides', icon: 'FaSlidersH', category: 'basic',
    componentPath: '@/components/main/HeroSliders',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['sliders_hero'],
  },
  {
    type: 'usp_grid', name: 'About With USP', description: 'Grid of unique selling points', icon: 'FaTh', category: 'basic',
    componentPath: '@/components/main/AboutWithUSP',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['usp_grid'],
  },
  {
    type: 'usp_grid_slider', name: 'About Values', description: 'USP as slider/carousel', icon: 'FaThList', category: 'basic',
    componentPath: '@/components/main/AboutValues',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['usp_grid_slider'],
  },
  {
    type: 'business_tab', name: 'Tab Business', description: 'Tabbed business segments', icon: 'FaBriefcase', category: 'basic',
    componentPath: '@/components/main/TabBusiness',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['business_tab'],
  },
  {
    type: 'key_highlight', name: 'Key Highlight With Image', description: 'Key metrics slider', icon: 'FaChartBar', category: 'basic',
    componentPath: '@/components/main/KeyHighlightWithImage',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['key_highlight'],
  },
  {
    type: 'about_with_marquee', name: 'About With Running Photos', description: 'About section with photo marquee', icon: 'FaInfoCircle', category: 'basic',
    componentPath: '@/components/main/AboutWithRunningPhotos',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['about_with_marquee'],
  },
  {
    type: 'join_first_squad', name: 'Join First Squad', description: 'Career recruitment carousel', icon: 'FaUserPlus', category: 'basic',
    componentPath: '@/components/main/JoinFirstSquad',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['join_first_squad'],
  },
  {
    type: 'list_services', name: 'List Services', description: 'Service listing with products', icon: 'FaConciergeBell', category: 'basic',
    defaultData: withCommon({ title: { en: 'Services', id: 'Layanan' }, services: [{ icon: 'globe', title: { en: 'Internet', id: 'Internet' }, description: { en: 'High-speed internet.', id: 'Internet cepat.' }, products: [{ name: { en: 'Fiber 50', id: 'Fiber 50' }, link: '#' }] }] }),
  },
  {
    type: 'card_with_highlight_summary', name: 'Cards + Highlights', description: 'Cards with key metrics', icon: 'FaIdCard', category: 'basic',
    defaultData: withCommon({ title: { en: 'Highlights', id: 'Sorotan' }, cards: [{ title: { en: 'Card 1', id: 'Kartu 1' }, description: { en: 'Description', id: 'Deskripsi' }, image: '', link: '#' }], highlight: { title: { en: 'Metrics', id: 'Metrik' }, metrics: [{ label: { en: 'Revenue', id: 'Pendapatan' }, value: 'Rp 2.5T', change: '+12%' }] } }),
  },
  {
    type: 'highlighting_real_initiatives', name: 'Highlighting Real Initiatives', description: 'CSR/community initiatives', icon: 'FaHandHoldingHeart', category: 'basic',
    componentPath: '@/components/main/HighlightingRealInitiatives',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['highlighting_real_initiatives'],
  },
  {
    type: 'info_contacts', name: 'Info Contact', description: 'Contact details with icons', icon: 'FaAddressBook', category: 'basic',
    componentPath: '@/components/main/InfoContact',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['info_contacts'],
  },
  {
    type: 'information_list', name: 'Information List', description: 'HTML + articles + docs', icon: 'FaListUl', category: 'basic',
    componentPath: '@/components/main/InformationList',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['information_list'],
  },
  {
    type: 'contact_us', name: 'Contact Us', description: 'Contact form section', icon: 'FaEnvelopeOpen', category: 'basic',
    componentPath: '@/components/main/ContactUs',
    defaultData: withCommon({ title: { en: 'Get in Touch', id: 'Hubungi Kami' }, description: { en: 'Questions?', id: 'Pertanyaan?' }, email: 'info@linknet.co.id', phone: '+62 21 2996 0808', address: { en: 'Jakarta, Indonesia', id: 'Jakarta, Indonesia' }, show_form: true }),
  },
  {
    type: 'document_list', name: 'Document List', description: 'Document downloads', icon: 'FaFileAlt', category: 'basic',
    defaultData: withCommon({ title: { en: 'Documents', id: 'Dokumen' }, sections: [{ title: { en: 'Reports', id: 'Laporan' }, documents: [{ title: { en: 'Report 2024', id: 'Laporan 2024' }, url: '#', file_type: 'pdf', file_size: '5 MB', year: 2024 }] }] }),
  },
  {
    type: 'accordion', name: 'FAQ', description: 'Collapsible FAQ/content', icon: 'FaListAlt', category: 'basic',
    componentPath: '@/components/main/FAQ',
    defaultData: withCommon({ style: 'default', allow_multiple: false, items: [{ title: { en: 'Question?', id: 'Pertanyaan?' }, content: { en: '<p>Answer</p>', id: '<p>Jawaban</p>' }, expanded: false }] }),
  },
  {
    type: 'tradingview_symbol_overview', name: 'TradingView Symbol Overview', description: 'Stock chart widget', icon: 'FaChartLine', category: 'basic',
    componentPath: '@/components/main/StockInformation',
    defaultData: withCommon({ symbol: 'IDX:LINK', interval: 'D', theme: 'light', chart_type: 'area', width: '100%', height: '400', show_toolbar: true, show_volume: true, locale: 'en' }),
  },
  // New components (from web design)
  {
    type: 'vision_mission', name: 'Vision Mission', description: 'Vision and mission grid', icon: 'FaEye', category: 'basic',
    componentPath: '@/components/main/VisionMission',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['vision_mission'],
  },
  {
    type: 'maps_coverage', name: 'Maps Coverage', description: 'Interactive Indonesia map', icon: 'FaMapMarkedAlt', category: 'basic',
    componentPath: '@/components/main/MapsCoverage',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['maps_coverage'],
  },
  {
    type: 'milestone', name: 'Milestone', description: 'Company timeline', icon: 'FaStream', category: 'basic',
    componentPath: '@/components/main/Milestone',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['milestone'],
  },
  {
    type: 'awards_marquee', name: 'Award Sneak Peek', description: 'Scrolling awards', icon: 'FaMedal', category: 'main',
    componentPath: '@/components/main/AwardSneakPeek',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['awards_marquee'],
  },
  {
    type: 'product_showcase', name: 'One Stream', description: 'Product with specs', icon: 'FaBox', category: 'basic',
    componentPath: '@/components/main/OneStream',
    defaultData: withCommon({ product_name: { en: 'Product', id: 'Produk' }, product_description: { en: 'Description.', id: 'Deskripsi.' }, product_image: '', logo_image: '', usp_items: [{ icon: 'check', title: { en: 'Feature', id: 'Fitur' }, description: { en: 'Desc', id: 'Desk' } }], cta_text: { en: 'Order Now', id: 'Pesan' }, cta_link: '#', show_specs: true }),
  },
  {
    type: 'usp_strip', name: 'USP', description: 'Horizontal USP taglines', icon: 'FaGripLines', category: 'basic',
    componentPath: '@/components/main/USP',
    defaultData: withCommon({ items: [{ text: { en: 'Fast', id: 'Cepat' } }, { text: { en: 'Reliable', id: 'Andal' } }, { text: { en: 'Secure', id: 'Aman' } }] }),
  },
  {
    type: 'closing_cta', name: 'Closing Sentence', description: 'Full-screen video CTA', icon: 'FaBullseye', category: 'basic',
    componentPath: '@/components/main/ClosingSentence',
    defaultData: withCommon({ title: { en: 'Ready?', id: 'Siap?' }, description: { en: 'Contact us.', id: 'Hubungi kami.' }, cta_text: { en: 'Get Started', id: 'Mulai' }, cta_link: '#', video_url: '', bg_image: '' }),
  },
  {
    type: 'video_section', name: 'Tvc', description: 'Expanding video section', icon: 'FaPlayCircle', category: 'basic',
    componentPath: '@/components/main/Tvc',
    defaultData: withCommon({ video_url: '', poster_image: '', autoplay: false }),
  },
  {
    type: 'extendable_article', name: 'Extendable Article', description: 'Expandable/collapsible rich text article section', icon: 'FaFileAlt', category: 'basic',
    componentPath: '@/components/main/ExtendableArticle',
    defaultData: withCommon({
      intro: { label: '', title: { en: 'More About Us', id: 'Tentang Kami' }, align: 'center' },
      content: { en: '<p>Enter your article content here...</p>', id: '<p>Masukkan konten artikel di sini...</p>' },
      button_expand: { en: 'Read More', id: 'Baca Selengkapnya' },
      button_collapse: { en: 'Show Less', id: 'Lebih Sedikit' },
    }),
  },
  {
    type: 'stock_information', name: 'Stock Information', description: 'Live stock price widget with chart and information panel', icon: 'FaChartLine', category: 'basic',
    componentPath: '@/components/main/StockInformation',
    defaultData: withCommon({
      title: { en: 'Get the latest information about LINK stock price today', id: 'Dapatkan informasi terkini mengenai harga saham LINK hari ini' },
      symbol: 'LINK.JK',
    }),
  },
  {
    type: 'testimonials', name: 'Testimonials', description: 'Client testimonial carousel with logos, quotes, and tags', icon: 'FaQuoteRight', category: 'basic',
    componentPath: '@/components/main/Testimonials',
    defaultData: withCommon({
      intro: {
        label: { en: 'TESTIMONIAL', id: 'TESTIMONIAL' },
        title: { en: 'Empowering Businesses Through Real Success Stories', id: 'Mendorong Bisnis Melalui Kisah Sukses Nyata' },
        description: '',
        align: 'left',
      },
      testimonials: [],
    }),
  },
  // MAIN (DB-driven)
  {
    type: 'news_highlight', name: 'News Featured', description: 'Featured news from DB', icon: 'FaNewspaper', category: 'main',
    componentPath: '@/components/main/NewsFeatured',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['news_highlight'],
  },
  {
    type: 'news_list', name: 'News List', description: 'Paginated news listing', icon: 'FaList', category: 'main',
    componentPath: '@/components/main/NewsList',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['news_list'],
  },
  {
    type: 'career_highlight', name: 'Career Sneak Peek', description: 'Featured careers', icon: 'FaUserTie', category: 'main',
    componentPath: '@/components/main/CareerSneakPeek',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['career_highlight'],
  },
  {
    type: 'career_list', name: 'Career', description: 'Full career listing', icon: 'FaBriefcase', category: 'main',
    componentPath: '@/components/main/Career',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['career_list'],
  },
  {
    type: 'management_list', name: 'Management', description: 'Board/management listing', icon: 'FaUsers', category: 'main',
    componentPath: '@/components/main/Management',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['management_list'],
  },
  {
    type: 'announcement_list', name: 'Announcement List', description: 'Announcements listing', icon: 'FaBullhorn', category: 'main',
    componentPath: '@/components/main/AnnouncementList',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['announcement_list'],
  },
  {
    type: 'report_list', name: 'Report List', description: 'Financial/corporate reports', icon: 'FaFileInvoice', category: 'main',
    componentPath: '@/components/main/ReportList',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['report_list'],
  },
  {
    type: 'awards_list', name: 'Awards Feed', description: 'Awards and achievements', icon: 'FaTrophy', category: 'main',
    componentPath: '@/components/main/AwardsFeed',
    defaultData: COMPONENT_DEFAULT_TEMPLATES['awards_list'],
  },
  // FORMS
  {
    type: 'form_registration_enterprise', name: 'Form Registration Enterprise', description: 'Form registration section for Enterprise BU', icon: 'FaWpforms', category: 'basic',
    componentPath: '@/components/main/FormRegistrationEnterprise',
    defaultData: withCommon({ title: { en: 'Enterprise Registration', id: 'Registrasi Enterprise' }, description: { en: 'Choose the form that suits your enterprise needs.', id: 'Pilih form sesuai kebutuhan enterprise Anda.' }, event_name: '', event_promo: '', event_page: '', max_participants: 5 }),
  },
  {
    type: 'form_registration_fiber', name: 'Form Registration Fiber', description: 'Form registration section for Fiber BU', icon: 'FaWpforms', category: 'basic',
    componentPath: '@/components/main/FormRegistrationFiber',
    defaultData: withCommon({ title: { en: 'Fiber Registration', id: 'Registrasi Fiber' }, description: { en: 'Register your Fiber service or submit an inquiry.', id: 'Daftarkan layanan Fiber atau ajukan pertanyaan.' }, event_name: '', event_promo: '', event_page: '', max_participants: 5 }),
  },
  {
    type: 'form_registration_media', name: 'Form Registration Media', description: 'Form registration section for Media BU', icon: 'FaWpforms', category: 'basic',
    componentPath: '@/components/main/FormRegistrationMedia',
    defaultData: withCommon({ title: { en: 'Media Registration', id: 'Registrasi Media' }, description: { en: 'Register your media partnership or campaign.', id: 'Daftarkan kemitraan atau kampanye media Anda.' }, event_name: '', event_promo: '', event_page: '', max_participants: 5 }),
  },
  {
    type: 'coverage_check_fiber', name: 'Coverage Check Fiber', description: 'Inline coverage check and Fiber inquiry section backed by Form Modules', icon: 'FaMapMarkedAlt', category: 'basic',
    componentPath: '@/components/main/CoverageCheckFiber',
    defaultData: withCommon({
      introData: {
        label: { en: 'CHECK COVERAGE', id: 'CEK COVERAGE' },
        title: { en: 'Find Fiber Network from Linknet Fiber in Your Area', id: 'Temukan Jaringan Fiber dari Linknet Fiber di Area Anda' },
        description: { en: 'Check Coverage Availability Now & Discover service options in your location.', id: 'Cek Ketersediaan Coverage Sekarang & Temukan pilihan layanan di lokasi Anda.' },
        align: 'left',
      },
      bg_image: '/assets/bg/bg-usp-home.jpg',
      bg_position_classes: 'bg-right-top md:bg-right',
      bg_size_class: 'bg-cover',
      title: { en: 'Check Fiber coverage and submit your request', id: 'Cek cakupan Fiber dan kirim permintaan Anda' },
      description: { en: 'Verify coverage first, then submit the live Fiber inquiry form with the selected location.', id: 'Verifikasi coverage terlebih dahulu, lalu kirim form inquiry Fiber dengan lokasi yang dipilih.' },
      coverage_title: { en: 'Step 1. Verify fiber coverage', id: 'Langkah 1. Verifikasi cakupan fiber' },
      coverage_description: { en: 'Select a covered address or switch to manual location entry if the site is not listed.', id: 'Pilih alamat yang tercakup atau gunakan input manual jika lokasi tidak ditemukan.' },
      request_title: { en: 'Step 2. Choose your request type', id: 'Langkah 2. Pilih jenis permintaan' },
      request_description: { en: 'This value maps directly to the Fiber inquiry module field.', id: 'Nilai ini langsung dipetakan ke field inquiry Fiber.' },
      form_title: { en: 'Step 3. Complete the Fiber inquiry', id: 'Langkah 3. Lengkapi inquiry Fiber' },
      form_description: { en: 'Coverage fields are prefilled from Step 1 and submitted into CMS Form Modules.', id: 'Field coverage diisi dari langkah 1 dan dikirim ke CMS Form Modules.' },
      summary_title: { en: 'Coverage summary', id: 'Ringkasan coverage' },
      summary_description: { en: 'These values are attached to the submission payload.', id: 'Nilai ini ikut dikirim di payload submission.' },
      cms_title: { en: 'CMS integration', id: 'Integrasi CMS' },
      cms_description: { en: 'Reads the active Fiber form module and submits through the public forms API.', id: 'Membaca form module Fiber aktif dan submit lewat public forms API.' },
      submit_label: { en: 'Submit Fiber Inquiry', id: 'Kirim Inquiry Fiber' },
      submitting_label: { en: 'Submitting...', id: 'Mengirim...' },
      success_title: { en: 'Fiber request submitted', id: 'Permintaan Fiber berhasil dikirim' },
      success_description: { en: 'The Fiber team has received your coverage context and inquiry details.', id: 'Tim Fiber telah menerima konteks coverage dan detail inquiry Anda.' },
      business_unit: 'fiber',
      form_slug: 'fiber-inquiry',
    }),
  },
  ...SYNCED_MAIN_COMPONENTS,
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
  };
  return aliases[type] || type; // Return original if no alias match
}
