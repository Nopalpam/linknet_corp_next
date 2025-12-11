'use client';

import { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { UserProfile } from '@/hooks/useProfile';
import AvatarUpload from './AvatarUpload';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email format'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional().or(z.literal(''))
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface GeneralTabProps {
  profile: UserProfile | undefined;
  mutate: () => void;
}

export default function GeneralTab({ profile, mutate }: GeneralTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await api.put('/profile', data);
      setSuccess(response.data.message || 'Profile updated successfully');
      mutate(); // Revalidate profile data
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to update profile';
      setError(errorMessage || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (_avatarUrl: string) => {
    setSuccess('Avatar updated successfully');
    mutate(); // Revalidate profile data
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    try {
      await api.delete('/profile/avatar');
      setSuccess('Avatar deleted successfully');
      mutate();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to delete avatar';
      setError(errorMessage || 'Failed to delete avatar');
    }
  };

  if (!profile) return null;

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-4">General Information</h4>

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

        {/* Avatar Section */}
        <div className="mb-4 pb-4 border-bottom">
          <h5 className="mb-3">Profile Picture</h5>
          <Row>
            <Col md={6}>
              <AvatarUpload
                currentAvatar={profile.avatar}
                onUploadSuccess={handleAvatarUpload}
              />
            </Col>
            {profile.avatar && (
              <Col md={6} className="d-flex align-items-center">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={handleDeleteAvatar}
                >
                  <i className="bi bi-trash me-2"></i>
                  Remove Avatar
                </Button>
              </Col>
            )}
          </Row>
        </div>

        {/* Profile Form */}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  First Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('firstName')}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Last Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  {...register('lastName')}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>
              Email <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              {...register('email')}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
            {!profile.emailVerified && (
              <Form.Text className="text-warning">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Email not verified. Please check your inbox.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              {...register('phone')}
              isInvalid={!!errors.phone}
              placeholder="+1234567890"
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" value={profile.username} disabled />
            <Form.Text className="text-muted">
              Username cannot be changed
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
