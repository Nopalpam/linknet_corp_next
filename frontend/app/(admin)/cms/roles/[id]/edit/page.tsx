'use client';

import { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Breadcrumb, Button } from 'react-bootstrap';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { roleApi } from '@/lib/api/role.api';
import { UpdateRoleDto, GetPermissionsResponse, RoleDetail } from '@/types/role.types';
import { RoleForm } from '@/components/roles/RoleForm';
import { CanAccess } from '@/components/CanAccess';
import { FaShieldAlt, FaEdit, FaHome, FaLock, FaArrowLeft } from 'react-icons/fa';

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
        const apiError = err as ApiError;
        let errorMessage = 'Failed to load role';
        
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
      const apiError = err as ApiError;
      let errorMessage = 'Failed to update role';
      
      if (apiError?.response?.data?.error) {
        const errorData = apiError.response.data.error;
        if (typeof errorData === 'object' && 'message' in errorData) {
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

  if (loading) {
    return (
      <Container className="py-4" style={{ minHeight: '60vh' }}>
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted fw-medium">Loading role data...</p>
        </div>
      </Container>
    );
  }

  if (error && !role) {
    return (
      <Container className="py-4" style={{ maxWidth: '800px' }}>
        <Alert variant="danger" className="shadow-sm border-0">
          <Alert.Heading className="h5 mb-3">
            <strong>Error Loading Role</strong>
          </Alert.Heading>
          <p className="mb-3">{error}</p>
          <hr />
          <div className="d-flex gap-2 mb-0">
            <Link href="/cms/roles" className="btn btn-danger">
              <FaArrowLeft className="me-2" />
              Back to Roles
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  if (role?.isSystem) {
    return (
      <Container className="py-4" style={{ maxWidth: '800px' }}>
        <Card className="border-warning shadow-sm">
          <Card.Body className="p-4">
            <div className="text-center py-3">
              <div className="d-inline-flex p-3 bg-warning bg-opacity-10 rounded-circle mb-3">
                <FaLock className="text-warning" size={40} />
              </div>
              <h4 className="fw-bold mb-3">System Role Protected</h4>
              <Alert variant="warning" className="mb-4 border-0">
                <p className="mb-0">
                  <strong>{role.name}</strong> is a system role and cannot be modified.
                  System roles are essential for the application's core functionality and security.
                </p>
              </Alert>
              <Link href="/cms/roles" className="btn btn-primary">
                <FaArrowLeft className="me-2" />
                Back to Roles
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <CanAccess permission="role_management.update">
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
          <Breadcrumb.Item active>Edit {role?.name}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-4 pb-3 border-bottom">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center">
              <div className="p-2 bg-primary bg-opacity-10 rounded me-3">
                <FaEdit className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="mb-0 fw-bold">Edit Role</h1>
                <p className="text-muted mb-0 mt-1">{role?.name}</p>
              </div>
            </div>
          </div>
          <p className="text-muted mb-0 ms-5 ps-2">
            Update role details and modify permissions
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
                <Spinner 
                  animation="border" 
                  role="status"
                  style={{ width: '3rem', height: '3rem' }}
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3 text-muted fw-medium">Loading form...</p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </CanAccess>
  );
}
