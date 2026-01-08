'use client';

import { useState, useEffect } from 'react';
import { Form, Row, Col, Card, Accordion, Button } from 'react-bootstrap';
import { PageFormData, PageStatus, PageTemplate } from '@/types/page';
import { TagsInput } from 'react-tag-input-component';
import slugify from 'slugify';

interface PageFormProps {
  initialData?: Partial<PageFormData>;
  onSubmit: (data: PageFormData) => void;
  isSubmitting?: boolean;
}

const PAGE_TEMPLATES = [
  { value: PageTemplate.DEFAULT, label: 'Default (with sidebar)', description: 'Standard page with sidebar navigation' },
  { value: PageTemplate.FULL_WIDTH, label: 'Full Width', description: 'Full width page without sidebar' },
  { value: PageTemplate.LANDING, label: 'Landing Page', description: 'Custom landing page layout' },
];

const PAGE_STATUS = [
  { value: PageStatus.DRAFT, label: 'Draft', description: 'Save as draft (not visible to public)' },
  { value: PageStatus.PUBLISHED, label: 'Published', description: 'Publish to make visible to public' },
];

export function PageForm({ initialData, onSubmit, isSubmitting = false }: PageFormProps) {
  const [formData, setFormData] = useState<PageFormData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    template: initialData?.template || PageTemplate.DEFAULT,
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || [],
    ogImage: initialData?.ogImage || '',
    status: initialData?.status || PageStatus.DRAFT,
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title) {
      const generatedSlug = slugify(formData.title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g,
      });
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, slugManuallyEdited]);

  const handleChange = (field: keyof PageFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Card className="mb-3">
        <Card.Body>
          <h5 className="mb-3">Basic Information</h5>

          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label>
              Title <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter page title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </Form.Group>

          {/* Slug */}
          <Form.Group className="mb-3">
            <Form.Label>
              Slug <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="page-url-slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
            />
            <Form.Text className="text-muted">
              URL-friendly version of the title. Only lowercase letters, numbers, and dashes.
              {!slugManuallyEdited && ' (Auto-generated from title)'}
            </Form.Text>
          </Form.Group>

          {/* Template */}
          <Form.Group className="mb-3">
            <Form.Label>Template</Form.Label>
            <Form.Select
              value={formData.template}
              onChange={(e) => handleChange('template', e.target.value as PageTemplate)}
            >
              {PAGE_TEMPLATES.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {PAGE_TEMPLATES.find((t) => t.value === formData.template)?.description}
            </Form.Text>
          </Form.Group>

          {/* Status */}
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as PageStatus)}
            >
              {PAGE_STATUS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {PAGE_STATUS.find((s) => s.value === formData.status)?.description}
            </Form.Text>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* SEO Metadata Section */}
      <Card className="mb-3">
        <Card.Body>
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <strong>SEO Metadata</strong>
                <span className="text-muted ms-2">(Optional but recommended)</span>
              </Accordion.Header>
              <Accordion.Body>
                {/* Meta Title */}
                <Form.Group className="mb-3">
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Leave empty to use page title"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange('metaTitle', e.target.value)}
                    maxLength={255}
                  />
                  <Form.Text className="text-muted">
                    Recommended length: 50-60 characters. Used in search engine results.
                  </Form.Text>
                </Form.Group>

                {/* Meta Description */}
                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Brief description of the page content"
                    value={formData.metaDescription}
                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                    maxLength={500}
                  />
                  <Form.Text className="text-muted">
                    Recommended length: 150-160 characters. Used in search engine results.
                  </Form.Text>
                </Form.Group>

                {/* Meta Keywords */}
                <Form.Group className="mb-3">
                  <Form.Label>Meta Keywords</Form.Label>
                  <TagsInput
                    value={formData.metaKeywords}
                    onChange={(tags) => handleChange('metaKeywords', tags)}
                    name="keywords"
                    placeHolder="Press enter to add keyword"
                  />
                  <Form.Text className="text-muted">
                    Enter keywords separated by pressing Enter. Used for search optimization.
                  </Form.Text>
                </Form.Group>

                {/* OG Image */}
                <Form.Group className="mb-3">
                  <Form.Label>Open Graph Image</Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.ogImage}
                    onChange={(e) => handleChange('ogImage', e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Image URL for social media sharing. Recommended size: 1200x630px.
                  </Form.Text>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Card.Body>
      </Card>

      {/* Submit Button */}
      <div className="d-flex justify-content-end gap-2">
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Page'}
        </Button>
      </div>
    </Form>
  );
}
