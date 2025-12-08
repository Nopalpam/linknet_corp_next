/**
 * Database Model Types
 * Auto-generated TypeScript interfaces based on Prisma schema
 */

// ============================================
// AUTHENTICATION TYPES
// ============================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  phone?: string | null;
  status: UserStatus;
  emailVerifiedAt?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IRole {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IPermission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: Date;
}

export interface IUserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: Date;
}

// ============================================
// CORE TYPES
// ============================================

export enum SettingType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

export interface ISetting {
  id: string;
  key: string;
  value?: any | null;
  type: SettingType;
  group: string;
  label: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum MenuTarget {
  SELF = 'SELF',
  BLANK = 'BLANK',
}

export enum MenuType {
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  SIDEBAR = 'SIDEBAR',
}

export interface IMenu {
  id: string;
  parentId?: string | null;
  title: string;
  slug: string;
  url?: string | null;
  target: MenuTarget;
  icon?: string | null;
  position: number;
  isActive: boolean;
  menuType: MenuType;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// CONTENT TYPES
// ============================================

export enum ContentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface IPage {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  featuredImage?: string | null;
  template: string;
  status: ContentStatus;
  publishedAt?: Date | null;
  createdById: string;
  updatedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IPageComponent {
  id: string;
  pageId: string;
  type: string;
  data: any;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NEWS TYPES
// ============================================

export interface INews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  featuredImage?: string | null;
  categoryId: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  views: number;
  status: ContentStatus;
  publishedAt?: Date | null;
  createdById: string;
  updatedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface INewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface INewsHighlight {
  id: string;
  newsId: string;
  position: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsTag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface INewsTagRelation {
  id: string;
  newsId: string;
  tagId: string;
  createdAt: Date;
}

// ============================================
// DOCUMENTS TYPES (3-TIER: ANNOUNCEMENTS)
// ============================================

export interface IAnnouncementType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IAnnouncementSection {
  id: string;
  typeId: string;
  name: string;
  slug: string;
  description?: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IAnnouncement {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  thumbnail?: string | null;
  downloads: number;
  status: ContentStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// REPORTS TYPES (3-TIER)
// ============================================

export interface IReportType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IReportSection {
  id: string;
  typeId: string;
  name: string;
  slug: string;
  description?: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IReport {
  id: string;
  sectionId: string;
  title: string;
  slug: string;
  description?: string | null;
  period?: string | null;
  year?: number | null;
  quarter?: number | null;
  fileUrl?: string | null;
  fileSize?: number | null;
  fileType?: string | null;
  thumbnail?: string | null;
  downloads: number;
  status: ContentStatus;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// HR TYPES
// ============================================

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
}

export enum CareerStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT',
}

export interface ICareer {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits?: string | null;
  salaryRange?: string | null;
  closingDate?: Date | null;
  status: CareerStatus;
  views: number;
  applications: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IAward {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  issuer: string;
  issueDate: Date;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IManagement {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  position: string;
  description?: string | null;
  photo?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IManagementCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  position: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// COMMUNICATION TYPES
// ============================================

export enum ContactType {
  GENERAL = 'GENERAL',
  SUPPORT = 'SUPPORT',
  SALES = 'SALES',
  PARTNERSHIP = 'PARTNERSHIP',
  COMPLAINT = 'COMPLAINT',
}

export enum SubmissionStatus {
  NEW = 'NEW',
  READ = 'READ',
  REPLIED = 'REPLIED',
  CLOSED = 'CLOSED',
}

export interface IContactSubmission {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  type: ContactType;
  status: SubmissionStatus;
  ipAddress?: string | null;
  userAgent?: string | null;
  readAt?: Date | null;
  repliedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// SYSTEM TYPES
// ============================================

export interface ILogActivity {
  id: string;
  userId?: string | null;
  action: string;
  module: string;
  description?: string | null;
  metadata?: any | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface IUrlRedirect {
  id: string;
  fromUrl: string;
  toUrl: string;
  statusCode: number;
  hits: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// FILES TYPES
// ============================================

export interface IFolder {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  path: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface IFile {
  id: string;
  folderId?: string | null;
  createdById: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  cloudProvider?: string | null;
  cloudPath?: string | null;
  cloudKey?: string | null;
  thumbnail?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
  metadata?: any | null;
  downloads: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// ============================================
// DTO TYPES (Data Transfer Objects)
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

// ============================================
// QUERY FILTER TYPES
// ============================================

export interface BaseFilter {
  search?: string;
  status?: ContentStatus;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UserFilter extends BaseFilter {
  role?: string;
  emailVerified?: boolean;
}

export interface NewsFilter extends BaseFilter {
  categoryId?: string;
  tagId?: string;
}

export interface CareerFilter extends BaseFilter {
  department?: string;
  location?: string;
  employmentType?: EmploymentType;
}
