"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import EventFormPage from "../components/EventFormPage";

export default function CreateEventPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Create Event" />
      <EventFormPage mode="create" />
    </div>
  );
}
