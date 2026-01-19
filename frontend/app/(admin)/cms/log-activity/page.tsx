'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Alert,
  Pagination,
  Spinner,
} from 'react-bootstrap';
import { FaSearch, FaTrash, FaChartBar } from 'react-icons/fa';
import { CanAccess } from '@/components/CanAccess';
import { Permission } from '@/lib/constants/permissions';
import { activityLogApi } from '@/lib/api/activityLog.api';
import { ActivityLogTable } from '@/components/activity-log/ActivityLogTable';
import { ActivityLogDetailModal } from '@/components/activity-log/ActivityLogDetailModal';
import { ActivityLogStatsModal } from '@/components/activity-log/ActivityLogStatsModal';
import type { ActivityLog, ActivityLogFilters } from '@/types/activityLog.types';

export default function LogActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filters, setFilters] = useState<ActivityLogFilters>({
    search: '',
    userId: '',
    module: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await activityLogApi.getLogs({
        page,
        limit,
        ...filters,
      });

      setLogs(response.data.logs);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ActivityLogFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      userId: '',
      module: '',
      action: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  const handleViewDetail = async (log: ActivityLog) => {
    try {
      const response = await activityLogApi.getLogById(log.id);
      setSelectedLog(response.data);
      setShowDetailModal(true);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch log details');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      await activityLogApi.deleteLog(id);
      setSuccess('Log deleted successfully');
      fetchLogs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete log');
    }
  };

  const handleCleanupOldLogs = async () => {
    const days = prompt('Delete logs older than how many days? (default: 90)', '90');
    if (!days) return;

    try {
      const response = await activityLogApi.cleanupLogs(parseInt(days));
      setSuccess(`Cleaned up ${response.data.deletedCount} old logs`);
      fetchLogs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to cleanup logs');
    }
  };

  return (
    <CanAccess permission={Permission.LOG_ACTIVITY_READ}>
      <Container fluid className="p-4">
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-1">Activity Logs</h2>
                <p className="text-muted mb-0">Monitor and audit system activities</p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowStatsModal(true)}
                  className="d-flex align-items-center gap-2"
                >
                  <FaChartBar /> Statistics
                </Button>
                <CanAccess permission={Permission.LOG_ACTIVITY_DELETE}>
                  <Button
                    variant="outline-danger"
                    onClick={handleCleanupOldLogs}
                    className="d-flex align-items-center gap-2"
                  >
                    <FaTrash /> Cleanup Old Logs
                  </Button>
                </CanAccess>
              </div>
            </div>
          </Col>
        </Row>

        {/* Alerts */}
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

        {/* Filters */}
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="g-3">
              {/* Search */}
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </InputGroup>
              </Col>

              {/* Module Filter */}
              <Col md={2}>
                <Form.Select
                  value={filters.module}
                  onChange={(e) => handleFilterChange('module', e.target.value)}
                >
                  <option value="">All Modules</option>
                  <option value="users">Users</option>
                  <option value="roles">Roles</option>
                  <option value="permissions">Permissions</option>
                  <option value="pages">Pages</option>
                  <option value="news">News</option>
                  <option value="awards">Awards</option>
                  <option value="contact">Contact</option>
                  <option value="files">Files</option>
                  <option value="auth">Auth</option>
                </Form.Select>
              </Col>

              {/* Action Filter */}
              <Col md={2}>
                <Form.Select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                >
                  <option value="">All Actions</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="login">Login</option>
                  <option value="logout">Logout</option>
                  <option value="read">Read</option>
                </Form.Select>
              </Col>

              {/* Date From */}
              <Col md={2}>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  placeholder="From Date"
                />
              </Col>

              {/* Date To */}
              <Col md={2}>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  placeholder="To Date"
                />
              </Col>

              {/* Reset Button */}
              <Col md={1}>
                <Button variant="outline-secondary" onClick={handleResetFilters} className="w-100">
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Activity Log Table */}
        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <ActivityLogTable
                  logs={logs}
                  onViewDetail={handleViewDetail}
                  onDelete={handleDelete}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div className="text-muted">
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                      entries
                    </div>
                    <Pagination>
                      <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                      <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />

                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        // Show first, last, current, and adjacent pages
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                          return (
                            <Pagination.Item
                              key={pageNum}
                              active={pageNum === page}
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </Pagination.Item>
                          );
                        } else if (pageNum === page - 2 || pageNum === page + 2) {
                          return <Pagination.Ellipsis key={pageNum} disabled />;
                        }
                        return null;
                      })}

                      <Pagination.Next
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Detail Modal */}
        {selectedLog && (
          <ActivityLogDetailModal
            show={showDetailModal}
            onHide={() => {
              setShowDetailModal(false);
              setSelectedLog(null);
            }}
            log={selectedLog}
          />
        )}

        {/* Stats Modal */}
        <ActivityLogStatsModal
          show={showStatsModal}
          onHide={() => setShowStatsModal(false)}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
        />
      </Container>
    </CanAccess>
  );
}
