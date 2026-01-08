'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
  Collapse,
} from 'react-bootstrap';
import { FaSave, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import '../tagsinput.css';
import { createPage, checkSlugAvailability } from '@/lib/api/pages';
import { CreatePageDto, PageStatus, PageTemplate } from '@/types/page';
import { toast } from 'react-hot-toast';
import FilePickerModal from '@/components/filemanager/FilePickerModal';

export default function CreatePagePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const [slugCheckLoading, setSlugCheckLoading] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [showFilePicker, setShowFilePicker] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    template: PageTemplate.DEFAULT,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [] as string[],
    ogImage: '',
    status: PageStatus.DRAFT,
  });

  // Auto-generate slug dari title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title]);

  // Check slug availability
  useEffect(() => {
    if (!formData.slug) {
      setSlugAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSlugCheckLoading(true);
        const result = await checkSlugAvailability(formData.slug);
        setSlugAvailable(result.available);
      } catch (error) {
        console.error('Failed to check slug:', error);
      } finally {
        setSlugCheckLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Slug is required');
      return;
    }

    if (slugAvailable === false) {
      toast.error('Slug is not available. Please use a different slug.');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreatePageDto = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        template: formData.template,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        metaKeywords: formData.metaKeywords.length
          ? formData.metaKeywords.join(', ')
          : undefined,
        ogImage: formData.ogImage.trim() || undefined,
        status: formData.status,
      };

      const response = await createPage(payload);
      toast.success('Page created successfully');

      // Redirect ke edit page untuk add components
      router.push(`/cms/pages/${response.data.id}/edit`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create page');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Create Page</h2>
              <p className="text-muted">Create a new page for your website</p>
            </div>
            <Button
              variant="outline-secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              <FaTimes className="me-2" />
              Cancel
            </Button>
          </div>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <Card className="mb-3">
          <Card.Header>
            <strong>Basic Information</strong>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Title <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter page title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Slug <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="page-slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                  {slugCheckLoading && (
                    <Form.Text className="text-muted">
                      <Spinner animation="border" size="sm" className="me-2" />
                      Checking availability...
                    </Form.Text>
                  )}
                  {!slugCheckLoading && slugAvailable === true && (
                    <Form.Text className="text-success">
                      ✓ Slug is available
                    </Form.Text>
                  )}
                  {!slugCheckLoading && slugAvailable === false && (
                    <Form.Text className="text-danger">
                      ✗ Slug already exists
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Template</Form.Label>
                  <Form.Select
                    value={formData.template}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        template: e.target.value as PageTemplate,
                      })
                    }
                  >
                    <option value={PageTemplate.DEFAULT}>
                      Default (with sidebar)
                    </option>
                    <option value={PageTemplate.FULL_WIDTH}>
                      Full Width (no sidebar)
                    </option>
                    <option value={PageTemplate.LANDING}>
                      Landing Page
                    </option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as PageStatus,
                      })
                    }
                  >
                    <option value={PageStatus.DRAFT}>Draft</option>
                    <option value={PageStatus.PUBLISHED}>Published</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SEO Section */}
        <Card className="mb-3">
          <Card.Header
            onClick={() => setSeoOpen(!seoOpen)}
            style={{ cursor: 'pointer' }}
            className="d-flex justify-content-between align-items-center"
          >
            <strong>SEO Metadata</strong>
            {seoOpen ? <FaChevronUp /> : <FaChevronDown />}
          </Card.Header>
          <Collapse in={seoOpen}>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Meta Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Leave empty to use page title"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                />
                <Form.Text className="text-muted">
                  Recommended: 50-60 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Meta Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter meta description for search engines"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                />
                <Form.Text className="text-muted">
                  Recommended: 150-160 characters
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Meta Keywords</Form.Label>
                <TagsInput
                  value={formData.metaKeywords}
                  onChange={(tags) =>
                    setFormData({ ...formData, metaKeywords: tags })
                  }
                  inputProps={{
                    placeholder: 'Add a keyword',
                  }}
                />
                <Form.Text className="text-muted">
                  Press Enter or comma to add keywords
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Open Graph Image</Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <Form.Control
                    type="text"
                    placeholder="Image URL"
                    value={formData.ogImage}
                    onChange={(e) =>
                      setFormData({ ...formData, ogImage: e.target.value })
                    }
                    readOnly
                  />
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowFilePicker(true)}
                  >
                    Browse
                  </Button>
                </div>
                {formData.ogImage && (
                  <div className="mt-2">
                    <img
                      src={formData.ogImage}
                      alt="OG Preview"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '120px',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                )}
              </Form.Group>
            </Card.Body>
          </Collapse>
        </Card>

        {/* Submit button */}
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                Create Page
              </>
            )}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </Form>

      {/* File Picker Modal */}
      {showFilePicker && (
        <FilePickerModal
          show={showFilePicker}
          onHide={() => setShowFilePicker(false)}
          onSelect={(file) => {
            setFormData({ ...formData, ogImage: file.url });
            setShowFilePicker(false);
          }}
          accept="image/*"
        />
      )}
    </Container>
  );
}
