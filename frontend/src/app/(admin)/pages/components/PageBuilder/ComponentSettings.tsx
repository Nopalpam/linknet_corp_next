"use client";

import React from "react";
import { usePageBuilder, type ComponentSchema } from "./EnhancedPageBuilderContext";
import { normalizeComponentType, getDisplayName } from "./componentRegistry";

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
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
            Select a component from the canvas to edit its properties
          </p>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-8 space-y-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            Keyboard Shortcuts
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Delete</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Del</kbd>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Duplicate</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Ctrl+D</kbd>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Copy</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Ctrl+C</kbd>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Paste</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Ctrl+V</kbd>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Undo</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Ctrl+Z</kbd>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Redo</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Ctrl+Y</kbd>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-600 dark:text-gray-400">Save</span>
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-300 font-mono text-xs">Ctrl+S</kbd>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    updateComponent(selectedComponent.id, { [key]: value });
  };

  const renderSettings = () => {
    // Normalisasi type untuk menangani alias
    const normalizedType = normalizeComponentType(selectedComponent.type);
    
    switch (normalizedType) {
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

      case "hero-section":
        return (
          <>
            <SettingField
              label="Title"
              type="text"
              value={selectedComponent.props.title}
              onChange={(value) => handleChange("title", value)}
            />
            <SettingField
              label="Subtitle"
              type="textarea"
              value={selectedComponent.props.subtitle}
              onChange={(value) => handleChange("subtitle", value)}
            />
            <SettingField
              label="Background Image URL"
              type="text"
              value={selectedComponent.props.backgroundImage}
              onChange={(value) => handleChange("backgroundImage", value)}
              placeholder="https://example.com/hero.jpg"
            />
            <SettingField
              label="Alignment"
              type="select"
              value={selectedComponent.props.alignment}
              onChange={(value) => handleChange("alignment", value)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <input
                  type="checkbox"
                  checked={selectedComponent.props.showButton}
                  onChange={(e) => handleChange("showButton", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show Button
              </label>
            </div>
            {selectedComponent.props.showButton && (
              <>
                <SettingField
                  label="Button Text"
                  type="text"
                  value={selectedComponent.props.buttonText}
                  onChange={(value) => handleChange("buttonText", value)}
                />
                <SettingField
                  label="Button Link"
                  type="text"
                  value={selectedComponent.props.buttonLink}
                  onChange={(value) => handleChange("buttonLink", value)}
                  placeholder="https://example.com"
                />
              </>
            )}
          </>
        );

      case "news_highlight":
        return (
          <>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                <input
                  type="checkbox"
                  checked={selectedComponent.props.showIntro}
                  onChange={(e) => handleChange("showIntro", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show Section Intro
              </label>
            </div>
            {selectedComponent.props.showIntro && (
              <>
                <SettingField
                  label="Intro Label"
                  type="text"
                  value={selectedComponent.props.introLabel}
                  onChange={(value) => handleChange("introLabel", value)}
                  placeholder="Latest News"
                />
                <SettingField
                  label="Intro Title"
                  type="text"
                  value={selectedComponent.props.introTitle}
                  onChange={(value) => handleChange("introTitle", value)}
                  placeholder="Stay Updated"
                />
              </>
            )}
            <SettingField
              label="Background CSS Class"
              type="text"
              value={selectedComponent.props.bgSection}
              onChange={(value) => handleChange("bgSection", value)}
              placeholder="bg-gray-50"
            />
            <SettingField
              label="Featured Count"
              type="select"
              value={String(selectedComponent.props.featuredCount || 1)}
              onChange={(value) => handleChange("featuredCount", parseInt(value))}
              options={[
                { value: "1", label: "1 Featured" },
                { value: "2", label: "2 Featured" },
                { value: "3", label: "3 Featured" },
              ]}
            />
            <SettingField
              label="Grid Count"
              type="select"
              value={String(selectedComponent.props.gridCount || 3)}
              onChange={(value) => handleChange("gridCount", parseInt(value))}
              options={[
                { value: "2", label: "2 Items" },
                { value: "3", label: "3 Items" },
                { value: "4", label: "4 Items" },
                { value: "6", label: "6 Items" },
              ]}
            />
            <SettingField
              label="Order By"
              type="select"
              value={selectedComponent.props.orderBy}
              onChange={(value) => handleChange("orderBy", value)}
              options={[
                { value: "newsDate", label: "News Date" },
                { value: "createdAt", label: "Created Date" },
                { value: "viewCount", label: "View Count" },
              ]}
            />
            <SettingField
              label="Sort Direction"
              type="select"
              value={selectedComponent.props.sortDirection}
              onChange={(value) => handleChange("sortDirection", value)}
              options={[
                { value: "desc", label: "Descending (Newest First)" },
                { value: "asc", label: "Ascending (Oldest First)" },
              ]}
            />
          </>
        );

      case "news_list":
        return (
          <>
            <SettingField
              label="Category Filter"
              type="text"
              value={selectedComponent.props.categoryId}
              onChange={(value) => handleChange("categoryId", value)}
              placeholder="Leave empty for all categories"
            />
            <SettingField
              label="Items Per Page"
              type="select"
              value={String(selectedComponent.props.itemsPerPage || 6)}
              onChange={(value) => handleChange("itemsPerPage", parseInt(value))}
              options={[
                { value: "3", label: "3 Items" },
                { value: "6", label: "6 Items" },
                { value: "9", label: "9 Items" },
                { value: "12", label: "12 Items" },
              ]}
            />
            <SettingField
              label="Grid Columns"
              type="select"
              value={String(selectedComponent.props.gridColumns || 3)}
              onChange={(value) => handleChange("gridColumns", parseInt(value))}
              options={[
                { value: "2", label: "2 Columns" },
                { value: "3", label: "3 Columns" },
                { value: "4", label: "4 Columns" },
              ]}
            />
            <SettingField
              label="Order By"
              type="select"
              value={selectedComponent.props.orderBy}
              onChange={(value) => handleChange("orderBy", value)}
              options={[
                { value: "newsDate", label: "News Date" },
                { value: "createdAt", label: "Created Date" },
                { value: "viewCount", label: "View Count" },
              ]}
            />
            <SettingField
              label="Sort Direction"
              type="select"
              value={selectedComponent.props.sortDirection}
              onChange={(value) => handleChange("sortDirection", value)}
              options={[
                { value: "desc", label: "Descending (Newest First)" },
                { value: "asc", label: "Ascending (Oldest First)" },
              ]}
            />
            <div className="space-y-2 mt-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Display Options</h4>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedComponent.props.showDate}
                  onChange={(e) => handleChange("showDate", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show Date
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedComponent.props.showCategory}
                  onChange={(e) => handleChange("showCategory", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show Category
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedComponent.props.showExcerpt}
                  onChange={(e) => handleChange("showExcerpt", e.target.checked)}
                  className="rounded border-gray-300"
                />
                Show Excerpt
              </label>
            </div>
          </>
        );

      case "pricing-section":
        return (
          <>
            <SettingField
              label="Section Title"
              type="text"
              value={selectedComponent.props.title}
              onChange={(value) => handleChange("title", value)}
            />
            
            <div className="mt-4 space-y-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Pricing Plans
              </h4>
              
              {selectedComponent.props.plans?.map((plan: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Plan {index + 1}: {plan.name}
                    </h5>
                    <button
                      onClick={() => {
                        const newPlans = [...selectedComponent.props.plans];
                        newPlans.splice(index, 1);
                        handleChange("plans", newPlans);
                      }}
                      className="text-red-600 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => {
                      const newPlans = [...selectedComponent.props.plans];
                      newPlans[index].name = e.target.value;
                      handleChange("plans", newPlans);
                    }}
                    placeholder="Plan Name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                  
                  <input
                    type="text"
                    value={plan.price}
                    onChange={(e) => {
                      const newPlans = [...selectedComponent.props.plans];
                      newPlans[index].price = e.target.value;
                      handleChange("plans", newPlans);
                    }}
                    placeholder="Price (e.g., $99)"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                  />
                  
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={plan.isFeatured}
                      onChange={(e) => {
                        const newPlans = [...selectedComponent.props.plans];
                        newPlans[index].isFeatured = e.target.checked;
                        handleChange("plans", newPlans);
                      }}
                      className="rounded border-gray-300"
                    />
                    Featured Plan
                  </label>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Features (one per line)
                    </label>
                    <textarea
                      value={plan.features?.join('\n') || ''}
                      onChange={(e) => {
                        const newPlans = [...selectedComponent.props.plans];
                        newPlans[index].features = e.target.value.split('\n').filter(f => f.trim());
                        handleChange("plans", newPlans);
                      }}
                      rows={4}
                      placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newPlans = [
                    ...(selectedComponent.props.plans || []),
                    {
                      name: "New Plan",
                      price: "$0",
                      features: ["Feature 1", "Feature 2"],
                      isFeatured: false,
                    },
                  ];
                  handleChange("plans", newPlans);
                }}
                className="w-full px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 dark:bg-brand-900/20 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition"
              >
                + Add Plan
              </button>
            </div>
          </>
        );

      default:
        // Jangan tampilkan "No settings available" untuk component yang valid
        // Ini hanya untuk component yang benar-benar tidak dikenali
        return (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              Component type: {selectedComponent.type}
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              This component type does not have custom settings yet.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Component Settings
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Editing: <span className="font-medium">{getDisplayName(selectedComponent.type)}</span>
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
