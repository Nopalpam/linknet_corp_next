// ===========================================
// Type Definitions for Public Website
// ===========================================

/** Page data returned from /api/v1/pages/:slug */
export interface Page {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImage?: string;
  status: string;
  components: PageComponent[];
  createdAt: string;
  updatedAt: string;
}

/** Page component / section mapped from page_components table */
export interface PageComponent {
  id: string;
  componentType: string;
  componentData: Record<string, any>;
  order: number;
  isVisible: boolean;
  /** MAIN components may have enriched data fetched by the backend */
  mainData?: any;
}

/** Multilingual value pattern used in component_data */
export interface MultilingualValue {
  en: string;
  id: string;
}

/** Menu item from /api/v1/menu */
export interface MenuItem {
  id: number;
  title: string;
  url: string;
  slug?: string | null;
  target?: string;
  position: string;
  type: string;               // 'link' | 'dropdown' | 'mega'
  order: number;
  parentId?: number | null;
  sectionTitle?: string | null;
  sectionOrder?: number;
  icon?: string | null;
  image?: string | null;
  description?: string | null;
  badge?: string | null;
  isActive?: boolean;
  openNewTab?: boolean;
  cssClass?: string | null;
  translations?: Record<string, any> | null;
  children?: MenuItem[];
}

/** Management member from /api/v1/managements */
export interface Management {
  id: number;
  name: string;
  position: string;
  category: string;
  photo?: string;
  description?: string;
  order: number;
}

/** News article from /api/v1/public/news */
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  publishedAt: string;
  category?: NewsCategory;
  viewCount: number;
}

/** News category */
export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
}

/** Contact form submission payload */
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
