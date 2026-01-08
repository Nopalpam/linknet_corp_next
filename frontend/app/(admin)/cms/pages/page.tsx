'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Table,
  Badge,
  Spinner,
  Alert,
  Dropdown,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { pageApi } from '@/lib/api/page';
import { PageListItem, PageStatus, PageTemplate } from '@/types/page';
import { CanAccess } from '@/components/CanAccess';
import { FaPlus, FaFileAlt, FaSearch, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { format } from 'date-fns';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const PAGE_TEMPLATES = [
  { value: PageTemplate.DEFAULT, label: 'Default (with sidebar)' },
  { value: PageTemplate.FULL_WIDTH, label: 'Full Width' },
  { value: PageTemplate.LANDING, label: 'Landing Page' },
];

const PAGE_STATUS = [
  { value: PageStatus.DRAFT, label: 'Draft', variant: 'secondary' },
  { value: PageStatus.PUBLISHED, label: 'Published', variant: 'success' },
];

export default function PagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [templateFilter, setTemplateFilter] = useState<PageTemplate | ''>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchPages();
  }, [page, search, statusFilter, templateFilter]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await pageApi.getPages({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
        template: templateFilter || undefined,
        sortBy: 'updatedAt',
        sortOrder: 'desc',
      });
      setPages(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to load pages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as PageStatus | '');
    setPage(1);
  };

  const handleTemplateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTemplateFilter(e.target.value as PageTemplate | '');
    setPage(1);
  };

  const handleEdit = (pageId: string) => {
    router.push(`/cms/pages/${pageId}/edit`);
  };

  const handleDelete = async (pageId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setError(null);
      await pageApi.deletePage(pageId);
      setSuccess('Page deleted successfully');
      await fetchPages();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to delete page:', err);
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to delete page';
      setError(errorMessage);
    }
  };

  const getStatusBadge = (status: PageStatus) => {
    const statusConfig = PAGE_STATUS.find((s) => s.value === status);
    return (
      <Badge bg={statusConfig?.variant || 'secondary'}>{statusConfig?.label || status}</Badge>
    );
  };

  const getTemplateLabel = (template: PageTemplate) => {
    return PAGE_TEMPLATES.find((t) => t.value === template)?.label || template;
  };

  if (loading && pages.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading pages...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            <FaFileAlt className="me-2" />
            Page Management
          </h1>
          <p className="text-muted mb-0">Manage website pages with SEO metadata</p>
        </div>
        <CanAccess permission="pages_create">
          <Button variant="primary" onClick={() => router.push('/cms/pages/create')}>
            <FaPlus className="me-2" />
            Create Page
          </Button>
        </CanAccess>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by title or slug..."
                  value={search}
                  onChange={handleSearchChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Select value={statusFilter} onChange={handleStatusFilterChange}>
                <option value="">All Status</option>
                {PAGE_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={templateFilter} onChange={handleTemplateFilterChange}>
                <option value="">All Templates</option>
                {PAGE_TEMPLATES.map((template) => (
                  <option key={template.value} value={template.value}>
                    {template.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Table */}
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Template</th>
                  <th>Components</th>
                  <th>Updated</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No pages found
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page.id}>
                      <td>
                        <strong>{page.title}</strong>
                      </td>
                      <td>
                        <code>/{page.slug}</code>
                      </td>
                      <td>{getStatusBadge(page.status)}</td>
                      <td>
                        <small className="text-muted">{getTemplateLabel(page.template)}</small>
                      </td>
                      <td>
                        <Badge bg="info">{page.componentCount || 0}</Badge>
                      </td>
                      <td>
                        <small className="text-muted">
                          {format(new Date(page.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </small>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="link" size="sm" className="text-dark">
                            ⋮
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <CanAccess permission="pages_update">
                              <Dropdown.Item onClick={() => handleEdit(page.id)}>
                                <FaEdit className="me-2" />
                                Edit
                              </Dropdown.Item>
                            </CanAccess>
                            <CanAccess permission="pages_delete">
                              <Dropdown.Item
                                onClick={() => handleDelete(page.id, page.title)}
                                className="text-danger"
                              >
                                <FaTrash className="me-2" />
                                Delete
                              </Dropdown.Item>
                            </CanAccess>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                pages
              </div>
              <div className="btn-group">
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button variant="outline-primary" size="sm" disabled>
                  Page {page} of {totalPages}
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
