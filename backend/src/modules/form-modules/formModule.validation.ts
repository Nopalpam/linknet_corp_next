import { z } from 'zod';
import {
  BusinessUnit,
  FormCategory,
  FormDispatchMode,
  FormFieldType,
  FormFileStatus,
  FormHandlingMode,
  FormIntegrationProvider,
  FormModuleStatus,
  FormResponseType,
  FormRuleType,
  FormSubmissionStatus,
} from '@prisma/client';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fieldPathRegex = /^[A-Za-z][A-Za-z0-9_.-]*$/;

const jsonObjectSchema = z.record(z.string(), z.unknown());

export const publicFormModuleParamsSchema = z.object({
  businessUnit: z.enum(['enterprise', 'fiber', 'media']),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase, alphanumeric with dashes only'),
});

const formStepSchema = z.object({
  key: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  actionLabel: z.string().max(120).optional(),
  stepNumber: z.coerce.number().int().positive(),
  isReviewStep: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const formFieldSchema = z.object({
  key: z.string().min(1).max(120),
  path: z.string().regex(fieldPathRegex, 'Field path contains invalid characters'),
  label: z.string().min(1).max(255),
  fieldType: z.nativeEnum(FormFieldType),
  formStepKey: z.string().min(1).max(100).optional(),
  parentFieldPath: z.string().regex(fieldPathRegex).optional(),
  placeholder: z.string().max(255).optional(),
  helpText: z.string().max(1000).optional(),
  defaultValue: z.unknown().optional(),
  validation: z.unknown().optional(),
  uiConfig: z.unknown().optional(),
  payloadKey: z.string().max(255).optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  isRequired: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isSystem: z.boolean().optional(),
});

const formFieldOptionSchema = z.object({
  fieldPath: z.string().regex(fieldPathRegex),
  value: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  description: z.string().max(500).optional(),
  metadata: z.unknown().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const formFieldRuleSchema = z.object({
  sourceFieldPath: z.string().regex(fieldPathRegex).optional(),
  targetFieldPath: z.string().regex(fieldPathRegex).optional(),
  ruleType: z.nativeEnum(FormRuleType),
  condition: z.unknown(),
  actionConfig: z.unknown(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

const formResponseConfigSchema = z.object({
  key: z.string().min(1).max(120),
  responseType: z.nativeEnum(FormResponseType),
  label: z.string().max(255).optional(),
  matchCondition: z.unknown().optional(),
  pathTemplate: z.string().min(1).max(1000),
  queryTemplate: z.unknown().optional(),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const formIntegrationConfigSchema = z.object({
  key: z.string().min(1).max(120),
  provider: z.nativeEnum(FormIntegrationProvider),
  dispatchMode: z.nativeEnum(FormDispatchMode).optional(),
  endpoint: z.string().max(1000).optional(),
  mappingConfig: z.unknown().optional(),
  headersConfig: z.unknown().optional(),
  isActive: z.boolean().optional(),
});

export const formModuleDefinitionSchema = z.object({
  steps: z.array(formStepSchema).default([]),
  fields: z.array(formFieldSchema).default([]),
  options: z.array(formFieldOptionSchema).default([]),
  rules: z.array(formFieldRuleSchema).default([]),
  responseConfigs: z.array(formResponseConfigSchema).default([]),
  integrationConfigs: z.array(formIntegrationConfigSchema).default([]),
});

export const createFormModuleSchema = z.object({
  businessUnit: z.nativeEnum(BusinessUnit),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase, alphanumeric with dashes only'),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.nativeEnum(FormCategory),
  handlingMode: z.nativeEnum(FormHandlingMode).optional(),
  status: z.nativeEnum(FormModuleStatus).optional(),
  schemaVersion: z.coerce.number().int().positive().optional(),
  defaultLocale: z.string().min(2).max(10).optional(),
  publicPath: z.string().max(500).optional(),
  sourceWebsite: z.string().max(255).optional(),
  promoWebsite: z.string().max(255).optional(),
  leadSource: z.string().max(255).optional(),
  integrationProvider: z.nativeEnum(FormIntegrationProvider).optional(),
  integrationConfig: z.unknown().optional(),
  submissionSettings: z.unknown().optional(),
  definition: formModuleDefinitionSchema.default({
    steps: [],
    fields: [],
    options: [],
    rules: [],
    responseConfigs: [],
    integrationConfigs: [],
  }),
});

export const updateFormModuleSchema = z.object({
  businessUnit: z.nativeEnum(BusinessUnit).optional(),
  slug: z.string().regex(slugRegex, 'Slug must be lowercase, alphanumeric with dashes only').optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.nativeEnum(FormCategory).optional(),
  handlingMode: z.nativeEnum(FormHandlingMode).optional(),
  status: z.nativeEnum(FormModuleStatus).optional(),
  schemaVersion: z.coerce.number().int().positive().optional(),
  defaultLocale: z.string().min(2).max(10).optional(),
  publicPath: z.string().max(500).optional().nullable(),
  sourceWebsite: z.string().max(255).optional().nullable(),
  promoWebsite: z.string().max(255).optional().nullable(),
  leadSource: z.string().max(255).optional().nullable(),
  integrationProvider: z.nativeEnum(FormIntegrationProvider).optional(),
  integrationConfig: z.unknown().optional(),
  submissionSettings: z.unknown().optional(),
  replaceDefinition: z.boolean().optional(),
  definition: formModuleDefinitionSchema.optional(),
});

export const formModuleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(200).optional(),
  businessUnit: z.nativeEnum(BusinessUnit).optional(),
  status: z.nativeEnum(FormModuleStatus).optional(),
  category: z.nativeEnum(FormCategory).optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'slug']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const submissionGroupSchema = z.object({
  groupKey: z.string().min(1).max(120),
  sortOrder: z.coerce.number().int().nonnegative().optional(),
  label: z.string().max(255).optional(),
  values: jsonObjectSchema,
});

const submissionFileSchema = z.object({
  fieldPath: z.string().regex(fieldPathRegex),
  fieldKey: z.string().max(120).optional(),
  groupKey: z.string().max(120).optional(),
  groupSortOrder: z.coerce.number().int().nonnegative().optional(),
  fileId: z.string().uuid().optional(),
  originalName: z.string().max(255).optional(),
  mimeType: z.string().max(255).optional(),
  size: z.coerce.number().int().nonnegative().optional(),
  path: z.string().max(1000).optional(),
  url: z.string().max(2000).optional(),
  checksum: z.string().max(255).optional(),
  status: z.nativeEnum(FormFileStatus).optional(),
  metadata: z.unknown().optional(),
});

export const publicFormSubmissionSchema = z.object({
  locale: z.string().min(2).max(10).optional(),
  requestId: z.string().max(255).optional(),
  sessionId: z.string().max(255).optional(),
  sourcePath: z.string().max(1000).optional(),
  values: jsonObjectSchema,
  groups: z.array(submissionGroupSchema).default([]),
  files: z.array(submissionFileSchema).default([]),
  responseContext: z.unknown().optional(),
});

export const formSubmissionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().max(200).optional(),
  status: z.nativeEnum(FormSubmissionStatus).optional(),
  sortBy: z.enum(['receivedAt', 'createdAt', 'primaryName', 'primaryEmail', 'status']).default('receivedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const formModuleIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const formSubmissionIdParamSchema = z.object({
  id: z.string().uuid(),
  submissionId: z.string().uuid(),
});

export type CreateFormModuleInput = z.infer<typeof createFormModuleSchema>;
export type FormModuleDefinitionInput = z.infer<typeof formModuleDefinitionSchema>;
export type FormModuleQueryInput = z.infer<typeof formModuleQuerySchema>;
export type FormSubmissionQueryInput = z.infer<typeof formSubmissionQuerySchema>;
export type PublicFormModuleParamsInput = z.infer<typeof publicFormModuleParamsSchema>;
export type PublicFormSubmissionInput = z.infer<typeof publicFormSubmissionSchema>;
export type UpdateFormModuleInput = z.infer<typeof updateFormModuleSchema>;