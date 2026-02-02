import type { Metadata } from "next";
import React from "react";
import VisitorMetrics from "@/components/dashboard/VisitorMetrics";
import VisitorChart from "@/components/dashboard/VisitorChart";
import ContentOverview from "@/components/dashboard/ContentOverview";
import SystemActivity from "@/components/dashboard/SystemActivity";
import QuickSummary from "@/components/dashboard/QuickSummary";

export const metadata: Metadata = {
  title:
    "Dashboard CMS - PT Link Net Tbk - We LINK the nation for better lives",
  description: "Company Profile CMS Dashboard - Linknet Corporation",
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Visitor Metrics - Full Width */}
      <div>
        <VisitorMetrics />
      </div>

      {/* Visitor Chart and Content Overview */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div>
          <VisitorChart />
        </div>
        <div>
          <ContentOverview />
        </div>
      </div>

      {/* System Activity and Quick Summary */}
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
