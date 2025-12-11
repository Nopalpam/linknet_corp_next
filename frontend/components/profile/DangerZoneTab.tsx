'use client';

import { useState } from 'react';
import { Card, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserProfile } from '@/hooks/useProfile';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().min(1, 'Confirmation text is required')
}).refine((data) => data.confirmation === 'DELETE MY ACCOUNT', {
  message: 'Please type "DELETE MY ACCOUNT" to confirm',
  path: ['confirmation']
});

type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

interface DangerZoneTabProps {
  profile: UserProfile | undefined;
}

export default function DangerZoneTab({ profile }: DangerZoneTabProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema)
  });

  const onSubmit = async (data: DeleteAccountFormData) => {
    setIsDeleting(true);
    setError(null);

    try {
      await api.delete('/profile', { data });
      
      // Clear auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Show success message and redirect to login
      alert('Your account has been deleted successfully. We\'re sorry to see you go.');
      router.push('/login');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to delete account';
      setError(errorMessage || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setError(null);
    reset();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    reset();
  };

  if (!profile) return null;

  return (
    <>
      <Card border="danger">
        <Card.Body>
          <h4 className="text-danger mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Danger Zone
          </h4>

          <div className="alert alert-warning">
            <strong>Warning:</strong> These actions are irreversible. Please proceed with caution.
          </div>

          <Card className="border-danger mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5 className="mb-2">Delete Account</h5>
                  <p className="text-muted mb-0">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <ul className="text-muted small mt-2 mb-0">
                    <li>All your data will be permanently deleted</li>
                    <li>You will be logged out from all devices</li>
                    <li>Your profile and content will be removed</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>
                <Button
                  variant="outline-danger"
                  onClick={handleOpenModal}
                  className="ms-3"
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="border-danger">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Delete Account
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <div className="alert alert-danger">
              <strong>This action cannot be undone!</strong>
              <p className="mb-0 mt-2">
                Your account <strong>{profile.email}</strong> and all associated data will be permanently deleted.
              </p>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>
                Enter your password <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                {...register('password')}
                isInvalid={!!errors.password}
                placeholder="Enter your password"
              />
              <Form.Control.Feedback type="invalid">
                {errors.password?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Type <code>DELETE MY ACCOUNT</code> to confirm <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                {...register('confirmation')}
                isInvalid={!!errors.confirmation}
                placeholder="DELETE MY ACCOUNT"
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmation?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-2"></i>
                  Delete My Account
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
