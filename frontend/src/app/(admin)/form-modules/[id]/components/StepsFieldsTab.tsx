"use client";

import React, { useState } from "react";
import { FormField, FormModuleDetail, FormStep } from "@/services/formModule.service";

interface StepsFieldsTabProps {
  module: FormModuleDetail;
}

const FIELD_TYPE_STYLES: Record<string, string> = {
  TEXT: "bg-gray-100 text-gray-700",
  EMAIL: "bg-blue-50 text-blue-700",
  PHONE: "bg-green-50 text-green-700",
  NUMBER: "bg-teal-50 text-teal-700",
  TEXTAREA: "bg-gray-100 text-gray-700",
  SELECT: "bg-indigo-50 text-indigo-700",
  MULTI_SELECT: "bg-indigo-50 text-indigo-700",
  CHECKBOX: "bg-yellow-50 text-yellow-700",
  CHECKBOX_GROUP: "bg-yellow-50 text-yellow-700",
  RADIO: "bg-pink-50 text-pink-700",
  DATE: "bg-cyan-50 text-cyan-700",
  FILE: "bg-orange-50 text-orange-700",
  FILE_GROUP: "bg-orange-50 text-orange-700",
  ADDRESS_LOOKUP: "bg-lime-50 text-lime-700",
  REPEATER: "bg-violet-50 text-violet-700",
  HIDDEN: "bg-gray-100 text-gray-500",
};

function FieldRow({ field }: { field: FormField }) {
  const [expanded, setExpanded] = useState(false);
  const hasOptions = field.options.length > 0;

  return (
    <div className="border-b border-gray-100 last:border-0 dark:border-gray-800">
      <button
        type="button"
        onClick={() => hasOptions && setExpanded((v) => !v)}
        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
          hasOptions ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {/* Field type badge */}
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-medium dark:bg-opacity-20 ${
            FIELD_TYPE_STYLES[field.fieldType] ?? "bg-gray-100 text-gray-600"
          }`}
        >
          {field.fieldType}
        </span>

        {/* Path + label */}
        <span className="min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {field.label}
          </span>
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            {field.path}
          </span>
        </span>

        {/* Required badge */}
        {field.isRequired && (
          <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
            required
          </span>
        )}

        {/* Options count */}
        {hasOptions && (
          <span className="shrink-0 text-xs text-gray-400">
            {field.options.length} option{field.options.length !== 1 ? "s" : ""}
            <span className="ml-1">{expanded ? "▲" : "▼"}</span>
          </span>
        )}
      </button>

      {/* Options list */}
      {expanded && hasOptions && (
        <div className="ml-8 mb-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-800/40">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {field.options.map((opt) => (
              <div key={opt.id} className="flex items-center gap-2 text-xs">
                <code className="rounded bg-white px-1.5 py-0.5 text-gray-600 dark:bg-gray-900 dark:text-gray-300">
                  {opt.value}
                </code>
                <span className="text-gray-500 dark:text-gray-400">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StepsFieldsTab({ module }: StepsFieldsTabProps) {
  // Group fields by step key
  const fieldsByStep: Record<string, FormField[]> = {};
  const ungroupedFields: FormField[] = [];

  for (const field of module.fields) {
    if (field.formStepKey) {
      if (!fieldsByStep[field.formStepKey]) fieldsByStep[field.formStepKey] = [];
      fieldsByStep[field.formStepKey].push(field);
    } else {
      ungroupedFields.push(field);
    }
  }

  if (module.steps.length === 0 && module.fields.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No steps or fields defined yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {module.steps.map((step) => (
        <div
          key={step.id}
          className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
        >
          {/* Step header */}
          <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {step.stepNumber}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {step.title}
                {step.isReviewStep && (
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    review
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">key: {step.key}</p>
            </div>
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              {(fieldsByStep[step.key] ?? []).length} field
              {(fieldsByStep[step.key] ?? []).length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Fields in this step */}
          <div>
            {(fieldsByStep[step.key] ?? []).length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">No fields</p>
            ) : (
              (fieldsByStep[step.key] ?? []).map((field) => (
                <FieldRow key={field.id} field={field} />
              ))
            )}
          </div>
        </div>
      ))}

      {/* Fields without a step */}
      {ungroupedFields.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Ungrouped Fields
            </p>
          </div>
          <div>
            {ungroupedFields.map((field) => (
              <FieldRow key={field.id} field={field} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
