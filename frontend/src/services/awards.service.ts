/**
 * Awards Service
 * Handles all API calls related to Awards CRUD operations
 */

import { BaseService } from './base.service';

export interface Award {
  id: string;
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE';
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAwardData {
  title: string;
  year: number;
  issuer: string;
  description?: string;
  image?: string;
  order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateAwardData extends CreateAwardData {
  id?: string;
}

class AwardsService extends BaseService {
  /**
   * Get all awards (CMS - requires authentication)
   */
  async getAllAwards(status?: 'ACTIVE' | 'INACTIVE'): Promise<{ data: Award[] }> {
    const url = status 
      ? this.getApiUrl(`/cms/awards?status=${status}`)
      : this.getApiUrl('/cms/awards');
    
    return this.fetchWithAuth(url);
  }

  /**
   * Get single award by ID
   */
  async getAwardById(id: string): Promise<{ data: Award }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/awards/${id}`));
  }

  /**
   * Create new award
   */
  async createAward(data: CreateAwardData): Promise<{ data: Award; message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/awards'), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update existing award
   */
  async updateAward(id: string, data: UpdateAwardData): Promise<{ data: Award; message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/awards/${id}`), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete award
   */
  async deleteAward(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl(`/cms/awards/${id}`), {
      method: 'DELETE',
    });
  }

  /**
   * Update awards order
   */
  async updateAwardsOrder(updates: { id: string; order: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(this.getApiUrl('/cms/awards/update-order'), {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
}

export const awardsService = new AwardsService();
