"use client";

import React, { useEffect, useState } from "react";
import { FiUser, FiEdit, FiLogIn, FiSave, FiTrash2, FiUpload, FiPlus, FiActivity } from "react-icons/fi";
import { dashboardService, RecentActivityItem } from "@/services/dashboard.service";
import Link from "next/link";

const actionIconMap: Record<string, { icon: typeof FiEdit; color: string }> = {
  create: { icon: FiPlus, color: "green" },
  update: { icon: FiEdit, color: "blue" },
  delete: { icon: FiTrash2, color: "orange" },
  login: { icon: FiLogIn, color: "purple" },
  logout: { icon: FiLogIn, color: "purple" },
  upload: { icon: FiUpload, color: "blue" },
};

function getActionMeta(action: string) {
  return actionIconMap[action] || { icon: FiActivity, color: "blue" };
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

const SystemActivity = () => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getRecentActivity(10);
        setActivities(data);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: {
        bg: "bg-blue-100 dark:bg-blue-900",
        text: "text-blue-600 dark:text-blue-400",
      },
      green: {
        bg: "bg-green-100 dark:bg-green-900",
        text: "text-green-600 dark:text-green-400",
      },
      purple: {
        bg: "bg-purple-100 dark:bg-purple-900",
        text: "text-purple-600 dark:text-purple-400",
      },
      orange: {
        bg: "bg-orange-100 dark:bg-orange-900",
        text: "text-orange-600 dark:text-orange-400",
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Recent Activity
          </h4>
          <p className="text-sm text-bodydark">Latest admin actions</p>
        </div>
        <Link
          href="/log-activity"
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse rounded-lg border border-stroke p-4 dark:border-strokedark">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-center text-sm text-bodydark py-8">No recent activity</p>
        ) : (
          activities.map((activity) => {
            const meta = getActionMeta(activity.action);
            const Icon = meta.icon;
            const colorClasses = getColorClasses(meta.color);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 rounded-lg border border-stroke p-4 transition-all hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colorClasses.bg}`}>
                  <Icon className={`h-5 w-5 ${colorClasses.text}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {activity.user}
                      </p>
                      <p className="text-sm text-bodydark">
                        {activity.description}{" "}
                        {activity.module && (
                          <span className="font-medium text-black dark:text-white">
                            {activity.module}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-bodydark whitespace-nowrap ml-2">
                      {timeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SystemActivity;
