"use client";

import React from "react";
import MediaPickerButton from "./MediaPickerButton";
import { MediaPickerKind } from "./MediaPickerModal";
import { FileItem } from "@/services/filemanager.service";

type MediaPathInputProps = {
  value: string;
  onChange: (value: string, file?: FileItem) => void;
  kind?: MediaPickerKind;
  placeholder?: string;
  inputClassName?: string;
  buttonClassName?: string;
  buttonLabel?: string;
  pickerTitle?: string;
  disabled?: boolean;
  type?: string;
  id?: string;
  name?: string;
};

export default function MediaPathInput({
  value,
  onChange,
  kind = "image",
  placeholder = "https://...",
  inputClassName = "",
  buttonClassName = "",
  buttonLabel = "Choose from File Manager",
  pickerTitle,
  disabled = false,
  type = "text",
  id,
  name,
}: MediaPathInputProps) {
  return (
    <div className="space-y-2">
      <input
        id={id}
        name={name}
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName}
      />
      <MediaPickerButton
        kind={kind}
        label={buttonLabel}
        title={pickerTitle}
        disabled={disabled}
        className={buttonClassName}
        onSelect={(url, file) => onChange(url, file)}
      />
    </div>
  );
}
