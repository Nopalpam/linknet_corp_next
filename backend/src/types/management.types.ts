/**
 * Management Module DTOs and Types
 */

export interface CreateManagementDTO {
  categoryId: string;
  name: string;
  position: string;
  description?: string;
  photo?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateManagementDTO extends Partial<CreateManagementDTO> {}

export interface ManagementQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ManagementCategoryDTO {
  name: string;
  description?: string;
  position?: number;
  isActive?: boolean;
}
