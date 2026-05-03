/**
 * Awards Service (Refactored)
 * Extends BaseCrudService for Awards-specific operations
 */

import { BaseCrudService } from './baseCrud.service';

export interface Award {
  id: string;
  title: string;
  year: number;
  issuer: string;
  description?: string;
  topLogo?: string;
  image?: string;
  link?: string;
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
  topLogo?: string;
  image?: string;
  link?: string;
  order?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateAwardData extends CreateAwardData {
  id?: string;
}

/**
 * Awards Service
 * Inherits all CRUD methods from BaseCrudService:
 * - getPaginated(params) - Get paginated awards with search, sort, filters
 * - getById(id) - Get single award
 * - create(data) - Create new award
 * - update(id, data) - Update award
 * - delete(id) - Delete award
 * - bulkDelete(ids) - Delete multiple awards
 * - getAll() - Get all awards without pagination
 */
class AwardsServiceRefactored extends BaseCrudService<Award> {
  constructor() {
    super('/cms/awards');
  }

  /**
   * Update awards order (awards-specific method)
   */
  async updateAwardsOrder(updates: { id: string; order: number }[]): Promise<{ message: string }> {
    return this.fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${this.baseEndpoint}/update-order`, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }
}

export const awardsServiceNew = new AwardsServiceRefactored();
