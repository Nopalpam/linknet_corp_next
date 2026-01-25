"use client";

import React from "react";
import { usePageBuilder } from "./EnhancedPageBuilderContext";

interface ComponentType {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  defaultProps: Record<string, any>;
}

const availableComponents: ComponentType[] = [
  {
    type: "section",
    label: "Section",
    category: "Layout",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
      </svg>
    ),
    defaultProps: {
      backgroundColor: "#ffffff",
      padding: "40px",
    },
  },
  {
    type: "heading",
    label: "Heading",
    category: "Content",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    defaultProps: {
      text: "Heading Text",
      level: "h2",
      color: "#000000",
      fontSize: "32px",
      textAlign: "left",
    },
  },
  {
    type: "text",
    label: "Text",
    category: "Content",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
    ),
    defaultProps: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      fontSize: "16px",
      color: "#333333",
      textAlign: "left",
    },
  },
  {
    type: "image",
    label: "Image",
    category: "Media",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    defaultProps: {
      src: "https://placehold.co/600x400",
      alt: "Image",
      width: "100%",
    },
  },
  {
    type: "button",
    label: "Button",
    category: "Interactive",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
    defaultProps: {
      text: "Click Me",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      padding: "12px 24px",
      borderRadius: "6px",
      href: "#",
    },
  },
  {
    type: "divider",
    label: "Divider",
    category: "Layout",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
    defaultProps: {
      height: "1px",
      backgroundColor: "#e5e7eb",
      margin: "20px 0",
    },
  },
];

export default function ComponentLibrary() {
  const { addComponent } = usePageBuilder();

  const categories = Array.from(
    new Set(availableComponents.map((c) => c.category))
  );

  const handleAddComponent = (component: ComponentType) => {
    addComponent({
      type: component.type,
      props: component.defaultProps,
    });
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Components
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Click to add components to your page
      </p>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              {category}
            </h4>
            <div className="space-y-2">
              {availableComponents
                .filter((c) => c.category === category)
                .map((component) => (
                  <button
                    key={component.type}
                    onClick={() => handleAddComponent(component)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-500 dark:text-gray-400">
                      {component.icon}
                    </span>
                    <span className="font-medium">{component.label}</span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Components can be nested. Add a Section first,
          then add other components inside it.
        </p>
      </div>
    </div>
  );
}
