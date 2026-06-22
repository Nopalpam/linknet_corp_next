'use client';

import { useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import SubmissionDetailModal from '@/components/common/SubmissionDetailModal';

export default function FormSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const formModuleId = params?.formModuleId as string;
  const submissionId = params?.submissionId as string;
  const returnTo =
    searchParams?.get('returnTo') || `/form-modules/${formModuleId}?tab=submissions`;

  const handleClose = useCallback(() => {
    router.push(returnTo);
  }, [returnTo, router]);

  return (
    <SubmissionDetailModal
      formModuleId={formModuleId}
      submissionId={submissionId}
      onClose={handleClose}
    />
  );
}