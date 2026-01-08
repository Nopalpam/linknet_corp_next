'use client';

import { useState } from 'react';
import { Container, Card, Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { pageApi } from '@/lib/api/page';
import { PageFormData } from '@/types/page';
import { PageForm } from '@/components/pages/PageForm';
import { FaFileAlt, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

interface ApiError {
  response?: {
    data?: {
      error?: string;
      details?: any;
    };
  };
}

export default function CreatePagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PageFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Convert keywords array to string if needed
      const payload = {
        title: data.title,
        slug: data.slug,
        template: data.template,
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
        metaKeywords: data.metaKeywords.length > 0 ? data.metaKeywords.join(', ') : undefined,
        ogImage: data.ogImage || undefined,
        status: data.status,
      };

      const response = await pageApi.createPage(payload);

      // Redirect to edit page to add components
      router.push(`/cms/pages/${response.data.id}/edit`);
    } catch (err) {
      console.error('Failed to create page:', err);
      const errorMessage =
        (err as ApiError)?.response?.data?.error || 'Failed to create page. Please try again.';
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Link href="/cms/pages" className="btn btn-link text-decoration-none">
          <FaArrowLeft className="me-2" />
          Back to Pages
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="mb-1">
          <FaFileAlt className="me-2" />
          Create New Page
        </h1>
        <p className="text-muted mb-0">
          Create a new page and configure its SEO metadata. After saving, you'll be able to add
          components to build the page content.
        </p>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      <PageForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </Container>
  );
}
