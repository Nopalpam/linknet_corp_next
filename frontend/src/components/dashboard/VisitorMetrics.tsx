"use client";

import React, { useEffect, useState } from "react";
import { FiUsers, FiTrendingUp, FiEye, FiCalendar } from "react-icons/fi";
import { dashboardService, VisitorStats } from "@/services/dashboard.service";

const VisitorMetrics = () => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [filterMode, setFilterMode] = useState<"all" | "year" | "month">("all");

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params: { year?: number; month?: number } = {};
      if (filterMode === "year") {
        params.year = selectedYear;
      } else if (filterMode === "month") {
        params.year = selectedYear;
        params.month = selectedMonth;
      }
      const data = await dashboardService.getVisitorStats(params);
      setStats(data);
    } catch {
      // Keep previous data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, selectedYear, selectedMonth]);

  const metrics = [
    {
      title: "Total Visitors",
      value: stats?.totalVisitors ?? 0,
      change: stats?.monthlyChange ?? "+0%",
      trend: stats?.monthlyChange?.startsWith("+") ? "up" : "down",
      icon: FiUsers,
      color: "blue",
      description: filterMode === "all" ? "All time visitors" : filterMode === "year" ? `Visitors in ${selectedYear}` : `Visitors in ${selectedMonth}/${selectedYear}`,
    },
    {
      title: "Today's Visitors",
      value: stats?.todayVisitors ?? 0,
      change: "",
      trend: "up",
      icon: FiEye,
      color: "green",
      description: "Visitors today",
    },
    {
      title: "This Week",
      value: stats?.weeklyVisitors ?? 0,
      change: "",
      trend: "up",
      icon: FiCalendar,
      color: "purple",
      description: "Weekly visitors",
    },
    {
      title: "Page Views",
      value: stats?.totalPageViews ?? 0,
      change: "",
      trend: "up",
      icon: FiTrendingUp,
      color: "orange",
      description: "Total page views",
    },
  ];

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
    };
    return colors[color];
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
          {(["all", "year", "month"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filterMode === mode
                  ? "bg-blue-500 text-white"
                  : "text-bodydark hover:bg-gray-2 dark:hover:bg-meta-4"
              } ${mode === "all" ? "rounded-l-lg" : ""} ${mode === "month" ? "rounded-r-lg" : ""}`}
            >
              {mode === "all" ? "All Time" : mode === "year" ? "By Year" : "By Month"}
            </button>
          ))}
        </div>

        {(filterMode === "year" || filterMode === "month") && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {filterMode === "month" && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="rounded-lg border border-stroke bg-white px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const colorClasses = getColorClasses(metric.color);

          return (
            <div
              key={index}
              className={`rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark ${loading ? "animate-pulse" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses.bg}`}>
                  <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
                </div>
                {metric.change && (
                  <span className={`text-sm font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {metric.change}
                  </span>
                )}
              </div>

              <div className="mt-4">
                <h4 className="text-2xl font-bold text-black dark:text-white">
                  {loading ? "..." : metric.value.toLocaleString()}
                </h4>
                <p className="mt-1 text-sm font-medium text-black dark:text-white">
                  {metric.title}
                </p>
                <p className="mt-1 text-xs text-bodydark">
                  {metric.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisitorMetrics;
