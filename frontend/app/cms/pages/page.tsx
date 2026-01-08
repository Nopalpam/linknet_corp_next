'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Form,
  InputGroup,
  Spinner,
  Alert,
} from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import { getPages, deletePage } from '@/lib/api/pages';
import {
  PageStatus,
  PageTemplate,
  PageQueryParams,
  PageListItem,
} from '@/types/page';
import { formatDate } from '@/lib/utils/date';
import Pagination from '@/components/common/Pagination';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

export default function PagesListPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PageStatus | ''>('');
  const [templateFilter, setTemplateFilter] = useState<PageTemplate | ''>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Build query params
  const queryParams: PageQueryParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter as PageStatus }),
    ...(templateFilter && { template: templateFilter as PageTemplate }),
    sortBy,
    sortOrder,
  };

  // Fetch pages
  const { data, error, isLoading, mutate } = useSWR(
    ['/cms/pages', queryParams],
    () => getPages(queryParams)
  );

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    mutate();
  };

  // Handle delete
  const handleDelete = async (page: PageListItem) => {
    if (
      !confirm(
        `Are you sure you want to delete page "${page.title}"? This will also delete all associated components.`
      )
    ) {
      return;
    }

    try {
      await deletePage(page.id);
      toast.success('Page deleted successfully');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete page');
    }
  };

  // Status badge variant
  const getStatusVariant = (status: PageStatus) => {
    switch (status) {
      case PageStatus.PUBLISHED:
        return 'success';
      case PageStatus.DRAFT:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Template label
  const getTemplateLabel = (template: PageTemplate) => {
    switch (template) {
      case PageTemplate.DEFAULT:
        return 'Default';
      case PageTemplate.FULL_WIDTH:
        return 'Full Width';
      case PageTemplate.LANDING:
        return 'Landing';
      default:
        return template;
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">Pages</h2>
              <p className="text-muted">Manage your website pages</p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push('/cms/pages/create')}
            >
              <FaPlus className="me-2" />
              Create Page
            </Button>
          </div>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by title or slug..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as PageStatus | '');
                  setCurrentPage(1);
                }}
              >
                <option value="">All Status</option>
                <option value={PageStatus.DRAFT}>Draft</option>
                <option value={PageStatus.PUBLISHED}>Published</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={templateFilter}
                onChange={(e) => {
                  setTemplateFilter(e.target.value as PageTemplate | '');
                  setCurrentPage(1);
                }}
              >
                <option value="">All Templates</option>
                <option value={PageTemplate.DEFAULT}>Default</option>
                <option value={PageTemplate.FULL_WIDTH}>Full Width</option>
                <option value={PageTemplate.LANDING}>Landing</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Alert variant="danger">
              Failed to load pages. Please try again.
            </Alert>
          )}

          {/* Table */}
          {data && (
            <>
              {data.data.length === 0 ? (
                <Alert variant="info">
                  No pages found. Create your first page to get started.
                </Alert>
              ) : (
                <>
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
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.data.map((page) => (
                          <tr key={page.id}>
                            <td>
                              <strong>{page.title}</strong>
                            </td>
                            <td>
                              <code className="text-muted">{page.slug}</code>
                            </td>
                            <td>
                              <Badge bg={getStatusVariant(page.status)}>
                                {page.status}
                              </Badge>
                            </td>
                            <td>{getTemplateLabel(page.template)}</td>
                            <td>
                              <Badge bg="info">
                                {page.componentCount || 0}
                              </Badge>
                            </td>
                            <td className="text-muted">
                              {formatDate(page.updatedAt)}
                            </td>
                            <td>
                              <div className="d-flex gap-2 justify-content-end">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() =>
                                    router.push(`/cms/pages/${page.id}/edit`)
                                  }
                                  title="Edit page"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDelete(page)}
                                  title="Delete page"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {data.pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={data.pagination.page}
                      totalPages={data.pagination.totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
