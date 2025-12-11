'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  ListGroup,
  Table,
  Spinner,
} from 'react-bootstrap';
import { userApi } from '@/lib/api/user.api';
import { UserDetail } from '@/types/user.types';
import { StatusBadge } from '@/components/users/StatusBadge';
import { format } from 'date-fns';
import Link from 'next/link';
import { CanAccess } from '@/components/CanAccess';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getUserById(userId);
      setUser(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      await userApi.toggleUserStatus(user.id);
      setSuccess('User status updated successfully');
      fetchUser();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle user status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      await userApi.deleteUser(user.id);
      setSuccess('User deleted successfully');
      setTimeout(() => {
        router.push('/cms/users');
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <div className="mt-2">Loading user details...</div>
        </div>
      </Container>
    );
  }

  if (error && !user) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => router.push('/cms/users')}>
          Back to Users
        </Button>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">User not found</Alert>
        <Button variant="secondary" onClick={() => router.push('/cms/users')}>
          Back to Users
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <Button variant="outline-secondary" onClick={() => router.push('/cms/users')}>
              <i className="bi bi-arrow-left"></i>
            </Button>
            <div>
              <h1 className="h3 mb-0">User Details</h1>
              <p className="text-muted mb-0">View and manage user information</p>
            </div>
          </div>
        </Col>
      </Row>

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

      <Row>
        <Col lg={4}>
          {/* Profile Card */}
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '100px', height: '100px', fontSize: '32px' }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="rounded-circle"
                    style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                  />
                ) : (
                  getInitials(user.firstName, user.lastName)
                )}
              </div>
              <h4 className="mb-1">
                {user.firstName} {user.lastName}
              </h4>
              <p className="text-muted mb-2">@{user.username}</p>
              <StatusBadge status={user.status} className="mb-3" />

              <div className="d-grid gap-2">
                <CanAccess permission="users_management.update">
                  <Button
                    variant={user.status === 'ACTIVE' ? 'warning' : 'success'}
                    onClick={handleToggleStatus}
                    size="sm"
                  >
                    {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </Button>
                </CanAccess>
                <CanAccess permission="users_management.update">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(`/cms/users/${user.id}/edit`)}
                  >
                    Edit User
                  </Button>
                </CanAccess>
              </div>
            </Card.Body>
          </Card>

          {/* Stats Card */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Statistics</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Total Logins</span>
                <strong>{user.stats.totalLogins}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Total Activities</span>
                <strong>{user.stats.totalActivities}</strong>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Active Sessions</span>
                <strong>{user.stats.activeSessions}</strong>
              </ListGroup.Item>
            </ListGroup>
          </Card>

          {/* Danger Zone */}
          <CanAccess permission="users_management.delete">
            <Card border="danger" className="mb-4">
              <Card.Header className="bg-danger text-white">
                <h5 className="mb-0">Danger Zone</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted small mb-3">
                  Once you delete this user, there is no going back. Please be certain.
                </p>
                <Button variant="danger" onClick={handleDelete} size="sm">
                  Delete User
                </Button>
              </Card.Body>
            </Card>
          </CanAccess>
        </Col>

        <Col lg={8}>
          {/* Basic Information */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Basic Information</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Email</strong>
                </Col>
                <Col sm={8}>
                  <div className="d-flex align-items-center gap-2">
                    {user.email}
                    {user.emailVerifiedAt ? (
                      <Badge bg="success">Verified</Badge>
                    ) : (
                      <Badge bg="warning">Not Verified</Badge>
                    )}
                  </div>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Phone</strong>
                </Col>
                <Col sm={8}>{user.phone || <span className="text-muted">Not provided</span>}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Created At</strong>
                </Col>
                <Col sm={8}>{format(new Date(user.createdAt), 'PPpp')}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={4}>
                  <strong>Last Updated</strong>
                </Col>
                <Col sm={8}>{format(new Date(user.updatedAt), 'PPpp')}</Col>
              </Row>
              <Row>
                <Col sm={4}>
                  <strong>Last Login</strong>
                </Col>
                <Col sm={8}>
                  {user.lastLoginAt ? (
                    format(new Date(user.lastLoginAt), 'PPpp')
                  ) : (
                    <span className="text-muted">Never logged in</span>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Roles & Permissions */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Roles & Permissions</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-4">
                <h6>Assigned Roles</h6>
                <div className="d-flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Badge key={role.id} bg="info" pill className="px-3 py-2">
                      {role.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h6>Permissions ({user.permissions.length})</h6>
                <div className="d-flex flex-wrap gap-2">
                  {user.permissions.slice(0, 20).map((permission) => (
                    <Badge key={permission.id} bg="secondary" className="px-2 py-1">
                      {permission.slug}
                    </Badge>
                  ))}
                  {user.permissions.length > 20 && (
                    <Badge bg="dark" className="px-2 py-1">
                      +{user.permissions.length - 20} more
                    </Badge>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Recent Activities */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body>
              {user.recentActivities.length === 0 ? (
                <p className="text-muted mb-0">No recent activities</p>
              ) : (
                <div className="table-responsive">
                  <Table hover size="sm">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Module</th>
                        <th>Description</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.recentActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td>
                            <Badge bg="primary">{activity.action}</Badge>
                          </td>
                          <td>{activity.module}</td>
                          <td>{activity.description || <span className="text-muted">-</span>}</td>
                          <td>
                            <small>{format(new Date(activity.createdAt), 'MMM d, HH:mm')}</small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
