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
const formModuleIdentifierRegex = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const fieldPathRegex = /^[A-Za-z][A-Za-z0-9_.-]*$/;
const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

const jsonObjectSchema = z.record(z.string(), z.unknown());
const formSubmissionDatePresetSchema = z.enum([
  'today',
  'yesterday',
  'last7days',
  'last30days',
  'custom',
]);

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

const submissionContextSchema = z.object({
  product: z.string().max(255).optional().nullable(),
  promo: z.string().max(255).optional().nullable(),
  source: z.string().max(255).optional().nullable(),
  formModuleName: z.string().max(255).optional().nullable(),
  form_module_name: z.string().max(255).optional().nullable(),
  formChannel: z.string().max(255).optional().nullable(),
  form_channel: z.string().max(255).optional().nullable(),
  url: z.string().max(2000).optional().nullable(),
  pageUrl: z.string().max(2000).optional().nullable(),
});

const submissionFormInfoSchema = z.object({
  formModuleName: z.string().max(255).optional().nullable(),
  form_module_name: z.string().max(255).optional().nullable(),
  formChannel: z.string().max(255).optional().nullable(),
  form_channel: z.string().max(255).optional().nullable(),
});

export const publicFormSubmissionSchema = z.object({
  locale: z.string().min(2).max(10).optional(),
  requestId: z.string().max(255).optional(),
  sessionId: z.string().max(255).optional(),
  sourcePath: z.string().max(1000).optional(),
  values: jsonObjectSchema,
  groups: z.array(submissionGroupSchema).default([]),
  files: z.array(submissionFileSchema).default([]),
  context: submissionContextSchema.optional(),
  formInfo: submissionFormInfoSchema.optional(),
  responseContext: z.unknown().optional(),
});

export const enterpriseFormSubmissionSchema = z.object({
  form_type: z.string().min(1).max(120),
  fields: jsonObjectSchema,
  context: submissionContextSchema.optional(),
  locale: z.string().min(2).max(10).optional(),
  requestId: z.string().max(255).optional(),
  sessionId: z.string().max(255).optional(),
  groups: z.array(submissionGroupSchema).default([]),
  files: z.array(submissionFileSchema).default([]),
  formInfo: submissionFormInfoSchema.optional(),
  responseContext: z.unknown().optional(),
});

export const formSubmissionQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().max(200).optional(),
    email: z.string().max(200).optional(),
    needs: z.string().max(255).optional(),
    formChannel: z.string().max(255).optional(),
    source: z.string().max(255).optional(),
    status: z.nativeEnum(FormSubmissionStatus).optional(),
    datePreset: formSubmissionDatePresetSchema.optional(),
    dateFrom: z.string().regex(dateOnlyRegex, 'Date must use YYYY-MM-DD').optional(),
    dateTo: z.string().regex(dateOnlyRegex, 'Date must use YYYY-MM-DD').optional(),
    format: z.enum(['csv', 'xlsx']).default('csv'),
    sortBy: z.enum(['receivedAt', 'createdAt', 'primaryName', 'primaryEmail', 'status']).default('receivedAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  })
  .superRefine((value, ctx) => {
    const hasCustomRange = value.dateFrom !== undefined || value.dateTo !== undefined;

    if (value.datePreset === 'custom') {
      if (!value.dateFrom) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateFrom'],
          message: 'dateFrom is required when datePreset=custom',
        });
      }

      if (!value.dateTo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dateTo'],
          message: 'dateTo is required when datePreset=custom',
        });
      }
    }

    if (hasCustomRange && value.datePreset !== 'custom') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['datePreset'],
        message: 'datePreset must be custom when dateFrom/dateTo are provided',
      });
    }

    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dateTo'],
        message: 'dateTo must be greater than or equal to dateFrom',
      });
    }
  });

export const formModuleIdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(255)
    .regex(formModuleIdentifierRegex, 'Form module id contains invalid characters'),
});

export const formSubmissionIdParamSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(255)
    .regex(formModuleIdentifierRegex, 'Form module id contains invalid characters'),
  submissionId: z.string().uuid(),
});

export const updateSubmissionReviewStatusSchema = z.object({
  reviewStatus: z.enum(['HOLD', 'REJECTED', 'APPROVED']),
});

export type CreateFormModuleInput = z.infer<typeof createFormModuleSchema>;
export type FormModuleDefinitionInput = z.infer<typeof formModuleDefinitionSchema>;
export type FormModuleQueryInput = z.infer<typeof formModuleQuerySchema>;
export type FormSubmissionQueryInput = z.infer<typeof formSubmissionQuerySchema>;
export type PublicFormModuleParamsInput = z.infer<typeof publicFormModuleParamsSchema>;
export type PublicFormSubmissionInput = z.infer<typeof publicFormSubmissionSchema>;
export type UpdateFormModuleInput = z.infer<typeof updateFormModuleSchema>;
export type UpdateSubmissionReviewStatusInput = z.infer<typeof updateSubmissionReviewStatusSchema>;
