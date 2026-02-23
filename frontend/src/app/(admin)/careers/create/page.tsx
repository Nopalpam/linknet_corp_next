"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { careerService, CareerFormData } from "@/services/career.service";
import { useToast } from "@/context/ToastContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CareerForm from "../components/CareerForm";

export default function CreateCareerPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CareerFormData) => {
    try {
      setIsSubmitting(true);
      await careerService.createCareer(data);
      toast.success("Career position created successfully");
      router.push("/careers");
    } catch (err: any) {
      toast.error(err.message || "Failed to create career position");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Create Career Position" />
      <CareerForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
