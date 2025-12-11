'use client';

import { useState } from 'react';
import { Table, Button, Form, Badge, Dropdown } from 'react-bootstrap';
import { UserListItem } from '@/types/user.types';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import Link from 'next/link';

interface UserTableProps {
  users: UserListItem[];
  onEdit?: (user: UserListItem) => void;
  onDelete?: (user: UserListItem) => void;
  onToggleStatus?: (user: UserListItem) => void;
  selectedUsers?: string[];
  onSelectUser?: (userId: string) => void;
  onSelectAll?: () => void;
  loading?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
  selectedUsers = [],
  onSelectUser,
  onSelectAll,
  loading = false,
}: UserTableProps) {
  const isSelected = (userId: string) => selectedUsers.includes(userId);
  const allSelected = users.length > 0 && selectedUsers.length === users.length;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="table-responsive">
      <Table hover>
        <thead>
          <tr>
            {onSelectUser && (
              <th style={{ width: '50px' }}>
                <Form.Check
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  disabled={loading || users.length === 0}
                />
              </th>
            )}
            <th>User</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Email Verified</th>
            <th>Last Login</th>
            <th>Created</th>
            <th style={{ width: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={onSelectUser ? 9 : 8} className="text-center py-5">
                <div className="text-muted">
                  {loading ? 'Loading users...' : 'No users found'}
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                {onSelectUser && (
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={isSelected(user.id)}
                      onChange={() => onSelectUser(user.id)}
                      disabled={loading}
                    />
                  </td>
                )}
                <td>
                  <div className="d-flex align-items-center">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                      style={{ width: '40px', height: '40px', fontSize: '14px' }}
                    >
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="rounded-circle"
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                      ) : (
                        getInitials(user.firstName, user.lastName)
                      )}
                    </div>
                    <div>
                      <div className="fw-bold">
                        {user.firstName} {user.lastName}
                      </div>
                      <small className="text-muted">@{user.username}</small>
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <div className="d-flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge key={role.id} bg="info" pill>
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td>
                  {user.emailVerifiedAt ? (
                    <Badge bg="success">Verified</Badge>
                  ) : (
                    <Badge bg="warning">Not Verified</Badge>
                  )}
                </td>
                <td>
                  {user.lastLoginAt ? (
                    <small>{format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')}</small>
                  ) : (
                    <small className="text-muted">Never</small>
                  )}
                </td>
                <td>
                  <small>{format(new Date(user.createdAt), 'MMM d, yyyy')}</small>
                </td>
                <td>
                  <Dropdown>
                    <Dropdown.Toggle variant="light" size="sm" id={`dropdown-${user.id}`}>
                      Actions
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} href={`/cms/users/${user.id}`}>
                        View Details
                      </Dropdown.Item>
                      {onEdit && (
                        <Dropdown.Item onClick={() => onEdit(user)} disabled={loading}>
                          Edit
                        </Dropdown.Item>
                      )}
                      {onToggleStatus && (
                        <Dropdown.Item onClick={() => onToggleStatus(user)} disabled={loading}>
                          {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Dropdown.Item>
                      )}
                      {onDelete && (
                        <>
                          <Dropdown.Divider />
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => onDelete(user)}
                            disabled={loading}
                          >
                            Delete
                          </Dropdown.Item>
                        </>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
