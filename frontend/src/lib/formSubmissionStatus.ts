import type { FormSubmissionStatus } from '@/services/formModule.service';

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

export function getFormSubmissionStatusMeta(
  status: FormSubmissionStatus
): FormSubmissionStatusMeta {
  return FORM_SUBMISSION_STATUS_META[status];
}

export function canRetryFormSubmission(status: FormSubmissionStatus): boolean {
  return status === 'FAILED';
}