/**
 * Contact Service
 * Handles all API calls related to Contact submissions
 */

import { BaseService } from './base.service';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface GetContactSubmissionsParams {
  status?: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED';
  page?: number;
  limit?: number;
}

class ContactService extends BaseService {
  /**
   * Submit contact form (Public)
   */
  async submitContactForm(data: SubmitContactFormData): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/contact-us/submit'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all contact submissions (CMS)
   */
  async getAllContactSubmissions(params?: GetContactSubmissionsParams): Promise<{ 
    data: ContactSubmission[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.getApiUrl('/cms/contactus')}?${queryString}`
      : this.getApiUrl('/cms/contactus');

    return this.fetchWithAuth(url);
  }

  /**
   * Get single contact submission by ID (CMS)
   */
  async getContactSubmissionById(id: string): Promise<{ data: ContactSubmission }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/contactus/${id}`));
  }

  /**
   * Delete contact submission (CMS)
   */
  async deleteContactSubmission(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/contactus/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Update contact submission status (CMS)
   */
  async updateContactStatus(
    id: string, 
    status: 'NEW' | 'READ' | 'REPLIED' | 'ARCHIVED'
  ): Promise<{ data: ContactSubmission; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/contactus/${id}/status`), {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const contactService = new ContactService();
