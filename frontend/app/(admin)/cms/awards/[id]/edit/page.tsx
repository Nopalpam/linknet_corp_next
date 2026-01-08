'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { awardApi } from '@/lib/api/award.api';
import { AwardFormData } from '@/types/award.types';

export default function EditAwardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AwardFormData>({
    title: '',
    year: new Date().getFullYear(),
    issuer: '',
    description: '',
    image: '',
    order: 0,
    status: 'ACTIVE',
  });

  useEffect(() => {
    fetchAward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAward = async () => {
    try {
      setFetching(true);
      const award = await awardApi.getAwardById(id);
      setFormData({
        title: award.title,
        year: award.year,
        issuer: award.issuer,
        description: award.description || '',
        image: award.image || '',
        order: award.order,
        status: award.status,
      });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch award');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await awardApi.updateAward(id, formData);
      router.push('/cms/awards');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update award');
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'year' || name === 'order' ? parseInt(value) : value,
    }));
  };

  if (fetching) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="text-center py-5">
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
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 font-size-18">Edit Award</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link href="/cms/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link href="/cms/awards">Awards</Link>
                </li>
                <li className="breadcrumb-item active">Edit</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

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

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="year" className="form-label">
                      Year <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      min="1900"
                      max="2100"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="issuer" className="form-label">
                      Issuer <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="issuer"
                      name="issuer"
                      value={formData.issuer}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="image" className="form-label">
                    Image URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="order" className="form-label">
                      Order
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="order"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                    />
                    <small className="form-text text-muted">
                      Lower numbers appear first
                    </small>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <select
                      className="form-select"
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link href="/cms/awards" className="btn btn-secondary">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      'Update Award'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-3">Help</h5>
              <div className="text-muted">
                <p className="small mb-2">
                  <strong>Title:</strong> The name of the award
                </p>
                <p className="small mb-2">
                  <strong>Year:</strong> Year the award was received
                </p>
                <p className="small mb-2">
                  <strong>Issuer:</strong> Organization that issued the award
                </p>
                <p className="small mb-2">
                  <strong>Description:</strong> Details about the award
                </p>
                <p className="small mb-2">
                  <strong>Image:</strong> URL to award image or certificate
                </p>
                <p className="small mb-2">
                  <strong>Order:</strong> Display order (lower = higher priority)
                </p>
                <p className="small mb-0">
                  <strong>Status:</strong> Active awards are visible to public
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
