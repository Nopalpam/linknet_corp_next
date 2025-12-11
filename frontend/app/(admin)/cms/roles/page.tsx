'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { roleApi } from '@/lib/api/role.api';
import { Role } from '@/types/role.types';
import { RoleCard } from '@/components/roles/RoleCard';
import { DeleteConfirmationModal } from '@/components/roles/DeleteConfirmationModal';
import { CanAccess } from '@/components/CanAccess';
import { FaPlus, FaShieldAlt } from 'react-icons/fa';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roleApi.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to load roles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    router.push(`/cms/roles/${role.id}/edit`);
  };

  const handleDelete = (role: Role) => {
    setSelectedRole(role);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async (roleId: string, transferToRoleId?: string) => {
    try {
      setError(null);
      await roleApi.deleteRole(roleId);
      setSuccess(`Role deleted successfully${transferToRoleId ? ' and users transferred' : ''}`);
      setShowDeleteModal(false);
      setSelectedRole(null);
      await fetchRoles();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Failed to delete role:', err);
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to delete role';
      setError(errorMessage);
    }
  };

  const handleCreateNew = () => {
    router.push('/cms/roles/create');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading roles...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">
            <FaShieldAlt className="me-2" />
            Role Management
          </h1>
          <p className="text-muted mb-0">Manage user roles and permissions</p>
        </div>
        <CanAccess permission="role_management.create">
          <Button variant="primary" onClick={handleCreateNew}>
            <FaPlus className="me-1" />
            Create New Role
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

      {roles.length === 0 ? (
        <Alert variant="info">
          <h5>No roles found</h5>
          <p className="mb-0">Create your first role to get started.</p>
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {roles.map((role) => (
            <Col key={role.id}>
              <RoleCard role={role} onEdit={handleEdit} onDelete={handleDelete} />
            </Col>
          ))}
        </Row>
      )}

      <DeleteConfirmationModal
        show={showDeleteModal}
        role={selectedRole}
        availableRoles={roles}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedRole(null);
        }}
      />
    </Container>
  );
}
