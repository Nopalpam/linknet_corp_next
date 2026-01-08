'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { pageApi } from '@/lib/api/page';
import { PageFormData, PageDetail } from '@/types/page';
import { PageForm } from '@/components/pages/PageForm';
import { FaFileAlt, FaArrowLeft, FaSave } from 'react-icons/fa';
import Link from 'next/link';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function EditPagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [page, setPage] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [params.id]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pageApi.getPageById(params.id);
      setPage(response.data);
    } catch (err) {
      console.error('Failed to fetch page:', err);
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to load page';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: PageFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      // Convert keywords array to string if needed
      const payload = {
        title: data.title,
        slug: data.slug,
        template: data.template,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords.length > 0 ? data.metaKeywords.join(', ') : null,
        ogImage: data.ogImage || null,
        status: data.status,
      };

      const response = await pageApi.updatePage(params.id, payload);
      setPage(response.data);
      setSuccess('Page updated successfully');

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to update page:', err);
      const errorMessage =
        (err as ApiError)?.response?.data?.error || 'Failed to update page. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading page...</p>
        </div>
      </Container>
    );
  }

  if (error && !page) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Link href="/cms/pages" className="btn btn-primary">
          Back to Pages
        </Link>
      </Container>
    );
  }

  if (!page) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Page not found</Alert>
        <Link href="/cms/pages" className="btn btn-primary">
          Back to Pages
        </Link>
      </Container>
    );
  }

  // Prepare initial data for form
  const initialData: Partial<PageFormData> = {
    title: page.title,
    slug: page.slug,
    template: page.template,
    metaTitle: page.metaTitle || '',
    metaDescription: page.metaDescription || '',
    metaKeywords: page.metaKeywords ? page.metaKeywords.split(',').map((k) => k.trim()) : [],
    ogImage: page.ogImage || '',
    status: page.status,
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <Link href="/cms/pages" className="btn btn-link text-decoration-none">
            <FaArrowLeft className="me-2" />
            Back to Pages
          </Link>
        </div>
        <div>
          <h1 className="mb-0">
            <FaFileAlt className="me-2" />
            Edit Page: {page.title}
          </h1>
        </div>
        <div style={{ width: '150px' }}></div> {/* Spacer for alignment */}
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-3">
          {success}
        </Alert>
      )}

      {/* Split Panel Layout */}
      <Row>
        {/* Left Panel: Page Settings */}
        <Col lg={4} xl={3} className="mb-3">
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Page Settings</h5>
            </Card.Header>
            <Card.Body>
              <PageForm
                initialData={initialData}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Right Panel: Component Builder */}
        <Col lg={8} xl={9}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Page Components</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5 text-muted">
                <p className="mb-0">Component builder will be available in the next phase.</p>
                <p className="small">
                  For now, you can only edit the page settings on the left panel.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
