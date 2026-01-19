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
    <Card 
      className="h-100 border-0 shadow-sm" 
      style={{ 
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
      }}
    >
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div 
                className={`p-2 rounded ${role.isSystem ? 'bg-warning bg-opacity-10' : 'bg-primary bg-opacity-10'}`}
              >
                <FaShieldAlt 
                  className={role.isSystem ? 'text-warning' : 'text-primary'} 
                  size={20}
                />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">{role.name}</h5>
                <small className="text-muted font-monospace">{role.slug}</small>
              </div>
            </div>
            {role.isSystem && (
              <Badge bg="warning" text="dark" className="mt-1">
                <FaLock size={10} className="me-1" />
                System Role
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p 
            className="text-muted mb-0" 
            style={{ 
              minHeight: '48px',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}
          >
            {role.description || (
              <em className="text-black-50">No description provided</em>
            )}
          </p>
        </div>

        {/* Stats */}
        <Row className="g-3 mb-4">
          <Col xs={6}>
            <div 
              className="text-center p-3 rounded border"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              <FaUsers className="text-primary mb-2" size={20} />
              <div className="fw-bold fs-4 text-primary">{role.userCount}</div>
              <small className="text-muted fw-medium">Active Users</small>
            </div>
          </Col>
          <Col xs={6}>
            <div 
              className="text-center p-3 rounded border"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              <FaShieldAlt className="text-success mb-2" size={20} />
              <div className="fw-bold fs-4 text-success">{role.permissionCount}</div>
              <small className="text-muted fw-medium">Permissions</small>
            </div>
          </Col>
        </Row>

        {/* Actions */}
        <div className="d-flex gap-2">
          <Button
            variant="primary"
            className="flex-grow-1 shadow-sm"
            size="sm"
            onClick={() => onEdit(role)}
            disabled={role.isSystem}
            style={{ 
              transition: 'all 0.2s ease',
              fontWeight: 500
            }}
          >
            <FaEdit className="me-2" />
            Edit
          </Button>
          <Button
            variant="outline-danger"
            className="flex-grow-1"
            size="sm"
            onClick={() => onDelete(role)}
            disabled={role.isSystem || role.userCount > 0}
            style={{ 
              transition: 'all 0.2s ease',
              fontWeight: 500
            }}
          >
            <FaTrash className="me-2" />
            Delete
          </Button>
        </div>

        {/* System Role Notice */}
        {role.isSystem && (
          <div 
            className="mt-3 pt-3 border-top text-center"
            style={{ fontSize: '0.8rem' }}
          >
            <FaLock className="text-warning me-1" size={12} />
            <span className="text-muted">System role cannot be modified or deleted</span>
          </div>
        )}
        
        {/* Has Users Notice */}
        {!role.isSystem && role.userCount > 0 && (
          <div 
            className="mt-3 pt-3 border-top text-center"
            style={{ fontSize: '0.8rem' }}
          >
            <FaUsers className="text-info me-1" size={12} />
            <span className="text-muted">Role has active users - transfer users before deleting</span>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
