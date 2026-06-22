import React, { useState, useEffect, useCallback } from 'react';
import { rolesService, Role, Permission } from '@/services';
import { useToast } from '@/context/ToastContext';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleManagementModal({ isOpen, onClose }: RoleManagementModalProps) {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [view, setView] = useState<'list' | 'form' | 'permissions'>('list');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    permissionIds: [] as string[],
  });

  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesService.getRoles();
      setRoles(response.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengambil data role');
    }
  }, [toast]);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await rolesService.getPermissions();
      setPermissions(response.data.permissions || []);
      setGroupedPermissions(response.data.grouped || {});
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengambil data permission');
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      (async () => {
        setLoading(true);
        await Promise.all([fetchRoles(), fetchPermissions()]);
        setLoading(false);
      })();
    }
  }, [isOpen, fetchRoles, fetchPermissions]);

  const handleCreateRole = () => {
    setFormMode('create');
    setFormData({
      name: '',
      slug: '',
      description: '',
      permissionIds: [],
    });
    setView('form');
  };

  const handleEditRole = (role: Role) => {
    setFormMode('edit');
    setSelectedRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      permissionIds: role.permissions.map(p => p.id),
    });
    setView('form');
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      ...formData,
      permissionIds: role.permissions.map(p => p.id),
    });
    setView('permissions');
  };

  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"?`)) {
      return;
    }

    try {
      await rolesService.deleteRole(role.id);
      toast.success('Role berhasil dihapus');
      await fetchRoles();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus role');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formMode === 'create') {
        await rolesService.createRole(formData);
        toast.success('Role berhasil ditambahkan');
      } else if (selectedRole) {
        await rolesService.updateRole(selectedRole.id, {
          name: formData.name,
          description: formData.description,
          permissionIds: formData.permissionIds,
        });
        toast.success('Role berhasil diperbarui');
      }
      await fetchRoles();
      setView('list');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan role');
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      await rolesService.updateRole(selectedRole.id, {
        permissionIds: formData.permissionIds,
      });
      toast.success('Permission berhasil diperbarui');
      await fetchRoles();
      setView('list');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan permission');
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    if (formData.permissionIds.includes(permissionId)) {
      setFormData({
        ...formData,
        permissionIds: formData.permissionIds.filter(id => id !== permissionId),
      });
    } else {
      setFormData({
        ...formData,
        permissionIds: [...formData.permissionIds, permissionId],
      });
    }
  };

  const handleModuleToggle = (module: string) => {
    const modulePermissions = groupedPermissions[module] || [];
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => formData.permissionIds.includes(id));

    if (allSelected) {
      // Deselect all
      setFormData({
        ...formData,
        permissionIds: formData.permissionIds.filter(id => !modulePermissionIds.includes(id)),
      });
    } else {
      // Select all
      const newPermissionIds = [...formData.permissionIds];
      modulePermissionIds.forEach(id => {
        if (!newPermissionIds.includes(id)) {
          newPermissionIds.push(id);
        }
      });
      setFormData({
        ...formData,
        permissionIds: newPermissionIds,
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
        className="modal-dialog modal-dialog-centered modal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {view === 'list' && 'Kelola Role & Permission'}
              {view === 'form' && (formMode === 'create' ? 'Tambah Role Baru' : 'Edit Role')}
              {view === 'permissions' && `Kelola Permission: ${selectedRole?.name}`}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : view === 'list' ? (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Daftar Role</h6>
                  <button className="btn btn-primary btn-sm" onClick={handleCreateRole}>
                    <i className="mdi mdi-plus me-1"></i> Tambah Role
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Description</th>
                        <th>Users</th>
                        <th>Permissions</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.id}>
                          <td>
                            <strong>{role.name}</strong>
                            {role.isSystem && (
                              <span className="badge bg-secondary ms-2">System</span>
                            )}
                          </td>
                          <td>{role.description || '-'}</td>
                          <td>{role.userCount}</td>
                          <td>{role.permissionCount} permissions</td>
                          <td>
                            <div className="btn-group">
                              {!role.isSystem && (
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => handleEditRole(role)}
                                  title="Edit"
                                >
                                  <i className="mdi mdi-pencil"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleManagePermissions(role)}
                                title="Kelola Permission"
                              >
                                <i className="mdi mdi-shield-key"></i>
                              </button>
                              {!role.isSystem && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteRole(role)}
                                  title="Hapus"
                                >
                                  <i className="mdi mdi-delete"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : view === 'form' ? (
              <form onSubmit={handleSubmitForm}>
                <div className="mb-3">
                  <label className="form-label">Nama Role *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Slug *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    disabled={formMode === 'edit'}
                  />
                  <small className="text-muted">Slug tidak dapat diubah setelah dibuat</small>
                </div>
                <div className="mb-3">
                  <label className="form-label">Deskripsi</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setView('list')}>
                    Kembali
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Tambah Role' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            ) : view === 'permissions' ? (
              <>
                <div className="alert alert-info">
                  <i className="mdi mdi-information me-2"></i>
                  Pilih permission yang ingin diberikan ke role <strong>{selectedRole?.name}</strong>
                </div>
                
                <div className="row">
                  {Object.keys(groupedPermissions).map((module) => {
                    const modulePerms = groupedPermissions[module] || [];
                    const allSelected = modulePerms.every(p => formData.permissionIds.includes(p.id));
                    
                    return (
                      <div key={module} className="col-md-6 mb-3">
                        <div className="card">
                          <div className="card-header bg-light">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={allSelected}
                                onChange={() => handleModuleToggle(module)}
                                id={`module-${module}`}
                              />
                              <label className="form-check-label fw-bold" htmlFor={`module-${module}`}>
                                {module.replace(/_/g, ' ').toUpperCase()}
                              </label>
                            </div>
                          </div>
                          <div className="card-body">
                            {modulePerms.map((permission) => (
                              <div key={permission.id} className="form-check mb-2">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={permission.id}
                                  checked={formData.permissionIds.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                />
                                <label className="form-check-label" htmlFor={permission.id}>
                                  {permission.name}
                                  {permission.description && (
                                    <small className="text-muted d-block">{permission.description}</small>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-secondary" onClick={() => setView('list')}>
                    Kembali
                  </button>
                  <button className="btn btn-primary" onClick={handleSavePermissions}>
                    <i className="mdi mdi-content-save me-1"></i>
                    Simpan Permission ({formData.permissionIds.length})
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
