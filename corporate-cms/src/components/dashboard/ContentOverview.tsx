"use client";

import React, { useEffect, useState } from "react";
import { FiFileText, FiMenu, FiBookOpen, FiImage } from "react-icons/fi";
import { dashboardService, ContentOverviewData } from "@/services/dashboard.service";

const ContentOverview = () => {
  const [data, setData] = useState<ContentOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const content = await dashboardService.getContentOverview();
        setData(content);
      } catch {
        // Keep loading state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const contentStats = [
    {
      title: "Total Pages",
      value: data ? data.pages.total.toString() : "...",
      icon: FiFileText,
      color: "blue",
      status: data ? `${data.pages.published} Published, ${data.pages.draft} Draft` : "Loading...",
    },
    {
      title: "Active Menus",
      value: data ? data.menus.total.toString() : "...",
      icon: FiMenu,
      color: "green",
      status: "Active menus",
    },
    {
      title: "News & Articles",
      value: data ? data.news.total.toString() : "...",
      icon: FiBookOpen,
      color: "purple",
      status: data ? `${data.news.published} Published, ${data.news.draft} Draft` : "Loading...",
    },
    {
      title: "Media Files",
      value: data ? data.files.total.toString() : "...",
      icon: FiImage,
      color: "orange",
      status: "Images, Videos, Documents",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      blue: {
        bg: "bg-blue-50 dark:bg-blue-950",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-950",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-600 dark:text-green-400",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950",
        border: "border-purple-200 dark:border-purple-800",
        text: "text-purple-600 dark:text-purple-400",
      },
      orange: {
        bg: "bg-orange-50 dark:bg-orange-950",
        border: "border-orange-200 dark:border-orange-800",
        text: "text-orange-600 dark:text-orange-400",
      },
    };
    return colors[color];
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-6">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Content Overview
        </h4>
        <p className="text-sm text-bodydark">Website content statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {contentStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);

          return (
            <div
              key={index}
              className={`rounded-lg border ${colorClasses.border} ${colorClasses.bg} p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-bodydark">
                    {stat.title}
                  </p>
                  <h4 className={`mt-2 text-3xl font-bold ${colorClasses.text}`}>
                    {stat.value}
                  </h4>
                  <p className="mt-2 text-xs text-bodydark">{stat.status}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses.bg} border ${colorClasses.border}`}>
                  <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContentOverview;
