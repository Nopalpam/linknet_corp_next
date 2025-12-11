'use client';

import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { UserProfile } from '@/hooks/useProfile';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

type PasswordFormData = z.infer<typeof passwordSchema>;

interface SecurityTabProps {
  profile: UserProfile | undefined;
}

export default function SecurityTab({ profile }: SecurityTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await api.put('/profile/password', data);
      setSuccess(response.data.message || 'Password changed successfully');
      reset(); // Clear form
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to change password';
      setError(errorMessage || 'Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="security-tab">
      {/* Change Password */}
      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-4">Change Password</h4>

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>
                Current Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                {...register('currentPassword')}
                isInvalid={!!errors.currentPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.currentPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                New Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                {...register('newPassword')}
                isInvalid={!!errors.newPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.newPassword?.message}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Must be at least 8 characters with uppercase, lowercase, number, and special character
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Confirm New Password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                {...register('confirmPassword')}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Changing Password...
                </>
              ) : (
                <>
                  <i className="bi bi-shield-lock me-2"></i>
                  Change Password
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Two-Factor Authentication</h4>
          <p className="text-muted">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <strong>Status:</strong>{' '}
              <span className={profile.twoFactorEnabled ? 'text-success' : 'text-muted'}>
                {profile.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <Button variant="outline-secondary" disabled>
              <i className="bi bi-gear me-2"></i>
              Configure 2FA (Coming Soon)
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Active Sessions */}
      <Card>
        <Card.Body>
          <h4 className="mb-3">Active Sessions</h4>
          <p className="text-muted">
            Manage devices and sessions where you&apos;re currently logged in.
          </p>
          
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Session management coming soon. For security, changing your password will log you out from all other devices.
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
