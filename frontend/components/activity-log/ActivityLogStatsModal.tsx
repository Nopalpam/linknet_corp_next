import React, { useState, useEffect } from 'react';
import { Modal, Card, Row, Col, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { activityLogApi } from '@/lib/api/activityLog.api';
import type { ActivityLogStats } from '@/types/activityLog.types';
import { FaUser, FaChartBar, FaCube } from 'react-icons/fa';

interface ActivityLogStatsModalProps {
  show: boolean;
  onHide: () => void;
  dateFrom?: string;
  dateTo?: string;
}

export function ActivityLogStatsModal({ show, onHide, dateFrom, dateTo }: ActivityLogStatsModalProps) {
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      fetchStats();
    }
  }, [show, dateFrom, dateTo]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApi.getStats({ dateFrom, dateTo });
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const getActionVariant = (action: string) => {
    const variants: Record<string, string> = {
      create: 'success',
      update: 'primary',
      delete: 'danger',
      login: 'info',
      logout: 'secondary',
      read: 'light',
    };
    return variants[action.toLowerCase()] || 'secondary';
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaChartBar className="me-2" />
          Activity Log Statistics
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : stats ? (
          <>
            {/* Total Logs */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <div className="text-center">
                  <h3 className="text-primary mb-2">{stats.totalLogs.toLocaleString()}</h3>
                  <p className="text-muted mb-0">Total Activity Logs</p>
                </div>
              </Card.Body>
            </Card>

            <Row className="g-4">
              {/* Action Statistics */}
              <Col md={6}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaChartBar className="me-2" />
                      Actions
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {stats.actionStats
                        .sort((a, b) => b.count - a.count)
                        .map((stat) => (
                          <ListGroup.Item
                            key={stat.action}
                            className="d-flex justify-content-between align-items-center px-0"
                          >
                            <div>
                              <Badge bg={getActionVariant(stat.action)} className="text-uppercase me-2">
                                {stat.action}
                              </Badge>
                            </div>
                            <Badge bg="secondary" pill>
                              {stat.count.toLocaleString()}
                            </Badge>
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

              {/* Module Statistics */}
              <Col md={6}>
                <Card className="h-100 shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaCube className="me-2" />
                      Modules
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {stats.moduleStats
                        .sort((a, b) => b.count - a.count)
                        .map((stat) => (
                          <ListGroup.Item
                            key={stat.module}
                            className="d-flex justify-content-between align-items-center px-0"
                          >
                            <span className="text-capitalize fw-bold">{stat.module}</span>
                            <Badge bg="secondary" pill>
                              {stat.count.toLocaleString()}
                            </Badge>
                          </ListGroup.Item>
                        ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>

              {/* Top Users */}
              <Col md={12}>
                <Card className="shadow-sm">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      <FaUser className="me-2" />
                      Top Active Users
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {stats.topUsers.map((userStat) => (
                        <ListGroup.Item
                          key={userStat.user?.id}
                          className="d-flex justify-content-between align-items-center px-0"
                        >
                          <div>
                            <div className="fw-bold">{userStat.user?.username}</div>
                            <small className="text-muted">{userStat.user?.email}</small>
                          </div>
                          <Badge bg="primary" pill>
                            {userStat.count.toLocaleString()} activities
                          </Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
