"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import {
  FormModuleDetail,
  FormModuleStatus,
  formModuleService,
} from "@/services/formModule.service";
import OverviewTab from "./components/OverviewTab";
import StepsFieldsTab from "./components/StepsFieldsTab";
import RulesTab from "./components/RulesTab";
import ResponseConfigTab from "./components/ResponseConfigTab";
import SubmissionsTab from "./components/SubmissionsTab";

type Tab = "overview" | "steps" | "rules" | "response" | "submissions";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "steps", label: "Steps & Fields" },
  { id: "rules", label: "Rules" },
  { id: "response", label: "Response Config" },
  { id: "submissions", label: "Submissions" },
];

const STATUS_NEXT: Record<FormModuleStatus, FormModuleStatus | null> = {
  DRAFT: "ACTIVE",
  ACTIVE: "ARCHIVED",
  ARCHIVED: null,
};

const STATUS_STYLES: Record<FormModuleStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function FormModuleDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const toast = useToast();

  const [module, setModule] = useState<FormModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [toggling, setToggling] = useState(false);

  const fetchModule = useCallback(async () => {
    try {
      setLoading(true);
      const data = await formModuleService.getFormModuleById(id);
      setModule(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load form module");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchModule();
  }, [fetchModule]);

  const handleToggleStatus = async () => {
    if (!module) return;
    const next = STATUS_NEXT[module.status];
    if (!next) return;

    try {
      setToggling(true);
      await formModuleService.updateFormModuleStatus(id, next);
      toast.success(
        `Status updated to ${next.charAt(0) + next.slice(1).toLowerCase()}`
      );
      await fetchModule();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">Form module not found</p>
        <Link
          href="/form-modules"
          className="mt-2 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to list
        </Link>
      </div>
    );
  }

  const nextStatus = STATUS_NEXT[module.status];

  return (
    <div>
      <PageBreadCrumb pageTitle="Form Module Detail" />

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {module.name}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                STATUS_STYLES[module.status]
              }`}
            >
              {module.status.charAt(0) + module.status.slice(1).toLowerCase()}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {module.businessUnit} · {module.category} · /{module.slug}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/form-modules"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            ← Back
          </Link>
          {nextStatus && (
            <button
              disabled={toggling}
              onClick={handleToggleStatus}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {toggling
                ? "Saving…"
                : `Move to ${nextStatus.charAt(0) + nextStatus.slice(1).toLowerCase()}`}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex gap-4" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab module={module} />}
      {activeTab === "steps" && <StepsFieldsTab module={module} />}
      {activeTab === "rules" && <RulesTab module={module} />}
      {activeTab === "response" && <ResponseConfigTab module={module} />}
      {activeTab === "submissions" && <SubmissionsTab formModuleId={id} />}
    </div>
  );
}
