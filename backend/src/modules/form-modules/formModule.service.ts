import {
  BusinessUnit,
  FormDispatchStatus,
  FormFileStatus,
  FormHandlingMode,
  FormModuleStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import {
  CreateFormModuleInput,
  FormModuleDefinitionInput,
  FormModuleQueryInput,
  FormSubmissionQueryInput,
  PublicFormSubmissionInput,
  UpdateFormModuleInput,
} from './formModule.validation';
import { FormSubmissionDispatchService } from './formSubmissionDispatch.service';
import { NotFoundError, ValidationError } from '../../types/error.types';

type PrismaTransaction = Prisma.TransactionClient;

const adminDefinitionInclude = {
  steps: {
    orderBy: { stepNumber: 'asc' },
  },
  fields: {
    orderBy: [{ sortOrder: 'asc' }, { path: 'asc' }],
    include: {
      options: {
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      },
    },
  },
  rules: {
    orderBy: [{ sortOrder: 'asc' }],
  },
  responseConfigs: {
    orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
  },
  integrations: {
    orderBy: [{ createdAt: 'asc' }],
  },
} satisfies Prisma.FormModuleInclude;

const publicDefinitionInclude = {
  steps: {
    where: { isActive: true },
    orderBy: { stepNumber: 'asc' },
  },
  fields: {
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { path: 'asc' }],
    include: {
      options: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      },
    },
  },
  rules: {
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }],
  },
  responseConfigs: {
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
  },
} satisfies Prisma.FormModuleInclude;

const submissionDetailInclude = {
  values: {
    orderBy: [{ fieldPath: 'asc' }],
  },
  groups: {
    orderBy: [{ groupKey: 'asc' }, { sortOrder: 'asc' }],
    include: {
      values: {
        orderBy: [{ fieldPath: 'asc' }],
      },
      files: {
        orderBy: [{ fieldPath: 'asc' }],
      },
    },
  },
  files: {
    orderBy: [{ fieldPath: 'asc' }],
  },
  dispatchLogs: {
    orderBy: [{ createdAt: 'asc' }],
  },
} satisfies Prisma.FormSubmissionInclude;

export class FormModuleService {
  private readonly dispatchService: FormSubmissionDispatchService;

  constructor(private readonly prisma: PrismaClient) {
    this.dispatchService = new FormSubmissionDispatchService(prisma);
  }

