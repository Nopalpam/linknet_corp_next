'use client';

import { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { roleApi } from '@/lib/api/role.api';
import { CreateRoleDto, UpdateRoleDto, GetPermissionsResponse } from '@/types/role.types';
import { RoleForm } from '@/components/roles/RoleForm';
import { CanAccess } from '@/components/CanAccess';
import { FaShieldAlt, FaPlus } from 'react-icons/fa';

interface ApiError {
  response?: {
    data?: {
      error?: string;
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
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to load permissions';
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
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to create role';
      setError(errorMessage);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/cms/roles');
  };

  return (
    <CanAccess permission="role_management.create">
      <Container className="py-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} href="/cms/dashboard">
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} href="/cms/roles">
            <FaShieldAlt className="me-1" />
            Roles
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Create New Role</Breadcrumb.Item>
        </Breadcrumb>

        <div className="mb-4">
          <h1 className="mb-1">
            <FaPlus className="me-2" />
            Create New Role
          </h1>
          <p className="text-muted mb-0">Define a new role with specific permissions</p>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card>
          <Card.Body className="p-4">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted">Loading permissions...</p>
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
