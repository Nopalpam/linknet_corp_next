import React from 'react';
import { Modal, Badge, Card, Row, Col, Nav, Tab } from 'react-bootstrap';
import type { ActivityLog } from '@/types/activityLog.types';
import { format } from 'date-fns';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface ActivityLogDetailModalProps {
  show: boolean;
  onHide: () => void;
  log: ActivityLog;
}

export function ActivityLogDetailModal({ show, onHide, log }: ActivityLogDetailModalProps) {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy, HH:mm:ss');
    } catch {
      return date;
    }
  };

  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  const getActionBadge = (action: string) => {
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
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Activity Log Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tab.Container defaultActiveKey="details">
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="details">Details</Nav.Link>
            </Nav.Item>
            {log.oldData && log.newData && (
              <Nav.Item>
                <Nav.Link eventKey="diff">Diff View</Nav.Link>
              </Nav.Item>
            )}
            {log.oldData && (
              <Nav.Item>
                <Nav.Link eventKey="oldData">Old Data</Nav.Link>
              </Nav.Item>
            )}
            {log.newData && (
              <Nav.Item>
                <Nav.Link eventKey="newData">New Data</Nav.Link>
              </Nav.Item>
            )}
            {log.metadata && (
              <Nav.Item>
                <Nav.Link eventKey="metadata">Metadata</Nav.Link>
              </Nav.Item>
            )}
          </Nav>

          <Tab.Content>
            {/* Details Tab */}
            <Tab.Pane eventKey="details">
              <Card>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Log ID</label>
                        <div className="fw-bold">
                          <code>{log.id}</code>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Date & Time</label>
                        <div className="fw-bold">{formatDate(log.createdAt)}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">User</label>
                        <div className="fw-bold">
                          {log.user ? (
                            <>
                              <div>{log.user.username}</div>
                              <small className="text-muted">{log.user.email}</small>
                            </>
                          ) : (
                            <span className="text-muted">System</span>
                          )}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Action</label>
                        <div>
                          <Badge bg={getActionBadge(log.action)} className="text-uppercase">
                            {log.action}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Module</label>
                        <div className="fw-bold text-capitalize">{log.module}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">Record ID</label>
                        <div className="fw-bold">
                          {log.recordId ? <code>{log.recordId}</code> : <span className="text-muted">-</span>}
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">IP Address</label>
                        <div className="fw-bold">{log.ipAddress || '-'}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="text-muted small">User Agent</label>
                        <div className="fw-bold small">{log.userAgent || '-'}</div>
                      </div>
                    </Col>
                    {log.description && (
                      <Col md={12}>
                        <div className="mb-3">
                          <label className="text-muted small">Description</label>
                          <div className="fw-bold">{log.description}</div>
                        </div>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            </Tab.Pane>

            {/* Diff View Tab */}
            {log.oldData && log.newData && (
              <Tab.Pane eventKey="diff">
                <Card>
                  <Card.Body>
                    <ReactDiffViewer
                      oldValue={formatJSON(log.oldData)}
                      newValue={formatJSON(log.newData)}
                      splitView={true}
                      leftTitle="Old Data"
                      rightTitle="New Data"
                      showDiffOnly={false}
                      useDarkTheme={false}
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* Old Data Tab */}
            {log.oldData && (
              <Tab.Pane eventKey="oldData">
                <Card>
                  <Card.Body>
                    <pre className="bg-light p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
                      <code>{formatJSON(log.oldData)}</code>
                    </pre>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* New Data Tab */}
            {log.newData && (
              <Tab.Pane eventKey="newData">
                <Card>
                  <Card.Body>
                    <pre className="bg-light p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
                      <code>{formatJSON(log.newData)}</code>
                    </pre>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}

            {/* Metadata Tab */}
            {log.metadata && (
              <Tab.Pane eventKey="metadata">
                <Card>
                  <Card.Body>
                    <pre className="bg-light p-3 rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
                      <code>{formatJSON(log.metadata)}</code>
                    </pre>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
}
