"use client";

import React from "react";
import { EventItem } from "@/services/event.service";

interface EventsTableProps {
  events: EventItem[];
  loading: boolean;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
  onRegistrations: (event: EventItem) => void;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventsTable({ events, loading, onEdit, onDelete, onRegistrations }: EventsTableProps) {
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium">No events found</p>
        <p className="text-sm">Create a new event to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="border-b border-gray-200 text-left dark:border-gray-700">
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Event</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Location</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Start</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">End</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">State</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Registrations</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
            <th className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {events.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="max-w-sm px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.cover_image} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                      EV
                    </div>
                  )}
                  <div className="truncate">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">/{item.slug}</p>
                  </div>
                </div>
              </td>
              <td className="max-w-xs px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.venue || "-"}</p>
                  <p className="truncate">{item.location || item.address || "-"}</p>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(item.start_date)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(item.end_date)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  {item.public_state || "-"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                {item.registration_count ?? item.registrationCount ?? 0}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    item.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {item.status === "PUBLISHED" ? "Published" : "Draft"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800"
                    title="Edit"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onRegistrations(item)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-800"
                    title="Registrations"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m10-12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
                    title="Delete"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}