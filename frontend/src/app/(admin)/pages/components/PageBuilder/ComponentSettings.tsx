"use client";

import React from "react";
import { usePageBuilder, type ComponentSchema } from "./EnhancedPageBuilderContext";

export default function ComponentSettings() {
  const { selectedComponent, updateComponent } = usePageBuilder();

  if (!selectedComponent) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            No Component Selected
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Select a component from the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, { [key]: value });
  };

  const renderSettings = () => {
    switch (selectedComponent.type) {
      case "section":
        return (
          <>
            <SettingField
              label="Background Color"
              type="color"
              value={selectedComponent.props.backgroundColor}
              onChange={(value) => handleChange("backgroundColor", value)}
            />
            <SettingField
              label="Padding"
              type="text"
              value={selectedComponent.props.padding}
              onChange={(value) => handleChange("padding", value)}
              placeholder="e.g., 40px"
            />
          </>
        );

      case "heading":
        return (
          <>
            <SettingField
              label="Text"
              type="text"
              value={selectedComponent.props.text}
              onChange={(value) => handleChange("text", value)}
            />
            <SettingField
              label="Level"
              type="select"
              value={selectedComponent.props.level}
              onChange={(value) => handleChange("level", value)}
              options={[
                { value: "h1", label: "H1" },
                { value: "h2", label: "H2" },
                { value: "h3", label: "H3" },
                { value: "h4", label: "H4" },
                { value: "h5", label: "H5" },
                { value: "h6", label: "H6" },
              ]}
            />
            <SettingField
              label="Font Size"
              type="text"
              value={selectedComponent.props.fontSize}
              onChange={(value) => handleChange("fontSize", value)}
              placeholder="e.g., 32px"
            />
            <SettingField
              label="Color"
              type="color"
              value={selectedComponent.props.color}
              onChange={(value) => handleChange("color", value)}
            />
            <SettingField
              label="Text Align"
              type="select"
              value={selectedComponent.props.textAlign}
              onChange={(value) => handleChange("textAlign", value)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </>
        );

      case "text":
        return (
          <>
            <SettingField
              label="Text"
              type="textarea"
              value={selectedComponent.props.text}
              onChange={(value) => handleChange("text", value)}
            />
            <SettingField
              label="Font Size"
              type="text"
              value={selectedComponent.props.fontSize}
              onChange={(value) => handleChange("fontSize", value)}
              placeholder="e.g., 16px"
            />
            <SettingField
              label="Color"
              type="color"
              value={selectedComponent.props.color}
              onChange={(value) => handleChange("color", value)}
            />
            <SettingField
              label="Text Align"
              type="select"
              value={selectedComponent.props.textAlign}
              onChange={(value) => handleChange("textAlign", value)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </>
        );

      case "image":
        return (
          <>
            <SettingField
              label="Image URL"
              type="text"
              value={selectedComponent.props.src}
              onChange={(value) => handleChange("src", value)}
              placeholder="https://example.com/image.jpg"
            />
            <SettingField
              label="Alt Text"
              type="text"
              value={selectedComponent.props.alt}
              onChange={(value) => handleChange("alt", value)}
            />
            <SettingField
              label="Width"
              type="text"
              value={selectedComponent.props.width}
              onChange={(value) => handleChange("width", value)}
              placeholder="e.g., 100% or 500px"
            />
          </>
        );

      case "button":
        return (
          <>
            <SettingField
              label="Button Text"
              type="text"
              value={selectedComponent.props.text}
              onChange={(value) => handleChange("text", value)}
            />
            <SettingField
              label="Link (URL)"
              type="text"
              value={selectedComponent.props.href}
              onChange={(value) => handleChange("href", value)}
              placeholder="https://example.com"
            />
            <SettingField
              label="Background Color"
              type="color"
              value={selectedComponent.props.backgroundColor}
              onChange={(value) => handleChange("backgroundColor", value)}
            />
            <SettingField
              label="Text Color"
              type="color"
              value={selectedComponent.props.color}
              onChange={(value) => handleChange("color", value)}
            />
            <SettingField
              label="Padding"
              type="text"
              value={selectedComponent.props.padding}
              onChange={(value) => handleChange("padding", value)}
              placeholder="e.g., 12px 24px"
            />
            <SettingField
              label="Border Radius"
              type="text"
              value={selectedComponent.props.borderRadius}
              onChange={(value) => handleChange("borderRadius", value)}
              placeholder="e.g., 6px"
            />
          </>
        );

      case "divider":
        return (
          <>
            <SettingField
              label="Height"
              type="text"
              value={selectedComponent.props.height}
              onChange={(value) => handleChange("height", value)}
              placeholder="e.g., 1px"
            />
            <SettingField
              label="Color"
              type="color"
              value={selectedComponent.props.backgroundColor}
              onChange={(value) => handleChange("backgroundColor", value)}
            />
            <SettingField
              label="Margin"
              type="text"
              value={selectedComponent.props.margin}
              onChange={(value) => handleChange("margin", value)}
              placeholder="e.g., 20px 0"
            />
          </>
        );

      default:
        return <p className="text-sm text-gray-600">No settings available</p>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Component Settings
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Editing: <span className="font-medium">{selectedComponent.type}</span>
        </p>
      </div>

      <div className="space-y-4">{renderSettings()}</div>
    </div>
  );
}

interface SettingFieldProps {
  label: string;
  type: "text" | "color" | "select" | "textarea";
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

function SettingField({
  label,
  type,
  value,
  onChange,
  placeholder,
  options,
}: SettingFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-brand-500"
        />
      )}
    </div>
  );
}
