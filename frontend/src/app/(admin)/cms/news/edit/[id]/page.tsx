"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import NewsFormPage from "@/app/(admin)/news/data/components/NewsFormPage";
import { useParams } from "next/navigation";

export default function EditNewsPage() {
  const params = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Edit News" />
      <NewsFormPage mode="edit" newsId={params.id} />
    </div>
  );
}
