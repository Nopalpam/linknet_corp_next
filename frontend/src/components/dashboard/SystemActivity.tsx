"use client";

import React from "react";
import { FiUser, FiEdit, FiLogIn, FiSave } from "react-icons/fi";

const SystemActivity = () => {
  const activities = [
    {
      id: 1,
      user: "Admin Superuser",
      action: "Updated page content",
      target: "About Us",
      time: "5 minutes ago",
      icon: FiEdit,
      color: "blue",
    },
    {
      id: 2,
      user: "Admin Marketing",
      action: "Published new article",
      target: "Company News",
      time: "1 hour ago",
      icon: FiSave,
      color: "green",
    },
    {
      id: 3,
      user: "Admin Content",
      action: "Logged in to system",
      target: "Dashboard",
      time: "2 hours ago",
      icon: FiLogIn,
      color: "purple",
    },
    {
      id: 4,
      user: "Admin Superuser",
      action: "Updated menu structure",
      target: "Main Navigation",
      time: "3 hours ago",
      icon: FiEdit,
      color: "orange",
    },
    {
      id: 5,
      user: "Admin Marketing",
      action: "Added media files",
      target: "Gallery",
      time: "5 hours ago",
      icon: FiSave,
      color: "blue",
    },
  ];

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
    return colors[color];
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
        <button className="text-sm font-medium text-primary hover:underline">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          const colorClasses = getColorClasses(activity.color);

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
                      {activity.action}{" "}
                      <span className="font-medium text-black dark:text-white">
                        {activity.target}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs text-bodydark">{activity.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemActivity;
