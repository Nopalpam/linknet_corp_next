"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CKEditorWrapper from "@/components/ui/ckeditor/CKEditorWrapper";
import MultiSelect from "@/components/form/MultiSelect";
import MediaPickerButton from "@/components/media/MediaPickerButton";
import { fileManagerService } from "@/services/filemanager.service";
import { News, newsService } from "@/services/news.service";
import {
  CreateEventData,
  EventItem,
  eventService,
  UpdateEventData,
} from "@/services/event.service";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (success: boolean, message?: string) => void;
  mode: "create" | "edit";
  event: EventItem | null;
}

function slugifyValue(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function createDefaultFormData(defaultStart: string): CreateEventData {
  return {
    title: "",
    hero_title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    location: "",
    venue: "",
    address: "",
    map_embed_url: "",
    organizer_label: "Organized by",
    organizer_name: "PT Link Net Tbk",
    organizer_logo: "",
    ticket_price: "FREE",
    register_link: "",
    registration_end_at: "",
    max_register_participants: 5,
    start_date: defaultStart,
    end_date: "",
    status: "DRAFT",
    article_ids: [],
  };
}

function mapEventToFormData(event: EventItem, defaultStart: string): CreateEventData {
  return {
    title: event.title || "",
    hero_title: event.hero_title || event.heroTitle || "",
    slug: event.slug || "",
    excerpt: event.excerpt || "",
    content: event.content || "",
    cover_image: event.cover_image || event.image || "",
    location: event.location || "",
    venue: event.venue || "",
    address: event.address || "",
    map_embed_url: event.map_embed_url || event.locationSection?.map_embed_url || "",
    organizer_label: event.organizer_label || event.organizer?.label || "Organized by",
    organizer_name: event.organizer_name || event.organizer?.name || "PT Link Net Tbk",
    organizer_logo: event.organizer_logo || event.organizer?.logo || "",
    ticket_price: event.ticket_price || event.ticketPrice || "FREE",
    register_link: event.register_link || event.registerLink || "",
    registration_end_at: toDateTimeInputValue(event.registration_end_at || event.registrationEndedTime),
    max_register_participants: event.max_register_participants ?? event.maxRegisterParticipants ?? 5,
    start_date: toDateTimeInputValue(event.start_date) || defaultStart,
    end_date: toDateTimeInputValue(event.end_date),
    status: event.status || "DRAFT",
    article_ids: event.article_ids || event.articleIds || [],
  };
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  event,
}: EventFormModalProps) {
  const defaultStart = useMemo(() => toDateTimeInputValue(new Date().toISOString()), []);
  const [formData, setFormData] = useState<CreateEventData>(createDefaultFormData(defaultStart));
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [uploadingField, setUploadingField] = useState<"cover_image" | "organizer_logo" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [slugLocked, setSlugLocked] = useState(false);
  const [newsOptions, setNewsOptions] = useState<News[]>([]);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const organizerLogoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCancelled = false;

    const hydrate = async () => {
      try {
        setInitializing(true);
        setError(null);

        const [newsResponse, eventResponse] = await Promise.all([
          newsService.getPaginated({
            page: 1,
            limit: 100,
            status: "PUBLISHED",
            sortBy: "newsDate",
            sortOrder: "desc",
          }),
          mode === "edit" && event?.id ? eventService.getById(event.id) : Promise.resolve(null),
        ]);

        if (isCancelled) {
          return;
        }

        setNewsOptions(newsResponse.data || []);

        if (mode === "edit" && (eventResponse?.data || event)) {
          const resolvedEvent = eventResponse?.data || event;
          if (resolvedEvent) {
            setFormData(mapEventToFormData(resolvedEvent, defaultStart));
            setSlugLocked(Boolean(resolvedEvent.slug));
          }
        } else {
          setFormData(createDefaultFormData(defaultStart));
          setSlugLocked(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || "Failed to prepare event form");
        }
      } finally {
        if (!isCancelled) {
          setInitializing(false);
        }
      }
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [defaultStart, event, isOpen, mode]);

  const setField = <K extends keyof CreateEventData>(key: K, value: CreateEventData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTitleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      title: value,
      hero_title: prev.hero_title || value,
      slug: slugLocked ? prev.slug : slugifyValue(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setSlugLocked(true);
    setField("slug", slugifyValue(value));
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: "cover_image" | "organizer_logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploadingField(targetField);
      setError(null);
      const response = await fileManagerService.uploadFiles([file], "events");
      const uploadedUrl = response.data?.files?.[0]?.url || "";
      setField(targetField, uploadedUrl as CreateEventData[typeof targetField]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    if (!formData.start_date) {
      setError("Start date is required");
      return;
    }

    if ((formData.max_register_participants || 0) < 1) {
      setError("Max register participants must be at least 1");
      return;
    }

    if (
      formData.registration_end_at
      && new Date(formData.registration_end_at).getTime() > new Date(formData.start_date).getTime()
    ) {
      setError("Registration close time must be before or equal to the event start date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: CreateEventData = {
        title: formData.title.trim(),
        hero_title: formData.hero_title?.trim() || "",
        slug: formData.slug?.trim() || undefined,
        excerpt: formData.excerpt?.trim() || "",
        content: formData.content,
        cover_image: formData.cover_image?.trim() || "",
        location: formData.location?.trim() || "",
        venue: formData.venue?.trim() || "",
        address: formData.address?.trim() || "",
        map_embed_url: formData.map_embed_url?.trim() || "",
        organizer_label: formData.organizer_label?.trim() || "",
        organizer_name: formData.organizer_name?.trim() || "",
        organizer_logo: formData.organizer_logo?.trim() || "",
        ticket_price: formData.ticket_price?.trim() || "FREE",
        register_link: formData.register_link?.trim() || "",
        registration_end_at: formData.registration_end_at
          ? new Date(formData.registration_end_at).toISOString()
          : null,
        max_register_participants: Number(formData.max_register_participants || 5),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        status: formData.status || "DRAFT",
        article_ids: formData.article_ids || [],
      };

      if (mode === "create") {
        const response = await eventService.createEvent(payload);
        onSuccess(true, response.message || "Event created successfully");
      } else if (event) {
        const updatePayload: UpdateEventData = payload;
        const response = await eventService.updateEvent(event.id, updatePayload);
        onSuccess(true, response.message || "Event updated successfully");
      }
    } catch (err: any) {
      const message = err.message || "Failed to save event";
      setError(message);
      onSuccess(false, message);
      return;
    } finally {
      setLoading(false);
    }

    onClose();
  };

  if (!isOpen) return null;

  const relatedNewsSelectOptions = newsOptions.map((news) => ({
    value: news.id,
    text: news.title_en,
    selected: (formData.article_ids || []).includes(news.id),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 pt-10 pb-10" onClick={onClose}>
      <div
        className="w-full max-w-6xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {mode === "create" ? "Add Event" : "Edit Event"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage event detail, scheduling, related news, and registration settings.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {initializing ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Hero Title</label>
                  <input
                    type="text"
                    value={formData.hero_title || ""}
                    onChange={(e) => setField("hero_title", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Headline shown on the public detail page"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="event-slug"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={formData.status || "DRAFT"}
                    onChange={(e) => setField("status", e.target.value as CreateEventData["status"])}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
                  <textarea
                    value={formData.excerpt || ""}
                    onChange={(e) => setField("excerpt", e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Short summary for cards and metadata"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Schedule & Registration
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setField("start_date", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.end_date || ""}
                    onChange={(e) => setField("end_date", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Close Time</label>
                  <input
                    type="datetime-local"
                    value={formData.registration_end_at || ""}
                    onChange={(e) => setField("registration_end_at", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Max Participants / Registration</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.max_register_participants ?? 5}
                    onChange={(e) => setField("max_register_participants", Number(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Ticket Price</label>
                  <input
                    type="text"
                    value={formData.ticket_price || ""}
                    onChange={(e) => setField("ticket_price", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="FREE"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">External Register Link</label>
                  <input
                    type="text"
                    value={formData.register_link || ""}
                    onChange={(e) => setField("register_link", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Leave blank to use internal registration form"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Location & Organizer
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">City / Area</label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) => setField("location", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Jakarta"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Venue</label>
                  <input
                    type="text"
                    value={formData.venue || ""}
                    onChange={(e) => setField("venue", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Pullman Jakarta Indonesia Thamrin CBD"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <textarea
                    value={formData.address || ""}
                    onChange={(e) => setField("address", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Full venue address"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Google Maps Embed URL</label>
                  <input
                    type="text"
                    value={formData.map_embed_url || ""}
                    onChange={(e) => setField("map_embed_url", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="https://www.google.com/maps?..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Organizer Label</label>
                  <input
                    type="text"
                    value={formData.organizer_label || ""}
                    onChange={(e) => setField("organizer_label", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Organized by"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Organizer Name</label>
                  <input
                    type="text"
                    value={formData.organizer_name || ""}
                    onChange={(e) => setField("organizer_name", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="PT Link Net Tbk"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Organizer Logo</label>
                  <div className="flex items-start gap-4">
                    {formData.organizer_logo ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.organizer_logo}
                          alt="Organizer logo preview"
                          className="h-20 w-20 rounded-lg border border-gray-200 object-contain p-2 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setField("organizer_logo", "");
                            if (organizerLogoInputRef.current) {
                              organizerLogoInputRef.current.value = "";
                            }
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null}

                    <div className="flex-1">
                      <input
                        ref={organizerLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "organizer_logo")}
                        className="hidden"
                        id="event-organizer-logo-upload"
                      />
                      <label
                        htmlFor="event-organizer-logo-upload"
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400 ${
                          uploadingField === "organizer_logo" ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        {uploadingField === "organizer_logo" ? "Uploading..." : "Choose Logo"}
                      </label>
                      <div className="mt-2">
                        <MediaPickerButton
                          kind="image"
                          label="Choose Logo from File Manager"
                          title="Choose Organizer Logo"
                          onSelect={(url) => setField("organizer_logo", url)}
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.organizer_logo || ""}
                        onChange={(e) => setField("organizer_logo", e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Related Articles
              </h3>
              <MultiSelect
                label="Published News"
                options={relatedNewsSelectOptions}
                defaultSelected={formData.article_ids || []}
                onChange={(selected) => setField("article_ids", selected)}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Selected articles will be shown as related news on the public event detail page.
              </p>
            </section>

            <section className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Content & Visual
              </h3>
              <div className="space-y-4">
                <CKEditorWrapper
                  value={formData.content}
                  onChange={(value) => setField("content", value)}
                  label="Content"
                  placeholder="Write event detail content here..."
                  minHeight="280px"
                />

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
                  <div className="flex items-start gap-4">
                    {formData.cover_image ? (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.cover_image}
                          alt="Cover preview"
                          className="h-24 w-24 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setField("cover_image", "");
                            if (coverInputRef.current) {
                              coverInputRef.current.value = "";
                            }
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : null}

                    <div className="flex-1">
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cover_image")}
                        className="hidden"
                        id="event-cover-upload"
                      />
                      <label
                        htmlFor="event-cover-upload"
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400 ${
                          uploadingField === "cover_image" ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        {uploadingField === "cover_image" ? "Uploading..." : "Choose Image"}
                      </label>
                      <div className="mt-2">
                        <MediaPickerButton
                          kind="image"
                          title="Choose Event Cover"
                          onSelect={(url) => setField("cover_image", url)}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Upload to the existing file manager bucket or paste a URL below.
                      </p>
                      <input
                        type="text"
                        value={formData.cover_image || ""}
                        onChange={(e) => setField("cover_image", e.target.value)}
                        className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingField !== null}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
