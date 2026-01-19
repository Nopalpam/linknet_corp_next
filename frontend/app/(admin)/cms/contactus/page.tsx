'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  InputGroup,
  Badge,
  Pagination,
  Spinner,
  Alert,
  Nav,
} from 'react-bootstrap';
import {
  FaSearch,
  FaTrash,
  FaEye,
  FaDownload,
  FaEnvelope,
  FaBriefcase,
  FaQuestionCircle,
  FaUserTie,
  FaEllipsisH,
} from 'react-icons/fa';
import { format } from 'date-fns';
import api from '@/lib/api';
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';

interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: 'BUSINESS' | 'SUPPORT' | 'CAREER' | 'OTHERS';
  status: 'NEW' | 'READ';
  submittedAt: string;
  readAt?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatsData {
  total: number;
  new: number;
  read: number;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'NEW' | 'READ'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    new: 0,
    read: 0,
  });
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/cms/contactus', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search,
          status: statusFilter === 'all' ? '' : statusFilter,
        },
      });

      if (response.data.success) {
        setSubmissions(response.data.data.submissions);
        setPagination(response.data.data.pagination);
        setStats(response.data.data.stats);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, search, statusFilter]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(submissions.map((sub) => sub.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Handle select one
  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Delete ${selectedIds.length} submission(s)?`)) return;

    try {
      const response = await api.post('/cms/contactus/destroy-multiple', {
        ids: selectedIds,
      });

      if (response.data.success) {
        setSuccess('Submissions deleted successfully');
        setSelectedIds([]);
        fetchSubmissions();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete submissions');
      console.error('Error deleting submissions:', err);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await api.get('/cms/contactus/export', {
        params: {
          status: statusFilter === 'all' ? '' : statusFilter,
          search,
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contact-submissions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export submissions');
      console.error('Error exporting:', err);
    }
  };

  // Handle view detail
  const handleViewDetail = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
    
    // Mark as read
    if (submission.status === 'NEW') {
      try {
        await api.patch(`/cms/contactus/${submission.id}/mark-read`);
        fetchSubmissions();
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  // Get inquiry type icon
  const getInquiryIcon = (type: string) => {
    switch (type) {
      case 'BUSINESS':
        return <FaBriefcase />;
      case 'SUPPORT':
        return <FaQuestionCircle />;
      case 'CAREER':
        return <FaUserTie />;
      case 'OTHERS':
        return <FaEllipsisH />;
      default:
        return null;
    }
  };

  return (
    <CanAccess permission={Permission.CONTACT_SUBMISSIONS_READ}>
      <Container fluid className="p-4">
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">Contact Submissions</h2>
                <p className="text-muted mb-0">Manage customer inquiries and contact form submissions</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alerts */}
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card className="shadow-sm">
          {/* Stats Tabs */}
          <Card.Header className="bg-white">
            <Nav variant="tabs" activeKey={statusFilter} onSelect={(k) => setStatusFilter(k as any)}>
              <Nav.Item>
                <Nav.Link eventKey="all">
                  All <Badge bg="secondary">{stats.total}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="NEW">
                  New <Badge bg="primary">{stats.new}</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="READ">
                  Read <Badge bg="secondary">{stats.read}</Badge>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body>
            {/* Actions Bar */}
            <Row className="mb-3">
              <Col md={6}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, company..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={6} className="text-end">
                {selectedIds.length > 0 && (
                  <Button
                    variant="outline-danger"
                    onClick={handleBulkDelete}
                    className="me-2"
                  >
                    <FaTrash className="me-1" />
                    Delete ({selectedIds.length})
                  </Button>
                )}
                <Button variant="outline-primary" onClick={handleExport}>
                  <FaDownload className="me-1" />
                  Export CSV
                </Button>
              </Col>
            </Row>

            {/* Table */}
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '50px' }}>
                          <Form.Check
                            type="checkbox"
                            checked={submissions.length > 0 && selectedIds.length === submissions.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th>Status</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Company</th>
                        <th>Type</th>
                        <th>Submitted</th>
                        <th style={{ width: '100px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-5 text-muted">
                            No submissions found
                          </td>
                        </tr>
                      ) : (
                        submissions.map((submission) => (
                          <tr
                            key={submission.id}
                            className={submission.status === 'NEW' ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleViewDetail(submission)}
                          >
                            <td onClick={(e) => e.stopPropagation()}>
                              <Form.Check
                                type="checkbox"
                                checked={selectedIds.includes(submission.id)}
                                onChange={() => handleSelectOne(submission.id)}
                              />
                            </td>
                            <td>
                              <Badge bg={submission.status === 'NEW' ? 'primary' : 'secondary'}>
                                {submission.status}
                              </Badge>
                            </td>
                            <td>
                              <strong className={submission.status === 'NEW' ? 'fw-bold' : ''}>
                                {submission.firstName} {submission.lastName}
                              </strong>
                            </td>
                            <td>
                              <FaEnvelope className="me-2 text-muted" />
                              {submission.email}
                            </td>
                            <td>{submission.company || '-'}</td>
                            <td>
                              {getInquiryIcon(submission.inquiryType)}{' '}
                              <span className="ms-1">{submission.inquiryType}</span>
                            </td>
                            <td>
                              <small>
                                {format(new Date(submission.submittedAt), 'MMM dd, yyyy HH:mm')}
                              </small>
                            </td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetail(submission)}
                              >
                                <FaEye />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-muted">
                      Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} entries
                    </div>
                    <Pagination>
                      <Pagination.First
                        onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                        disabled={pagination.page === 1}
                      />
                      <Pagination.Prev
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                        }
                        disabled={pagination.page === 1}
                      />

                      {[...Array(pagination.totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === pagination.totalPages ||
                          (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === pagination.page}
                              onClick={() =>
                                setPagination((prev) => ({ ...prev, page: pageNum }))
                              }
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        } else if (
                          pageNum === pagination.page - 2 ||
                          pageNum === pagination.page + 2
                        ) {
                          return <Pagination.Ellipsis key={pageNum} disabled />;
                        }
                        return null;
                      })}

                      <Pagination.Next
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                        }
                        disabled={pagination.page === pagination.totalPages}
                      />
                      <Pagination.Last
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: pagination.totalPages }))
                        }
                        disabled={pagination.page === pagination.totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Detail Modal - Simple version without separate component */}
        {showDetailModal && selectedSubmission && (
          <div
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowDetailModal(false)}
          >
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Contact Submission Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDetailModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <Row className="g-3">
                    <Col md={6}>
                      <strong>Name:</strong>
                      <p>{selectedSubmission.firstName} {selectedSubmission.lastName}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Email:</strong>
                      <p>{selectedSubmission.email}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Phone:</strong>
                      <p>{selectedSubmission.phone || '-'}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Company:</strong>
                      <p>{selectedSubmission.company || '-'}</p>
                    </Col>
                    <Col md={6}>
                      <strong>Inquiry Type:</strong>
                      <p>
                        {getInquiryIcon(selectedSubmission.inquiryType)}{' '}
                        {selectedSubmission.inquiryType}
                      </p>
                    </Col>
                    <Col md={6}>
                      <strong>Status:</strong>
                      <p>
                        <Badge bg={selectedSubmission.status === 'NEW' ? 'primary' : 'secondary'}>
                          {selectedSubmission.status}
                        </Badge>
                      </p>
                    </Col>
                    <Col md={12}>
                      <strong>Subject:</strong>
                      <p>{selectedSubmission.subject}</p>
                    </Col>
                    <Col md={12}>
                      <strong>Message:</strong>
                      <p className="bg-light p-3 rounded">{selectedSubmission.message}</p>
                    </Col>
                    <Col md={12}>
                      <strong>Submitted At:</strong>
                      <p>
                        {format(
                          new Date(selectedSubmission.submittedAt),
                          'MMMM dd, yyyy HH:mm:ss'
                        )}
                      </p>
                    </Col>
                  </Row>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </CanAccess>
  );
}

