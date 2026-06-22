"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import EventFormPage from "../../components/EventFormPage";
import { useParams } from "next/navigation";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Edit Event" />
      <EventFormPage mode="edit" eventId={params.id} />
    </div>
  );
}
