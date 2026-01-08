// Component Types
export interface PageComponent {
  id: string;
  type: string;
  data: any;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentType {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  schema: any;
}

// Hero Section
export interface HeroSectionData {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

// Text Block
export interface TextBlockData {
  content: string;
}

// Image Gallery
export interface ImageGalleryData {
  images: Array<{
    url: string;
    caption?: string;
    alt: string;
  }>;
}

// Call to Action
export interface CallToActionData {
  title: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor?: string;
}

// Video Embed
export interface VideoEmbedData {
  video_url: string;
  poster_image?: string;
  caption?: string;
  autoplay?: boolean;
  controls?: boolean;
}

// Accordion
export interface AccordionData {
  items: Array<{
    title: string;
    content: string;
    is_open?: boolean;
  }>;
  allow_multiple?: boolean;
}

// Tabs
export interface TabsData {
  tabs: Array<{
    title: string;
    content: string;
    icon?: string;
  }>;
  style?: 'pills' | 'tabs' | 'underline';
}

// Testimonials
export interface TestimonialsData {
  items: Array<{
    name: string;
    position?: string;
    company?: string;
    photo?: string;
    quote: string;
    rating?: number;
  }>;
  layout?: 'carousel' | 'grid' | 'list';
  columns?: number;
}

// Team Grid
export interface TeamGridData {
  members: Array<{
    name: string;
    position: string;
    photo?: string;
    bio?: string;
    email?: string;
    phone?: string;
    social_links?: {
      linkedin?: string;
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  }>;
  columns?: number;
}

// Stats Counter
export interface StatsCounterData {
  stats: Array<{
    number: number;
    label: string;
    icon?: string;
    suffix?: string;
    prefix?: string;
  }>;
  animate?: boolean;
  columns?: number;
}

// Pricing Table
export interface PricingTableData {
  plans: Array<{
    name: string;
    price: number;
    currency?: string;
    period?: string;
    description?: string;
    features?: string[];
    is_featured?: boolean;
    cta_text?: string;
    cta_url?: string;
  }>;
  columns?: number;
}

// Contact Form
export interface ContactFormData {
  form_id: string;
  title?: string;
  description?: string;
  show_title?: boolean;
  success_message?: string;
}

// Latest News
export interface LatestNewsData {
  title?: string;
  category_id?: string;
  limit?: number;
  layout?: 'grid' | 'list' | 'carousel';
  columns?: number;
  show_excerpt?: boolean;
  show_date?: boolean;
  show_author?: boolean;
}

// Custom HTML
export interface CustomHtmlData {
  html_content: string;
  container_class?: string;
  enable_scripts?: boolean;
}

// API Request/Response Types
export interface CreateComponentRequest {
  componentType: string;
  componentData: any;
  order?: number;
  isVisible?: boolean;
}

export interface UpdateComponentRequest {
  componentType?: string;
  componentData?: any;
  order?: number;
  isVisible?: boolean;
}

export interface ReorderComponentsRequest {
  components: Array<{ id: string; order: number }>;
}

export interface ComponentsResponse {
  success: boolean;
  data: PageComponent[];
}

export interface ComponentResponse {
  success: boolean;
  data: PageComponent;
  message?: string;
}

export interface ComponentTypesResponse {
  success: boolean;
  data: ComponentType[];
}

export interface ComponentPreviewResponse {
  success: boolean;
  data: {
    html: string;
  };
}
