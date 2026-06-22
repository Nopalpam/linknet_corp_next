"use client";

import React, { useState } from "react";
import { FolderOpen } from "lucide-react";
import MediaPickerModal, { MediaPickerKind } from "./MediaPickerModal";
import { FileItem } from "@/services/filemanager.service";

type MediaPickerButtonProps = {
  onSelect: (url: string, file: FileItem) => void;
  kind?: MediaPickerKind;
  label?: string;
  title?: string;
  className?: string;
  disabled?: boolean;
};

export default function MediaPickerButton({
  onSelect,
  kind = "image",
  label = "Choose from File Manager",
  title,
  className = "",
  disabled = false,
}: MediaPickerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 ${className}`}
      >
        <FolderOpen className="h-4 w-4" />
        {label}
      </button>

      <MediaPickerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        kind={kind}
        title={title}
        onSelect={(file) => onSelect(file.url, file)}
      />
    </>
  );
}
