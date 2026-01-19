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
    <Modal show={show} onHide={onCancel} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-danger bg-opacity-10 rounded">
              <FaExclamationTriangle className="text-danger" size={24} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Delete Role</h5>
              <small className="text-muted">This action cannot be undone</small>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        {role.isSystem ? (
          <Alert variant="danger" className="border-0 shadow-sm">
            <div className="d-flex align-items-start gap-3">
              <div>
                <strong className="d-block mb-2">Cannot Delete System Role</strong>
                <p className="mb-0">
                  System roles are protected and cannot be deleted. They are essential for the
                  application&apos;s core functionality and security.
                </p>
              </div>
            </div>
          </Alert>
        ) : hasUsers ? (
          <>
            <Alert variant="warning" className="border-0 shadow-sm mb-4">
              <div className="d-flex align-items-start gap-3">
                <FaExclamationTriangle size={24} className="flex-shrink-0 mt-1" />
                <div>
                  <strong className="d-block mb-2">Warning: Active Users Detected</strong>
                  <p className="mb-0">
                    This role is currently assigned to{' '}
                    <strong className="text-dark">{role.userCount}</strong> user{role.userCount > 1 ? 's' : ''}.
                    You must transfer these users to another role before deletion.
                  </p>
                </div>
              </div>
            </Alert>

            {transferOptions.length > 0 ? (
              <div className="p-4 bg-light rounded">
                <Form.Group className="mb-0">
                  <Form.Label className="fw-semibold mb-3">
                    Transfer users to: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={transferToRoleId}
                    onChange={(e) => setTransferToRoleId(e.target.value)}
                    disabled={deleting}
                    size="lg"
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="">-- Select a destination role --</option>
                    {transferOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} (currently has {r.userCount} user{r.userCount !== 1 ? 's' : ''})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted mt-2 d-block">
                    All {role.userCount} user{role.userCount > 1 ? 's' : ''} from{' '}
                    <strong>{role.name}</strong> will be moved to the selected role.
                  </Form.Text>
                </Form.Group>
              </div>
            ) : (
              <Alert variant="danger" className="border-0 shadow-sm">
                <strong className="d-block mb-2">No Available Roles</strong>
                <p className="mb-0">
                  You need to create another role or manually reassign users before deleting this
                  role.
                </p>
              </Alert>
            )}
          </>
        ) : (
          <div className="text-center py-3">
            <p className="mb-3">
              Are you sure you want to permanently delete the role{' '}
              <strong className="text-danger">{role.name}</strong>?
            </p>
            <Alert variant="light" className="border mb-0">
              <small className="text-muted">
                ⚠️ This action is permanent and cannot be undone
              </small>
            </Alert>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <div className="d-flex gap-2 w-100 justify-content-end">
          <Button 
            variant="outline-secondary" 
            onClick={onCancel} 
            disabled={deleting}
            size="lg"
            style={{ minWidth: '100px' }}
          >
            Cancel
          </Button>
          {canDelete && (
            <Button 
              variant="danger" 
              onClick={handleConfirm} 
              disabled={deleting}
              size="lg"
              className="shadow-sm"
              style={{ minWidth: '140px' }}
            >
              {deleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
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
              size="lg"
              className="shadow-sm"
              style={{ minWidth: '180px' }}
            >
              {deleting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Transfer & Delete
                </>
              )}
            </Button>
          )}
        </div>
      </Modal.Footer>
    </Modal>
  );
};