  async getFormModules(query: FormModuleQueryInput) {
    const skip = (query.page - 1) * query.limit;
    const where: Prisma.FormModuleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.businessUnit ? { businessUnit: query.businessUnit } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { slug: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.FormModuleOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.formModule.count({ where }),
      this.prisma.formModule.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          _count: {
            select: {
              submissions: true,
              steps: true,
              fields: true,
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getFormModuleById(id: string) {
    const module = await this.prisma.formModule.findFirst({
      where: { id, deletedAt: null },
      include: adminDefinitionInclude,
    });

    if (!module) {
      throw new NotFoundError('Form module not found');
    }

    return module;
  }

  async getPublicFormModule(businessUnit: BusinessUnit, slug: string) {
    const module = await this.prisma.formModule.findFirst({
      where: {
        businessUnit,
        slug,
        status: FormModuleStatus.ACTIVE,
        deletedAt: null,
      },
      include: publicDefinitionInclude,
    });

    if (!module) {
      throw new NotFoundError('Active form module not found');
    }

    return module;
  }

  async createFormModule(input: CreateFormModuleInput) {
    return this.prisma.$transaction(async (tx) => {
      const created = await tx.formModule.create({
        data: this.buildCreateModuleData(input),
      });

      await this.replaceModuleDefinition(tx, created.id, input.definition);

      return tx.formModule.findUniqueOrThrow({
        where: { id: created.id },
        include: adminDefinitionInclude,
      });
    });
  }

  async updateFormModule(id: string, input: UpdateFormModuleInput) {
    return this.prisma.$transaction(async (tx) => {
      await tx.formModule.findFirstOrThrow({
        where: { id, deletedAt: null },
      });

      await tx.formModule.update({
        where: { id },
        data: this.buildUpdateModuleData(input),
      });

      if (input.replaceDefinition) {
        await this.replaceModuleDefinition(tx, id, input.definition ?? {
          steps: [],
          fields: [],
          options: [],
          rules: [],
          responseConfigs: [],
          integrationConfigs: [],
        });
      }

      return tx.formModule.findUniqueOrThrow({
        where: { id },
        include: adminDefinitionInclude,
      });
    });
  }

  async deleteFormModule(id: string) {
    const existing = await this.prisma.formModule.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundError('Form module not found');
    }

    await this.prisma.formModule.update({
      where: { id },
      data: {
        status: FormModuleStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  async createSubmission(
    businessUnit: BusinessUnit,
    slug: string,
    input: PublicFormSubmissionInput,
    requestMeta: { ipAddress?: string | null; userAgent?: string | null }
  ) {
    const module = await this.prisma.formModule.findFirst({
      where: {
        businessUnit,
        slug,
        status: FormModuleStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        responseConfigs: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { key: 'asc' }],
        },
        integrations: {
          where: { isActive: true },
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });

    if (!module) {
      throw new NotFoundError('Active form module not found');
    }

    const primarySnapshot = this.resolvePrimarySnapshot(input.values, input.groups);
    const resolvedResponse = this.resolveResponseConfig(
      module.responseConfigs,
      input.values,
      input.groups,
      input.locale ?? module.defaultLocale,
      primarySnapshot
    );

    if (module.handlingMode === FormHandlingMode.ROUTING_ONLY) {
      return {
        submission: null,
        response: resolvedResponse,
        persisted: false,
      };
    }

    const createdSubmission = await this.prisma.$transaction(async (tx) => {
      const submission = await tx.formSubmission.create({
        data: {
          formModuleId: module.id,
          businessUnit,
          formSlug: module.slug,
          schemaVersion: module.schemaVersion,
          locale: input.locale ?? module.defaultLocale,
          requestId: input.requestId,
          sessionId: input.sessionId,
          ipAddress: requestMeta.ipAddress ?? undefined,
          userAgent: requestMeta.userAgent ?? undefined,
          sourcePath: input.sourcePath ?? module.publicPath ?? undefined,
          promoWebsite: this.pickString(input.values, ['Promo_Website__c']) ?? module.promoWebsite ?? undefined,
          pageWebsite: this.pickString(input.values, ['Page_Website__c']) ?? undefined,
          sourceWebsite: this.pickString(input.values, ['Source_Website__c']) ?? module.sourceWebsite ?? undefined,
          leadSource: this.pickString(input.values, ['LeadSource']) ?? module.leadSource ?? undefined,
          primaryName: primarySnapshot.primaryName,
          primaryEmail: primarySnapshot.primaryEmail,
          primaryPhone: primarySnapshot.primaryPhone,
          eventName: primarySnapshot.eventName,
          rawPayload: this.toJsonInput(input),
          responseContext: resolvedResponse ? this.toJsonInput(resolvedResponse) : undefined,
          status: input.files.length > 0 ? 'VALIDATED' : 'STORED',
        },
      });

      const valueRows = Object.entries(input.values).map(([fieldKey, value]) => ({
        submissionId: submission.id,
        fieldPath: fieldKey,
        fieldKey: this.extractFieldKey(fieldKey),
        value: this.toJsonInput(value),
        displayValue: this.displayValueOf(value),
        isSensitive: this.isSensitiveField(fieldKey),
      }));

      if (valueRows.length > 0) {
        await tx.formSubmissionValue.createMany({ data: valueRows });
      }

      const groupLookup = new Map<string, string>();

      for (const [index, group] of input.groups.entries()) {
        const sortOrder = group.sortOrder ?? index;
        const createdGroup = await tx.formSubmissionGroup.create({
          data: {
            submissionId: submission.id,
            groupKey: group.groupKey,
            sortOrder,
            label: group.label,
          },
        });

        groupLookup.set(`${group.groupKey}:${sortOrder}`, createdGroup.id);

        const groupValues = Object.entries(group.values).map(([fieldKey, value]) => ({
          groupId: createdGroup.id,
          fieldPath: `${group.groupKey}.${fieldKey}`,
          fieldKey: this.extractFieldKey(fieldKey),
          value: this.toJsonInput(value),
          displayValue: this.displayValueOf(value),
          isSensitive: this.isSensitiveField(fieldKey),
        }));

        if (groupValues.length > 0) {
          await tx.formSubmissionGroupValue.createMany({ data: groupValues });
        }
      }

      for (const file of input.files) {
        const sortOrder = file.groupSortOrder ?? 0;
        const groupId = file.groupKey ? groupLookup.get(`${file.groupKey}:${sortOrder}`) : undefined;

        await tx.formSubmissionFile.create({
          data: {
            submissionId: submission.id,
            groupId,
            fieldPath: file.fieldPath,
            fieldKey: file.fieldKey ?? this.extractFieldKey(file.fieldPath),
            fileId: file.fileId,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
            path: file.path,
            url: file.url,
            checksum: file.checksum,
            status: file.status ?? FormFileStatus.PENDING,
            metadata: file.metadata === undefined ? undefined : this.toJsonInput(file.metadata),
          },
        });
      }

      if (module.integrations.length > 0) {
        await tx.formSubmissionDispatchLog.createMany({
          data: module.integrations.map((integration) => ({
            submissionId: submission.id,
            integrationConfigId: integration.id,
            provider: integration.provider,
            dispatchMode: integration.dispatchMode,
            status: FormDispatchStatus.PENDING,
            requestPayload: this.toJsonInput({
              values: input.values,
              groups: input.groups,
              files: input.files,
            }),
          })),
        });
      }

      return tx.formSubmission.findUniqueOrThrow({
        where: { id: submission.id },
        include: submissionDetailInclude,
      });
    });

    try {
      await this.dispatchService.processSubmissionDispatches(createdSubmission.id);
    } catch (error) {
      console.error('[FormDispatch] Failed to process submission dispatches:', error);
    }

    const hydratedSubmission = await this.prisma.formSubmission.findUniqueOrThrow({
      where: { id: createdSubmission.id },
      include: submissionDetailInclude,
    });

    return {
      submission: hydratedSubmission,
      response: resolvedResponse,
      persisted: true,
    };
  }

  async getFormSubmissions(formModuleId: string, query: FormSubmissionQueryInput) {
    const module = await this.prisma.formModule.findFirst({
      where: { id: formModuleId, deletedAt: null },
      select: { id: true },
    });

    if (!module) {
      throw new NotFoundError('Form module not found');
    }

    const skip = (query.page - 1) * query.limit;
    const where: Prisma.FormSubmissionWhereInput = {
      formModuleId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { primaryName: { contains: query.search, mode: 'insensitive' } },
              { primaryEmail: { contains: query.search, mode: 'insensitive' } },
              { primaryPhone: { contains: query.search, mode: 'insensitive' } },
              { eventName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.FormSubmissionOrderByWithRelationInput;

    const [total, items] = await Promise.all([
      this.prisma.formSubmission.count({ where }),
      this.prisma.formSubmission.findMany({
        where,
        skip,
        take: query.limit,
        orderBy,
        include: {
          _count: {
            select: {
              values: true,
              groups: true,
              files: true,
            },
          },
        },
      }),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getFormSubmissionById(formModuleId: string, submissionId: string) {
    const submission = await this.prisma.formSubmission.findFirst({
      where: {
        id: submissionId,
        formModuleId,
        deletedAt: null,
      },
      include: submissionDetailInclude,
    });

    if (!submission) {
      throw new NotFoundError('Form submission not found');
    }

    return submission;
  }

  async retrySubmissionDispatches(formModuleId: string, submissionId: string) {
    const submission = await this.prisma.formSubmission.findFirst({
      where: {
        id: submissionId,
        formModuleId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!submission) {
      throw new NotFoundError('Form submission not found');
    }

    await this.dispatchService.retryFailedDispatches(submissionId);

    return this.prisma.formSubmission.findUniqueOrThrow({
      where: { id: submissionId },
      include: submissionDetailInclude,
    });
  }

  private buildCreateModuleData(input: CreateFormModuleInput): Prisma.FormModuleCreateInput {
    return {
      businessUnit: input.businessUnit,
      slug: input.slug,
      name: input.name,
      description: input.description,
      category: input.category,
      handlingMode: input.handlingMode,
      status: input.status,
      schemaVersion: input.schemaVersion,
      defaultLocale: input.defaultLocale,
      publicPath: input.publicPath,
      sourceWebsite: input.sourceWebsite,
      promoWebsite: input.promoWebsite,
      leadSource: input.leadSource,
      integrationProvider: input.integrationProvider,
      integrationConfig: input.integrationConfig as Prisma.InputJsonValue | undefined,
      submissionSettings: input.submissionSettings as Prisma.InputJsonValue | undefined,
    };
  }

  private buildUpdateModuleData(input: UpdateFormModuleInput): Prisma.FormModuleUpdateInput {
    const data: Prisma.FormModuleUpdateInput = {};

    if (input.businessUnit !== undefined) data.businessUnit = input.businessUnit;
    if (input.slug !== undefined) data.slug = input.slug;
    if (input.name !== undefined) data.name = input.name;
    if (input.description !== undefined) data.description = input.description;
    if (input.category !== undefined) data.category = input.category;
    if (input.handlingMode !== undefined) data.handlingMode = input.handlingMode;
    if (input.status !== undefined) data.status = input.status;
    if (input.schemaVersion !== undefined) data.schemaVersion = input.schemaVersion;
    if (input.defaultLocale !== undefined) data.defaultLocale = input.defaultLocale;
    if (input.publicPath !== undefined) data.publicPath = input.publicPath;
    if (input.sourceWebsite !== undefined) data.sourceWebsite = input.sourceWebsite;
    if (input.promoWebsite !== undefined) data.promoWebsite = input.promoWebsite;
    if (input.leadSource !== undefined) data.leadSource = input.leadSource;
    if (input.integrationProvider !== undefined) data.integrationProvider = input.integrationProvider;
    if (input.integrationConfig !== undefined) data.integrationConfig = input.integrationConfig as Prisma.InputJsonValue;
    if (input.submissionSettings !== undefined) data.submissionSettings = input.submissionSettings as Prisma.InputJsonValue;

    return data;
  }

  private async replaceModuleDefinition(
    tx: PrismaTransaction,
    formModuleId: string,
    definition: FormModuleDefinitionInput
  ) {
    await tx.formFieldRule.deleteMany({ where: { formModuleId } });
    await tx.formFieldOption.deleteMany({ where: { field: { formModuleId } } });
    await tx.formField.deleteMany({ where: { formModuleId } });
    await tx.formStep.deleteMany({ where: { formModuleId } });
    await tx.formResponseConfig.deleteMany({ where: { formModuleId } });
    await tx.formIntegrationConfig.deleteMany({ where: { formModuleId } });

    const stepIdByKey = new Map<string, string>();

    for (const step of [...definition.steps].sort((left, right) => left.stepNumber - right.stepNumber)) {
      const createdStep = await tx.formStep.create({
        data: {
          formModuleId,
          key: step.key,
          title: step.title,
          description: step.description,
          actionLabel: step.actionLabel,
          stepNumber: step.stepNumber,
          isReviewStep: step.isReviewStep ?? false,
          isActive: step.isActive ?? true,
        },
      });

      stepIdByKey.set(createdStep.key, createdStep.id);
    }

    const fieldIdByPath = new Map<string, string>();
    const sortedFields = [...definition.fields].sort((left, right) => {
      const leftDepth = left.path.split('.').length;
      const rightDepth = right.path.split('.').length;

      if (leftDepth !== rightDepth) {
        return leftDepth - rightDepth;
      }

      return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    });

    for (const field of sortedFields) {
      const formStepId = field.formStepKey
        ? stepIdByKey.get(field.formStepKey)
        : undefined;
      const parentFieldId = field.parentFieldPath
        ? fieldIdByPath.get(field.parentFieldPath)
        : undefined;

      if (field.formStepKey && !formStepId) {
        throw new ValidationError(`Referenced step key not found: ${field.formStepKey}`);
      }

      if (field.parentFieldPath && !parentFieldId) {
        throw new ValidationError(`Referenced parent field path not found: ${field.parentFieldPath}`);
      }

      const createdField = await tx.formField.create({
        data: {
          formModuleId,
          formStepId,
          parentFieldId,
          key: field.key,
          path: field.path,
          label: field.label,
          fieldType: field.fieldType,
          placeholder: field.placeholder,
          helpText: field.helpText,
          defaultValue: field.defaultValue as Prisma.InputJsonValue | undefined,
          validation: field.validation as Prisma.InputJsonValue | undefined,
          uiConfig: field.uiConfig as Prisma.InputJsonValue | undefined,
          payloadKey: field.payloadKey,
          sortOrder: field.sortOrder ?? 0,
          isRequired: field.isRequired ?? false,
          isActive: field.isActive ?? true,
          isSystem: field.isSystem ?? false,
        },
      });

      fieldIdByPath.set(createdField.path, createdField.id);
    }

    for (const option of definition.options) {
      const fieldId = fieldIdByPath.get(option.fieldPath);

      if (!fieldId) {
        throw new ValidationError(`Referenced field path for option not found: ${option.fieldPath}`);
      }

      await tx.formFieldOption.create({
        data: {
          fieldId,
          value: option.value,
          label: option.label,
          description: option.description,
          metadata: option.metadata as Prisma.InputJsonValue | undefined,
          sortOrder: option.sortOrder ?? 0,
          isDefault: option.isDefault ?? false,
          isActive: option.isActive ?? true,
        },
      });
    }

    for (const rule of definition.rules) {
      const sourceFieldId = rule.sourceFieldPath ? fieldIdByPath.get(rule.sourceFieldPath) : undefined;
      const targetFieldId = rule.targetFieldPath ? fieldIdByPath.get(rule.targetFieldPath) : undefined;

      if (rule.sourceFieldPath && !sourceFieldId) {
        throw new ValidationError(`Referenced source field path not found: ${rule.sourceFieldPath}`);
      }

      if (rule.targetFieldPath && !targetFieldId) {
        throw new ValidationError(`Referenced target field path not found: ${rule.targetFieldPath}`);
      }

      await tx.formFieldRule.create({
        data: {
          formModuleId,
          sourceFieldId,
          targetFieldId,
          ruleType: rule.ruleType,
          condition: rule.condition as Prisma.InputJsonValue,
          actionConfig: rule.actionConfig as Prisma.InputJsonValue,
          sortOrder: rule.sortOrder ?? 0,
          isActive: rule.isActive ?? true,
        },
      });
    }

    for (const responseConfig of definition.responseConfigs) {
      await tx.formResponseConfig.create({
        data: {
          formModuleId,
          key: responseConfig.key,
          responseType: responseConfig.responseType,
          label: responseConfig.label,
          matchCondition: responseConfig.matchCondition as Prisma.InputJsonValue | undefined,
          pathTemplate: responseConfig.pathTemplate,
          queryTemplate: responseConfig.queryTemplate as Prisma.InputJsonValue | undefined,
          sortOrder: responseConfig.sortOrder ?? 0,
          isDefault: responseConfig.isDefault ?? false,
          isActive: responseConfig.isActive ?? true,
        },
      });
    }

    for (const integrationConfig of definition.integrationConfigs) {
      await tx.formIntegrationConfig.create({
        data: {
          formModuleId,
          key: integrationConfig.key,
          provider: integrationConfig.provider,
          dispatchMode: integrationConfig.dispatchMode ?? 'SYNC',
          endpoint: integrationConfig.endpoint,
          mappingConfig: integrationConfig.mappingConfig as Prisma.InputJsonValue | undefined,
          headersConfig: integrationConfig.headersConfig as Prisma.InputJsonValue | undefined,
          isActive: integrationConfig.isActive ?? true,
        },
      });
    }
  }

  private resolvePrimarySnapshot(
    values: Record<string, unknown>,
    groups: PublicFormSubmissionInput['groups']
  ) {
    const primaryGroupValues = groups[0]?.values ?? {};
    const firstName =
      this.pickString(values, ['FirstName', 'firstName', 'fullName', 'picName']) ??
      this.pickString(primaryGroupValues, ['FirstName', 'firstName', 'fullName', 'picName']);
    const lastName =
      this.pickString(values, ['LastName', 'lastName']) ??
      this.pickString(primaryGroupValues, ['LastName', 'lastName']);

    const primaryName = [firstName, lastName].filter(Boolean).join(' ').trim() || firstName || undefined;

    return {
      primaryName,
      primaryEmail:
        this.pickString(values, ['Email', 'email', 'companyEmail']) ??
        this.pickString(primaryGroupValues, ['Email', 'email', 'companyEmail']),
      primaryPhone:
        this.pickString(values, ['MobilePhone', 'phone', 'phoneNumber']) ??
        this.pickString(primaryGroupValues, ['MobilePhone', 'phone', 'phoneNumber']),
      eventName: this.pickString(values, ['Event_Name__c', 'eventName']),
    };
  }

  private resolveResponseConfig(
    responseConfigs: Array<{
      key: string;
      responseType: string;
      pathTemplate: string;
      queryTemplate: Prisma.JsonValue | null;
      matchCondition: Prisma.JsonValue | null;
      isDefault: boolean;
    }>,
    values: Record<string, unknown>,
    groups: PublicFormSubmissionInput['groups'],
    locale: string,
    primarySnapshot: { primaryName?: string; primaryEmail?: string; primaryPhone?: string; eventName?: string }
  ) {
    const context = this.buildTemplateContext(values, groups, locale, primarySnapshot);
    const matched = responseConfigs.find((config) => this.matchesCondition(config.matchCondition, context));
    const fallback = matched ?? responseConfigs.find((config) => config.isDefault) ?? null;

    if (!fallback) {
      return null;
    }

    return {
      key: fallback.key,
      responseType: fallback.responseType,
      path: this.interpolateTemplate(fallback.pathTemplate, context),
      query: this.resolveTemplatePayload(fallback.queryTemplate, context),
    };
  }

  private matchesCondition(condition: Prisma.JsonValue | null, context: Record<string, unknown>) {
    if (!condition || typeof condition !== 'object' || Array.isArray(condition)) {
      return false;
    }

    return Object.entries(condition as Record<string, unknown>).every(([key, expected]) => {
      const actual = context[key];

      if (Array.isArray(expected)) {
        if (Array.isArray(actual)) {
          return expected.every((entry) => actual.includes(entry));
        }

        return expected.includes(actual);
      }

      if (expected && typeof expected === 'object') {
        const candidate = expected as Record<string, unknown>;

        if ('equals' in candidate) {
          return actual === candidate.equals;
        }

        if ('includes' in candidate) {
          if (Array.isArray(actual)) {
            return actual.includes(candidate.includes);
          }

          return String(actual ?? '').includes(String(candidate.includes ?? ''));
        }
      }

      return actual === expected;
    });
  }

  private buildTemplateContext(
    values: Record<string, unknown>,
    groups: PublicFormSubmissionInput['groups'],
    locale: string,
    primarySnapshot: { primaryName?: string; primaryEmail?: string; primaryPhone?: string; eventName?: string }
  ) {
    const context: Record<string, unknown> = {
      locale,
      ...values,
      ...primarySnapshot,
    };

    for (const [groupIndex, group] of groups.entries()) {
      for (const [key, value] of Object.entries(group.values)) {
        context[`${group.groupKey}.${key}`] = value;
        context[`${group.groupKey}[${groupIndex}].${key}`] = value;
      }
    }

    return context;
  }

  private interpolateTemplate(template: string, context: Record<string, unknown>) {
    return template.replace(/\{([^}]+)\}/g, (_match, token: string) => {
      const value = context[token];
      return value == null ? '' : String(value);
    });
  }

  private resolveTemplatePayload(payload: Prisma.JsonValue | null, context: Record<string, unknown>): Prisma.JsonValue | null {
    if (payload == null) {
      return null;
    }

    if (typeof payload === 'string') {
      return this.interpolateTemplate(payload, context);
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.resolveTemplatePayload(item, context));
    }

    if (typeof payload === 'object') {
      const objectPayload = payload as Record<string, Prisma.JsonValue>;

      return Object.fromEntries(
        Object.entries(objectPayload).map(([key, value]) => [key, this.resolveTemplatePayload(value, context)])
      );
    }

    return payload;
  }

  private toJsonInput(value: unknown): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (value === null) {
      return Prisma.JsonNull;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((entry) => {
        if (entry === null) {
          return null;
        }

        return this.toJsonInput(entry);
      }) as Prisma.InputJsonArray;
    }

    if (typeof value === 'object' && value) {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>)
          .filter(([, entryValue]) => entryValue !== undefined)
          .map(([entryKey, entryValue]) => {
            if (entryValue === null) {
              return [entryKey, null];
            }

            return [entryKey, this.toJsonInput(entryValue)];
          })
      ) as Prisma.InputJsonObject;
    }

    return String(value);
  }

  private pickString(source: Record<string, unknown>, keys: string[]) {
    for (const key of keys) {
      const value = source[key];

      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return undefined;
  }

  private extractFieldKey(fieldPath: string) {
    const parts = fieldPath.split('.');
    return parts[parts.length - 1] ?? fieldPath;
  }

  private displayValueOf(value: unknown) {
    if (value == null) {
      return undefined;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value.map((entry) => String(entry)).join(', ');
    }

    return JSON.stringify(value);
  }

  private isSensitiveField(fieldKey: string) {
    const normalized = fieldKey.toLowerCase();
    return normalized.includes('password') || normalized.includes('secret') || normalized.includes('token');
  }
}