import type { FormSubmissionStatus } from '@/services/formModule.service';

export interface FormSubmissionStatusMeta {
  label: string;
  description: string;
  className: string;
}

const FORM_SUBMISSION_STATUS_META: Record<FormSubmissionStatus, FormSubmissionStatusMeta> = {
  RECEIVED: {
    label: 'Received',
    description: 'Submission has been received by the backend and is waiting for the next processing step.',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  },
  VALIDATED: {
    label: 'Validated',
    description: 'Submission data passed validation and was processed successfully.',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  STORED: {
    label: 'Stored',
    description: 'Submission data has been stored successfully and is ready for dispatch or follow-up.',
    className: 'bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-400',
  },
  DISPATCHED: {
    label: 'Dispatched',
    description: 'Submission data was dispatched successfully to the configured integration.',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  },
  PARTIAL_FAILED: {
    label: 'Partial Failed',
    description: 'Submission data was stored, but one or more downstream dispatches failed.',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  },
  FAILED: {
    label: 'Failed',
    description: 'Submission failed because validation or submission processing returned an error.',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
};

export function getFormSubmissionStatusMeta(
  status: FormSubmissionStatus
): FormSubmissionStatusMeta {
  return FORM_SUBMISSION_STATUS_META[status];
}

export function canRetryFormSubmission(status: FormSubmissionStatus): boolean {
  return status === 'FAILED' || status === 'PARTIAL_FAILED';
}