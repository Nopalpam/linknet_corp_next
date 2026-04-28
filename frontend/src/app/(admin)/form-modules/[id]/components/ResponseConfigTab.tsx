"use client";

import React from "react";
import { FormModuleDetail } from "@/services/formModule.service";

interface ResponseConfigTabProps {
  module: FormModuleDetail;
}

const RESPONSE_TYPE_STYLES: Record<string, string> = {
  REDIRECT: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  MESSAGE: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  COMPONENT: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export default function ResponseConfigTab({ module }: ResponseConfigTabProps) {
  return (
    <div className="space-y-4">
      {/* Response Configs */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Response Configs</p>
        </div>
        {module.responseConfigs.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            No response configs defined.
          </p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 text-left dark:border-gray-800">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Key
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Path Template
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Default
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {module.responseConfigs.map((rc) => (
                <tr key={rc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                    {rc.key}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        RESPONSE_TYPE_STYLES[rc.responseType] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {rc.responseType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {rc.pathTemplate}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {rc.isDefault ? (
                      <span className="text-blue-600 dark:text-blue-400">Yes</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {rc.isActive ? (
                      <span className="text-green-600 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Integration Configs */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Integration Configs</p>
        </div>
        {module.integrations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
            No integration configs defined.
          </p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b border-gray-100 text-left dark:border-gray-800">
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Key
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Provider
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Dispatch Mode
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Endpoint
                </th>
                <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {module.integrations.map((ic) => (
                <tr key={ic.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-700 dark:text-gray-300">
                    {ic.key}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {ic.provider}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {ic.dispatchMode ?? "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {ic.endpoint ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {ic.isActive ? (
                      <span className="text-green-600 dark:text-green-400">Yes</span>
                    ) : (
                      <span className="text-gray-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
