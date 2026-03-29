"use client";

import React, { useEffect, useState } from "react";
import {
  FiBookOpen,
  FiEye,
  FiTrendingUp,
  FiRefreshCw,
  FiCalendar,
  FiFileText,
  FiChevronRight,
} from "react-icons/fi";
import {
  analyticsService,
  NewsAnalyticsData,
} from "@/services/analytics.service";

const TopNewsWidget = () => {
  const [data, setData] = useState<NewsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"top" | "recent">("top");

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await analyticsService.getNewsAnalytics(5);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getViewsBadgeColor = (views: number) => {
    if (views >= 1000)
      return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (views >= 100)
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (views >= 10)
      return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
  };

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-stroke p-6 pb-4 dark:border-strokedark">
        <div className="flex items-center gap-2">
          <FiBookOpen className="h-5 w-5 text-purple-500" />
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Content Analytics
          </h4>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="rounded-lg border border-stroke p-1.5 text-bodydark transition-colors hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
            title="Refresh"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          {/* Source Badge */}
          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            Source: Internal CMS
          </span>
        </div>
      </div>

      {/* Summary Stats Bar */}
      {data?.summary && (
        <div className="grid grid-cols-2 gap-0 border-b border-stroke dark:border-strokedark sm:grid-cols-4">
          {[
            {
              label: "Total Articles",
              value: data.summary.totalArticles,
              icon: FiFileText,
            },
            {
              label: "Published",
              value: data.summary.totalPublished,
              icon: FiBookOpen,
            },
            {
              label: "Draft",
              value: data.summary.totalDraft,
              icon: FiCalendar,
            },
            {
              label: "Total Views",
              value: data.summary.totalViews,
              icon: FiEye,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 border-r border-stroke p-4 last:border-r-0 dark:border-strokedark"
              >
                <Icon className="h-4 w-4 text-bodydark" />
                <div>
                  <p className="text-lg font-bold text-black dark:text-white">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-bodydark">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-stroke dark:border-strokedark">
        {(["top", "recent"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-bodydark hover:text-black dark:hover:text-white"
            }`}
          >
            {tab === "top" ? (
              <span className="flex items-center justify-center gap-1.5">
                <FiTrendingUp className="h-4 w-4" />
                Top 5 Most Viewed
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <FiCalendar className="h-4 w-4" />
                Recently Published
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 pt-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center gap-4"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1">
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
                <div className="h-6 w-16 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : activeTab === "top" ? (
          <div className="space-y-3">
            {data?.topArticles && data.topArticles.length > 0 ? (
              data.topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-meta-4"
                >
                  {/* Rank Badge */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : index === 1
                          ? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          : index === 2
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Article Info */}
                  <div className="min-w-0 flex-1">
                    <h6 className="truncate text-sm font-medium text-black dark:text-white">
                      {article.title}
                    </h6>
                    <div className="mt-1 flex items-center gap-2 text-xs text-bodydark">
                      {article.category && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700">
                          {article.category.name}
                        </span>
                      )}
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getViewsBadgeColor(article.viewCount)}`}
                    >
                      <FiEye className="h-3 w-3" />
                      {article.viewCount.toLocaleString()}
                    </span>
                    <span className="text-xs text-bodydark">
                      {article.uniqueViewCount.toLocaleString()} unique
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-bodydark">
                <FiBookOpen className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p>Belum ada data artikel</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.recentArticles && data.recentArticles.length > 0 ? (
              data.recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-meta-4"
                >
                  {/* Date Icon */}
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30">
                    <FiCalendar className="h-4 w-4 text-blue-500" />
                  </div>

                  {/* Article Info */}
                  <div className="min-w-0 flex-1">
                    <h6 className="truncate text-sm font-medium text-black dark:text-white">
                      {article.title}
                    </h6>
                    <div className="mt-1 flex items-center gap-2 text-xs text-bodydark">
                      {article.category && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700">
                          {article.category.name}
                        </span>
                      )}
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>

                  {/* Views */}
                  <span
                    className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getViewsBadgeColor(article.viewCount)}`}
                  >
                    <FiEye className="h-3 w-3" />
                    {article.viewCount.toLocaleString()}
                  </span>

                  <FiChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition-colors group-hover:text-gray-500 dark:text-gray-600" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-bodydark">
                <FiBookOpen className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p>Belum ada artikel terbaru</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNewsWidget;
