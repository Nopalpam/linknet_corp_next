"use client";

import React from "react";
import { usePageBuilder } from "./EnhancedPageBuilderContext";
import { getAllComponents, getComponentsByCategory, type ComponentConfig } from "./componentRegistry";

// Icon components
const IconComponents: Record<string, React.ReactNode> = {
  hero: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  pricing: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  section: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
    </svg>
  ),
  heading: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  button: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  divider: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
};

export default function ComponentLibrary() {
  const { addComponent } = usePageBuilder();
  const [draggedComponent, setDraggedComponent] = React.useState<string | null>(null);

  // Get components from registry
  const componentsByCategory = getComponentsByCategory();
  const categories = Object.keys(componentsByCategory);

  const handleAddComponent = (config: ComponentConfig) => {
    addComponent({
      type: config.type,
      props: config.defaultProps,
    });
  };

  const handleDragStart = (e: React.DragEvent, config: ComponentConfig) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: config.type,
        props: config.defaultProps,
      })
    );
    
    setDraggedComponent(config.type);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedComponent(null);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Components
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Drag components to the canvas or click to add
      </p>

      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              {category}
            </h4>
            <div className="space-y-2">
              {componentsByCategory[category].map((config) => (
                <button
                  key={config.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, config)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleAddComponent(config)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition cursor-move ${
                    draggedComponent === config.type ? "opacity-50 scale-95" : ""
                  }`}
                  title={`Drag or click to add ${config.displayName}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                    {IconComponents[config.icon] || IconComponents.section}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {config.displayName}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Tip:</strong> Drag & drop or click components to add them to your page.
        </p>
      </div>
    </div>
  );
}
