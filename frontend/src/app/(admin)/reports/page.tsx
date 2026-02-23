"use client";

import React from "react";
import Link from "next/link";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

const reportPages = [
  {
    title: "Report Types",
    description: "Manage report type categories (Annual Report, Financial Statement, etc.) and their display modes (Grid/List).",
    href: "/reports/report-types",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: "blue",
  },
  {
    title: "Report Sections",
    description: "Manage sections within List-type report types. Organize items by year or category with optional CTA links.",
    href: "/reports/report-sections",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    color: "purple",
  },
  {
    title: "Report Items",
    description: "Manage individual report documents (PDF files) with cover images, data types, and audit status.",
    href: "/reports/report-items",
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "green",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    hover: "hover:border-blue-400 dark:hover:border-blue-600",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    hover: "hover:border-purple-400 dark:hover:border-purple-600",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    hover: "hover:border-green-400 dark:hover:border-green-600",
  },
};

export default function ReportsHubPage() {
  return (
    <div>
      <PageBreadCrumb pageTitle="Reports Management" />

      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Manage corporate reports including Annual Reports, Financial Statements, and Sustainability Reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reportPages.map((page) => {
          const colors = colorMap[page.color];
          return (
            <Link
              key={page.href}
              href={page.href}
              className={`group rounded-xl border-2 ${colors.border} ${colors.hover} bg-white p-6 transition-all hover:shadow-lg dark:bg-gray-800`}
            >
              <div className={`mb-4 inline-flex rounded-lg ${colors.bg} p-3`}>
                <span className={colors.text}>{page.icon}</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white group-hover:underline">
                {page.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {page.description}
              </p>
              <div className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${colors.text}`}>
                Manage
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
