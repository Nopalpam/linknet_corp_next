'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchFormModule } from '@/lib/formsApi';

/**
 * useFormModule
 *
 * Fetches a form module definition from the backend API and processes it into
 * convenient data structures for rendering and validation.
 *
 * @param {string} businessUnit - 'enterprise' | 'fiber' | 'media'
 * @param {string} slug         - Form module slug, e.g. 'enterprise-consultation'
 *
 * @returns {{
 *   module: object | null;
 *   loading: boolean;
 *   error: Error | null;
 *   fieldOptions: Record<string, Array<{label: string; value: string}>>;
 *   rulesByTarget: Record<string, Array<object>>;
 *   steps: Array<object>;
 *   fields: Array<object>;
 *   rules: Array<object>;
 *   responseConfigs: Array<object>;
 * }}
 */
export function useFormModule(businessUnit, slug) {
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!businessUnit || !slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetchFormModule(businessUnit, slug, controller.signal)
      .then((data) => {
        setModule(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error(`[useFormModule] Failed to load ${businessUnit}/${slug}:`, err);
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [businessUnit, slug]);

  /**
   * fieldOptions: maps each fieldPath to its options array.
   * Only populated for fields that have options (SELECT, MULTI_SELECT,
   * RADIO, CHECKBOX_GROUP, etc.).
   *
   * Shape: { [fieldPath]: [{label: string, value: string}] }
   */
  const fieldOptions = useMemo(() => {
    if (!module) return {};

    return (module.fields || []).reduce((acc, field) => {
      if (Array.isArray(field.options) && field.options.length > 0) {
        acc[field.path] = field.options.map((opt) => ({
          label: opt.label,
          value: opt.value,
        }));
      }
      return acc;
    }, {});
  }, [module]);

  /**
   * rulesByTarget: maps each targetFieldPath to its array of active rules.
   * Used to evaluate conditional show/hide/require logic.
   *
   * Shape: { [targetFieldPath]: [{ ruleType, condition, actionConfig, ... }] }
   */
  const rulesByTarget = useMemo(() => {
    if (!module) return {};

    return (module.rules || []).reduce((acc, rule) => {
      const target = rule.targetFieldPath;
      if (!target) return acc;
      if (!acc[target]) acc[target] = [];
      acc[target].push(rule);
      return acc;
    }, {});
  }, [module]);

  return {
    module,
    loading,
    error,
    fieldOptions,
    rulesByTarget,
    steps: module?.steps || [],
    fields: module?.fields || [],
    rules: module?.rules || [],
    responseConfigs: module?.responseConfigs || [],
  };
}
