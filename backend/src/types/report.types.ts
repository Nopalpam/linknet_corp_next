/**
 * Report Module DTOs and Types
 * 3-level hierarchy: ReportType → ReportSection → reports (items)
 * Matches current Prisma schema with String IDs
 */

// ============================================
// REPORT TYPE TYPES
// ============================================

export interface CreateReportTypeDTO {
  name: string;
  type?: 'Grid' | 'List';
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  position?: number;
  isActive?: boolean;
}

export interface UpdateReportTypeDTO {
  name?: string;
  type?: 'Grid' | 'List';
  slug?: string;
  description?: string;
  icon?: string;
  color?: string;
  position?: number;
  isActive?: boolean;
}

export interface ReportTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'Grid' | 'List';
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// REPORT SECTION TYPES
// ============================================

export interface CreateReportSectionDTO {
  type_id: string;
  name: string;
  slug?: string;
  description?: string;
  position?: number;
  isActive?: boolean;
}

export interface UpdateReportSectionDTO {
  type_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  position?: number;
  isActive?: boolean;
}

export interface ReportSectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type_id?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// REPORT ITEM (reports model) TYPES
// ============================================

export interface CreateReportItemDTO {
  type_id?: string;
  section_id?: string;
  title: string;
  slug?: string;
  description?: string;
  pdf_file?: string;
  cover_image?: string;
  data_type?: string;
  audit_status?: string;
  file_size?: string;
  sort_order?: number;
  is_active?: boolean;
  period?: string;
  year?: number;
  quarter?: number;
  file_url?: string;
  file_type?: string;
  thumbnail?: string;
  status?: string;
}

export interface UpdateReportItemDTO {
  type_id?: string;
  section_id?: string;
  title?: string;
  slug?: string;
  description?: string;
  pdf_file?: string;
  cover_image?: string;
  data_type?: string;
  audit_status?: string;
  file_size?: string;
  sort_order?: number;
  is_active?: boolean;
  period?: string;
  year?: number;
  quarter?: number;
  file_url?: string;
  file_type?: string;
  thumbnail?: string;
  status?: string;
}

export interface ReportItemQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type_id?: string;
  section_id?: string;
  year?: number;
  data_type?: string;
  audit_status?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// PUBLIC FILTER TYPES
// ============================================

export interface ReportFilterParams {
  search?: string;
  year?: number;
  type_id?: string;
  section_id?: string;
  page?: number;
  limit?: number;
}

// ============================================
// ORDER UPDATE TYPES
// ============================================

export interface OrderUpdateItem {
  id: string;
  position: number;
}
