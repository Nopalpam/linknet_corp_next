"use client";
import React from "react";
import { UserProfile } from "@/services/profile.service";
import AvatarUpload from "./AvatarUpload";

interface ProfileHeaderProps {
  profile: UserProfile;
  onAvatarUpdated: (newAvatar: string) => void;
  onShowToast?: (message: string, type: "success" | "error") => void;
}

export default function ProfileHeader({ profile, onAvatarUpdated, onShowToast }: ProfileHeaderProps) {
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 items-center xl:flex-row xl:items-center xl:gap-8">
        {/* Avatar with Upload */}
        <AvatarUpload profile={profile} onAvatarUpdated={onAvatarUpdated} onShowToast={onShowToast} />

        {/* User Info */}
        <div className="flex-1 text-center xl:text-left">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {profile.fullName}
          </h4>
          <div className="flex flex-col items-center gap-2 xl:flex-row xl:gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{profile.username}
            </p>
            {profile.roles && profile.roles.length > 0 && (
              <>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profile.roles[0].name}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
