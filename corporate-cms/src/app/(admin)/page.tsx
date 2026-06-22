import type { Metadata } from "next";
import React from "react";
import VisitorMetrics from "@/components/dashboard/VisitorMetrics";
import VisitorChart from "@/components/dashboard/VisitorChart";
import ContentOverview from "@/components/dashboard/ContentOverview";
import SystemActivity from "@/components/dashboard/SystemActivity";
import QuickSummary from "@/components/dashboard/QuickSummary";
import GAAnalyticsWidget from "@/components/dashboard/GAAnalyticsWidget";
import TopNewsWidget from "@/components/dashboard/TopNewsWidget";

export const metadata: Metadata = {
  title:
    "Dashboard CMS - PT Link Net Tbk - We LINK the nation for better lives",
  description: "Company Profile CMS Dashboard - Linknet Corporation",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* ========== SECTION: Website Analytics (Google Analytics) ========== */}
      <div>
        <GAAnalyticsWidget />
      </div>

      {/* ========== SECTION: Internal Visitor Metrics ========== */}
      <div>
        <VisitorMetrics />
      </div>

      {/* ========== SECTION: Content Analytics (Internal CMS) + Visitor Chart ========== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <TopNewsWidget />
        </div>
        <div>
          <VisitorChart />
        </div>
      </div>

      {/* ========== SECTION: Content Overview ========== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <ContentOverview />
        </div>
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Data Source Legend
            </h4>
            <p className="text-sm text-bodydark">
              Dashboard ini menggabungkan data dari beberapa sumber
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/30">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-blue-700 dark:text-blue-400">
                  Google Analytics
                </h5>
                <p className="text-sm text-blue-600/70 dark:text-blue-400/70">
                  Data visitor, page views, sessions, dan bounce rate dari Google Analytics 4 (GA4). Mencakup seluruh traffic website publik.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-purple-100 bg-purple-50/50 p-4 dark:border-purple-900/30 dark:bg-purple-950/30">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h5 className="font-semibold text-purple-700 dark:text-purple-400">
                  Internal CMS
                </h5>
                <p className="text-sm text-purple-600/70 dark:text-purple-400/70">
                  Data artikel, views per artikel, dan statistik konten dari database internal CMS. Tracking views di-increment setiap halaman artikel dibuka.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SECTION: System Activity & Quick Summary ========== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SystemActivity />
        </div>
        <div className="xl:col-span-2">
          <QuickSummary />
        </div>
      </div>
    </div>
  );
}
