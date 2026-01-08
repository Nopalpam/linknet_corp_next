'use client';

import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface DashboardStats {
  totalUsers?: number;
  totalPages?: number;
  totalRoles?: number;
  recentActivity?: any[];
}

export default function CMSDashboardPage() {
  const { user } = useAuth();
  const { isLoading: authLoading } = useRequireAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    // TODO: Fetch dashboard stats from API
    // For now, using placeholder data
    setStats({
      totalUsers: 0,
      totalPages: 0,
      totalRoles: 0,
      recentActivity: []
    });
    setLoading(false);
  }, [authLoading]);

  if (loading || authLoading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-flex align-items-center justify-content-between">
              <h4 className="mb-0">Dashboard</h4>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Page Title */}
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0">Dashboard</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item active">Dashboard</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Welcome back, {user?.name || 'Admin'}!</h5>
              <p className="card-text text-muted">
                This is your admin dashboard. You can manage your content, users, and settings from here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row">
        <div className="col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex">
                <div className="flex-1 overflow-hidden">
                  <p className="text-truncate font-size-14 mb-2">Total Users</p>
                  <h4 className="mb-0">{stats.totalUsers || 0}</h4>
                </div>
                <div className="text-primary">
                  <i className="ri-user-line font-size-24"></i>
                </div>
              </div>
            </div>
            <div className="card-body border-top py-3">
              <div className="text-truncate">
                <span className="badge badge-soft-success font-size-11">
                  <i className="mdi mdi-menu-up"></i> View Details
                </span>
                <span className="text-muted ms-2">User Management</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex">
                <div className="flex-1 overflow-hidden">
                  <p className="text-truncate font-size-14 mb-2">Total Pages</p>
                  <h4 className="mb-0">{stats.totalPages || 0}</h4>
                </div>
                <div className="text-primary">
                  <i className="ri-file-list-line font-size-24"></i>
                </div>
              </div>
            </div>
            <div className="card-body border-top py-3">
              <div className="text-truncate">
                <span className="badge badge-soft-success font-size-11">
                  <i className="mdi mdi-menu-up"></i> View Details
                </span>
                <span className="text-muted ms-2">Page Management</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex">
                <div className="flex-1 overflow-hidden">
                  <p className="text-truncate font-size-14 mb-2">Total Roles</p>
                  <h4 className="mb-0">{stats.totalRoles || 0}</h4>
                </div>
                <div className="text-primary">
                  <i className="ri-shield-user-line font-size-24"></i>
                </div>
              </div>
            </div>
            <div className="card-body border-top py-3">
              <div className="text-truncate">
                <span className="badge badge-soft-success font-size-11">
                  <i className="mdi mdi-menu-up"></i> View Details
                </span>
                <span className="text-muted ms-2">Role Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Quick Actions</h5>
              <div className="row">
                <div className="col-md-3 col-sm-6">
                  <a href="/cms/users" className="btn btn-primary w-100 mb-2">
                    <i className="ri-user-add-line me-1"></i> Manage Users
                  </a>
                </div>
                <div className="col-md-3 col-sm-6">
                  <a href="/cms/pages" className="btn btn-info w-100 mb-2">
                    <i className="ri-file-add-line me-1"></i> Create Page
                  </a>
                </div>
                <div className="col-md-3 col-sm-6">
                  <a href="/cms/roles" className="btn btn-success w-100 mb-2">
                    <i className="ri-shield-line me-1"></i> Manage Roles
                  </a>
                </div>
                <div className="col-md-3 col-sm-6">
                  <a href="/cms/settings" className="btn btn-secondary w-100 mb-2">
                    <i className="ri-settings-3-line me-1"></i> Settings
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Recent Activity</h5>
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>User</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivity.map((activity, index) => (
                        <tr key={index}>
                          <td>{activity.action}</td>
                          <td>{activity.user}</td>
                          <td>{activity.date}</td>
                          <td>
                            <span className="badge badge-soft-success">
                              {activity.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
