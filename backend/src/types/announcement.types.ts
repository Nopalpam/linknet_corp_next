/**
 * Announcement Module DTOs and Types
 * 3-level hierarchy: AnnouncementType → AnnouncementSection → announcements (items)
 */

// ============================================
// ANNOUNCEMENT TYPE TYPES
// ============================================

export interface CreateAnnouncementTypeDTO {
  name: string;
  slug?: string;
  type?: string;
  description?: string;
  icon?: string;
  color?: string;
  position?: number;
  isActive?: boolean;
}

export interface UpdateAnnouncementTypeDTO {
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  icon?: string;
  color?: string;
  position?: number;
  isActive?: boolean;
}

export interface AnnouncementTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// ANNOUNCEMENT SECTION TYPES
// ============================================

export interface CreateAnnouncementSectionDTO {
  type_id: string;
  name: string;
  slug?: string;
  description?: string;
  announcement_year?: string;
  cta_enabled?: boolean;
  cta_text?: string;
  cta_url?: string;
  position?: number;
  isActive?: boolean;
}

export interface UpdateAnnouncementSectionDTO {
  type_id?: string;
  name?: string;
  slug?: string;
  description?: string;
  announcement_year?: string;
  cta_enabled?: boolean;
  cta_text?: string;
  cta_url?: string;
  position?: number;
  isActive?: boolean;
}

export interface AnnouncementSectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type_id?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// ANNOUNCEMENT ITEM TYPES
// ============================================

export interface CreateAnnouncementItemDTO {
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
  status?: string;
}

export interface UpdateAnnouncementItemDTO {
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
  status?: string;
}

export interface AnnouncementItemQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type_id?: string;
  section_id?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// PUBLIC FILTER TYPES
// ============================================

export interface AnnouncementFilterParams {
  search?: string;
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
