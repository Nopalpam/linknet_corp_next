'use client';

import { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { roleApi } from '@/lib/api/role.api';
import { Role } from '@/types/role.types';
import { RoleCard } from '@/components/roles/RoleCard';
import { DeleteConfirmationModal } from '@/components/roles/DeleteConfirmationModal';
import { CanAccess } from '@/components/CanAccess';
import { FaPlus, FaShieldAlt, FaInbox } from 'react-icons/fa';

interface ApiError {
  response?: {
    data?: {
      error?: string | {
        code: string;
        message: string;
      };
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
      const apiError = err as ApiError;
      let errorMessage = 'Failed to load roles';
      
      if (apiError?.response?.data?.error) {
        const errorData = apiError.response.data.error;
        if (typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
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
      const apiError = err as ApiError;
      let errorMessage = 'Failed to delete role';
      
      if (apiError?.response?.data?.error) {
        const errorData = apiError.response.data.error;
        if (typeof errorData === 'object' && 'message' in errorData) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleCreateNew = () => {
    router.push('/cms/roles/create');
  };

  if (loading) {
    return (
      <Container className="py-4" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted fw-medium">Loading roles...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4" style={{ maxWidth: '1400px' }}>
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-start mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center mb-2">
            <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
              <FaShieldAlt className="text-primary" size={24} />
            </div>
            <h1 className="mb-0 fw-bold">Role Management</h1>
          </div>
          <p className="text-muted mb-0 ms-5 ps-2">Manage user roles and permissions for access control</p>
        </div>
        <CanAccess permission="role_management.create">
          <Button 
            variant="primary" 
            onClick={handleCreateNew}
            size="lg"
            className="shadow-sm"
            style={{ minWidth: '180px' }}
          >
            <FaPlus className="me-2" />
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
        <Card className="border-0 shadow-sm" style={{ marginTop: '3rem' }}>
          <Card.Body className="text-center py-5">
            <div className="mb-4">
              <div className="d-inline-flex p-4 bg-primary bg-opacity-10 rounded-circle mb-3">
                <FaInbox className="text-primary" size={48} />
              </div>
              <h4 className="fw-bold mb-2">No Roles Found</h4>
              <p className="text-muted mb-4">
                Get started by creating your first role to manage user permissions and access control.
              </p>
            </div>
            <CanAccess permission="role_management.create">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleCreateNew}
                className="shadow-sm"
              >
                <FaPlus className="me-2" />
                Create Your First Role
              </Button>
            </CanAccess>
          </Card.Body>
        </Card>
      ) : (
        <>
          <div className="mb-3">
            <p className="text-muted mb-0">
              <strong>{roles.length}</strong> {roles.length === 1 ? 'role' : 'roles'} found
            </p>
          </div>
          <Row xs={1} md={2} xl={3} className="g-4">
            {roles.map((role) => (
              <Col key={role.id}>
                <RoleCard role={role} onEdit={handleEdit} onDelete={handleDelete} />
              </Col>
            ))}
          </Row>
        </>
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
