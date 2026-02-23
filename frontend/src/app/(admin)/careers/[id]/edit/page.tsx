"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { careerService, Career, CareerFormData } from "@/services/career.service";
import { useToast } from "@/context/ToastContext";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CareerForm from "../../components/CareerForm";

export default function EditCareerPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const careerId = params.id as string;

  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCareer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await careerService.getCareerById(careerId);
      setCareer(response.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load career position");
      router.push("/careers");
    } finally {
      setLoading(false);
    }
  }, [careerId, router, toast]);

  useEffect(() => {
    if (careerId) {
      fetchCareer();
    }
  }, [careerId, fetchCareer]);

  const handleSubmit = async (data: CareerFormData) => {
    try {
      setIsSubmitting(true);
      await careerService.updateCareer(careerId, data);
      toast.success("Career position updated successfully");
      router.push("/careers");
    } catch (err: any) {
      toast.error(err.message || "Failed to update career position");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageBreadcrumb pageTitle="Edit Career Position" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-3 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading career data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!career) {
    return (
      <>
        <PageBreadcrumb pageTitle="Edit Career Position" />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-500 dark:text-gray-400">Career position not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBreadcrumb pageTitle={`Edit: ${career.position}`} />
      <CareerForm
        mode="edit"
        initialData={career}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
