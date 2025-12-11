import { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Role } from '@/types/role.types';
import { FaExclamationTriangle, FaTrash } from 'react-icons/fa';

interface DeleteConfirmationModalProps {
  show: boolean;
  role: Role | null;
  availableRoles: Role[];
  onConfirm: (roleId: string, transferToRoleId?: string) => Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmationModal = ({
  show,
  role,
  availableRoles,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) => {
  const [transferToRoleId, setTransferToRoleId] = useState<string>('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (show) {
      setTransferToRoleId('');
    }
  }, [show]);

  if (!role) return null;

  const hasUsers = role.userCount > 0;
  const canDelete = !role.isSystem && !hasUsers;
  const needsTransfer = hasUsers;

  // Filter out system roles and the role being deleted
  const transferOptions = availableRoles.filter(
    (r) => !r.isSystem && r.id !== role.id
  );

  const handleConfirm = async () => {
    if (needsTransfer && !transferToRoleId) {
      return;
    }

    setDeleting(true);
    try {
      await onConfirm(role.id, transferToRoleId || undefined);
      onCancel();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaExclamationTriangle className="text-warning me-2" />
          Delete Role
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {role.isSystem ? (
          <Alert variant="danger">
            <strong>Cannot Delete System Role</strong>
            <p className="mb-0 mt-2">
              System roles are protected and cannot be deleted. They are essential for the
              application&apos;s functionality.
            </p>
          </Alert>
        ) : hasUsers ? (
          <>
            <Alert variant="warning">
              <strong>Warning!</strong> This role is assigned to{' '}
              <strong>{role.userCount}</strong> user{role.userCount > 1 ? 's' : ''}.
            </Alert>

            <p>
              You must transfer users to another role before deleting{' '}
              <strong>{role.name}</strong>.
            </p>

            {transferOptions.length > 0 ? (
              <Form.Group className="mb-3">
                <Form.Label>
                  Transfer users to: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={transferToRoleId}
                  onChange={(e) => setTransferToRoleId(e.target.value)}
                  disabled={deleting}
                >
                  <option value="">-- Select a role --</option>
                  {transferOptions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.userCount} users)
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  All {role.userCount} user{role.userCount > 1 ? 's' : ''} will be assigned to the
                  selected role.
                </Form.Text>
              </Form.Group>
            ) : (
              <Alert variant="danger" className="mt-3">
                <strong>No available roles for transfer.</strong>
                <p className="mb-0 mt-2">
                  You need to create another role or manually reassign users before deleting this
                  role.
                </p>
              </Alert>
            )}
          </>
        ) : (
          <>
            <p>
              Are you sure you want to delete the role <strong>{role.name}</strong>?
            </p>
            <p className="text-muted mb-0">This action cannot be undone.</p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel} disabled={deleting}>
          Cancel
        </Button>
        {canDelete && (
          <Button variant="danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-1" />
                Delete Role
              </>
            )}
          </Button>
        )}
        {needsTransfer && transferOptions.length > 0 && (
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!transferToRoleId || deleting}
          >
            {deleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Transferring...
              </>
            ) : (
              <>
                <FaTrash className="me-1" />
                Transfer & Delete
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
