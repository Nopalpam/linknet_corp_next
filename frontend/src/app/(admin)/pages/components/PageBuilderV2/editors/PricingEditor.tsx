/**
 * Pricing Component - Settings Editor
 * 
 * Provides the editing UI for Pricing component settings.
 * Changes are propagated via onChange callback - no internal state duplication.
 */

'use client';

import React from 'react';
import { PricingSettings, PricingPlan } from '../types';

interface PricingEditorProps {
  settings: PricingSettings;
  onChange: (settings: PricingSettings) => void;
}

export const PricingEditor: React.FC<PricingEditorProps> = ({ settings, onChange }) => {
  // Update section title/subtitle
  const updateField = <K extends keyof PricingSettings>(
    field: K,
    value: PricingSettings[K]
  ) => {
    onChange({ ...settings, [field]: value });
  };

  // Update a specific plan
  const updatePlan = (planId: string, updates: Partial<PricingPlan>) => {
    const updatedPlans = settings.plans.map((plan) =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    onChange({ ...settings, plans: updatedPlans });
  };

  // Add new plan
  const addPlan = () => {
    const newPlan: PricingPlan = {
      id: `plan-${Date.now()}`,
      name: 'New Plan',
      price: '$0',
      features: ['Feature 1'],
      isFeatured: false,
    };
    onChange({ ...settings, plans: [...settings.plans, newPlan] });
  };

  // Remove plan
  const removePlan = (planId: string) => {
    onChange({
      ...settings,
      plans: settings.plans.filter((p) => p.id !== planId),
    });
  };

  // Update plan features
  const updatePlanFeatures = (planId: string, featuresText: string) => {
    const features = featuresText.split('\n').filter((f) => f.trim());
    updatePlan(planId, { features });
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Title
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => updateField('title', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
          placeholder="Choose Your Plan"
        />
      </div>

      {/* Section Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Section Subtitle
        </label>
        <input
          type="text"
          value={settings.subtitle || ''}
          onChange={(e) => updateField('subtitle', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
          placeholder="Select the perfect plan for your needs"
        />
      </div>

      {/* Plans */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pricing Plans ({settings.plans.length})
          </label>
          <button
            type="button"
            onClick={addPlan}
            className="px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/30"
          >
            + Add Plan
          </button>
        </div>

        <div className="space-y-4">
          {settings.plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border ${
                plan.isFeatured
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
              }`}
            >
              {/* Plan Header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Plan {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.isFeatured}
                      onChange={(e) =>
                        updatePlan(plan.id, { isFeatured: e.target.checked })
                      }
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Featured
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removePlan(plan.id)}
                    className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors dark:hover:bg-red-900/20"
                    title="Remove plan"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Plan Name */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Basic"
                />
              </div>

              {/* Plan Price */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Price
                </label>
                <input
                  type="text"
                  value={plan.price}
                  onChange={(e) => updatePlan(plan.id, { price: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="$29/mo"
                />
              </div>

              {/* Plan Features */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  value={plan.features.join('\n')}
                  onChange={(e) => updatePlanFeatures(plan.id, e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white font-mono"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>
            </div>
          ))}

          {settings.plans.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              No plans added. Click &ldquo;Add Plan&rdquo; to create your first pricing plan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
