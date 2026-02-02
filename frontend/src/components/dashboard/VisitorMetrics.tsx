"use client";

import React from "react";
import { FiUsers, FiTrendingUp, FiEye, FiCalendar } from "react-icons/fi";

const VisitorMetrics = () => {
  const metrics = [
    {
      title: "Total Visitors",
      value: "45,892",
      change: "+12.5%",
      trend: "up",
      icon: FiUsers,
      color: "blue",
      description: "All time visitors",
    },
    {
      title: "Today's Visitors",
      value: "1,234",
      change: "+8.2%",
      trend: "up",
      icon: FiEye,
      color: "green",
      description: "Visitors today",
    },
    {
      title: "This Week",
      value: "8,456",
      change: "+15.3%",
      trend: "up",
      icon: FiCalendar,
      color: "purple",
      description: "Weekly visitors",
    },
    {
      title: "Page Views",
      value: "125,678",
      change: "+10.8%",
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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const colorClasses = getColorClasses(metric.color);

        return (
          <div
            key={index}
            className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses.bg}`}>
                <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
              </div>
              <span className={`text-sm font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {metric.change}
              </span>
            </div>

            <div className="mt-4">
              <h4 className="text-2xl font-bold text-black dark:text-white">
                {metric.value}
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
  );
};

export default VisitorMetrics;
