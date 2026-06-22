"use client";

import React from "react";
import {
  BusinessUnit,
  FormCategory,
  FormHandlingMode,
  FormModuleDetail,
  FormModuleStatus,
} from "@/services/formModule.service";

interface OverviewTabProps {
  module: FormModuleDetail;
}

const BU_LABEL: Record<BusinessUnit, string> = {
  ENTERPRISE: "Enterprise",
  FIBER: "Fiber",
  MEDIA: "Media",
};

const BU_STYLES: Record<BusinessUnit, string> = {
  ENTERPRISE: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
  FIBER: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
  MEDIA: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
};

const STATUS_STYLES: Record<FormModuleStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  ARCHIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 border-b border-gray-100 py-3 last:border-0 dark:border-gray-800">
      <span className="w-44 shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-white">{children}</span>
    </div>
  );
}

function getSubmissionSetting(module: FormModuleDetail, key: string) {
  const settings = module.submissionSettings;

  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return undefined;
  }

  return (settings as Record<string, unknown>)[key];
}

export default function OverviewTab({ module }: OverviewTabProps) {
  const sendToSalesForce = getSubmissionSetting(module, "sendToSalesForce");
  const salesForceIntegrationStatus = getSubmissionSetting(
    module,
    "salesForceIntegrationStatus"
  );
  const hasSalesForceIntegrationStatus =
    salesForceIntegrationStatus !== undefined &&
    salesForceIntegrationStatus !== null &&
    salesForceIntegrationStatus !== "";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <Row label="Name">{module.name}</Row>
      <Row label="Slug">
        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
          {module.slug}
        </code>
      </Row>
      <Row label="Business Unit">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            BU_STYLES[module.businessUnit]
          }`}
        >
          {BU_LABEL[module.businessUnit]}
        </span>
      </Row>
      <Row label="Category">{module.category}</Row>
      <Row label="Handling Mode">{module.handlingMode}</Row>
      <Row label="Status">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            STATUS_STYLES[module.status]
          }`}
        >
          {module.status.charAt(0) + module.status.slice(1).toLowerCase()}
        </span>
      </Row>
      <Row label="Schema Version">v{module.schemaVersion}</Row>
      {module.description && <Row label="Description">{module.description}</Row>}
      {module.publicPath && (
        <Row label="Public Path">
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-800">
            {module.publicPath}
          </code>
        </Row>
      )}
      <Row label="Page Context Promo">{module.promoWebsite || "-"}</Row>
      <Row label="Page Context Source">{module.sourceWebsite || "-"}</Row>
      {module.leadSource && <Row label="Lead Source">{module.leadSource}</Row>}
      {module.integrationProvider && (
        <Row label="Integration Provider">{module.integrationProvider}</Row>
      )}
      {sendToSalesForce !== undefined && (
        <Row label="Send to Sales Force">
          {sendToSalesForce === true ? "Yes" : "No"}
        </Row>
      )}
      {hasSalesForceIntegrationStatus && (
        <Row label="Sales Force Status">{String(salesForceIntegrationStatus)}</Row>
      )}
      <Row label="Steps">{module.steps.length}</Row>
      <Row label="Fields">{module.fields.length}</Row>
      <Row label="Created At">
        {new Date(module.createdAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Row>
      <Row label="Updated At">
        {new Date(module.updatedAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Row>
    </div>
  );
}
