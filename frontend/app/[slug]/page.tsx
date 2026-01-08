import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicPageBySlug, getPublishedSlugs } from '@/lib/api/public';
import ComponentRenderer from '@/components/public/ComponentRenderer';

interface CatchAllPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for catch-all routes
export async function generateStaticParams() {
  try {
    const slugs = await getPublishedSlugs();
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CatchAllPageProps): Promise<Metadata> {
  try {
    const page = await getPublicPageBySlug(params.slug);

    return {
      title: page.metaTitle || page.title,
      description: page.metaDescription || undefined,
      keywords: page.metaKeywords?.join(', ') || undefined,
      openGraph: {
        title: page.metaTitle || page.title,
        description: page.metaDescription || undefined,
        images: page.ogImage ? [page.ogImage] : undefined,
      },
    };
  } catch (error) {
    return {
      title: 'Page Not Found',
    };
  }
}

// Revalidate every 60 seconds (ISR)
export const revalidate = 60;

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  try {
    const page = await getPublicPageBySlug(params.slug);

    return (
      <main className="catch-all-page">
        {/* Render all visible components */}
        {page.components
          .filter((component) => component.isVisible !== false)
          .map((component, index) => (
            <ComponentRenderer
              key={component.id}
              type={component.type}
              data={component.data}
              index={index}
            />
          ))}
      </main>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    notFound();
  }
}
