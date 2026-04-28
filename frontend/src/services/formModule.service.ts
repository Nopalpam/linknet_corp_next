/**
 * Form Module CMS Service
 * Handles API calls for /api/v1/cms/form-modules and /api/v1/cms/form-modules/:id/submissions
 */

import { BaseCrudService } from './baseCrud.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const CMS_PREFIX = '/api/v1/cms';

// ================== ENUMS ==================

export type BusinessUnit = 'ENTERPRISE' | 'FIBER' | 'MEDIA';
export type FormCategory = 'REGISTRATION' | 'INQUIRY' | 'PARTNERSHIP' | 'RECOMMENDATION' | 'EVENT';
export type FormHandlingMode = 'SUBMISSION' | 'ROUTING_ONLY';
export type FormModuleStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type FormSubmissionStatus =
  | 'RECEIVED'
  | 'VALIDATED'
  | 'STORED'
  | 'DISPATCHED'
  | 'PARTIAL_FAILED'
  | 'FAILED';
export type FormFieldType =
  | 'TEXT' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'TEXTAREA'
  | 'SELECT' | 'MULTI_SELECT' | 'CHECKBOX' | 'CHECKBOX_GROUP'
  | 'RADIO' | 'DATE' | 'FILE' | 'FILE_GROUP' | 'ADDRESS_LOOKUP'
  | 'REPEATER' | 'HIDDEN';
export type FormRuleType = 'SHOW' | 'HIDE' | 'REQUIRE' | 'OPTIONAL' | 'SET_VALUE' | 'CLEAR_VALUE';
export type FormResponseType = 'REDIRECT' | 'MESSAGE' | 'COMPONENT';
export type FormIntegrationProvider = 'CRM_WEB_TO_LEAD' | 'INTERNAL' | 'WEBHOOK' | 'EMAIL';
export type FormDispatchMode = 'SYNC' | 'ASYNC' | 'FIRE_AND_FORGET';
export type FormDispatchStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';

// ================== INTERFACES ==================

