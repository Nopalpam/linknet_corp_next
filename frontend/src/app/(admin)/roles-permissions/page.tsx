"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { rolesService, Role, Permission } from '@/services';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import PageBreadCrumb from '@/components/common/PageBreadCrumb';

export default function RolesPermissionsPage() {
  const toast = useToast();
  const { user } = useAuth();
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

  // ✅ Check if user is Super Admin
  const isSuperAdmin = user?.roles?.some(role => role.slug === 'super-admin') || false;

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
    (async () => {
      setLoading(true);
      await Promise.all([fetchRoles(), fetchPermissions()]);
      setLoading(false);
    })();
  }, [fetchRoles, fetchPermissions]);

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

  const handleToggleModule = (moduleName: string) => {
    const modulePermissions = groupedPermissions[moduleName] || [];
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => formData.permissionIds.includes(id));

    if (allSelected) {
      setFormData({
        ...formData,
        permissionIds: formData.permissionIds.filter(id => !modulePermissionIds.includes(id)),
      });
    } else {
      setFormData({
        ...formData,
        permissionIds: [...new Set([...formData.permissionIds, ...modulePermissionIds])],
      });
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadCrumb pageTitle="Roles & Permissions" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // List View
  if (view === 'list') {
    return (
      <>
        <PageBreadCrumb pageTitle="Roles & Permissions" />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-xl font-semibold text-black dark:text-white">
                Roles & Permissions Management
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Kelola role dan permission pengguna sistem
              </p>
            </div>
            <button
              onClick={handleCreateRole}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Role
            </button>
          </div>

          {/* Roles Table */}
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Role Name</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Description</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Permissions</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Users</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{role.slug}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-black dark:text-white">
                        {role.description || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {role.permissionCount} permissions
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded bg-meta-3/10 px-3 py-1 text-xs font-medium text-meta-3">
                        {role.userCount} users
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className={`hover:text-primary transition-colors ${
                            role.isSystem && !isSuperAdmin 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                          title={role.isSystem && !isSuperAdmin ? 'Hanya Super Admin yang bisa mengelola role ini' : 'Kelola permissions'}
                          disabled={role.isSystem && !isSuperAdmin}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditRole(role)}
                          className={`hover:text-primary transition-colors ${
                            role.isSystem && !isSuperAdmin 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                          title={role.isSystem && !isSuperAdmin ? 'Hanya Super Admin yang bisa mengedit role ini' : 'Edit role'}
                          disabled={role.isSystem && !isSuperAdmin}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role)}
                          className={`hover:text-danger transition-colors ${
                            role.isSystem && !isSuperAdmin 
                              ? 'opacity-50 cursor-not-allowed' 
                              : ''
                          }`}
                          title={role.isSystem && !isSuperAdmin ? 'Hanya Super Admin yang bisa menghapus role ini' : 'Hapus role'}
                          disabled={role.isSystem && !isSuperAdmin}
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  // Form View (Create/Edit Role)
  if (view === 'form') {
    return (
      <>
        <PageBreadCrumb pageTitle={formMode === 'create' ? 'Tambah Role' : 'Edit Role'} />
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
          <div className="mb-6">
            <button
              onClick={() => setView('list')}
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke daftar
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Role Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Slug <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                disabled={formMode === 'edit'}
                className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary disabled:bg-gray disabled:cursor-not-allowed dark:border-strokedark dark:bg-meta-4"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Permissions
              </label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([module, perms]) => {
                  const allSelected = perms.every(p => formData.permissionIds.includes(p.id));
                  return (
                    <div key={module} className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                      <div className="mb-3 flex items-center">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => handleToggleModule(module)}
                          className="mr-2 cursor-pointer"
                        />
                        <label className="font-medium text-black dark:text-white">
                          {module}
                        </label>
                      </div>
                      <div className="ml-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {perms.map((permission) => (
                          <label key={permission.id} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.permissionIds.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="mr-2"
                            />
                            <span className="text-sm text-black dark:text-white">
                              {permission.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 border-t border-stroke pt-6 dark:border-strokedark">
              <button
                type="button"
                onClick={() => setView('list')}
                className="rounded-md border border-stroke px-6 py-2 text-black hover:bg-gray dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90"
              >
                {formMode === 'create' ? 'Tambah Role' : 'Update Role'}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Permissions View
  return (
    <>
      <PageBreadCrumb pageTitle={`Kelola Permissions - ${selectedRole?.name}`} />
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6">
          <button
            onClick={() => setView('list')}
            className="inline-flex items-center text-sm text-primary hover:underline"
          >
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke daftar
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            {selectedRole?.name}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {selectedRole?.description || 'Kelola permissions untuk role ini'}
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([module, perms]) => {
            const allSelected = perms.every(p => formData.permissionIds.includes(p.id));
            return (
              <div key={module} className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                <div className="mb-3 flex items-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => handleToggleModule(module)}
                    className="mr-2 cursor-pointer"
                  />
                  <label className="font-medium text-black dark:text-white">
                    {module}
                  </label>
                </div>
                <div className="ml-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {perms.map((permission) => (
                    <label key={permission.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissionIds.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">
                        {permission.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-3 border-t border-stroke pt-6 dark:border-strokedark">
          <button
            type="button"
            onClick={() => setView('list')}
            className="rounded-md border border-stroke px-6 py-2 text-black hover:bg-gray dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            Batal
          </button>
          <button
            onClick={handleSavePermissions}
            className="rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90"
          >
            Simpan Permissions
          </button>
        </div>
      </div>
    </>
  );
}
