import {
  BusinessUnit,
  FormDispatchStatus,
  FormFileStatus,
  FormHandlingMode,
  FormModuleStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { endOfDay, startOfDay, subDays } from 'date-fns';
import { Parser } from 'json2csv';
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

const NEEDS_FIELD_PRIORITY = [
  'needs',
  'Choose_your_Needs__c',
  'needType',
  'typePartnership',
  'consultationType',
  'selectedNeeds',
  'businessNeed',
  'bandwidthNeed',
] as const;

const FORM_CHANNEL_FIELD_PATHS = ['formChannel', 'form_channel', 'channel', 'sourceInput'] as const;

type SubmissionModuleContext = {
  id: string;
  name: string;
  slug: string;
  fields: Array<{
    path: string;
    payloadKey: string | null;
    label: string;
  }>;
};

type SubmissionNeedsField = SubmissionModuleContext['fields'][number];

type PageSubmissionContext = {
  product?: string;
  promo?: string;
  source?: string;
  pageUrl?: string;
};

type FormSubmissionInfo = {
  moduleName?: string;
  channel?: string;
};

type PageSubmissionMetadata = {
  slug: string;
  product?: string | null;
  promo?: string | null;
  source?: string | null;
};

type ExportableSubmission = Prisma.FormSubmissionGetPayload<{
  include: typeof submissionDetailInclude;
}>;

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
      where: {
        deletedAt: null,
        OR: [{ id }, { slug: id }],
      },
      include: adminDefinitionInclude,
    });

    if (!module) {
      throw new NotFoundError('Form module not found');
    }

    // Map formStepId → formStepKey so the CMS UI can group fields by step key
    const stepKeyById = new Map(module.steps.map((s) => [s.id, s.key]));
    const fields = module.fields.map((field) => ({
      ...field,
      formStepKey: field.formStepId ? (stepKeyById.get(field.formStepId) ?? null) : null,
    }));

    return { ...module, fields };
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

  async getPublicFormModules(businessUnit: BusinessUnit) {
    return this.prisma.formModule.findMany({
      where: {
        businessUnit,
        status: FormModuleStatus.ACTIVE,
        deletedAt: null,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        businessUnit: true,
        slug: true,
        name: true,
        description: true,
        category: true,
        handlingMode: true,
        publicPath: true,
        sourceWebsite: true,
        promoWebsite: true,
        leadSource: true,
      },
    });
  }

  async verifyPublicFormModuleExists(businessUnit: BusinessUnit, slug: string) {
    const exists = await this.prisma.formModule.findFirst({
      where: {
        businessUnit,
        slug,
        status: FormModuleStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundError('Active form module not found');
    }
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
    requestMeta: { ipAddress?: string | null; userAgent?: string | null },
    options: { forcePersist?: boolean } = {}
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

    const pageContext = await this.resolvePageSubmissionContext(input, module.publicPath);
    const formInfo = this.resolveFormSubmissionInfo(input, module.name);
    const primarySnapshot = this.resolvePrimarySnapshot(input.values, input.groups);
    const resolvedResponse = this.resolveResponseConfig(
      module.responseConfigs,
      input.values,
      input.groups,
      input.locale ?? module.defaultLocale,
      primarySnapshot
    );

    if (module.handlingMode === FormHandlingMode.ROUTING_ONLY && !options.forcePersist) {
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
          product: pageContext.product ?? undefined,
          promoWebsite: pageContext.promo ?? this.pickString(input.values, ['Promo_Website__c']) ?? module.promoWebsite ?? undefined,
          pageWebsite: pageContext.pageUrl ?? this.pickString(input.values, ['Page_Website__c']) ?? input.sourcePath ?? undefined,
          sourceWebsite: pageContext.source ?? this.pickString(input.values, ['Source_Website__c']) ?? module.sourceWebsite ?? undefined,
          formModuleName: formInfo.moduleName ?? undefined,
          formChannel: formInfo.channel ?? undefined,
          leadSource: this.pickString(input.values, ['LeadSource']) ?? module.leadSource ?? undefined,
          primaryName: primarySnapshot.primaryName,
          primaryEmail: primarySnapshot.primaryEmail,
          primaryPhone: primarySnapshot.primaryPhone,
          eventName: primarySnapshot.eventName,
          rawPayload: this.toJsonInput(input),
          responseContext: resolvedResponse ? this.toJsonInput(resolvedResponse) : undefined,
          status: 'STORED',
        },
      });

      const valueRows = Object.entries(input.values).filter(([, value]) => value !== undefined).map(([fieldKey, value]) => ({
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

        const groupValues = Object.entries(group.values).filter(([, value]) => value !== undefined).map(([fieldKey, value]) => ({
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
    const module = await this.getSubmissionModuleContext(formModuleId);
    const needsField = this.resolveSubmissionNeedsField(module.fields);
    const where = this.buildFormSubmissionWhere(module.id, query, needsField);

    const skip = (query.page - 1) * query.limit;

    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.FormSubmissionOrderByWithRelationInput;

    const [total, items, formChannelOptions, sourceOptions] = await Promise.all([
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
          values: {
            orderBy: [{ fieldPath: 'asc' }],
          },
        },
      }),
      this.getSubmissionFormChannelOptions(module.id, query, needsField),
      this.getSubmissionSourceOptions(module.id, query, needsField),
    ]);

    return {
      data: items,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
      filters: {
        formChannels: formChannelOptions,
        sources: sourceOptions,
      },
    };
  }

  async exportFormSubmissions(formModuleId: string, query: FormSubmissionQueryInput) {
    const module = await this.getSubmissionModuleContext(formModuleId);
    const needsField = this.resolveSubmissionNeedsField(module.fields);
    const where = this.buildFormSubmissionWhere(module.id, query, needsField);
    const orderBy = {
      [query.sortBy]: query.sortOrder,
    } as Prisma.FormSubmissionOrderByWithRelationInput;

    const submissions = await this.prisma.formSubmission.findMany({
      where,
      orderBy,
      include: submissionDetailInclude,
    });

    const rows = this.buildSubmissionExportRows(submissions, module.name, needsField);
    const baseFields = [
      'submissionId',
      'formModuleName',
      'formModuleId',
      'formChannel',
      'businessUnit',
      'formSlug',
      'status',
      'product',
      'promo',
      'source',
      'pageUrl',
      'needs',
      'primaryName',
      'primaryEmail',
      'primaryPhone',
      'receivedAt',
      'createdAt',
    ];
    const dynamicFields = Array.from(
      new Set(
        rows.flatMap((row) => Object.keys(row)).filter((field) => !baseFields.includes(field))
      )
    ).sort((left, right) => left.localeCompare(right));
    const fields = [...baseFields, ...dynamicFields];
    const filenameBase = `form-submissions-${module.slug}-${new Date().toISOString().slice(0, 10)}`;

    if (query.format === 'xlsx') {
      return {
        filename: `${filenameBase}.xlsx`,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        body: this.buildXlsxBuffer(rows, fields),
      };
    }

    const parser = new Parser({ fields });

    return {
      filename: `${filenameBase}.csv`,
      contentType: 'text/csv; charset=utf-8',
      body: parser.parse(rows),
    };
  }

  async getFormSubmissionById(formModuleId: string, submissionId: string) {
    const module = await this.getSubmissionModuleContext(formModuleId);
    const submission = await this.prisma.formSubmission.findFirst({
      where: {
        id: submissionId,
        formModuleId: module.id,
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
    const module = await this.getSubmissionModuleContext(formModuleId);
    const submission = await this.prisma.formSubmission.findFirst({
      where: {
        id: submissionId,
        formModuleId: module.id,
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

  private async resolvePageSubmissionContext(
    input: PublicFormSubmissionInput,
    modulePublicPath?: string | null
  ): Promise<PageSubmissionContext> {
    const explicitContext = input.context;
    const explicitContextUrl = explicitContext?.url ?? explicitContext?.pageUrl ?? undefined;
    const candidatePaths = [
      explicitContextUrl,
      this.pickString(input.values, ['Page_Website__c', 'pageWebsite', 'pageUrl']),
      input.sourcePath,
      modulePublicPath,
    ].filter((value): value is string => Boolean(value));

    const slugCandidates = Array.from(
      new Set(
        candidatePaths
          .flatMap((path) => this.pathToPageSlugCandidates(path))
          .filter((value): value is string => Boolean(value))
      )
    );

    let page: PageSubmissionMetadata | null = null;

    if (slugCandidates.length) {
      try {
        page = await this.prisma.page.findFirst({
          where: {
            slug: { in: slugCandidates },
            deletedAt: null,
          },
          select: {
            slug: true,
            product: true,
            promo: true,
            source: true,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2022'
        ) {
          page = await this.prisma.page.findFirst({
            where: {
              slug: { in: slugCandidates },
              deletedAt: null,
            },
            select: { slug: true },
          });
        } else {
          throw error;
        }
      }
    }

    const explicitPageUrl = this.pickString(input.values, ['Page_Website__c', 'pageWebsite', 'pageUrl']);
    const pageUrl = explicitContextUrl ?? explicitPageUrl ?? input.sourcePath ?? (page ? `/${page.slug}` : undefined);
    const urlSource = this.getSourceFromUrl(pageUrl);

    return {
      product: page?.product ?? explicitContext?.product ?? this.pickString(input.values, ['Product', 'product', 'Product__c']),
      promo: page?.promo ?? explicitContext?.promo ?? this.pickString(input.values, ['Promo_Website__c', 'Promo', 'promo']),
      source: urlSource ?? page?.source ?? explicitContext?.source ?? this.pickString(input.values, ['Source_Website__c', 'Source', 'source']),
      pageUrl,
    };
  }

  private resolveFormSubmissionInfo(
    input: PublicFormSubmissionInput,
    moduleName: string
  ): FormSubmissionInfo {
    const context = input.context;
    const formInfo = input.formInfo;
    const rawChannel =
      formInfo?.formChannel ??
      formInfo?.form_channel ??
      context?.formChannel ??
      context?.form_channel ??
      this.pickString(input.values, ['form_channel', 'formChannel', 'channel', 'sourceInput', 'Source_Input__c']);

    return {
      moduleName:
        formInfo?.formModuleName ??
        formInfo?.form_module_name ??
        context?.formModuleName ??
        context?.form_module_name ??
        moduleName,
      channel: this.normalizeFormChannel(rawChannel),
    };
  }

  private normalizeFormChannel(channel?: string | null) {
    if (!channel) return undefined;

    const normalized = channel.trim().toLowerCase().replace(/[\s-]+/g, '_');

    if (normalized === 'live_chat' || normalized === 'start_conversation') {
      return 'Live Chat';
    }

    if (normalized === 'whatsapp' || normalized === 'whats_app') {
      return 'WhatsApp';
    }

    return channel.trim() || undefined;
  }

  private getSourceFromUrl(url?: string | null) {
    if (!url) return undefined;

    try {
      const parsedUrl = new URL(url, 'https://linknet.local');
      return (
        parsedUrl.searchParams.get('utm_source') ||
        parsedUrl.searchParams.get('source') ||
        undefined
      );
    } catch {
      return undefined;
    }
  }

  private pathToPageSlugCandidates(path: string) {
    const withoutOrigin = path.replace(/^https?:\/\/[^/]+/i, '');
    const pathname = withoutOrigin.split(/[?#]/)[0] ?? '';
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      return [];
    }

    const withoutLocale =
      segments[0] === 'id' || segments[0] === 'en'
        ? segments.slice(1)
        : segments;

    const withoutPagesPrefix = withoutLocale[0] === 'pages' || withoutLocale[0] === 'page'
      ? withoutLocale.slice(1)
      : withoutLocale;

    return [
      withoutLocale.join('/'),
      withoutPagesPrefix.join('/'),
      withoutLocale[withoutLocale.length - 1],
      withoutPagesPrefix[withoutPagesPrefix.length - 1],
    ].filter((value): value is string => Boolean(value));
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

  private async getSubmissionModuleContext(formModuleId: string): Promise<SubmissionModuleContext> {
    const module = await this.prisma.formModule.findFirst({
      where: {
        deletedAt: null,
        OR: [{ id: formModuleId }, { slug: formModuleId }],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        fields: {
          where: { isActive: true },
          select: {
            path: true,
            payloadKey: true,
            label: true,
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundError('Form module not found');
    }

    return module;
  }

  private resolveSubmissionNeedsField(fields: SubmissionModuleContext['fields']): SubmissionNeedsField | null {
    for (const candidate of NEEDS_FIELD_PRIORITY) {
      const match = fields.find(
        (field) => field.path === candidate || field.payloadKey === candidate
      );

      if (match) {
        return match;
      }
    }

    return null;
  }

  private buildFormSubmissionWhere(
    formModuleId: string,
    query: FormSubmissionQueryInput,
    needsField: SubmissionNeedsField | null,
    options: { excludeNeeds?: boolean } = {}
  ): Prisma.FormSubmissionWhereInput {
    const dateRange = this.resolveSubmissionReceivedAtRange(query);
    const needsFieldPaths = this.getNeedsFieldPaths(needsField);
    const andConditions: Prisma.FormSubmissionWhereInput[] = [];

    if (query.search) {
      andConditions.push({
        OR: [
          { primaryName: { contains: query.search, mode: 'insensitive' } },
          { primaryEmail: { contains: query.search, mode: 'insensitive' } },
          { primaryPhone: { contains: query.search, mode: 'insensitive' } },
          { eventName: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }

    if (query.formChannel) {
      andConditions.push({
        OR: [
          {
            formChannel: {
              equals: query.formChannel,
              mode: 'insensitive',
            },
          },
          ...this.getFormChannelLegacyValueFilters(query.formChannel),
        ],
      });
    }

    return {
      formModuleId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.email
        ? {
            primaryEmail: {
              contains: query.email,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(dateRange ? { receivedAt: dateRange } : {}),
      ...(andConditions.length ? { AND: andConditions } : {}),
      ...(query.source
        ? {
            sourceWebsite: {
              equals: query.source,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(!options.excludeNeeds && query.needs && needsFieldPaths.length > 0
        ? {
            values: {
              some: {
                AND: [
                  {
                    fieldPath: {
                      in: needsFieldPaths,
                    },
                  },
                  {
                    displayValue: {
                      equals: query.needs,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          }
        : {}),
    };
  }

  private getFormChannelLegacyValueFilters(channel: string): Prisma.FormSubmissionWhereInput[] {
    const variants = this.getFormChannelVariants(channel);

    return variants.map((variant) => ({
      values: {
        some: {
          AND: [
            { fieldPath: { in: [...FORM_CHANNEL_FIELD_PATHS] } },
            { displayValue: { equals: variant, mode: 'insensitive' } },
          ],
        },
      },
    }));
  }

  private getFormChannelVariants(channel: string) {
    const normalized = channel.trim().toLowerCase().replace(/[\s-]+/g, '_');

    if (normalized === 'live_chat' || normalized === 'start_conversation') {
      return ['Live Chat', 'live_chat', 'start_conversation'];
    }

    if (normalized === 'whatsapp' || normalized === 'whats_app') {
      return ['WhatsApp', 'Whatsapp', 'whatsapp'];
    }

    return [channel];
  }

  private resolveSubmissionReceivedAtRange(query: FormSubmissionQueryInput) {
    if (!query.datePreset) {
      return undefined;
    }

    const now = new Date();

    if (query.datePreset === 'today') {
      return {
        gte: startOfDay(now),
        lte: endOfDay(now),
      } satisfies Prisma.DateTimeFilter;
    }

    if (query.datePreset === 'yesterday') {
      const yesterday = subDays(now, 1);
      return {
        gte: startOfDay(yesterday),
        lte: endOfDay(yesterday),
      } satisfies Prisma.DateTimeFilter;
    }

    if (query.datePreset === 'last7days') {
      return {
        gte: startOfDay(subDays(now, 6)),
        lte: endOfDay(now),
      } satisfies Prisma.DateTimeFilter;
    }

    if (query.datePreset === 'last30days') {
      return {
        gte: startOfDay(subDays(now, 29)),
        lte: endOfDay(now),
      } satisfies Prisma.DateTimeFilter;
    }

    if (!query.dateFrom || !query.dateTo) {
      throw new ValidationError('Custom date range requires dateFrom and dateTo');
    }

    const startDate = startOfDay(new Date(`${query.dateFrom}T00:00:00`));
    const endDate = endOfDay(new Date(`${query.dateTo}T00:00:00`));

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid submission date range');
    }

    return {
      gte: startDate,
      lte: endDate,
    } satisfies Prisma.DateTimeFilter;
  }

  private getNeedsFieldPaths(needsField: SubmissionNeedsField | null) {
    return Array.from(
      new Set([needsField?.path, needsField?.payloadKey].filter((value): value is string => Boolean(value)))
    );
  }

  private async getSubmissionFormChannelOptions(
    formModuleId: string,
    query: FormSubmissionQueryInput,
    needsField: SubmissionNeedsField | null
  ) {
    const [submissionRows, valueRows] = await Promise.all([
      this.prisma.formSubmission.findMany({
        where: this.buildFormSubmissionWhere(
          formModuleId,
          { ...query, formChannel: undefined },
          needsField
        ),
        select: { formChannel: true },
        orderBy: [{ formChannel: 'asc' }],
      }),
      this.prisma.formSubmissionValue.findMany({
        where: {
          fieldPath: { in: [...FORM_CHANNEL_FIELD_PATHS] },
          submission: {
            is: this.buildFormSubmissionWhere(
              formModuleId,
              { ...query, formChannel: undefined },
              needsField
            ),
          },
        },
        select: {
          displayValue: true,
          value: true,
        },
        orderBy: [{ displayValue: 'asc' }],
      }),
    ]);

    return Array.from(
      new Set(
        [
          ...submissionRows.map((row) => row.formChannel),
          ...valueRows.map((row) => this.normalizeFormChannel(
            this.normalizeSubmissionValue(row.displayValue ?? row.value) ?? undefined
          )),
        ]
          .map((value) => this.normalizeFormChannel(value ?? undefined))
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right));
  }

  private async getSubmissionSourceOptions(
    formModuleId: string,
    query: FormSubmissionQueryInput,
    needsField: SubmissionNeedsField | null
  ) {
    const rows = await this.prisma.formSubmission.findMany({
      where: this.buildFormSubmissionWhere(
        formModuleId,
        { ...query, source: undefined },
        needsField
      ),
      select: { sourceWebsite: true },
      orderBy: [{ sourceWebsite: 'asc' }],
    });

    return Array.from(
      new Set(
        rows
          .map((row) => row.sourceWebsite?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((left, right) => left.localeCompare(right));
  }

  private buildXlsxBuffer(rows: Record<string, string>[], fields: string[]) {
    const sheetRows = [
      fields,
      ...rows.map((row) => fields.map((field) => row[field] ?? '')),
    ];
    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
      `<sheetData>` +
      sheetRows.map((row, rowIndex) => {
        const rowNumber = rowIndex + 1;
        const cells = row.map((value, columnIndex) => {
          const ref = `${this.toExcelColumn(columnIndex + 1)}${rowNumber}`;
          return `<c r="${ref}" t="inlineStr"><is><t>${this.escapeXml(value)}</t></is></c>`;
        }).join('');

        return `<row r="${rowNumber}">${cells}</row>`;
      }).join('') +
      `</sheetData></worksheet>`;

    return this.createZipBuffer([
      {
        path: '[Content_Types].xml',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
          `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
          `<Default Extension="xml" ContentType="application/xml"/>` +
          `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
          `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
          `</Types>`,
      },
      {
        path: '_rels/.rels',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
          `</Relationships>`,
      },
      {
        path: 'xl/workbook.xml',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
          `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
          `<sheets><sheet name="Submissions" sheetId="1" r:id="rId1"/></sheets>` +
          `</workbook>`,
      },
      {
        path: 'xl/_rels/workbook.xml.rels',
        content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
          `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
          `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
          `</Relationships>`,
      },
      {
        path: 'xl/worksheets/sheet1.xml',
        content: sheetXml,
      },
    ]);
  }

  private createZipBuffer(entries: Array<{ path: string; content: string }>) {
    const localParts: Buffer[] = [];
    const centralParts: Buffer[] = [];
    let offset = 0;

    for (const entry of entries) {
      const name = Buffer.from(entry.path, 'utf8');
      const data = Buffer.from(entry.content, 'utf8');
      const crc = this.crc32(data);
      const localHeader = Buffer.alloc(30);

      localHeader.writeUInt32LE(0x04034b50, 0);
      localHeader.writeUInt16LE(20, 4);
      localHeader.writeUInt16LE(0, 6);
      localHeader.writeUInt16LE(0, 8);
      localHeader.writeUInt16LE(0, 10);
      localHeader.writeUInt16LE(0, 12);
      localHeader.writeUInt32LE(crc, 14);
      localHeader.writeUInt32LE(data.length, 18);
      localHeader.writeUInt32LE(data.length, 22);
      localHeader.writeUInt16LE(name.length, 26);

      localParts.push(localHeader, name, data);

      const centralHeader = Buffer.alloc(46);
      centralHeader.writeUInt32LE(0x02014b50, 0);
      centralHeader.writeUInt16LE(20, 4);
      centralHeader.writeUInt16LE(20, 6);
      centralHeader.writeUInt16LE(0, 8);
      centralHeader.writeUInt16LE(0, 10);
      centralHeader.writeUInt16LE(0, 12);
      centralHeader.writeUInt16LE(0, 14);
      centralHeader.writeUInt32LE(crc, 16);
      centralHeader.writeUInt32LE(data.length, 20);
      centralHeader.writeUInt32LE(data.length, 24);
      centralHeader.writeUInt16LE(name.length, 28);
      centralHeader.writeUInt32LE(offset, 42);
      centralParts.push(centralHeader, name);

      offset += localHeader.length + name.length + data.length;
    }

    const centralDirectory = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(entries.length, 8);
    end.writeUInt16LE(entries.length, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(offset, 16);

    return Buffer.concat([...localParts, centralDirectory, end]);
  }

  private crc32(buffer: Buffer) {
    let crc = 0xffffffff;

    for (const byte of buffer) {
      crc ^= byte;

      for (let index = 0; index < 8; index += 1) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  private toExcelColumn(column: number) {
    let label = '';
    let current = column;

    while (current > 0) {
      current -= 1;
      label = String.fromCharCode(65 + (current % 26)) + label;
      current = Math.floor(current / 26);
    }

    return label;
  }

  private escapeXml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private buildSubmissionExportRows(
    submissions: ExportableSubmission[],
    formModuleName: string,
    needsField: SubmissionNeedsField | null
  ) {
    return submissions.map((submission) => {
      const row: Record<string, string> = {
        submissionId: submission.id,
        formModuleName: submission.formModuleName ?? formModuleName,
        formModuleId: submission.formModuleId,
        formChannel: submission.formChannel ?? '',
        businessUnit: submission.businessUnit,
        formSlug: submission.formSlug,
        status: submission.status,
        product: submission.product ?? '',
        promo: submission.promoWebsite ?? '',
        source: submission.sourceWebsite ?? '',
        pageUrl: submission.pageWebsite ?? submission.sourcePath ?? '',
        needs: this.extractSubmissionNeeds(submission.values, needsField) ?? '',
        primaryName: submission.primaryName ?? '',
        primaryEmail: submission.primaryEmail ?? '',
        primaryPhone: submission.primaryPhone ?? '',
        receivedAt: submission.receivedAt.toISOString(),
        createdAt: submission.createdAt.toISOString(),
      };

      for (const value of submission.values) {
        row[value.fieldPath] = this.normalizeSubmissionValue(value.displayValue ?? value.value) ?? '';
      }

      for (const group of submission.groups) {
        for (const value of group.values) {
          row[`${group.groupKey}[${group.sortOrder + 1}].${value.fieldPath}`] =
            this.normalizeSubmissionValue(value.displayValue ?? value.value) ?? '';
        }

        for (const file of group.files) {
          row[`${group.groupKey}[${group.sortOrder + 1}].${file.fieldPath}.file`] =
            file.url ?? file.originalName ?? '';
        }
      }

      for (const file of submission.files) {
        row[`${file.fieldPath}.file`] = file.url ?? file.originalName ?? '';
      }

      return row;
    });
  }

  private extractSubmissionNeeds(
    values: Array<{
      fieldPath: string;
      value: Prisma.JsonValue | null;
      displayValue: string | null;
    }>,
    needsField: SubmissionNeedsField | null
  ) {
    const fieldPaths = this.getNeedsFieldPaths(needsField);

    if (fieldPaths.length === 0) {
      return null;
    }

    const matchedValue = values.find((value) => fieldPaths.includes(value.fieldPath));

    if (!matchedValue) {
      return null;
    }

    return this.normalizeSubmissionValue(
      matchedValue.displayValue ?? matchedValue.value
    );
  }

  private normalizeSubmissionValue(value: unknown): string | null {
    if (value == null) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((entry) => this.normalizeSubmissionValue(entry))
        .filter((entry): entry is string => Boolean(entry))
        .join(', ');
    }

    return JSON.stringify(value);
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