export interface FormFieldOption {
  id: string;
  fieldPath: string;
  value: string;
  label: string;
  description?: string | null;
  metadata?: unknown;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface FormField {
  id: string;
  key: string;
  path: string;
  label: string;
  fieldType: FormFieldType;
  formStepKey?: string | null;
  parentFieldPath?: string | null;
  placeholder?: string | null;
  helpText?: string | null;
  defaultValue?: unknown;
  validation?: unknown;
  uiConfig?: unknown;
  payloadKey?: string | null;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  isSystem: boolean;
  options: FormFieldOption[];
}

export interface FormStep {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  actionLabel?: string | null;
  stepNumber: number;
  isReviewStep: boolean;
  isActive: boolean;
}

export interface FormFieldRule {
  id: string;
  sourceFieldPath?: string | null;
  targetFieldPath?: string | null;
  ruleType: FormRuleType;
  condition: unknown;
  actionConfig: unknown;
  sortOrder: number;
  isActive: boolean;
}

export interface FormResponseConfig {
  id: string;
  key: string;
  responseType: FormResponseType;
  label?: string | null;
  matchCondition?: unknown;
  pathTemplate: string;
  queryTemplate?: unknown;
  sortOrder: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface FormIntegrationConfig {
  id: string;
  key: string;
  provider: FormIntegrationProvider;
  dispatchMode?: FormDispatchMode | null;
  endpoint?: string | null;
  mappingConfig?: unknown;
  headersConfig?: unknown;
  isActive: boolean;
  createdAt: string;
}

export interface FormModuleCounts {
  submissions: number;
  steps: number;
  fields: number;
}

export interface FormModule {
  id: string;
  businessUnit: BusinessUnit;
  slug: string;
  name: string;
  description?: string | null;
  category: FormCategory;
  handlingMode: FormHandlingMode;
  status: FormModuleStatus;
  schemaVersion: number;
  defaultLocale?: string | null;
  publicPath?: string | null;
  sourceWebsite?: string | null;
  promoWebsite?: string | null;
  leadSource?: string | null;
  integrationProvider?: FormIntegrationProvider | null;
  integrationConfig?: unknown;
  submissionSettings?: unknown;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: FormModuleCounts;
}

export interface FormModuleDetail extends FormModule {
  steps: FormStep[];
  fields: FormField[];
  rules: FormFieldRule[];
  responseConfigs: FormResponseConfig[];
  integrations: FormIntegrationConfig[];
}

export interface FormSubmissionValue {
  id: string;
  fieldPath: string;
  fieldKey?: string | null;
  value?: unknown;
  rawValue?: string | null;
}

export interface FormSubmissionGroupValue {
  id: string;
  fieldPath: string;
  fieldKey?: string | null;
  value?: unknown;
  rawValue?: string | null;
}

export interface FormSubmissionFile {
  id: string;
  fieldPath: string;
  fieldKey?: string | null;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  url?: string | null;
  status: string;
}

export interface FormSubmissionGroup {
  id: string;
  groupKey: string;
  sortOrder: number;
  label?: string | null;
  values: FormSubmissionGroupValue[];
  files: FormSubmissionFile[];
}

export interface FormDispatchLog {
  id: string;
  provider: FormIntegrationProvider;
  status: FormDispatchStatus;
  requestPayload?: unknown;
  responseBody?: unknown;
  errorMessage?: string | null;
  attemptCount: number;
  dispatchedAt?: string | null;
  createdAt: string;
}

export interface FormSubmission {
  id: string;
  formModuleId: string;
  businessUnit: BusinessUnit;
  formSlug: string;
  formName?: string | null;
  locale?: string | null;
  requestId?: string | null;
  sessionId?: string | null;
  sourcePath?: string | null;
  primaryName?: string | null;
  primaryEmail?: string | null;
  status: FormSubmissionStatus;
  receivedAt: string;
  processedAt?: string | null;
  createdAt: string;
  values?: FormSubmissionValue[];
  groups?: FormSubmissionGroup[];
  files?: FormSubmissionFile[];
  dispatchLogs?: FormDispatchLog[];
}

// ================== QUERY PARAMS ==================

export interface FormModuleListParams {
  page?: number;
  limit?: number;
  search?: string;
  businessUnit?: BusinessUnit;
  status?: FormModuleStatus;
  category?: FormCategory;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'slug';
  sortOrder?: 'asc' | 'desc';
}

export interface FormSubmissionListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: FormSubmissionStatus;
  sortBy?: 'receivedAt' | 'createdAt' | 'primaryName' | 'primaryEmail' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ================== PAGINATION ==================

export interface PaginatedFormModules {
  data: FormModule[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginatedFormSubmissions {
  data: FormSubmission[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ================== SERVICE CLASS ==================

class FormModuleService extends BaseCrudService<FormModule> {
  constructor() {
    super('/cms/form-modules');
  }

  async listFormModules(params: FormModuleListParams = {}): Promise<PaginatedFormModules> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.businessUnit) qs.set('businessUnit', params.businessUnit);
    if (params.status) qs.set('status', params.status);
    if (params.category) qs.set('category', params.category);
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.sortOrder) qs.set('sortOrder', params.sortOrder);

    const url = `${API_URL}/api/v1${this.baseEndpoint}?${qs.toString()}`;
    const res = await this.fetchWithAuth(url);
    return { data: res.data, pagination: res.pagination };
  }

  async getFormModuleById(id: string): Promise<FormModuleDetail> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/${id}`;
    const res = await this.fetchWithAuth(url);
    return res.data;
  }

  async updateFormModuleStatus(id: string, status: FormModuleStatus): Promise<FormModule> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/${id}`;
    const res = await this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.data;
  }

  async listSubmissions(
    formModuleId: string,
    params: FormSubmissionListParams = {}
  ): Promise<PaginatedFormSubmissions> {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.status) qs.set('status', params.status);
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.sortOrder) qs.set('sortOrder', params.sortOrder);

    const url = `${API_URL}/api/v1${this.baseEndpoint}/${formModuleId}/submissions?${qs.toString()}`;
    const res = await this.fetchWithAuth(url);
    return { data: res.data, pagination: res.pagination };
  }

  async getSubmissionById(formModuleId: string, submissionId: string): Promise<FormSubmission> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/${formModuleId}/submissions/${submissionId}`;
    const res = await this.fetchWithAuth(url);
    return res.data;
  }

  async retrySubmissionDispatch(formModuleId: string, submissionId: string): Promise<FormSubmission> {
    const url = `${API_URL}/api/v1${this.baseEndpoint}/${formModuleId}/submissions/${submissionId}/retry-dispatch`;
    const res = await this.fetchWithAuth(url, { method: 'POST' });
    return res.data;
  }
}

export const formModuleService = new FormModuleService();
