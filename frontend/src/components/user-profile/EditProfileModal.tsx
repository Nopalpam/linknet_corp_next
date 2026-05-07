"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "../ui/modal";
import Label from "../form/Label";
import { UserProfile, UpdateProfileData } from "@/services/profile.service";
import { profileService } from "@/services/profile.service";
import { useAuth } from "@/context/AuthContext";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
  onShowToast?: (message: string, type: "success" | "error") => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
  onShowToast,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    username: profile.username,
    phone: profile.phone || "",
    currentPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshUser } = useAuth();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        phone: profile.phone || "",
        currentPassword: "",
      });
      setError(null);
    }
  }, [isOpen, profile]);

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName?.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName?.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.username?.trim()) {
      setError("Username is required");
      return false;
    }
    
    // Validate phone format (optional but if provided, must be valid)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\d\s\-+()]+$/;
      if (!phoneRegex.test(formData.phone)) {
        setError("Please enter a valid phone number");
        return false;
      }
    }

    if (!formData.currentPassword?.trim()) {
      setError("Current password is required to save profile changes");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean data - only send changed fields
      const updateData: UpdateProfileData = {};
      if (formData.firstName !== profile.firstName) {
        updateData.firstName = formData.firstName?.trim();
      }
      if (formData.lastName !== profile.lastName) {
        updateData.lastName = formData.lastName?.trim();
      }
      if (formData.username !== profile.username) {
        updateData.username = formData.username?.trim();
      }
      if (formData.phone !== profile.phone) {
        updateData.phone = formData.phone?.trim() || undefined;
      }

      // If nothing changed, just close
      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      updateData.currentPassword = formData.currentPassword;

      const response = await profileService.updateProfile(updateData);
      
      if (response.data) {
        // Show success toast
        if (onShowToast) {
          onShowToast(response.message || "Profile updated successfully", "success");
        }
        
        // Update profile data
        onProfileUpdated(response.data);
        
        // Refresh auth context to update user data in header
        await refreshUser();
        
        // Close modal immediately
        onClose();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      
      // Show error toast
      if (onShowToast) {
        onShowToast(errorMessage, "error");
      }
      
      console.error("Update profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] m-4">
      <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
        <div className="px-2 pr-14">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Profile
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update your personal information
          </p>
        </div>

        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <svg
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <form onSubmit={handleSubmit} className="mt-6" autoComplete="off">
          <div className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* First Name */}
            <div>
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <input
                id="firstName"
                type="text"
                value={formData.firstName || ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="Enter first name"
                disabled={isLoading}
                required
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <input
                id="lastName"
                type="text"
                value={formData.lastName || ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Enter last name"
                disabled={isLoading}
                required
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
              />
            </div>

            {/* Username */}
            <div>
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <input
                id="username"
                type="text"
                value={formData.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Enter username"
                disabled={isLoading}
                required
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone</Label>
              <input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="Enter phone number"
                disabled={isLoading}
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
              />
            </div>

            {/* Email (readonly) */}
            <div>
              <Label htmlFor="email">Email (cannot be changed)</Label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
              />
            </div>

            <div>
              <Label htmlFor="currentPassword">
                Current Password <span className="text-red-500">*</span>
              </Label>
              <input
                id="currentPassword"
                type="password"
                autoComplete="off"
                value={formData.currentPassword || ""}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                placeholder="Confirm current password"
                disabled={isLoading}
                required
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 mt-8 sm:flex-row sm:justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
