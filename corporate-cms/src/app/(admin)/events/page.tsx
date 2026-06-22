"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import { EventItem, eventService } from "@/services/event.service";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import EventRegistrationsModal from "./components/EventRegistrationsModal";
import EventsTable from "./components/EventsTable";

export default function EventsPage() {
  const toast = useToast();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRegistrationsModalOpen, setIsRegistrationsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const itemsPerPage = 10;

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number | undefined> = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        sortBy: "startDate",
        sortOrder: "asc",
      };

      if (filterStatus === "PUBLISHED") params.status = "PUBLISHED";
      if (filterStatus === "DRAFT") params.status = "DRAFT";

      const response = await eventService.getPaginated(params);
      setEvents(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.totalItems || 0);
    } catch (err: any) {
      const message = err.message || "Failed to fetch events";
      setError(message);
      setEvents([]);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterStatus, toast]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const handleCreate = () => {
    router.push("/events/create");
  };

  const handleEdit = (event: EventItem) => {
    router.push(`/events/edit/${event.id}`);
  };

  const handleDelete = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  const handleRegistrations = (event: EventItem) => {
    setSelectedEvent(event);
    setIsRegistrationsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    try {
      await eventService.delete(selectedEvent.id);
      toast.success("Event deleted successfully");
      setIsDeleteModalOpen(false);
      await fetchEvents();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Events" />

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage event list and detail content ({totalItems} total)
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Event
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        ) : null}

        <EventsTable
          events={events}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRegistrations={handleRegistrations}
        />

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={selectedEvent?.title || ""}
      />

      <EventRegistrationsModal
        isOpen={isRegistrationsModalOpen}
        onClose={() => setIsRegistrationsModalOpen(false)}
        eventId={selectedEvent?.id || null}
        eventTitle={selectedEvent?.title}
      />
    </div>
  );
}
