// ===========================================
// Type Definitions for Public Website
// ===========================================

/** Page data returned from /api/v1/pages/:slug */
export interface Page {
  id: number;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: string;
  components: PageComponent[];
  createdAt: string;
  updatedAt: string;
}

/** Page component / section */
export interface PageComponent {
  id: number;
  componentType: string;
  title?: string;
  subtitle?: string;
  content?: string;
  order: number;
  settings?: Record<string, unknown>;
  items?: ComponentItem[];
}

/** Items within a component (e.g., slider items, cards) */
export interface ComponentItem {
  id: number;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  link?: string;
  order: number;
}

/** Menu item from /api/v1/menu */
export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target?: string;
  position: string;
  order: number;
  parentId?: number | null;
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
