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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          Permissions ({selectedPermissionIds.length} of {permissions.length} selected)
        </h6>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onChange(permissions.map((p) => p.id))}
            disabled={disabled}
          >
            Select All
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onChange([])}
            disabled={disabled}
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

          return (
            <Accordion.Item eventKey={module} key={module}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                  <span className="fw-bold text-capitalize">
                    {module.replace(/_/g, ' ')}
                  </span>
                  <span className="badge bg-primary">
                    {selectedCount} / {modulePermissions.length}
                  </span>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <div className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id={`select-all-${module}`}
                    label={
                      <strong>
                        {allSelected ? (
                          <>
                            <FaCheckSquare className="text-primary me-1" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <FaSquare className="text-secondary me-1" />
                            Select All
                          </>
                        )}
                      </strong>
                    }
                    checked={allSelected}
                    onChange={() => handleSelectAllModule(module)}
                    disabled={disabled}
                    className="mb-2 pb-2 border-bottom"
                  />
                </div>

                {modulePermissions.map((permission) => (
                  <Form.Check
                    key={permission.id}
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    label={
                      <div>
                        <div className="fw-semibold">{permission.name}</div>
                        {permission.description && (
                          <small className="text-muted">{permission.description}</small>
                        )}
                        <div>
                          <code className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {permission.slug}
                          </code>
                        </div>
                      </div>
                    }
                    checked={selectedPermissionIds.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    disabled={disabled}
                    className="mb-3"
                  />
                ))}
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </div>
  );
};
