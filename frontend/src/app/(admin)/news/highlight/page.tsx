"use client";

import React, { useState, useEffect, useCallback } from "react";
import { newsHighlightService, NewsHighlight, News } from "@/services/news.service";
import { useToast } from "@/context/ToastContext";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export default function NewsHighlightPage() {
  const toast = useToast();
  const [highlights, setHighlights] = useState<NewsHighlight[]>([]);
  const [availableNews, setAvailableNews] = useState<Pick<News, "id" | "titleEn" | "titleId" | "slug" | "newsThumbnail" | "newsDate">[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsId, setSelectedNewsId] = useState<string>("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const fetchHighlights = useCallback(async () => {
    try {
      setLoading(true);
      const [hlRes, availRes] = await Promise.all([
        newsHighlightService.getHighlights(),
        newsHighlightService.getAvailable(),
      ]);
      setHighlights(hlRes.data || []);
      setAvailableNews(availRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch highlights");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchHighlights();
  }, [fetchHighlights]);

  const handleAddHighlight = async () => {
    if (!selectedNewsId) return;
    try {
      await newsHighlightService.createHighlight(parseInt(selectedNewsId, 10));
      toast.success("Highlight added");
      setSelectedNewsId("");
      await fetchHighlights();
    } catch (err: any) {
      toast.error(err.message || "Failed to add highlight");
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await newsHighlightService.removeHighlight(id);
      toast.success("Highlight removed");
      await fetchHighlights();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove highlight");
    }
  };

  // Drag & Drop reorder
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newItems = [...highlights];
    const [dragged] = newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, dragged);
    setHighlights(newItems);
    setDraggedIdx(idx);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    // Save new order
    const updates = highlights.map((h, i) => ({ id: h.id, order: i + 1 }));
    try {
      await newsHighlightService.reorderHighlights(updates);
      toast.success("Order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save order");
      await fetchHighlights();
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="News Highlight" />

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News Highlights</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage featured news. Drag to reorder. ({highlights.length} items)
          </p>
        </div>

        {/* Add Highlight */}
        <div className="mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add News to Highlight
            </label>
            <select
              value={selectedNewsId}
              onChange={(e) => setSelectedNewsId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- Select News --</option>
              {availableNews.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.titleEn} ({formatDate(n.newsDate)})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddHighlight}
            disabled={!selectedNewsId}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>

        {/* Highlights List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : highlights.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500 dark:text-gray-400">
            <p>No highlights configured. Add news articles above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {highlights.map((h, idx) => (
              <div
                key={h.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-4 rounded-lg border p-3 transition-colors ${
                  draggedIdx === idx
                    ? "border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80"
                } cursor-grab active:cursor-grabbing`}
              >
                {/* Drag Handle */}
                <div className="text-gray-400">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z" />
                  </svg>
                </div>

                {/* Position Badge */}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {idx + 1}
                </div>

                {/* Thumbnail */}
                {h.news?.newsThumbnail && (
                  <img
                    src={h.news.newsThumbnail}
                    alt=""
                    className="h-12 w-16 rounded object-cover"
                  />
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {h.news?.titleEn || "Unknown News"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {h.news?.newsDate ? formatDate(h.news.newsDate) : ""}
                    {h.news?.dataStatus !== 1 && (
                      <span className="ml-2 text-yellow-600 dark:text-yellow-400">(Inactive)</span>
                    )}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(h.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  title="Remove highlight"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
