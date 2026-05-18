/**
 * Management Module DTOs and Types
 * Matches actual DB: management_categories + managements tables
 */

// ============================================
// MANAGEMENT CATEGORY TYPES
// ============================================

export interface CreateManagementCategoryDTO {
  name: string;
  slug?: string;
  description?: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateManagementCategoryDTO {
  name?: string;
  slug?: string;
  description?: string;
  position?: number;
  is_active?: boolean;
}

export interface ManagementCategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// MANAGEMENT (DATA) TYPES
// ============================================

export interface CreateManagementDTO {
  categoryId: string;
  name: string;
  slug?: string;
  position?: string;
  positionEn?: string;
  positionId?: string;
  description?: string;
  photo?: string;
  bioEn?: string;
  bioId?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order?: number;
  is_active?: boolean;
}

export interface UpdateManagementDTO {
  categoryId?: string;
  name?: string;
  slug?: string;
  position?: string;
  positionEn?: string;
  positionId?: string;
  description?: string;
  photo?: string;
  bioEn?: string;
  bioId?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order?: number;
  is_active?: boolean;
}

export interface ManagementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
