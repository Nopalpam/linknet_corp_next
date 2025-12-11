import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Role } from '@/types/role.types';
import { FaEdit, FaTrash, FaUsers, FaShieldAlt, FaLock } from 'react-icons/fa';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const RoleCard = ({ role, onEdit, onDelete }: RoleCardProps) => {
  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="mb-1 d-flex align-items-center gap-2">
              <FaShieldAlt className={role.isSystem ? 'text-warning' : 'text-primary'} />
              {role.name}
              {role.isSystem && (
                <Badge bg="warning" text="dark" className="ms-2">
                  <FaLock size={10} className="me-1" />
                  System
                </Badge>
              )}
            </h5>
            <small className="text-muted">{role.slug}</small>
          </div>
        </div>

        <p className="text-muted mb-3" style={{ minHeight: '40px' }}>
          {role.description || 'No description'}
        </p>

        <Row className="g-3 mb-3">
          <Col xs={6}>
            <div className="text-center p-2 bg-light rounded">
              <FaUsers className="text-primary mb-1" />
              <div className="fw-bold">{role.userCount}</div>
              <small className="text-muted">Users</small>
            </div>
          </Col>
          <Col xs={6}>
            <div className="text-center p-2 bg-light rounded">
              <FaShieldAlt className="text-success mb-1" />
              <div className="fw-bold">{role.permissionCount}</div>
              <small className="text-muted">Permissions</small>
            </div>
          </Col>
        </Row>

        <div className="d-grid gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onEdit(role)}
            disabled={role.isSystem}
          >
            <FaEdit className="me-1" />
            Edit Role
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete(role)}
            disabled={role.isSystem || role.userCount > 0}
          >
            <FaTrash className="me-1" />
            Delete Role
          </Button>
        </div>

        {role.isSystem && (
          <small className="text-muted d-block mt-2 text-center">
            System roles cannot be modified
          </small>
        )}
      </Card.Body>
    </Card>
  );
};
