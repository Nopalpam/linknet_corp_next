'use client';

import { useState, useCallback } from 'react';
import { submitFormModule } from '@/lib/formsApi';

/**
 * useFormSubmission
 *
 * Handles form submission to the backend API for a given businessUnit + slug.
 * Returns a stable `submit` callback and tracks async state.
 *
 * @param {string} businessUnit - 'enterprise' | 'fiber' | 'media'
 * @param {string} slug         - Form module slug, e.g. 'enterprise-consultation'
 *
 * @returns {{
 *   submit: (payload: object) => Promise<{ submission: object|null; response: object|null; persisted: boolean }>;
 *   submitting: boolean;
 *   error: Error | null;
 *   result: object | null;
 *   reset: () => void;
 * }}
 */
export function useFormSubmission(businessUnit, slug) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submit = useCallback(
    async (payload) => {
      setSubmitting(true);
      setError(null);

      try {
        const data = await submitFormModule(businessUnit, slug, payload);
        setResult(data);
        return data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [businessUnit, slug],
  );

  const reset = useCallback(() => {
    setSubmitting(false);
    setError(null);
    setResult(null);
  }, []);

  return { submit, submitting, error, result, reset };
}
