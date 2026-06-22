/**
 * Contact Service
 * Handles all API calls related to Contact submissions
 */

import { BaseService } from './base.service';

export type ContactSubmissionStatus = 'NEW' | 'READ';

export interface ContactSubmissionListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  inquiryType: 'BUSINESS' | 'SUPPORT' | 'CAREER' | 'OTHERS';
  subject: string;
  message: string;
  status: ContactSubmissionStatus;
  submittedAt: string;
  readAt?: string | null;
}

export interface SubmitContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  inquiryType: 'BUSINESS' | 'SUPPORT' | 'CAREER' | 'OTHERS';
  subject: string;
  message: string;
}

export interface GetContactSubmissionsParams {
  status?: ContactSubmissionStatus;
  page?: number;
  limit?: number;
  search?: string;
  inquiryType?: ContactSubmissionListItem['inquiryType'];
  dateFrom?: string;
  dateTo?: string;
}

export interface GetContactSubmissionsResponse {
  success: boolean;
  data: {
    submissions: ContactSubmissionListItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    stats: {
      total: number;
      totalThisMonth: number;
      new: number;
      read: number;
    };
  };
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
  async getAllContactSubmissions(params?: GetContactSubmissionsParams): Promise<GetContactSubmissionsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.inquiryType) queryParams.append('inquiryType', params.inquiryType);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.getApiUrl('/cms/contactus')}?${queryString}`
      : this.getApiUrl('/cms/contactus');

    return this.fetchWithAuth(url);
  }

  /**
   * Get single contact submission by ID (CMS)
   */
  async getContactSubmissionById(id: string): Promise<{ data: ContactSubmissionListItem }> {
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
   * Delete multiple contact submissions (CMS)
   */
  async bulkDeleteContactSubmissions(ids: string[]): Promise<{ message: string; deletedCount: number }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/contactus/destroy-multiple'), {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }

  /**
   * Update contact submission status (CMS)
   */
  async updateContactStatus(
    id: string, 
    status: ContactSubmissionStatus
  ): Promise<{ data: ContactSubmissionListItem; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/contactus/${id}/status`), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const contactService = new ContactService();
