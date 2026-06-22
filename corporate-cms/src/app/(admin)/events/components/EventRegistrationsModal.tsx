"use client";

import React, { useEffect, useState } from "react";
import { EventRegistrationItem, eventService } from "@/services/event.service";

interface EventRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle?: string;
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

export default function EventRegistrationsModal({
  isOpen,
  onClose,
  eventId,
  eventTitle,
}: EventRegistrationsModalProps) {
  const [registrations, setRegistrations] = useState<EventRegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !eventId) {
      return;
    }

    let isCancelled = false;

    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await eventService.getEventRegistrations(eventId, {
          page: currentPage,
          limit: 10,
          search: searchQuery || undefined,
        });

        if (!isCancelled) {
          setRegistrations(response.data || []);
          setTotalPages(response.pagination?.totalPages || 1);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setRegistrations([]);
          setError(err.message || "Failed to load registrations");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchRegistrations();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, eventId, isOpen, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setExpandedId(null);
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10" onClick={onClose}>
      <div
        className="w-full max-w-6xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Event Registrations</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {eventTitle ? `Registrations for ${eventTitle}` : "Inspect company submissions and participant details."}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, PIC, or email..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:max-w-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {currentPage} of {totalPages}</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-6 py-16 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No registrations found for this event.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left dark:border-gray-800 dark:bg-gray-950/40">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Company</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">PIC</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Participants</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Submitted</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {registrations.map((registration) => {
                  const isExpanded = expandedId === registration.id;

                  return (
                    <React.Fragment key={registration.id}>
                      <tr className="align-top hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{registration.company_name}</p>
                            <p>{registration.company_email}</p>
                            {registration.company_phone ? <p>{registration.company_phone}</p> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{registration.pic_name}</p>
                            <p>{registration.pic_email}</p>
                            {registration.pic_phone ? <p>{registration.pic_phone}</p> : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {registration.participant_count}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {formatDateTime(registration.submitted_at || registration.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                            {registration.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : registration.id)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="bg-gray-50/70 dark:bg-gray-950/20">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Company Notes</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {registration.notes || "No notes provided."}
                                </p>
                                {registration.company_address ? (
                                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-900 dark:text-white">Address:</span> {registration.company_address}
                                  </p>
                                ) : null}
                              </div>

                              <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                                <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Participants</h3>
                                <div className="space-y-3">
                                  {(registration.participants || []).map((participant, index) => (
                                    <div key={`${registration.id}-${participant.email}-${index}`} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{participant.name}</p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">{participant.email}</p>
                                      {participant.job_title ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{participant.job_title}</p>
                                      ) : null}
                                      {participant.phone ? (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{participant.phone}</p>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}