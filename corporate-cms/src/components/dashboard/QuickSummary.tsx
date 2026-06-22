"use client";

import React from "react";
import {
  FiGlobe,
  FiLink,
  FiSettings,
  FiServer,
  FiDatabase,
  FiCheck,
} from "react-icons/fi";

const QuickSummary = () => {
  const summaryCards = [
    {
      title: "Website Status",
      value: "Published",
      icon: FiGlobe,
      status: "active",
      description: "Live & accessible",
      color: "green",
    },
    {
      title: "API Status",
      value: "Connected",
      icon: FiServer,
      status: "active",
      description: "All services running",
      color: "blue",
    },
    {
      title: "Database",
      value: "Healthy",
      icon: FiDatabase,
      status: "active",
      description: "Connection stable",
      color: "purple",
    },
  ];

  const quickStats = [
    {
      label: "Total Redirects",
      value: "18",
      icon: FiLink,
    },
    {
      label: "System Settings",
      value: "42",
      icon: FiSettings,
    },
    {
      label: "Active Modules",
      value: "8",
      icon: FiCheck,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<
      string,
      { bg: string; text: string; badge: string }
    > = {
      green: {
        bg: "bg-green-50 dark:bg-green-950",
        text: "text-green-600 dark:text-green-400",
        badge: "bg-green-500",
      },
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950",
        text: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-500",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950",
        text: "text-purple-600 dark:text-purple-400",
        badge: "bg-purple-500",
      },
    };
    return colors[color];
  };

  return (
    <div className="space-y-4">
      {/* System Status Cards */}
      <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            System Status
          </h4>
          <p className="text-sm text-bodydark">Real-time system health</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            const colorClasses = getColorClasses(card.color);

            return (
              <div
                key={index}
                className={`rounded-lg border border-stroke p-4 ${colorClasses.bg} transition-all hover:shadow-md dark:border-strokedark`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClasses.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-bodydark">
                        {card.title}
                      </p>
                      <h4
                        className={`text-xl font-bold ${colorClasses.text}`}
                      >
                        {card.value}
                      </h4>
                    </div>
                  </div>
                  <span
                    className={`h-3 w-3 rounded-full ${colorClasses.badge} animate-pulse`}
                  ></span>
                </div>
                <p className="mt-2 text-xs text-bodydark">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="hidden rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Quick Overview
          </h4>
          <p className="text-sm text-bodydark">System configuration summary</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-lg border border-stroke p-4 transition-all hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-2 dark:bg-meta-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm text-bodydark">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickSummary;
