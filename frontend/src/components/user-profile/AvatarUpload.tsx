"use client";
import React, { useState } from "react";
import Image from "next/image";
import { UserProfile } from "@/services/profile.service";
import { profileService } from "@/services/profile.service";
import { useAuth } from "@/context/AuthContext";

interface AvatarUploadProps {
  profile: UserProfile;
  onAvatarUpdated: (newAvatar: string) => void;
  onShowToast?: (message: string, type: "success" | "error") => void;
}

export default function AvatarUpload({ profile, onAvatarUpdated, onShowToast }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const { refreshUser } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Please select a valid image file (JPG, PNG, or WebP)';
      setUploadError(errorMsg);
      if (onShowToast) {
        onShowToast(errorMsg, "error");
      }
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const errorMsg = 'File size must be less than 5MB';
      setUploadError(errorMsg);
      if (onShowToast) {
        onShowToast(errorMsg, "error");
      }
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const response = await profileService.updateAvatar(file);
      
      if (response.data.avatar) {
        onAvatarUpdated(response.data.avatar);
        
        // Refresh auth context to update avatar in header
        await refreshUser();
        
        // Show success toast
        if (onShowToast) {
          onShowToast(response.message || "Avatar updated successfully", "success");
        }
      }

      // Reset input
      event.target.value = '';
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload avatar';
      setUploadError(errorMsg);
      
      // Show error toast
      if (onShowToast) {
        onShowToast(errorMsg, "error");
      }
      
      console.error('Avatar upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    document.getElementById('avatar-upload-input')?.click();
  };

  // Get avatar URL with fallback
  const getAvatarUrl = () => {
    if (imageError || !profile.avatar) {
      return "/images/user/owner.jpg";
    }
    return profile.avatar;
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="w-24 h-24 overflow-hidden border-2 border-gray-200 rounded-full dark:border-gray-700">
          {!imageError && profile.avatar ? (
            <Image
              width={96}
              height={96}
              // src={getAvatarUrl()}
              src="/images/user/ownerzz.jpg"
              alt={profile.fullName}
              className="object-cover w-full h-full"
              onError={() => setImageError(true)}
              unoptimized={true}
            />
          ) : (
            <Image
              width={96}
              height={96}
              // src="/images/user/owner.jpg"
              src="/images/user/ownerzz.jpg"
              alt={profile.fullName}
              className="object-cover w-full h-full"
            />
          )}
        </div>
        
        {/* Upload Overlay */}
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          title="Change avatar"
        >
          {isUploading ? (
            <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        id="avatar-upload-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Click to upload<br />JPG, PNG or WebP (Max 5MB)
      </p>

      {uploadError && (
        <p className="text-xs text-red-500 text-center max-w-[200px]">
          {uploadError}
        </p>
      )}
    </div>
  );
}
