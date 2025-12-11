'use client';

import { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { roleApi } from '@/lib/api/role.api';
import { UpdateRoleDto, GetPermissionsResponse, RoleDetail } from '@/types/role.types';
import { RoleForm } from '@/components/roles/RoleForm';
import { CanAccess } from '@/components/CanAccess';
import { FaShieldAlt, FaEdit } from 'react-icons/fa';

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [permissionsData, setPermissionsData] = useState<GetPermissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roleData, permData] = await Promise.all([
          roleApi.getRoleById(roleId),
          roleApi.getPermissions(),
        ]);
        setRole(roleData);
        setPermissionsData(permData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to load role';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (roleId) {
      fetchData();
    }
  }, [roleId]);

  const handleSubmit = async (data: UpdateRoleDto) => {
    try {
      setError(null);
      await roleApi.updateRole(roleId, data);
      router.push('/cms/roles');
    } catch (err) {
      console.error('Failed to update role:', err);
      const errorMessage = (err as ApiError)?.response?.data?.error || 'Failed to update role';
      setError(errorMessage);
      throw err;
    }
  };

  const handleCancel = () => {
    router.push('/cms/roles');
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading role...</p>
        </div>
      </Container>
    );
  }

  if (error && !role) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Link href="/cms/roles" className="btn btn-secondary">
          Back to Roles
        </Link>
      </Container>
    );
  }

  if (role?.isSystem) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          <h5>System Role</h5>
          <p className="mb-0">System roles cannot be edited. They are protected by the system.</p>
        </Alert>
        <Link href="/cms/roles" className="btn btn-secondary">
          Back to Roles
        </Link>
      </Container>
    );
  }

  return (
    <CanAccess permission="role_management.update">
      <Container className="py-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} href="/cms/dashboard">
            Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item linkAs={Link} href="/cms/roles">
            <FaShieldAlt className="me-1" />
            Roles
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Edit {role?.name}</Breadcrumb.Item>
        </Breadcrumb>

        <div className="mb-4">
          <h1 className="mb-1">
            <FaEdit className="me-2" />
            Edit Role: {role?.name}
          </h1>
          <p className="text-muted mb-0">Update role details and permissions</p>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card>
          <Card.Body className="p-4">
            {role && permissionsData ? (
              <RoleForm
                initialData={{
                  name: role.name,
                  slug: role.slug,
                  description: role.description,
                  permissionIds: role.permissions.map((p) => p.id),
                }}
                permissionsData={permissionsData}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isEdit
              />
            ) : (
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </CanAccess>
  );
}
