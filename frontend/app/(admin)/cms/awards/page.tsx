'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { awardApi } from '@/lib/api/award.api';
import { Award } from '@/types/award.types';
import { CanAccess } from '@/components/CanAccess';

export default function AwardsPage() {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | ''>('');

  useEffect(() => {
    fetchAwards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchAwards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await awardApi.getAwards(statusFilter || undefined);
      setAwards(data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch awards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      await awardApi.deleteAward(id);
      setSuccess('Award deleted successfully');
      fetchAwards();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to delete award');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleToggleStatus = async (award: Award) => {
    try {
      const newStatus = award.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await awardApi.updateAward(award.id, { status: newStatus });
      setSuccess('Award status updated successfully');
      fetchAwards();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update award status');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Awards Management</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link href="/cms/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Awards</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess(null)}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-sm-6">
                  <CanAccess permission="awards.create">
                    <Link href="/cms/awards/create" className="btn btn-success">
                      <i className="bx bx-plus me-1"></i> Add Award
                    </Link>
                  </CanAccess>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-end">
                    <select
                      className="form-select"
                      style={{ width: 'auto' }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as '' | 'ACTIVE' | 'INACTIVE')}
                    >
                      <option value="">All Status</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : awards.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bx bx-trophy display-4 text-muted"></i>
                  <p className="mt-3">No awards found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-centered table-nowrap align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '80px' }}>Image</th>
                        <th>Title</th>
                        <th>Year</th>
                        <th>Issuer</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th style={{ width: '150px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {awards.map((award) => (
                        <tr key={award.id}>
                          <td>
                            {award.image ? (
                              <img
                                src={award.image}
                                alt={award.title}
                                className="rounded"
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                }}
                              />
                            ) : (
                              <div
                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: '60px', height: '60px' }}
                              >
                                <i className="bx bx-trophy text-muted"></i>
                              </div>
                            )}
                          </td>
                          <td>
                            <h5 className="font-size-14 mb-1">{award.title}</h5>
                            {award.description && (
                              <p className="text-muted mb-0 small">
                                {award.description.substring(0, 100)}
                                {award.description.length > 100 && '...'}
                              </p>
                            )}
                          </td>
                          <td>{award.year}</td>
                          <td>{award.issuer}</td>
                          <td>{award.order}</td>
                          <td>
                            <span
                              className={`badge badge-soft-${
                                award.status === 'ACTIVE' ? 'success' : 'secondary'
                              }`}
                            >
                              {award.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <CanAccess permission="awards.update">
                                <button
                                  className="btn btn-sm btn-soft-info"
                                  onClick={() => handleToggleStatus(award)}
                                  title={`Set to ${
                                    award.status === 'ACTIVE' ? 'Inactive' : 'Active'
                                  }`}
                                >
                                  <i
                                    className={`bx ${
                                      award.status === 'ACTIVE'
                                        ? 'bx-hide'
                                        : 'bx-show'
                                    }`}
                                  ></i>
                                </button>
                              </CanAccess>
                              <CanAccess permission="awards.update">
                                <Link
                                  href={`/cms/awards/${award.id}/edit`}
                                  className="btn btn-sm btn-soft-primary"
                                >
                                  <i className="bx bx-pencil"></i>
                                </Link>
                              </CanAccess>
                              <CanAccess permission="awards.delete">
                                <button
                                  className="btn btn-sm btn-soft-danger"
                                  onClick={() => handleDelete(award.id, award.title)}
                                >
                                  <i className="bx bx-trash"></i>
                                </button>
                              </CanAccess>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
