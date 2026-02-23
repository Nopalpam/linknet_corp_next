/**
 * Management Module DTOs and Types
 * Compatible with MySQL legacy structure (BigInt IDs, bilingual fields)
 */

// ============================================
// MANAGEMENT CATEGORY TYPES
// ============================================

export interface CreateManagementCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  status?: number; // 1 = active, 0 = inactive
  createdBy?: string;
}

export interface UpdateManagementCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  order?: number;
  status?: number;
  updatedBy?: string;
}

export interface ManagementCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// MANAGEMENT (DATA) TYPES
// ============================================

export interface CreateManagementDTO {
  name: string;
  positionEn?: string;
  positionId?: string;
  category?: string;
  categoryId?: bigint | number | string;
  photo?: string;
  bioEn?: string;
  bioId?: string;
  dataOrder?: number;
  dataStatus?: number; // 1 = active, 0 = inactive
  createdBy?: string;
}

export interface UpdateManagementDTO {
  name?: string;
  positionEn?: string;
  positionId?: string;
  category?: string;
  categoryId?: bigint | number | string;
  photo?: string;
  bioEn?: string;
  bioId?: string;
  dataOrder?: number;
  dataStatus?: number;
  updatedBy?: string;
}

export interface ManagementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  dataStatus?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
