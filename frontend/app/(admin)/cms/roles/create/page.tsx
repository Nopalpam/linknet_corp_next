'use client';

import { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { roleApi } from '@/lib/api/role.api';
import { CreateRoleDto, UpdateRoleDto, GetPermissionsResponse } from '@/types/role.types';
import { RoleForm } from '@/components/roles/RoleForm';
import { CanAccess } from '@/components/CanAccess';
import { FaShieldAlt, FaPlus, FaHome } from 'react-icons/fa';

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

export default function CreateRolePage() {
  const router = useRouter();
  const [permissionsData, setPermissionsData] = useState<GetPermissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await roleApi.getPermissions();
      setPermissionsData(data);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      const apiError = err as ApiError;
      let errorMessage = 'Failed to load permissions';
      
      if (apiError?.response?.data?.error) {
        const errorData = apiError.response.data.error;
        // Extract message from error object
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

  const handleSubmit = async (data: CreateRoleDto | UpdateRoleDto) => {
    try {
      setError(null);
      // Type guard to ensure we have the slug property
      if (!('slug' in data)) {
        throw new Error('Slug is required for creating a role');
      }
      await roleApi.createRole(data as CreateRoleDto);
      router.push('/cms/roles');
    } catch (err) {
      console.error('Failed to create role:', err);
      // Handle both string and object error responses
      const apiError = err as ApiError;
      let errorMessage = 'Failed to create role';
      
      if (apiError?.response?.data?.error) {
        const errorData = apiError.response.data.error;
        // If error is an object with message property, extract the message
        if (typeof errorData === 'object' && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      
      setError(errorMessage);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/cms/roles');
  };

  return (
    <CanAccess permission="role_management.create">
      <Container className="py-4" style={{ maxWidth: '1000px' }}>
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} href="/cms/dashboard">
            <FaHome className="me-1" />
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} href="/cms/roles">
            <FaShieldAlt className="me-1" />
            Roles
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Create New Role</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-4 pb-3 border-bottom">
          <div className="d-flex align-items-center mb-2">
            <div className="p-2 bg-success bg-opacity-10 rounded me-3">
              <FaPlus className="text-success" size={24} />
            </div>
            <h1 className="mb-0 fw-bold">Create New Role</h1>
          </div>
          <p className="text-muted mb-0 ms-5 ps-2">
            Define a new role with specific permissions to control user access
          </p>
        </div>

        {error && (
          <Alert 
            variant="danger" 
            dismissible 
            onClose={() => setError(null)}
            className="shadow-sm border-0"
          >
            <Alert.Heading className="h6 mb-2">
              <strong>Error</strong>
            </Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        )}

        <Card className="border-0 shadow-sm">
          <Card.Body className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner 
                  animation="border" 
                  role="status"
                  style={{ width: '3rem', height: '3rem' }}
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted fw-medium">Loading permissions...</p>
              </div>
            ) : (
              <RoleForm
                permissionsData={permissionsData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                loading={loading}
              />
            )}
          </Card.Body>
        </Card>
      </Container>
    </CanAccess>
  );
}
