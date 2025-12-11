'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { CreateUserDto, UpdateUserDto } from '@/types/user.types';
import { RoleSelector } from './RoleSelector';
import { useState } from 'react';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  roles: z.array(z.string()).min(1, 'At least one role is required'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  isEdit?: boolean;
  loading?: boolean;
  onCancel?: () => void;
}

export function UserForm({
  initialData,
  onSubmit,
  isEdit = false,
  loading = false,
  onCancel,
}: UserFormProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.roles || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: initialData?.email || '',
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      phone: initialData?.phone || '',
      password: '',
      roles: initialData?.roles || [],
      status: initialData?.status || 'ACTIVE',
    },
  });

  const onFormSubmit = async (data: UserFormData) => {
    const formData: CreateUserDto | UpdateUserDto = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone || undefined,
      roles: selectedRoles,
      status: data.status,
    };

    // Add password only if provided and creating new user
    if (!isEdit && data.password) {
      (formData as CreateUserDto).password = data.password;
    }

    await onSubmit(formData);
  };

  return (
    <Form onSubmit={handleSubmit(onFormSubmit)}>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              First Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              {...register('firstName')}
              isInvalid={!!errors.firstName}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.firstName?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Last Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              {...register('lastName')}
              isInvalid={!!errors.lastName}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.lastName?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              {...register('email')}
              isInvalid={!!errors.email}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              {...register('phone')}
              isInvalid={!!errors.phone}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {!isEdit && (
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Password {!isEdit && '(optional)'}</Form.Label>
              <Form.Control
                type="password"
                {...register('password')}
                isInvalid={!!errors.password}
                disabled={loading}
                placeholder={
                  isEdit
                    ? 'Leave blank to keep current password'
                    : 'Leave blank to send password setup email'
                }
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
              {!isEdit && (
                <Form.Text className="text-muted">
                  If not provided, user will receive an email to set their password
                </Form.Text>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select {...register('status')} disabled={loading}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}

      {isEdit && (
        <Row className="mb-3">
          <Col md={12}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Select {...register('status')} disabled={loading}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>
              Roles <span className="text-danger">*</span>
            </Form.Label>
            <RoleSelector
              value={selectedRoles}
              onChange={setSelectedRoles}
              error={errors.roles?.message}
              disabled={loading}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 justify-content-end mt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              {isEdit ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEdit ? 'Update User' : 'Create User'}</>
          )}
        </Button>
      </div>
    </Form>
  );
}
