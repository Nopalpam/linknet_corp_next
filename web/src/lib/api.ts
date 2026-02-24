// ===========================================
// API Service - Fetch data from Express.js Backend
// ===========================================
// All data fetching functions for the public website.
// Uses native fetch() with Next.js caching/revalidation.

import { API_BASE_URL, DEFAULT_REVALIDATE } from "@/config/env";
import type {
  Page,
  MenuItem,
  Management,
  NewsArticle,
  ContactFormData,
  ApiResponse,
  PaginatedResponse,
} from "@/types";

// ----- Helper -----

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE, ...fetchOptions } = options || {};

  const url = `${API_BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...fetchOptions,
    next: { revalidate },
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText} - ${url}`);
  }

  return res.json();
}

// ----- Pages -----

/** Get a published page by its slug */
export async function getPageBySlug(slug: string): Promise<Page | null> {
  try {
    const response = await fetchApi<ApiResponse<Page>>(`/pages/${slug}`);
    return response.data;
  } catch {
    return null;
  }
}

/** Get all published page slugs (for static generation) */
export async function getPublishedSlugs(): Promise<string[]> {
  try {
    const response = await fetchApi<ApiResponse<string[]>>("/pages/slugs");
    return response.data;
  } catch {
    return [];
  }
}

// ----- Menus -----

/** Get public navigation menus */
export async function getMenus(): Promise<MenuItem[]> {
  try {
    const response = await fetchApi<ApiResponse<MenuItem[]>>("/menu");
    return response.data;
  } catch {
    return [];
  }
}

/** Get menus by position (e.g., 'header', 'footer') */
export async function getMenusByPosition(position: string): Promise<MenuItem[]> {
  try {
    const response = await fetchApi<ApiResponse<MenuItem[]>>(
      `/menu/position/${position}`
    );
    return response.data;
  } catch {
    return [];
  }
}

// ----- Management -----

/** Get active management members */
export async function getManagements(): Promise<Management[]> {
  try {
    const response = await fetchApi<ApiResponse<Management[]>>("/managements");
    return response.data;
  } catch {
    return [];
  }
}

/** Get management members grouped by category */
export async function getManagementsByCategory(): Promise<
  Record<string, Management[]>
> {
  try {
    const response = await fetchApi<ApiResponse<Record<string, Management[]>>>(
      "/managements/by-category"
    );
    return response.data;
  } catch {
    return {};
  }
}

// ----- News -----

/** Get active/published news articles */
export async function getNews(
  page = 1,
  limit = 10
): Promise<PaginatedResponse<NewsArticle>> {
  try {
    return await fetchApi<PaginatedResponse<NewsArticle>>(
      `/public/news?page=${page}&limit=${limit}`
    );
  } catch {
    return {
      success: false,
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
    };
  }
}

/** Get highlighted/featured news */
export async function getHighlightedNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetchApi<ApiResponse<NewsArticle[]>>(
      "/public/news/highlights"
    );
    return response.data;
  } catch {
    return [];
  }
}

/** Get single news by slug */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const response = await fetchApi<ApiResponse<NewsArticle>>(
      `/public/news/${slug}`
    );
    return response.data;
  } catch {
    return null;
  }
}

// ----- Contact -----

/** Submit contact form (client-side only) */
export async function submitContactForm(
  data: ContactFormData
): Promise<ApiResponse<unknown>> {
  const url = `${API_BASE_URL}/contact-us/submit`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message || "Failed to submit contact form"
    );
  }

  return res.json();
}
