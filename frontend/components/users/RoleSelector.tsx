'use client';

import { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import api from '@/lib/api';

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface RoleSelectorProps {
  value: string[];
  onChange: (roleIds: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, error, disabled = false }: RoleSelectorProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/cms/roles');
      setRoles(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (roleId: string) => {
    if (disabled) return;

    if (value.includes(roleId)) {
      onChange(value.filter((id) => id !== roleId));
    } else {
      onChange([...value, roleId]);
    }
  };

  if (loading) {
    return <div className="text-muted">Loading roles...</div>;
  }

  return (
    <div>
      <div className="d-flex flex-column gap-2">
        {roles.map((role) => (
          <Form.Check
            key={role.id}
            type="checkbox"
            id={`role-${role.id}`}
            label={
              <div>
                <strong>{role.name}</strong>
                {role.description && (
                  <small className="text-muted d-block">{role.description}</small>
                )}
              </div>
            }
            checked={value.includes(role.id)}
            onChange={() => handleToggle(role.id)}
            disabled={disabled}
          />
        ))}
      </div>
      {error && <div className="text-danger small mt-2">{error}</div>}
    </div>
  );
}
