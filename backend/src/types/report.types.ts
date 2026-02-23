/**
 * Report Module DTOs and Types
 * Compatible with MySQL legacy structure (BigInt IDs)
 * 3-level hierarchy: ReportType → ReportSection → ReportItem
 */

// ============================================
// REPORT TYPE TYPES
// ============================================

export interface CreateReportTypeDTO {
  name: string;
  type?: 'Grid' | 'List';
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateReportTypeDTO {
  name?: string;
  type?: 'Grid' | 'List';
  sortOrder?: number;
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
  reportTypeId: string | number;
  title: string;
  description?: string;
  reportYear?: number;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateReportSectionDTO {
  reportTypeId?: string | number;
  title?: string;
  description?: string;
  reportYear?: number;
  ctaEnabled?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReportSectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  reportTypeId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// REPORT ITEM TYPES
// ============================================

export interface CreateReportItemDTO {
  reportTypeId?: string | number;
  reportSectionId?: string | number;
  title: string;
  subDescription?: string;
  pdfFile?: string;
  coverImage?: string;
  dataType?: 'Consolidated' | 'Interim';
  auditStatus?: 'Audited' | 'Unaudited' | 'Limited Review';
  fileSize?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateReportItemDTO {
  reportTypeId?: string | number | null;
  reportSectionId?: string | number | null;
  title?: string;
  subDescription?: string;
  pdfFile?: string;
  coverImage?: string;
  dataType?: 'Consolidated' | 'Interim' | null;
  auditStatus?: 'Audited' | 'Unaudited' | 'Limited Review' | null;
  fileSize?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface ReportItemQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  reportTypeId?: string;
  reportSectionId?: string;
  dataType?: string;
  auditStatus?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// PUBLIC FILTER TYPES
// ============================================

export interface ReportFilterParams {
  search?: string;
  dataType?: string;
  auditStatus?: string;
  year?: number;
  reportTypeId?: string;
  displayType?: 'Grid' | 'List';
  page?: number;
  limit?: number;
}

// ============================================
// ORDER UPDATE TYPES
// ============================================

export interface OrderUpdateItem {
  id: string;
  sortOrder: number;
}
