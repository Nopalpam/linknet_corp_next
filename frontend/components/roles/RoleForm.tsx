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
      <Form.Group className="mb-3">
        <Form.Label>
          Role Name <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="e.g., Content Manager"
          value={formData.name}
          onChange={handleNameChange}
          isInvalid={!!errors.name}
          disabled={submitting}
        />
        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>
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
        />
        <Form.Text className="text-muted">
          {autoSlug && !isEdit ? 'Auto-generated from name' : 'Lowercase letters, numbers, and underscores only'}
        </Form.Text>
        <Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Brief description of this role"
          value={formData.description}
          onChange={handleDescriptionChange}
          disabled={submitting}
        />
      </Form.Group>

      <div className="mb-4">
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
        <Alert variant="warning" className="mb-3">
          <strong>Warning:</strong> No permissions selected. Users with this role will have limited access.
        </Alert>
      )}

      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel} disabled={submitting}>
          <FaTimes className="me-1" />
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <FaSave className="me-1" />
              {isEdit ? 'Update Role' : 'Create Role'}
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};
