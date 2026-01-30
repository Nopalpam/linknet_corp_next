"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usersService, rolesService, User, UserRole, Role } from "@/services";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import Image from "next/image";
import UserFormModal from "./components/UserFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import RoleManagementModal from "./components/RoleManagementModal";

export default function UsersManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  // Modal states
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageSize,
        sortBy: 'created_at',
        sortOrder: 'desc',
      };

      if (searchQuery) params.search = searchQuery;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterRole !== 'all') params.role = filterRole;

      const response = await usersService.getUsers(params);
      setUsers(response.data || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to fetch users';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, filterStatus, filterRole, toast]);

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesService.getRoles();
      setRoles(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch roles:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handle create
  const handleCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsUserFormOpen(true);
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setIsUserFormOpen(true);
  };

  // Handle delete
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning('Pilih minimal satu user untuk dihapus');
      return;
    }
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (success: boolean, message?: string) => {
    setIsUserFormOpen(false);
    if (success) {
      toast.success(message || (formMode === 'create' ? 'User berhasil ditambahkan' : 'User berhasil diperbarui'));
      setSelectedIds([]);
      await fetchUsers();
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      if (selectedUser) {
        // Single delete
        await usersService.deleteUser(selectedUser.id);
        toast.success('User berhasil dihapus');
      } else if (selectedIds.length > 0) {
        // Bulk delete
        await usersService.bulkDeleteUsers({ userIds: selectedIds });
        toast.success(`${selectedIds.length} user berhasil dihapus`);
      }
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      setSelectedIds([]);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus user');
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      await usersService.toggleUserStatus(user.id);
      toast.success(`Status user berhasil diubah`);
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status user');
    }
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id));
    }
  };

  // Filter users by search
  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ACTIVE: 'bg-success text-white',
      INACTIVE: 'bg-secondary text-white',
      SUSPENDED: 'bg-danger text-white',
    };
    return badges[status] || 'bg-secondary';
  };

  return (
    <>
      <PageBreadCrumb pageTitle="User Management" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">User Management</h4>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleCreate}
                  >
                    <i className="mdi mdi-plus me-1"></i> Tambah User
                  </button>
                  <button
                    className="btn btn-info"
                    onClick={() => setIsRoleModalOpen(true)}
                  >
                    <i className="mdi mdi-shield-account me-1"></i> Kelola Role
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body">
              {/* Filters and Search */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <option value="all">Semua Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  {selectedIds.length > 0 && (
                    <button
                      className="btn btn-danger w-100"
                      onClick={handleBulkDelete}
                    >
                      <i className="mdi mdi-delete me-1"></i> Hapus ({selectedIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">Tidak ada data user</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.length === users.length && users.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(user.id)}
                              onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                            />
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={user.firstName}
                                  width={40}
                                  height={40}
                                  className="rounded-circle me-2"
                                  style={{ objectFit: 'cover' }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                                  style={{ width: '40px', height: '40px' }}
                                >
                                  {user.firstName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div className="fw-bold">{user.firstName} {user.lastName}</div>
                                <small className="text-muted">@{user.username}</small>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            {user.roles.map((role, idx) => (
                              <span key={idx} className="badge bg-info me-1">
                                {role.name}
                              </span>
                            ))}
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            {user.lastLoginAt
                              ? new Date(user.lastLoginAt).toLocaleDateString('id-ID')
                              : 'Belum pernah login'}
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => handleEdit(user)}
                                title="Edit"
                              >
                                <i className="mdi mdi-pencil"></i>
                              </button>
                              <button
                                className={`btn btn-sm ${user.status === 'ACTIVE' ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => handleToggleStatus(user)}
                                title={user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                              >
                                <i className={`mdi mdi-${user.status === 'ACTIVE' ? 'pause' : 'play'}`}></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(user)}
                                title="Hapus"
                              >
                                <i className="mdi mdi-delete"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} dari {total} user
                  </div>
                  <nav>
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isUserFormOpen && (
        <UserFormModal
          isOpen={isUserFormOpen}
          onClose={() => setIsUserFormOpen(false)}
          onSubmit={handleFormSubmit}
          user={selectedUser}
          roles={roles}
          mode={formMode}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteConfirm}
          title={selectedUser ? `Hapus User: ${selectedUser.firstName} ${selectedUser.lastName}` : `Hapus ${selectedIds.length} User`}
          message={
            selectedUser
              ? `Apakah Anda yakin ingin menghapus user "${selectedUser.firstName} ${selectedUser.lastName}"?`
              : `Apakah Anda yakin ingin menghapus ${selectedIds.length} user yang dipilih?`
          }
        />
      )}

      {isRoleModalOpen && (
        <RoleManagementModal
          isOpen={isRoleModalOpen}
          onClose={() => {
            setIsRoleModalOpen(false);
            fetchRoles(); // Refresh roles after closing
          }}
        />
      )}
    </>
  );
}
