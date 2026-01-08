'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPagePreview } from '@/lib/api/public';
import ComponentRenderer from '@/components/public/ComponentRenderer';
import { PublicPage } from '@/lib/api/public';

interface PreviewPageProps {
  params: {
    slug: string;
  };
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const searchParams = useSearchParams();
  const secret = searchParams.get('secret');
  const [page, setPage] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPreview = async () => {
      if (!secret) {
        setError('Preview secret is required');
        setLoading(false);
        return;
      }

      try {
        const pageData = await getPagePreview(params.slug, secret);
        setPage(pageData);
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Failed to load preview. Invalid secret or page not found.');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [params.slug, secret]);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Preview Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Page not found
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Preview Banner */}
      <div className="bg-warning text-dark py-2 sticky-top" style={{ zIndex: 1000 }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>Preview Mode:</strong> You are viewing unpublished content
            </span>
            <span className="badge bg-dark">
              Status: {page.status}
            </span>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="preview-page">
        {page.components.map((component, index) => (
          <ComponentRenderer
            key={component.id}
            type={component.type}
            data={component.data}
            isVisible={component.isVisible}
            index={index}
          />
        ))}
      </main>
    </>
  );
}
