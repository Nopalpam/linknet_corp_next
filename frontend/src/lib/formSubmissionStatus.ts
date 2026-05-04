import type { FormSubmissionReviewStatus, FormSubmissionStatus } from '@/services/formModule.service';

export interface FormSubmissionStatusMeta {
  label: string;
  description: string;
  className: string;
}

const FORM_SUBMISSION_STATUS_META: Record<FormSubmissionStatus, FormSubmissionStatusMeta> = {
  STORED: {
    label: 'Stored',
    description: 'Submission data has been stored successfully and is ready for follow-up.',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400',
  },
  FAILED: {
    label: 'Failed',
    description: 'Submission failed because one or more downstream processing steps did not complete successfully.',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
};

const FORM_SUBMISSION_REVIEW_STATUS_META: Record<FormSubmissionReviewStatus, FormSubmissionStatusMeta> = {
  HOLD: {
    label: 'Hold',
    description: 'Submission is under review and has not been actioned yet.',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  REJECTED: {
    label: 'Rejected',
    description: 'Submission has been reviewed and rejected.',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
  APPROVED: {
    label: 'Approved (BRIM)',
    description: 'Submission has been approved and queued for BRIM integration.',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
};

export function getFormSubmissionStatusMeta(
  status: FormSubmissionStatus
): FormSubmissionStatusMeta {
  return FORM_SUBMISSION_STATUS_META[status];
}

export function getFormSubmissionReviewStatusMeta(
  status: FormSubmissionReviewStatus | null | undefined
): FormSubmissionStatusMeta {
  return FORM_SUBMISSION_REVIEW_STATUS_META[status ?? 'HOLD'];
}

export function canRetryFormSubmission(status: FormSubmissionStatus): boolean {
  return status === 'FAILED';
}