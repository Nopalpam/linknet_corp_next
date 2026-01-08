import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface PublicPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  template: string;
  status: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
  components: Array<{
    id: string;
    type: string;
    data: any;
    order: number;
    isVisible?: boolean;
  }>;
}

export interface PublicPageResponse {
  success: boolean;
  data: PublicPage;
  message?: string;
}

export interface SlugResponse {
  success: boolean;
  data: Array<{
    slug: string;
    updatedAt: string;
  }>;
}

/**
 * Get published page by slug (public)
 */
export const getPublicPageBySlug = async (slug: string): Promise<PublicPage> => {
  const response = await axios.get<PublicPageResponse>(`${apiUrl}/pages/${slug}`);
  return response.data.data;
};

/**
 * Get page preview by slug (with secret)
 */
export const getPagePreview = async (slug: string, secret: string): Promise<PublicPage> => {
  const response = await axios.get<PublicPageResponse>(
    `${apiUrl}/pages/preview/${slug}?secret=${secret}`
  );
  return response.data.data;
};

/**
 * Get all published page slugs (for SSG)
 */
export const getPublishedSlugs = async (): Promise<string[]> => {
  const response = await axios.get<SlugResponse>(`${apiUrl}/pages/slugs`);
  return response.data.data.map((p) => p.slug);
};

/**
 * Trigger page revalidation
 */
export const triggerPageRevalidation = async (pageId: string, token: string): Promise<void> => {
  await axios.post(
    `${apiUrl}/cms/pages/${pageId}/revalidate`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
