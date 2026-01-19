import { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import slugify from 'slugify';
import { CreateRoleDto, UpdateRoleDto, GetPermissionsResponse } from '@/types/role.types';
import { PermissionSelector } from './PermissionSelector';
import { FaSave, FaTimes } from 'react-icons/fa';

interface RoleFormProps {
  initialData?: {
    name: string;
    slug: string;
    description?: string | null;
    permissionIds: string[];
  };
  permissionsData: GetPermissionsResponse | null;
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
  loading?: boolean;
}

export const RoleForm = ({
  initialData,
  permissionsData,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}: RoleFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    permissionIds: initialData?.permissionIds || [],
  });

  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (autoSlug && formData.name) {
      const generatedSlug = slugify(formData.name, {
        lower: true,
        strict: true,
        replacement: '_',
      });
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, autoSlug]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    setErrors((prev) => ({ ...prev, name: '' }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
    setErrors((prev) => ({ ...prev, slug: '' }));
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, description: e.target.value }));
  };

  const handlePermissionsChange = (permissionIds: string[]) => {
    setFormData((prev) => ({ ...prev, permissionIds }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug must contain only lowercase letters, numbers, and underscores';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    try {
      if (isEdit) {
        const updateData: UpdateRoleDto = {
          name: formData.name,
          description: formData.description || null,
          permissionIds: formData.permissionIds,
        };
        await onSubmit(updateData as CreateRoleDto | UpdateRoleDto);
      } else {
        const createData: CreateRoleDto = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          permissionIds: formData.permissionIds,
        };
        await onSubmit(createData as CreateRoleDto | UpdateRoleDto);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !permissionsData) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      {/* Basic Information Section */}
      <div className="mb-4 pb-3 border-bottom">
        <h5 className="fw-bold mb-3">Basic Information</h5>
        
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            Role Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., Content Manager, Administrator"
            value={formData.name}
            onChange={handleNameChange}
            isInvalid={!!errors.name}
            disabled={submitting}
            size="lg"
            style={{ 
              borderRadius: '8px',
              border: errors.name ? '2px solid #dc3545' : '1px solid #dee2e6'
            }}
          />
          {errors.name && (
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.name}
            </Form.Control.Feedback>
          )}
          <Form.Text className="text-muted">
            A descriptive name for this role
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">
            Slug <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="e.g., content_manager"
            value={formData.slug}
            onChange={handleSlugChange}
            isInvalid={!!errors.slug}
            disabled={submitting || isEdit}
            readOnly={isEdit}
            size="lg"
            style={{ 
              borderRadius: '8px',
              border: errors.slug ? '2px solid #dc3545' : '1px solid #dee2e6',
              backgroundColor: isEdit ? '#f8f9fa' : 'white'
            }}
          />
          {errors.slug && (
            <Form.Control.Feedback type="invalid" className="d-block">
              {errors.slug}
            </Form.Control.Feedback>
          )}
          <Form.Text className="text-muted">
            {isEdit ? (
              'Slug cannot be changed after creation'
            ) : autoSlug ? (
              '✓ Auto-generated from name (lowercase, numbers, and underscores)'
            ) : (
              'Lowercase letters, numbers, and underscores only'
            )}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            placeholder="Brief description of this role and its purpose..."
            value={formData.description}
            onChange={handleDescriptionChange}
            disabled={submitting}
            style={{ 
              borderRadius: '8px',
              resize: 'vertical'
            }}
          />
          <Form.Text className="text-muted">
            Help others understand what this role is for
          </Form.Text>
        </Form.Group>
      </div>

      {/* Permissions Section */}
      <div className="mb-4 pb-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold mb-0">Permissions</h5>
          <small className="text-muted">
            {formData.permissionIds.length} selected
          </small>
        </div>
        <PermissionSelector
          permissions={permissionsData.permissions}
          groupedPermissions={permissionsData.grouped}
          modules={permissionsData.modules}
          selectedPermissionIds={formData.permissionIds}
          onChange={handlePermissionsChange}
          disabled={submitting}
        />
      </div>

      {formData.permissionIds.length === 0 && (
        <Alert variant="warning" className="mb-4 border-0 shadow-sm">
          <div className="d-flex align-items-start">
            <div className="me-3">
              <strong>⚠️ No Permissions Selected</strong>
            </div>
          </div>
          <p className="mb-0 mt-2 small">
            Users with this role will have very limited access to the system.
            Consider adding at least basic permissions.
          </p>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-3 justify-content-end pt-3 border-top">
        <Button 
          variant="outline-secondary" 
          onClick={onCancel} 
          disabled={submitting}
          size="lg"
          style={{ minWidth: '120px' }}
        >
          <FaTimes className="me-2" />
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          disabled={submitting}
          size="lg"
          className="shadow-sm"
          style={{ minWidth: '160px' }}
        >
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <FaSave className="me-2" />
              {isEdit ? 'Update Role' : 'Create Role'}
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};
