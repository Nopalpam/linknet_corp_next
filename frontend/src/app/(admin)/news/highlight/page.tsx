"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  newsHighlightService,
  newsService,
  NewsHighlight,
  News,
} from "@/services/news.service";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function NewsHighlightPage() {
  const [highlights, setHighlights] = useState<NewsHighlight[]>([]);
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedNewsIds, setSelectedNewsIds] = useState<{ [position: number]: string }>({});

  const positions = [1, 2, 3, 4, 5];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [highlightRes, newsRes] = await Promise.all([
        newsHighlightService.getHighlights(),
        newsService.getAll(),
      ]);

      const highlightData = highlightRes.data || [];
      const newsData = (newsRes.data || []).filter((n: News) => n.status === "PUBLISHED");

      setHighlights(highlightData);
      setNewsList(newsData);

      // Map position to selected news
      const selected: { [position: number]: string } = {};
      highlightData.forEach((h: NewsHighlight) => {
        selected[h.position] = h.newsId;
      });
      setSelectedNewsIds(selected);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectChange = (position: number, newsId: string) => {
    setSelectedNewsIds((prev) => ({
      ...prev,
      [position]: newsId,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Update highlights for each position
      for (const position of positions) {
        const newsId = selectedNewsIds[position];
        const existingHighlight = highlights.find((h) => h.position === position);

        if (newsId) {
          // Set or update highlight
          await newsHighlightService.setHighlight(newsId, position);
        } else if (existingHighlight) {
          // Remove highlight if no news selected - use the newsId from existing highlight
          await newsHighlightService.removeHighlight(existingHighlight.newsId);
        }
      }

      setMessage({ type: "success", text: "Highlights saved successfully" });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save highlights" });
    } finally {
      setSaving(false);
    }
  };

  const getNewsById = (id: string) => newsList.find((n) => n.id === id);

  const getUsedNewsIds = () => {
    return Object.values(selectedNewsIds).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6">
      <PageBreadCrumb pageTitle="News Highlight" />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">News Highlight</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Select up to 5 news articles to highlight on the homepage
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Highlights Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {positions.map((position) => {
          const selectedNews = selectedNewsIds[position]
            ? getNewsById(selectedNewsIds[position])
            : null;
          const usedIds = getUsedNewsIds();

          return (
            <div
              key={position}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Position #{position}
                </span>
                {selectedNews && (
                  <button
                    onClick={() => handleSelectChange(position, "")}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Thumbnail Preview */}
              <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                {selectedNews?.thumbnail ? (
                  <img
                    src={selectedNews.thumbnail}
                    alt={selectedNews.titleEn}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* News Title */}
              {selectedNews && (
                <p className="mb-3 line-clamp-2 text-sm font-medium text-gray-900 dark:text-white">
                  {selectedNews.titleEn}
                </p>
              )}

              {/* Select Dropdown */}
              <select
                value={selectedNewsIds[position] || ""}
                onChange={(e) => handleSelectChange(position, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Select news...</option>
                {newsList.map((news) => {
                  const isUsed = usedIds.includes(news.id) && selectedNewsIds[position] !== news.id;
                  return (
                    <option key={news.id} value={news.id} disabled={isUsed}>
                      {news.titleEn} {isUsed && "(In use)"}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
