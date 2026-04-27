import {
  FormDispatchStatus,
  FormIntegrationProvider,
  FormSubmissionStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import cron from 'node-cron';
import prisma from '../../config/database';

const DISPATCH_TIMEOUT_MS = 10_000;
const DISPATCH_CRON_SCHEDULE = '*/5 * * * *';

const getMissingFormModuleTableName = (error: unknown): string | null => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2021') {
    return null;
  }

  const tableName = error.meta?.table;
  return typeof tableName === 'string' && tableName.startsWith('public.form_') ? tableName : null;
};

const dispatchLogInclude = {
  integrationConfig: true,
  submission: {
    include: {
      formModule: true,
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
    },
  },
} satisfies Prisma.FormSubmissionDispatchLogInclude;

type DispatchLogRecord = Prisma.FormSubmissionDispatchLogGetPayload<{
  include: typeof dispatchLogInclude;
}>;

type DispatchAttemptResult = {
  logId: string;
  status: FormDispatchStatus;
  errorMessage: string | null;
};

const isConfiguredValue = (value: string | null | undefined): value is string => {
  if (!value) {
    return false;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 && !trimmed.startsWith('<FILL:');
};

export class FormSubmissionDispatchService {
  constructor(private readonly prisma: PrismaClient) {}

  async processSubmissionDispatches(submissionId: string) {
    const logs = await this.prisma.formSubmissionDispatchLog.findMany({
      where: {
        submissionId,
        status: FormDispatchStatus.PENDING,
      },
      include: dispatchLogInclude,
      orderBy: [{ createdAt: 'asc' }],
    });

    if (logs.length === 0) {
      const submissionStatus = await this.syncSubmissionStatus(submissionId);

      return {
        submissionId,
        processed: 0,
        successCount: 0,
        failureCount: 0,
        skippedCount: 0,
        submissionStatus,
      };
    }

    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;

    for (const log of logs) {
      const result = await this.processSingleDispatch(log);

      if (result.status === FormDispatchStatus.SUCCESS) {
        successCount += 1;
      } else if (result.status === FormDispatchStatus.SKIPPED) {
        skippedCount += 1;
      } else {
        failureCount += 1;
      }
    }

    const submissionStatus = await this.syncSubmissionStatus(submissionId);

    return {
      submissionId,
      processed: logs.length,
      successCount,
      failureCount,
      skippedCount,
      submissionStatus,
    };
  }

  async processPendingDispatches(limit = 25) {
    const submissions = await this.prisma.formSubmission.findMany({
      where: {
        deletedAt: null,
        dispatchLogs: {
          some: {
            status: FormDispatchStatus.PENDING,
          },
        },
      },
      select: { id: true },
      orderBy: [{ receivedAt: 'asc' }],
      take: limit,
    });

    const results = [] as Array<Awaited<ReturnType<FormSubmissionDispatchService['processSubmissionDispatches']>>>;

    for (const submission of submissions) {
      results.push(await this.processSubmissionDispatches(submission.id));
    }

    return {
      processedSubmissions: results.length,
      processedLogs: results.reduce((total, result) => total + result.processed, 0),
      successCount: results.reduce((total, result) => total + result.successCount, 0),
      failureCount: results.reduce((total, result) => total + result.failureCount, 0),
      skippedCount: results.reduce((total, result) => total + result.skippedCount, 0),
    };
  }

  async retryFailedDispatches(submissionId: string) {
    const failedLogs = await this.prisma.formSubmissionDispatchLog.findMany({
      where: {
        submissionId,
        status: FormDispatchStatus.FAILED,
      },
      select: {
        id: true,
      },
    });

    if (failedLogs.length === 0) {
      return {
        submissionId,
        resetCount: 0,
        result: await this.processSubmissionDispatches(submissionId),
      };
    }

    for (const failedLog of failedLogs) {
      await this.prisma.formSubmissionDispatchLog.update({
        where: { id: failedLog.id },
        data: {
          status: FormDispatchStatus.PENDING,
          errorMessage: null,
          responsePayload: Prisma.JsonNull,
          dispatchedAt: null,
          attempt: {
            increment: 1,
          },
        },
      });
    }

    return {
      submissionId,
      resetCount: failedLogs.length,
      result: await this.processSubmissionDispatches(submissionId),
    };
  }

  private async processSingleDispatch(log: DispatchLogRecord): Promise<DispatchAttemptResult> {
    const provider = log.provider;
    const integration = log.integrationConfig;

    if (!integration) {
      return this.finalizeDispatch(log, FormDispatchStatus.FAILED, {
        errorMessage: 'Integration configuration not found for dispatch log',
        responsePayload: {
          reason: 'missing_integration_config',
        },
      });
    }

    if (provider === FormIntegrationProvider.NOOP) {
      return this.finalizeDispatch(log, FormDispatchStatus.SKIPPED, {
        responsePayload: {
          reason: 'noop_provider',
          message: 'Dispatch intentionally skipped because provider is NOOP',
        },
      });
    }

    if (provider === FormIntegrationProvider.INTERNAL) {
      return this.finalizeDispatch(log, FormDispatchStatus.SUCCESS, {
        responsePayload: {
          reason: 'internal_provider',
          message: 'Dispatch handled internally without external HTTP call',
        },
      });
    }

    const endpoint = integration.endpoint?.trim() ?? null;

    if (!isConfiguredValue(endpoint)) {
      return this.finalizeDispatch(log, FormDispatchStatus.FAILED, {
        errorMessage: 'Integration endpoint is not configured',
        responsePayload: {
          reason: 'missing_endpoint',
          provider,
        },
      });
    }

    const request = this.buildHttpRequest(log);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: controller.signal,
      });

      const responsePayload = await this.readResponsePayload(response);

      if (!response.ok) {
        return this.finalizeDispatch(log, FormDispatchStatus.FAILED, {
          errorMessage: `Dispatch endpoint returned ${response.status}`,
          responsePayload: {
            status: response.status,
            statusText: response.statusText,
            body: responsePayload,
          },
        });
      }

      return this.finalizeDispatch(log, FormDispatchStatus.SUCCESS, {
        responsePayload: {
          status: response.status,
          statusText: response.statusText,
          body: responsePayload,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown dispatch error';

      return this.finalizeDispatch(log, FormDispatchStatus.FAILED, {
        errorMessage,
        responsePayload: {
          reason: 'request_error',
          message: errorMessage,
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildHttpRequest(log: DispatchLogRecord) {
    const provider = log.provider;
    const mappingConfig = this.asObject(log.integrationConfig?.mappingConfig);
    const headersConfig = this.asObject(log.integrationConfig?.headersConfig);
    const payload = this.buildDispatchPayload(log, mappingConfig);
    const method = this.resolveMethod(mappingConfig);
    const format = this.resolveRequestFormat(provider, mappingConfig, headersConfig);
    const headers = this.normalizeHeaders(headersConfig);

    if (format === 'form-urlencoded') {
      if (!this.hasHeader(headers, 'content-type')) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      if (!this.hasHeader(headers, 'accept')) {
        headers.Accept = 'application/json;charset=utf-8';
      }

      return {
        method,
        headers,
        body: new URLSearchParams(this.toFlatRecord(payload)).toString(),
      };
    }

    if (!this.hasHeader(headers, 'content-type')) {
      headers['Content-Type'] = 'application/json';
    }

    if (!this.hasHeader(headers, 'accept')) {
      headers.Accept = 'application/json';
    }

    return {
      method,
      headers,
      body: JSON.stringify(payload),
    };
  }

  private buildDispatchPayload(
    log: DispatchLogRecord,
    mappingConfig: Record<string, unknown> | null,
  ): Record<string, unknown> {
    const submissionValues = Object.fromEntries(
      log.submission.values.map((value) => [value.fieldPath, this.normalizeJsonValue(value.value)]),
    );
    const groups = log.submission.groups.map((group) => ({
      groupKey: group.groupKey,
      label: group.label,
      sortOrder: group.sortOrder,
      values: Object.fromEntries(
        group.values.map((value) => [value.fieldPath, this.normalizeJsonValue(value.value)]),
      ),
      files: group.files.map((file) => ({
        fieldPath: file.fieldPath,
        fieldKey: file.fieldKey,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        path: file.path,
        url: file.url,
        checksum: file.checksum,
        status: file.status,
      })),
    }));
    const files = log.submission.files.map((file) => ({
      fieldPath: file.fieldPath,
      fieldKey: file.fieldKey,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path,
      url: file.url,
      checksum: file.checksum,
      status: file.status,
    }));
    const requestPayload = this.asObject(log.requestPayload) ?? {};

    return {
      submissionId: log.submission.id,
      businessUnit: log.submission.businessUnit,
      formSlug: log.submission.formSlug,
      formName: log.submission.formModule.name,
      sourceWebsite: log.submission.sourceWebsite,
      promoWebsite: log.submission.promoWebsite,
      leadSource: log.submission.leadSource,
      primaryName: log.submission.primaryName,
      primaryEmail: log.submission.primaryEmail,
      primaryPhone: log.submission.primaryPhone,
      eventName: log.submission.eventName,
      receivedAt: log.submission.receivedAt.toISOString(),
      values: submissionValues,
      groups,
      files,
      rawSubmission: requestPayload,
      ...(mappingConfig ?? {}),
    };
  }

  private async finalizeDispatch(
    log: DispatchLogRecord,
    status: FormDispatchStatus,
    options: {
      errorMessage?: string | null;
      responsePayload?: unknown;
    },
  ): Promise<DispatchAttemptResult> {
    const updatedLog = await this.prisma.formSubmissionDispatchLog.update({
      where: { id: log.id },
      data: {
        status,
        errorMessage: options.errorMessage ?? null,
        dispatchedAt: new Date(),
        responsePayload:
          options.responsePayload === undefined
            ? undefined
            : this.toJsonInput(options.responsePayload),
      },
      select: {
        id: true,
        status: true,
        errorMessage: true,
      },
    });

    return {
      logId: updatedLog.id,
      status: updatedLog.status,
      errorMessage: updatedLog.errorMessage,
    };
  }

  private async syncSubmissionStatus(submissionId: string) {
    const logs = await this.prisma.formSubmissionDispatchLog.findMany({
      where: { submissionId },
      select: { status: true },
    });

    if (logs.length === 0) {
      const submission = await this.prisma.formSubmission.findUnique({
        where: { id: submissionId },
        select: { status: true },
      });

      return submission?.status ?? FormSubmissionStatus.STORED;
    }

    const statuses = logs.map((log) => log.status);
    const failureCount = statuses.filter((status) => status === FormDispatchStatus.FAILED).length;
    const successLikeCount = statuses.filter(
      (status) => status === FormDispatchStatus.SUCCESS || status === FormDispatchStatus.SKIPPED,
    ).length;

    let submissionStatus: FormSubmissionStatus = FormSubmissionStatus.STORED;

    if (failureCount === 0 && successLikeCount === statuses.length) {
      submissionStatus = FormSubmissionStatus.DISPATCHED;
    } else if (failureCount > 0 && successLikeCount > 0) {
      submissionStatus = FormSubmissionStatus.PARTIAL_FAILED;
    } else if (failureCount === statuses.length) {
      submissionStatus = FormSubmissionStatus.FAILED;
    }

    await this.prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        status: submissionStatus,
      },
    });

    return submissionStatus;
  }

  private resolveMethod(mappingConfig: Record<string, unknown> | null) {
    const configuredMethod = this.pickString(mappingConfig?.method);
    return configuredMethod?.toUpperCase() ?? 'POST';
  }

  private resolveRequestFormat(
    provider: FormIntegrationProvider,
    mappingConfig: Record<string, unknown> | null,
    headersConfig: Record<string, unknown> | null,
  ) {
    const configuredFormat = this.pickString(mappingConfig?.requestFormat)?.toLowerCase();

    if (configuredFormat === 'form-urlencoded' || configuredFormat === 'x-www-form-urlencoded') {
      return 'form-urlencoded' as const;
    }

    if (configuredFormat === 'json') {
      return 'json' as const;
    }

    const configuredContentType = this.pickString(headersConfig?.['Content-Type'] ?? headersConfig?.['content-type']);

    if (configuredContentType?.includes('application/x-www-form-urlencoded')) {
      return 'form-urlencoded' as const;
    }

    if (provider === FormIntegrationProvider.CRM_WEB_TO_LEAD) {
      return 'form-urlencoded' as const;
    }

    return 'json' as const;
  }

  private normalizeHeaders(headersConfig: Record<string, unknown> | null) {
    if (!headersConfig) {
      return {} as Record<string, string>;
    }

    return Object.entries(headersConfig).reduce<Record<string, string>>((result, [key, value]) => {
      const normalizedValue = this.pickString(value);

      if (normalizedValue) {
        result[key] = normalizedValue;
      }

      return result;
    }, {});
  }

  private hasHeader(headers: Record<string, string>, headerName: string) {
    const expectedHeader = headerName.toLowerCase();
    return Object.keys(headers).some((key) => key.toLowerCase() === expectedHeader);
  }

  private toFlatRecord(payload: Record<string, unknown>) {
    return Object.entries(payload).reduce<Record<string, string>>((result, [key, value]) => {
      if (value === null || value === undefined) {
        return result;
      }

      result[key] = this.toRequestString(value);
      return result;
    }, {});
  }

  private toRequestString(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toRequestString(item)).join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private normalizeJsonValue(value: Prisma.JsonValue | undefined): unknown {
    if (value === undefined) {
      return null;
    }

    if (value === null) {
      return null;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalizeJsonValue(item));
    }

    if (typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [key, this.normalizeJsonValue(nestedValue)]),
      );
    }

    return value;
  }

  private asObject(value: Prisma.JsonValue | null | undefined): Record<string, unknown> | null {
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      return null;
    }

    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.normalizeJsonValue(item)]));
  }

  private pickString(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toJsonInput(value: unknown): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
    if (value === null) {
      return Prisma.JsonNull;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }

  private async readResponsePayload(response: Response): Promise<unknown> {
    const rawBody = await response.text();

    if (!rawBody) {
      return null;
    }

    try {
      return JSON.parse(rawBody) as unknown;
    } catch {
      return rawBody;
    }
  }
}

