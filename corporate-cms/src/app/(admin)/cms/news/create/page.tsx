"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import NewsFormPage from "@/app/(admin)/news/data/components/NewsFormPage";

export default function CreateNewsPage() {
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Create News" />
      <NewsFormPage mode="create" />
    </div>
  );
}
