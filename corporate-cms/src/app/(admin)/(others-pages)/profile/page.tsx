"use client";
import React, { useEffect, useState } from "react";
import { Metadata } from "next";
import { useAuth } from "@/context/AuthContext";
import { profileService, UserProfile } from "@/services/profile.service";
import ProfileHeader from "@/components/user-profile/ProfileHeader";
import ProfileInfoCard from "@/components/user-profile/ProfileInfoCard";
import EditProfileModal from "@/components/user-profile/EditProfileModal";
import ToastContainer from "@/components/ui/ToastContainer";
import { useModal } from "@/hooks/useModal";
import { useToast } from "@/hooks/useToast";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();
  const { toasts, removeToast, success, error: showError } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMsg(null);
        const response = await profileService.getProfile();
        setProfile(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        setErrorMsg(errorMessage);
        showError(errorMessage);
        console.error("Fetch profile error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [user, authLoading, showError]);

  const handleAvatarUpdated = (newAvatar: string) => {
    if (profile) {
      setProfile({
        ...profile,
        avatar: newAvatar,
      });
    }
  };

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  // Toast handler
  const handleShowToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      success(message);
    } else {
      showError(message);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="w-10 h-10 text-gray-400 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (errorMsg) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="w-16 h-16 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                Failed to Load Profile
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{errorMsg}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // No profile state
  if (!profile) {
    return (
      <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-gray-500 dark:text-gray-400">No profile data available</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile
          </h3>
          <div className="space-y-6">
            {/* Profile Header with Avatar */}
            <ProfileHeader profile={profile} onAvatarUpdated={handleAvatarUpdated} onShowToast={handleShowToast} />

            {/* Profile Information */}
            <ProfileInfoCard profile={profile} onEditClick={openModal} />
          </div>
        </div>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isOpen}
          onClose={closeModal}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
          onShowToast={handleShowToast}
        />
      </div>
    </>
  );
}