const formSubmissionDispatchService = new FormSubmissionDispatchService(prisma);
let dispatchJobsInitialized = false;

export const initializeFormSubmissionDispatchJobs = () => {
  if (dispatchJobsInitialized) {
    return;
  }

  dispatchJobsInitialized = true;

  let dispatchSweepDisabled = false;
  let disabledTableName: string | null = null;
  let dispatchTask: ReturnType<typeof cron.schedule> | null = null;

  const disableDispatchSweep = (tableName: string) => {
    if (dispatchSweepDisabled) {
      return;
    }

    dispatchSweepDisabled = true;
    disabledTableName = tableName;
    dispatchTask?.stop();
    console.warn(
      `[FormDispatch] Disabled dispatch sweeps because required table ${tableName} is missing in the current database. Apply the form modules migration to enable this feature.`,
    );
  };

  const runSweep = async (source: 'startup' | 'cron') => {
    if (dispatchSweepDisabled) {
      return;
    }

    try {
      const result = await formSubmissionDispatchService.processPendingDispatches();

      if (result.processedLogs > 0) {
        console.log(
          `[FormDispatch] ${source} sweep processed ${result.processedLogs} log(s) across ${result.processedSubmissions} submission(s)`,
        );
      }
    } catch (error) {
      const tableName = getMissingFormModuleTableName(error);

      if (tableName) {
        disableDispatchSweep(tableName);
        return;
      }

      if (disabledTableName) {
        return;
      }

      console.error(`[FormDispatch] ${source} sweep failed:`, error);
    }
  };

  dispatchTask = cron.schedule(DISPATCH_CRON_SCHEDULE, async () => {
    await runSweep('cron');
  });

  void runSweep('startup');
};

export { formSubmissionDispatchService };