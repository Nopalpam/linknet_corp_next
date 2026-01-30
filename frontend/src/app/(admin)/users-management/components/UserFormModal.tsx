import React, { useState, useEffect } from 'react';
import { usersService, CreateUserDto, UpdateUserDto, User, Role } from '@/services';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (success: boolean, message?: string) => void;
  user: User | null;
  roles: Role[];
  mode: 'create' | 'edit';
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  roles,
  mode,
}: UserFormModalProps) {
  const [formData, setFormData] = useState<any>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    roles: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        status: user.status,
        roles: user.roles.map((r) => r.id),
      });
    } else {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        status: 'ACTIVE',
        roles: [],
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'Nama depan wajib diisi';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Nama belakang wajib diisi';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Password wajib diisi (minimal 8 karakter)';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    }

    if (!formData.roles || formData.roles.length === 0) {
      newErrors.roles = 'Pilih minimal satu role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      if (mode === 'create') {
        await usersService.createUser(formData as CreateUserDto);
        onSubmit(true, 'User berhasil ditambahkan');
      } else if (user) {
        const updateData: UpdateUserDto = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          status: formData.status,
          roles: formData.roles,
        };
        await usersService.updateUser(user.id, updateData);
        onSubmit(true, 'User berhasil diperbarui');
      }
    } catch (error: any) {
      onSubmit(false, error.message || 'Gagal menyimpan user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    if (formData.roles?.includes(roleId)) {
      setFormData({
        ...formData,
        roles: (formData.roles || []).filter((r: string) => r !== roleId),
      });
    } else {
      setFormData({
        ...formData,
        roles: [...(formData.roles || []), roleId],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Status <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Nama Depan <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                  {errors.firstName && (
                    <div className="invalid-feedback">{errors.firstName}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Nama Belakang <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                  {errors.lastName && (
                    <div className="invalid-feedback">{errors.lastName}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Nomor Telepon</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">
                    Password {mode === 'create' && <span className="text-danger">*</span>}
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    value={formData.password || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={mode === 'edit' ? 'Kosongkan jika tidak ingin mengubah' : ''}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">{errors.password}</div>
                  )}
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">
                    Role <span className="text-danger">*</span>
                  </label>
                  {errors.roles && (
                    <div className="text-danger small mb-2">{errors.roles}</div>
                  )}
                  <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {roles.map((role) => (
                      <div key={role.id} className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`role-${role.id}`}
                          checked={formData.roles?.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                        />
                        <label className="form-check-label" htmlFor={`role-${role.id}`}>
                          <strong>{role.name}</strong>
                          {role.description && (
                            <small className="text-muted d-block">{role.description}</small>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Menyimpan...
                  </>
                ) : mode === 'create' ? (
                  'Tambah User'
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
