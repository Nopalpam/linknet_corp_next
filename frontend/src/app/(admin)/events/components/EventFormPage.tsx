"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CKEditorWrapper from "@/components/ui/ckeditor/CKEditorWrapper";
import MultiSelect from "@/components/form/MultiSelect";
import MediaPickerButton from "@/components/media/MediaPickerButton";
import { useToast } from "@/context/ToastContext";
import { fileManagerService } from "@/services/filemanager.service";
import { News, newsService } from "@/services/news.service";
import {
  CreateEventData,
  EventItem,
  eventService,
  UpdateEventData,
} from "@/services/event.service";

type Mode = "create" | "edit";

interface EventFormPageProps {
  mode: Mode;
  eventId?: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function toIsoOrNull(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function createDefaultFormData(defaultStart: string): CreateEventData {
  return {
    title: "",
    title_id: "",
    hero_title: "",
    hero_title_id: "",
    slug: "",
    excerpt: "",
    excerpt_id: "",
    content: "",
    content_id: "",
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
    title: event.title_en || event.title || "",
    title_id: event.title_id || "",
    hero_title: event.hero_title_en || event.hero_title || event.heroTitle || "",
    hero_title_id: event.hero_title_id || "",
    slug: event.slug || "",
    excerpt: event.excerpt_en || event.excerpt || "",
    excerpt_id: event.excerpt_id || "",
    content: event.content_en || event.content || "",
    content_id: event.content_id || "",
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

export default function EventFormPage({ mode, eventId }: EventFormPageProps) {
  const router = useRouter();
  const toast = useToast();
  const defaultStart = useMemo(() => toDateTimeInputValue(new Date().toISOString()), []);
  const [formData, setFormData] = useState<CreateEventData>(createDefaultFormData(defaultStart));
  const [event, setEvent] = useState<EventItem | null>(null);
  const [newsOptions, setNewsOptions] = useState<News[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"main" | "content">("main");
  const [contentLocale, setContentLocale] = useState<"en" | "id">("en");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [uploadingField, setUploadingField] = useState<"cover_image" | "organizer_logo" | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const organizerLogoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    newsService
      .getPaginated({
        page: 1,
        limit: 100,
        status: "PUBLISHED",
        sortBy: "newsDate",
        sortOrder: "desc",
      })
      .then((response) => {
        if (!cancelled) setNewsOptions(response.data || []);
      })
      .catch(() => {
        if (!cancelled) setNewsOptions([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode !== "edit" || !eventId) {
      setFormData(createDefaultFormData(defaultStart));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    eventService
      .getById(eventId)
      .then((response) => {
        if (cancelled) return;
        const item = response.data;
        setEvent(item);
        setFormData(mapEventToFormData(item, defaultStart));
        setSlugTouched(Boolean(item.slug));
      })
      .catch((err: any) => {
        const message = err.message || "Failed to load event";
        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [defaultStart, eventId, mode, toast]);

  useEffect(() => {
    const nextSlug = slugify(formData.slug || "");
    if (!nextSlug) {
      setSlugStatus("idle");
      return undefined;
    }

    const timer = window.setTimeout(() => {
      void checkSlug(nextSlug);
    }, 450);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.slug, eventId, mode]);

  const pageTitle = mode === "create" ? "Create Event" : "Edit Event";

  const updateField = <K extends keyof CreateEventData>(key: K, value: CreateEventData[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
    if (key === "slug") setSlugStatus("idle");
  };

  const handleTitleChange = (value: string) => {
    setFormData((current) => ({
      ...current,
      title: value,
      hero_title: current.hero_title || value,
      slug: slugTouched ? current.slug : slugify(value),
    }));
  };

  const generateSlug = () => {
    const nextSlug = slugify(formData.title);
    setSlugTouched(false);
    updateField("slug", nextSlug);
    if (nextSlug) void checkSlug(nextSlug);
  };

  const checkSlug = async (slugValue = formData.slug || "") => {
    const normalized = slugify(slugValue);
    if (!normalized) {
      setSlugStatus("idle");
      return;
    }

    setSlugStatus("checking");
    try {
      const response = await eventService.checkSlug(normalized, mode === "edit" ? eventId : undefined);
      setFormData((current) => ({ ...current, slug: response.data.slug }));
      setSlugStatus(response.data.available ? "available" : "taken");
    } catch (err: any) {
      setSlugStatus("idle");
      toast.error(err.message || "Failed to check slug");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: "cover_image" | "organizer_logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      updateField(targetField, uploadedUrl as CreateEventData[typeof targetField]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  };

  const validate = () => {
    if (!formData.title.trim()) return "Title (EN) is required";
    if (!formData.slug?.trim()) return "Slug is required";
    if (slugStatus === "taken") return "Slug is already registered";
    if (!formData.content.trim()) return "Content (EN) is required";
    if (!formData.start_date) return "Start date is required";
    if ((formData.max_register_participants || 0) < 1) return "Max participants must be at least 1";

    const registrationEndAt = formData.registration_end_at ? new Date(formData.registration_end_at) : null;
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;

    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      return "End date must be greater than or equal to the start date";
    }

    if (registrationEndAt && startDate && registrationEndAt.getTime() > startDate.getTime()) {
      return "Registration close time must be before or equal to the event start date";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const payload: CreateEventData | UpdateEventData = {
      title: formData.title.trim(),
      title_id: formData.title_id?.trim() || "",
      hero_title: formData.hero_title?.trim() || "",
      hero_title_id: formData.hero_title_id?.trim() || "",
      slug: slugify(formData.slug || formData.title),
      excerpt: formData.excerpt?.trim() || "",
      excerpt_id: formData.excerpt_id?.trim() || "",
      content: formData.content,
      content_id: formData.content_id || "",
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
      registration_end_at: toIsoOrNull(formData.registration_end_at),
      max_register_participants: Number(formData.max_register_participants || 5),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: toIsoOrNull(formData.end_date),
      status: formData.status || "DRAFT",
      article_ids: formData.article_ids || [],
    };

    try {
      if (mode === "create") {
        const response = await eventService.createEvent(payload as CreateEventData);
        toast.success(response.message || "Event created successfully");
        router.replace(`/events/edit/${response.data.id}`);
      } else if (eventId) {
        const response = await eventService.updateEvent(eventId, payload as UpdateEventData);
        setEvent(response.data);
        toast.success(response.message || "Event updated successfully");
        router.refresh();
      }
    } catch (err: any) {
      const message = err.message || "Failed to save event";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId || !event) return;
    if (!window.confirm(`Delete "${event.title}"?`)) return;

    try {
      await eventService.delete(eventId);
      toast.success("Event deleted successfully");
      router.push("/events");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete event");
    }
  };

  if (loading) {
    return <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-900">Loading event...</div>;
  }

  const relatedNewsSelectOptions = newsOptions.map((news) => ({
    value: news.id,
    text: news.title_en,
    selected: (formData.article_ids || []).includes(news.id),
  }));

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage multilingual event content, schedule, location, registration, and related news.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          ) : null}

          <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
            {(["main", "content"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "main" ? "Main Content" : "Detail Content"}
              </button>
            ))}
          </div>

          {activeTab === "main" ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <TextInput label="Title (EN)" required value={formData.title} onChange={handleTitleChange} />
                <TextInput label="Title (ID)" value={formData.title_id || ""} onChange={(value) => updateField("title_id", value)} />
                <TextInput label="Hero Title (EN)" value={formData.hero_title || ""} onChange={(value) => updateField("hero_title", value)} />
                <TextInput label="Hero Title (ID)" value={formData.hero_title_id || ""} onChange={(value) => updateField("hero_title_id", value)} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col gap-2 md:flex-row">
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateField("slug", slugify(e.target.value));
                    }}
                    onBlur={() => checkSlug()}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="event-slug"
                  />
                  <button
                    type="button"
                    onClick={generateSlug}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Generate Slug
                  </button>
                </div>
                <p className={`mt-1 text-xs ${slugStatus === "available" ? "text-green-600" : slugStatus === "taken" ? "text-red-600" : "text-gray-500"}`}>
                  {slugStatus === "checking" && "Checking slug..."}
                  {slugStatus === "available" && "Slug is available"}
                  {slugStatus === "taken" && "Slug is already registered"}
                  {slugStatus === "idle" && "Use lowercase letters, numbers, and hyphens."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <TextArea label="Excerpt (EN)" value={formData.excerpt || ""} onChange={(value) => updateField("excerpt", value)} />
                <TextArea label="Excerpt (ID)" value={formData.excerpt_id || ""} onChange={(value) => updateField("excerpt_id", value)} />
              </div>

              <ImageField
                label="Cover Image"
                value={formData.cover_image || ""}
                inputRef={coverInputRef}
                inputId="event-cover-upload-page"
                uploading={uploadingField === "cover_image"}
                onUpload={(e) => handleImageUpload(e, "cover_image")}
                onChange={(value) => updateField("cover_image", value)}
                onRemove={() => updateField("cover_image", "")}
                previewClassName="object-cover"
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                {(["en", "id"] as const).map((locale) => (
                  <button
                    key={locale}
                    type="button"
                    onClick={() => setContentLocale(locale)}
                    className={`px-4 py-2 text-sm font-medium ${
                      contentLocale === locale ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Content ({locale.toUpperCase()})
                  </button>
                ))}
              </div>

              {contentLocale === "en" ? (
                <CKEditorWrapper
                  key="event-content-en"
                  value={formData.content}
                  onChange={(value) => updateField("content", value)}
                  label="Content (EN)"
                  placeholder="Write event detail content here..."
                  minHeight="340px"
                />
              ) : (
                <CKEditorWrapper
                  key="event-content-id"
                  value={formData.content_id || ""}
                  onChange={(value) => updateField("content_id", value)}
                  label="Content (ID)"
                  placeholder="Tulis detail event di sini..."
                  minHeight="340px"
                />
              )}

              <MultiSelect
                label="Related Published News"
                options={relatedNewsSelectOptions}
                defaultSelected={formData.article_ids || []}
                onChange={(selected) => updateField("article_ids", selected)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Selected articles will be shown as related news on the public event detail page.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Location & Organizer</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="City / Area" value={formData.location || ""} onChange={(value) => updateField("location", value)} placeholder="Jakarta" />
            <TextInput label="Venue" value={formData.venue || ""} onChange={(value) => updateField("venue", value)} placeholder="Pullman Jakarta Indonesia Thamrin CBD" />
            <TextArea label="Address" value={formData.address || ""} onChange={(value) => updateField("address", value)} className="md:col-span-2" rows={2} />
            <TextInput label="Google Maps Embed URL" value={formData.map_embed_url || ""} onChange={(value) => updateField("map_embed_url", value)} className="md:col-span-2" />
            <TextInput label="Organizer Label" value={formData.organizer_label || ""} onChange={(value) => updateField("organizer_label", value)} />
            <TextInput label="Organizer Name" value={formData.organizer_name || ""} onChange={(value) => updateField("organizer_name", value)} />
            <div className="md:col-span-2">
              <ImageField
                label="Organizer Logo"
                value={formData.organizer_logo || ""}
                inputRef={organizerLogoInputRef}
                inputId="event-organizer-logo-upload-page"
                uploading={uploadingField === "organizer_logo"}
                onUpload={(e) => handleImageUpload(e, "organizer_logo")}
                onChange={(value) => updateField("organizer_logo", value)}
                onRemove={() => updateField("organizer_logo", "")}
                previewClassName="object-contain p-2"
              />
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <SideCard title="Schedule & Registration">
          <DateInput label="Start Date" required value={formData.start_date} onChange={(value) => updateField("start_date", value)} />
          <DateInput label="End Date" value={formData.end_date || ""} onChange={(value) => updateField("end_date", value)} />
          <DateInput label="Registration Close Time" value={formData.registration_end_at || ""} onChange={(value) => updateField("registration_end_at", value)} />
          <TextInput label="Ticket Price" value={formData.ticket_price || ""} onChange={(value) => updateField("ticket_price", value)} placeholder="FREE" />
          <TextInput label="External Register Link" value={formData.register_link || ""} onChange={(value) => updateField("register_link", value)} placeholder="Leave blank for internal form" />
          <NumberInput label="Max Participants / Registration" value={formData.max_register_participants ?? 5} onChange={(value) => updateField("max_register_participants", value)} min={1} />
        </SideCard>

        <SideCard title="Status">
          <SelectInput label="Status" value={formData.status || "DRAFT"} onChange={(value) => updateField("status", value as CreateEventData["status"])}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </SelectInput>
          <ReadonlyMeta label="Created" value={event?.created_at ? new Date(event.created_at).toLocaleString("en-US") : "-"} />
          <ReadonlyMeta label="Updated" value={event?.updated_at ? new Date(event.updated_at).toLocaleString("en-US") : "-"} />
        </SideCard>

        <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
          <div className="flex flex-col gap-2">
            <button type="submit" disabled={saving || uploadingField !== null} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "Saving..." : mode === "create" ? "Submit" : "Update"}
            </button>
            {mode === "edit" ? (
              <button type="button" onClick={handleDelete} className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
                Delete
              </button>
            ) : null}
            <button type="button" onClick={() => router.push("/events")} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
          </div>
        </div>
      </aside>
    </form>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-900">
      <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="datetime-local"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || min || 0)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        {children}
      </select>
    </div>
  );
}

function ImageField({
  label,
  value,
  inputRef,
  inputId,
  uploading,
  onUpload,
  onChange,
  onRemove,
  previewClassName,
}: {
  label: string;
  value: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  inputId: string;
  uploading: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (value: string) => void;
  onRemove: () => void;
  previewClassName?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={`${label} preview`}
              className={`h-24 w-24 rounded-lg border border-gray-200 dark:border-gray-700 ${previewClassName || ""}`}
            />
            <button
              type="button"
              onClick={() => {
                onRemove();
                if (inputRef.current) inputRef.current.value = "";
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
          <input ref={inputRef} type="file" accept="image/*" onChange={onUpload} className="hidden" id={inputId} />
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-blue-500 dark:hover:text-blue-400 ${
              uploading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {uploading ? "Uploading..." : "Choose Image"}
          </label>
          <div className="mt-2">
            <MediaPickerButton
              kind="image"
              title={`Choose ${label}`}
              onSelect={(url) => onChange(url)}
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}

function ReadonlyMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  );
}
