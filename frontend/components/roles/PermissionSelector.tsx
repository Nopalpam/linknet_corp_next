import { useState, useEffect } from 'react';
import { Accordion, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Permission, PermissionsByModule } from '@/types/role.types';
import { FaCheckSquare, FaSquare } from 'react-icons/fa';

interface PermissionSelectorProps {
  permissions: Permission[];
  groupedPermissions: PermissionsByModule;
  modules: string[];
  selectedPermissionIds: string[];
  onChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

export const PermissionSelector = ({
  permissions,
  groupedPermissions,
  modules,
  selectedPermissionIds,
  onChange,
  disabled = false,
}: PermissionSelectorProps) => {
  const [activeKey, setActiveKey] = useState<string[]>([]);

  // Initialize with first module open
  useEffect(() => {
    if (modules.length > 0 && activeKey.length === 0) {
      const firstModule = modules[0];
      if (firstModule) {
        setActiveKey([firstModule]);
      }
    }
  }, [modules, activeKey.length]);

  const handlePermissionToggle = (permissionId: string) => {
    if (disabled) return;

    const newSelected = selectedPermissionIds.includes(permissionId)
      ? selectedPermissionIds.filter((id) => id !== permissionId)
      : [...selectedPermissionIds, permissionId];

    onChange(newSelected);
  };

  const handleSelectAllModule = (module: string) => {
    if (disabled) return;

    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    const allSelected = modulePermissionIds.every((id) =>
      selectedPermissionIds.includes(id)
    );

    if (allSelected) {
      // Deselect all in module
      const newSelected = selectedPermissionIds.filter(
        (id) => !modulePermissionIds.includes(id)
      );
      onChange(newSelected);
    } else {
      // Select all in module
      const newSelected = [...new Set([...selectedPermissionIds, ...modulePermissionIds])];
      onChange(newSelected);
    }
  };

  const isModuleAllSelected = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    return (
      modulePermissionIds.length > 0 &&
      modulePermissionIds.every((id) => selectedPermissionIds.includes(id))
    );
  };

  const getModuleSelectedCount = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map((p) => p.id);
    return modulePermissionIds.filter((id) => selectedPermissionIds.includes(id)).length;
  };

  if (!permissions || permissions.length === 0) {
    return (
      <Alert variant="info">
        <Spinner animation="border" size="sm" className="me-2" />
        Loading permissions...
      </Alert>
    );
  }

  return (
    <div className="permission-selector">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded">
        <div>
          <h6 className="mb-1 fw-bold">Select Permissions</h6>
          <small className="text-muted">
            <strong className="text-primary">{selectedPermissionIds.length}</strong> of{' '}
            <strong>{permissions.length}</strong> permissions selected
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onChange(permissions.map((p) => p.id))}
            disabled={disabled || selectedPermissionIds.length === permissions.length}
            style={{ minWidth: '100px' }}
          >
            Select All
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onChange([])}
            disabled={disabled || selectedPermissionIds.length === 0}
            style={{ minWidth: '100px' }}
          >
            Clear All
          </Button>
        </div>
      </div>

      <Accordion activeKey={activeKey} onSelect={(keys) => setActiveKey(keys as string[])} alwaysOpen>
        {modules.map((module) => {
          const modulePermissions = groupedPermissions[module] || [];
          const selectedCount = getModuleSelectedCount(module);
          const allSelected = isModuleAllSelected(module);
          const percentSelected = modulePermissions.length > 0 
            ? Math.round((selectedCount / modulePermissions.length) * 100)
            : 0;

          return (
            <Accordion.Item 
              eventKey={module} 
              key={module}
              className="mb-3 border rounded shadow-sm"
              style={{ overflow: 'hidden' }}
            >
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                  <div className="d-flex align-items-center gap-3">
                    <FaShieldAlt className="text-primary" />
                    <span className="fw-bold text-capitalize" style={{ fontSize: '1rem' }}>
                      {module.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted fw-medium">
                      {selectedCount} / {modulePermissions.length}
                    </small>
                    <Badge 
                      bg={percentSelected === 100 ? 'success' : percentSelected > 0 ? 'primary' : 'secondary'}
                      className="px-3"
                    >
                      {percentSelected}%
                    </Badge>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body className="p-4" style={{ backgroundColor: '#fafbfc' }}>
                <div className="mb-3 pb-3 border-bottom bg-white p-3 rounded">
                  <Form.Check
                    type="checkbox"
                    id={`select-all-${module}`}
                    label={
                      <div className="d-flex align-items-center gap-2">
                        {allSelected ? (
                          <>
                            <FaCheckSquare className="text-primary" size={18} />
                            <strong>Deselect All in Module</strong>
                          </>
                        ) : (
                          <>
                            <FaSquare className="text-secondary" size={18} />
                            <strong>Select All in Module</strong>
                          </>
                        )}
                      </div>
                    }
                    checked={allSelected}
                    onChange={() => handleSelectAllModule(module)}
                    disabled={disabled}
                  />
                </div>

                <div className="permission-list">
                  {modulePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="p-3 mb-2 bg-white rounded border"
                      style={{
                        transition: 'all 0.2s ease',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => {
                        if (!disabled) {
                          e.currentTarget.style.borderColor = '#0d6efd';
                          e.currentTarget.style.backgroundColor = '#f8f9ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#dee2e6';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <Form.Check
                        type="checkbox"
                        id={`permission-${permission.id}`}
                        label={
                          <div className="ms-2">
                            <div className="fw-semibold mb-1" style={{ fontSize: '0.95rem' }}>
                              {permission.name}
                            </div>
                            {permission.description && (
                              <small className="text-muted d-block mb-2">
                                {permission.description}
                              </small>
                            )}
                            <code 
                              className="text-muted px-2 py-1 rounded" 
                              style={{ 
                                fontSize: '0.75rem',
                                backgroundColor: '#f8f9fa'
                              }}
                            >
                              {permission.slug}
                            </code>
                          </div>
                        }
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        disabled={disabled}
                      />
                    </div>
                  ))}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};
