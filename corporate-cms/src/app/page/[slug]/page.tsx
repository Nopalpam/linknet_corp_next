import React from "react";
import Link from "next/link";
import { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://dev-be.lncorp.local";
const API_PREFIX = "/api/v1";

/**
 * Fetch published page by slug from the backend.
 * Uses the public endpoint: GET /api/v1/pages/:slug
 * 
 * Returns page with components from page_components table,
 * sorted by sort_order, filtered by is_visible.
 */
async function getPageBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/pages/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
}

/**
 * Generate static params for all published pages
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}${API_PREFIX}/pages/slugs`);
    if (!res.ok) return [];
    const json = await res.json();
    
    if (json.success && Array.isArray(json.data)) {
      return json.data.map((item: any) => ({
        slug: typeof item === "string" ? item : item.slug,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Dynamic metadata from page SEO fields
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: "Page Not Found" };
  }

  const title = page.metaTitle || page.title || "Page";
  const description = page.metaDescription || undefined;

  return {
    title: page.metaTitle ? { absolute: title } : title,
    description,
    keywords: page.metaKeywords || undefined,
    robots: {
      index: !page.noindex,
      follow: !page.nofollow,
    },
    openGraph: {
      title,
      description,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

/**
 * Public page renderer
 * Route: /page/[slug]
 * 
 * Renders a published page by loading its components from
 * the page_components table and rendering them via PageComponentRenderer.
 */
export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Page not found</p>
          <Link
            href="/"
            className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic import to keep this page as a Server Component for SEO
  const PageComponentRenderer = (await import("@/components/PageRenderer/PageComponentRenderer")).default;
  const components = (page.components || []).filter((component: any) => {
    const type = String(component.type || "").toLowerCase();
    if (page.showNavbar === false && type.startsWith("navbar")) return false;
    if (page.showFooter === false && type.startsWith("footer")) return false;
    return true;
  });

  return (
    <main className="min-h-screen">
      {/* Render all page components from page_components table */}
      <PageComponentRenderer components={components} />
    </main>
  );
}
