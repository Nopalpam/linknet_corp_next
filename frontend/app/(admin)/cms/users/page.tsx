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
  Modal,
  Pagination,
  Spinner,
} from 'react-bootstrap';
import { userApi } from '@/lib/api/user.api';
import { UserListItem, GetUsersParams } from '@/types/user.types';
import { UserTable } from '@/components/users/UserTable';
import { UserForm } from '@/components/users/UserForm';
import { CanAccess } from '@/components/CanAccess';

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'email' | 'last_login_at'>(
    'created_at'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter, roleFilter, emailVerifiedFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: GetUsersParams = {
        page,
        limit,
        search: search || undefined,
        status: statusFilter as any,
        role: roleFilter || undefined,
        emailVerified:
          emailVerifiedFilter === 'true'
            ? true
            : emailVerifiedFilter === 'false'
            ? false
            : undefined,
        sortBy,
        sortOrder,
      };

      const response = await userApi.getUsers(params);
      setUsers(response.data);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      setSelectedUsers([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: any) => {
    try {
      await userApi.createUser(data);
      setSuccess('User created successfully');
      setShowCreateModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;

    try {
      await userApi.updateUser(selectedUser.id, data);
      setSuccess('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user: UserListItem) => {
    if (!confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      await userApi.deleteUser(user.id);
      setSuccess('User deleted successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleStatus = async (user: UserListItem) => {
    try {
      await userApi.toggleUserStatus(user.id);
      setSuccess('User status updated successfully');
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle user status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;

    if (
      !confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`)
    ) {
      return;
    }

    try {
      await userApi.bulkDeleteUsers({ userIds: selectedUsers });
      setSuccess(`${selectedUsers.length} user(s) deleted successfully`);
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete users');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h3 mb-0">User Management</h1>
          <p className="text-muted">Manage CMS users, roles, and permissions</p>
        </Col>
        <Col xs="auto">
          <CanAccess permission="users_management.create">
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <i className="bi bi-plus-circle me-2"></i>
              Create User
            </Button>
          </CanAccess>
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

      <Card>
        <Card.Body>
          {/* Filters */}
          <Form onSubmit={handleSearch} className="mb-4">
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="outline-secondary" type="submit">
                    Search
                  </Button>
                </InputGroup>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={emailVerifiedFilter}
                  onChange={(e) => {
                    setEmailVerifiedFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Verification</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setPage(1);
                  }}
                >
                  <option value="created_at">Created Date</option>
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="last_login_at">Last Login</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as any);
                    setPage(1);
                  }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>

          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <div className="mb-3">
              <Alert variant="info" className="d-flex align-items-center justify-content-between">
                <span>{selectedUsers.length} user(s) selected</span>
                <CanAccess permission="users_management.delete">
                  <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                    Delete Selected
                  </Button>
                </CanAccess>
              </Alert>
            </div>
          )}

          {/* Table */}
          <UserTable
            users={users}
            onEdit={(user) => {
              setSelectedUser(user);
              setShowEditModal(true);
            }}
            onDelete={handleDeleteUser}
            onToggleStatus={handleToggleStatus}
            selectedUsers={selectedUsers}
            onSelectUser={handleSelectUser}
            onSelectAll={handleSelectAll}
            loading={loading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                users
              </div>
              <Pagination>
                <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
                <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />

                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (page <= 3) {
                    pageNum = idx + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = page - 2 + idx;
                  }

                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={page === pageNum}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}

                <Pagination.Next
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                />
                <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Create User Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateModal(false)}
            isEdit={false}
          />
        </Modal.Body>
      </Modal>

      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <UserForm
              initialData={{
                email: selectedUser.email,
                firstName: selectedUser.firstName,
                lastName: selectedUser.lastName,
                phone: selectedUser.phone || undefined,
                roles: selectedUser.roles.map((r) => r.id),
                status: selectedUser.status,
              }}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              isEdit={true}
            />
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
