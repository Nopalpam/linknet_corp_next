"use client";

import React from "react";
import { FormModuleDetail } from "@/services/formModule.service";

interface RulesTabProps {
  module: FormModuleDetail;
}

const RULE_STYLES: Record<string, string> = {
  SHOW: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  HIDE: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  REQUIRE: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  OPTIONAL: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  SET_VALUE: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  CLEAR_VALUE: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
};

export default function RulesTab({ module }: RulesTabProps) {
  if (module.rules.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No conditional rules defined.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-700">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">#</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Type
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Source Field
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Target Field
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Condition
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Active
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {module.rules.map((rule, i) => (
            <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
              <td className="px-4 py-3 text-xs text-gray-400">{i + 1}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    RULE_STYLES[rule.ruleType] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {rule.ruleType}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                {rule.sourceFieldPath ?? "—"}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                {rule.targetFieldPath ?? "—"}
              </td>
              <td className="max-w-xs px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                <pre className="whitespace-pre-wrap font-mono text-[10px]">
                  {JSON.stringify(rule.condition, null, 2)}
                </pre>
              </td>
              <td className="px-4 py-3 text-xs">
                {rule.isActive ? (
                  <span className="text-green-600 dark:text-green-400">Yes</span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
