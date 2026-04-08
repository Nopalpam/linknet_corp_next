"use client";

import React, { useEffect, useState } from "react";
import {
  FiUsers,
  FiEye,
  FiActivity,
  FiClock,
  FiUserPlus,
  FiAlertCircle,
  FiRefreshCw,
  FiBarChart2,
} from "react-icons/fi";
import {
  analyticsService,
  GAAnalyticsData,
} from "@/services/analytics.service";

const GAAnalyticsWidget = () => {
  const [data, setData] = useState<GAAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  const getDateRange = (range: "7d" | "30d" | "90d") => {
    switch (range) {
      case "7d":
        return { startDate: "7daysAgo", endDate: "today" };
      case "30d":
        return { startDate: "30daysAgo", endDate: "today" };
      case "90d":
        return { startDate: "90daysAgo", endDate: "today" };
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = getDateRange(dateRange);
      const result = await analyticsService.getGoogleAnalytics(params);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Not connected state
  if (!loading && data && !data.connected) {
    return (
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBarChart2 className="h-5 w-5 text-blue-500" />
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Website Analytics
            </h4>
          </div>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
          >
            <FiRefreshCw className="h-3 w-3" />
            Coba Lagi
          </button>
        </div>

        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-10 text-center dark:border-gray-600">
          <FiAlertCircle className="mb-3 h-12 w-12 text-amber-400" />
          <h5 className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
            Google Analytics Belum Terhubung
          </h5>
          <p className="max-w-md text-sm text-gray-500 dark:text-gray-400">
            {data.message ||
              "Silakan konfigurasi GA4_PROPERTY_ID dan credentials di environment variables backend untuk menampilkan data analytics dari Google."}
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-3 text-left text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <p className="font-semibold mb-1">Yang diperlukan:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>GA4_PROPERTY_ID</li>
              <li>GA4_CREDENTIALS_PATH atau GA4_CLIENT_EMAIL + GA4_PRIVATE_KEY</li>
            </ul>
          </div>
          <button
            onClick={fetchData}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw className="h-4 w-4" />
            Refresh Data Analytics
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.overview
    ? [
        {
          title: "Total Visitors",
          value: data.overview.totalVisitors,
          icon: FiUsers,
          color: "blue",
          format: "number",
        },
        {
          title: "Page Views",
          value: data.overview.pageViews,
          icon: FiEye,
          color: "green",
          format: "number",
        },
        {
          title: "Sessions",
          value: data.overview.sessions,
          icon: FiActivity,
          color: "purple",
          format: "number",
        },
        {
          title: "Bounce Rate",
          value: data.overview.bounceRate,
          icon: FiBarChart2,
          color: "orange",
          format: "percent",
        },
        {
          title: "Avg. Session Duration",
          value: data.overview.avgSessionDuration,
          icon: FiClock,
          color: "teal",
          format: "duration",
        },
        {
          title: "New Users",
          value: data.overview.newUsers,
          icon: FiUserPlus,
          color: "indigo",
          format: "number",
        },
      ]
    : [];

  const formatValue = (
    value: number | null,
    format: string
  ): string => {
    if (value === null || value === undefined) return "N/A";
    switch (format) {
      case "number":
        return value.toLocaleString();
      case "percent":
        return `${value}%`;
      case "duration": {
        const mins = Math.floor(value / 60);
        const secs = Math.floor(value % 60);
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      }
      default:
        return String(value);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950",
        text: "text-blue-600 dark:text-blue-400",
        icon: "text-blue-500",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-950",
        text: "text-green-600 dark:text-green-400",
        icon: "text-green-500",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950",
        text: "text-purple-600 dark:text-purple-400",
        icon: "text-purple-500",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-950",
        text: "text-orange-600 dark:text-orange-400",
        icon: "text-orange-500",
      },
      teal: {
        bg: "bg-teal-50 dark:bg-teal-950",
        text: "text-teal-600 dark:text-teal-400",
        icon: "text-teal-500",
      },
      indigo: {
        bg: "bg-indigo-50 dark:bg-indigo-950",
        text: "text-indigo-600 dark:text-indigo-400",
        icon: "text-indigo-500",
      },
    };
    return (
      colors[color] || {
        bg: "bg-gray-50 dark:bg-gray-950",
        text: "text-gray-600 dark:text-gray-400",
        icon: "text-gray-500",
      }
    );
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiBarChart2 className="h-5 w-5 text-blue-500" />
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Website Analytics
          </h4>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  dateRange === range
                    ? "bg-primary text-white"
                    : "text-bodydark hover:bg-gray-2 dark:hover:bg-meta-4"
                } ${range === "7d" ? "rounded-l-lg" : ""} ${
                  range === "90d" ? "rounded-r-lg" : ""
                }`}
              >
                {range === "7d"
                  ? "7 Days"
                  : range === "30d"
                    ? "30 Days"
                    : "90 Days"}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border border-stroke p-1.5 text-bodydark transition-colors hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
            title="Refresh data"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          {/* Source Badge */}
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Source: Google Analytics
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-lg border border-stroke p-4 dark:border-strokedark"
              >
                <div className="mb-3 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="mb-2 h-6 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))
          : metrics.map((metric, index) => {
              const Icon = metric.icon;
              const colorClasses = getColorClasses(metric.color);

              return (
                <div
                  key={index}
                  className="rounded-lg border border-stroke p-4 transition-all hover:shadow-md dark:border-strokedark"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${colorClasses.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${colorClasses.icon}`} />
                  </div>
                  <h4
                    className={`text-xl font-bold ${colorClasses.text}`}
                  >
                    {formatValue(metric.value, metric.format)}
                  </h4>
                  <p className="mt-1 text-xs font-medium text-bodydark">
                    {metric.title}
                  </p>
                </div>
              );
            })}
      </div>

      {/* Top Pages Table */}
      {data?.topPages && data.topPages.length > 0 && (
        <div className="mt-6">
          <h5 className="mb-3 text-sm font-semibold text-black dark:text-white">
            Top Pages
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stroke text-left dark:border-strokedark">
                  <th className="pb-2 pr-4 font-medium text-bodydark">#</th>
                  <th className="pb-2 pr-4 font-medium text-bodydark">
                    Page Path
                  </th>
                  <th className="pb-2 pr-4 font-medium text-bodydark">
                    Title
                  </th>
                  <th className="pb-2 pr-4 text-right font-medium text-bodydark">
                    Views
                  </th>
                  <th className="pb-2 text-right font-medium text-bodydark">
                    Unique Users
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.slice(0, 10).map((page, index) => (
                  <tr
                    key={index}
                    className="border-b border-stroke/50 last:border-0 dark:border-strokedark/50"
                  >
                    <td className="py-2 pr-4 text-bodydark">{index + 1}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-black dark:text-white">
                      {page.pagePath.length > 50
                        ? page.pagePath.substring(0, 50) + "..."
                        : page.pagePath}
                    </td>
                    <td className="py-2 pr-4 text-bodydark">
                      {page.pageTitle.length > 40
                        ? page.pageTitle.substring(0, 40) + "..."
                        : page.pageTitle}
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold text-black dark:text-white">
                      {page.pageViews.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-bodydark">
                      {page.uniquePageViews.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GAAnalyticsWidget;
