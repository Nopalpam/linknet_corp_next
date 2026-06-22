"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usersService, User, GetUsersParams } from "@/services/users.service";
import { rolesService, Role } from "@/services/roles.service";
import { useToast } from "@/context/ToastContext";
import { isSessionExpiredError } from "@/lib/sessionExpired";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { DataTable, TableColumn } from "@/components/DataTable/DataTable";
import { DataTablePagination } from "@/components/DataTable/DataTablePagination";
import UserFormModal from "./components/UserFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import BulkDeleteModal from "@/components/BulkDeleteModal";
import Image from "next/image";

export default function UsersManagementPage() {
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED" | "">("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await rolesService.getRoles();
      setRoles(response.data || []);
    } catch (err: any) {
      console.error("Failed to fetch roles:", err);
    }
  }, []);

  // Fetch users with pagination
  const fetchUsers = useCallback(
    async (page = currentPage) => {
      try {
        setLoading(true);
        const params: GetUsersParams = {
          page,
          limit: itemsPerPage,
          search: searchQuery || undefined,
          role: filterRole || undefined,
          status: filterStatus || undefined,
        };

        const response = await usersService.getUsers(params);

        setUsers(response.data || []);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      } catch (err: any) {
        if (isSessionExpiredError(err)) {
          return;
        }
        const errorMsg = err.response?.data?.message || err.message || "Failed to fetch users";
        toast.error(errorMsg);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, itemsPerPage, searchQuery, filterRole, filterStatus, toast]
  );

  // Initial load
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filterRole, filterStatus, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  // Handle selection
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const isAllSelected = selectedIds.length > 0 && selectedIds.length === users.length;

  // Handle create
  const handleCreate = () => {
    setFormMode("create");
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setFormMode("edit");
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  // Handle delete
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.warning("Please select users to delete");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      await usersService.toggleUserStatus(user.id);
      toast.success(`User status updated successfully`);
      fetchUsers(currentPage);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to update user status";
      toast.error(errorMsg);
    }
  };

  // Define table columns
  const columns: TableColumn<User>[] = [
    {
      key: "user",
      label: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.firstName}
                width={40}
                height={40}
                className="object-cover"
                unoptimized
                onError={(event) => {
                  event.currentTarget.src = "/images/user/owner1.jpg";
                }}
              />
            ) : (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      label: "Username",
      render: (user) => (
        <span className="text-gray-700 dark:text-gray-300">{user.username || "-"}</span>
      ),
    },
    {
      key: "roles",
      label: "Roles",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roles && user.roles.length > 0 ? (
            user.roles.map((role) => (
              <span
                key={role.id}
                className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {role.name}
              </span>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No roles</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user) => {
        const statusColors: Record<string, string> = {
          ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        };
        return (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              statusColors[user.status] || statusColors.INACTIVE
            }`}
          >
            {user.status}
          </span>
        );
      },
    },
    {
      key: "lastLoginAt",
      label: "Last Login",
      render: (user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {user.lastLoginAt
            ? new Date(user.lastLoginAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Never"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <PageBreadCrumb pageTitle="Users Management" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage users, assign roles, and control access
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter by Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.slug}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* Bulk Actions */}
          <div className="flex items-end">
            <button
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          isAllSelected={isAllSelected}
          getItemId={(user) => user.id}
          emptyMessage="No users found"
          actions={(user) => (
            <>
              <button
                onClick={() => handleToggleStatus(user)}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                title={user.status === "ACTIVE" ? "Deactivate" : "Activate"}
              >
                {user.status === "ACTIVE" ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={() => handleEdit(user)}
                className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                title="Edit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(user)}
                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
        />

        {/* Pagination */}
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onLimitChange={handleItemsPerPageChange}
        />
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={(success, message) => {
          if (success) {
            toast.success(message || (formMode === "create" ? "User created successfully" : "User updated successfully"));
            setIsFormModalOpen(false);
            fetchUsers(currentPage);
          } else {
            toast.error(message || "Failed to save user");
          }
        }}
        mode={formMode}
        user={selectedUser}
        roles={roles}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={async () => {
          if (selectedUser) {
            try {
              await usersService.deleteUser(selectedUser.id);
              toast.success("User deleted successfully");
              fetchUsers(currentPage);
              setSelectedUser(null);
            } catch (err: any) {
              const errorMsg = err.response?.data?.message || err.message || "Failed to delete user";
              toast.error(errorMsg);
            }
          }
        }}
        title="Delete User"
        message={selectedUser ? `Are you sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}?` : "Are you sure you want to delete this user?"}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        itemCount={selectedIds.length}
        itemName="users"
        onConfirm={async () => {
          try {
            await usersService.bulkDeleteUsers({ userIds: selectedIds });
            toast.success(`${selectedIds.length} users deleted successfully`);
            setSelectedIds([]);
            fetchUsers(currentPage);
            setIsBulkDeleteModalOpen(false);
          } catch (err: any) {
            const errorMsg =
              err.response?.data?.message || err.message || "Failed to delete users";
            toast.error(errorMsg);
          }
        }}
      />
    </div>
  );
}
