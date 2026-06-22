/**
 * Pricing Component - Canvas Renderer
 * 
 * Renders the Pricing component in the Page Builder canvas.
 * This is a pure display component - no editing logic.
 */

'use client';

import React from 'react';
import { PricingSettings } from '../types';

interface PricingRendererProps {
  settings: PricingSettings;
  isSelected: boolean;
}

export const PricingRenderer: React.FC<PricingRendererProps> = ({ settings, isSelected }) => {
  const { title, subtitle, plans } = settings;

  return (
    <div
      className={`p-8 rounded-lg bg-gray-50 dark:bg-gray-800 ${
        isSelected ? 'ring-2 ring-brand-500' : ''
      }`}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {title || 'Pricing Plans'}
        </h2>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* Plans Grid */}
      <div className={`grid gap-6 ${
        plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        plans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {plans.map((plan, index) => (
          <div
            key={plan.id || index}
            className={`relative rounded-xl p-6 ${
              plan.isFeatured
                ? 'bg-brand-600 text-white shadow-xl scale-105'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Featured Badge */}
            {plan.isFeatured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan Name */}
            <h3 className={`text-xl font-semibold mb-2 ${
              plan.isFeatured ? 'text-white' : 'text-gray-900 dark:text-white'
            }`}>
              {plan.name}
            </h3>

            {/* Price */}
            <div className="mb-4">
              <span className={`text-3xl font-bold ${
                plan.isFeatured ? 'text-white' : 'text-gray-900 dark:text-white'
              }`}>
                {plan.price}
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className={`flex items-center gap-2 text-sm ${
                    plan.isFeatured ? 'text-white/90' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${
                      plan.isFeatured ? 'text-white' : 'text-brand-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                plan.isFeatured
                  ? 'bg-white text-brand-600 hover:bg-gray-100'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
              onClick={(e) => e.preventDefault()}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No pricing plans added. Edit this component to add plans.
        </div>
      )}
    </div>
  );
};
