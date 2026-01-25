"use client";

import React from "react";
import Image from "next/image";
import { usePageBuilder, type ComponentSchema } from "./EnhancedPageBuilderContext";

export default function PageCanvas() {
  const { components, selectedComponent, selectComponent, deleteComponent } =
    usePageBuilder();

  if (components.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start Building
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add components from the left panel to start building your page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg min-h-full p-8">
      <div className="space-y-4">
        {components.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            isSelected={selectedComponent?.id === component.id}
            onSelect={() => selectComponent(component.id)}
            onDelete={() => deleteComponent(component.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface ComponentRendererProps {
  component: ComponentSchema;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onDelete,
}: ComponentRendererProps) {
  const renderComponent = () => {
    switch (component.type) {
      case "section":
        return (
          <div
            style={{
              backgroundColor: component.props.backgroundColor,
              padding: component.props.padding,
            }}
            className="min-h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
          >
            {component.children && component.children.length > 0 ? (
              <div className="space-y-4">
                {component.children.map((child) => (
                  <ComponentRenderer
                    key={child.id}
                    component={child}
                    isSelected={false}
                    onSelect={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Drop components here
              </div>
            )}
          </div>
        );

      case "heading":
        const HeadingTag = component.props.level || "h2";
        const headingStyle = {
          color: component.props.color,
          fontSize: component.props.fontSize,
          textAlign: component.props.textAlign as any,
          margin: 0,
        };
        
        switch (HeadingTag) {
          case "h1":
            return <h1 style={headingStyle}>{component.props.text}</h1>;
          case "h2":
            return <h2 style={headingStyle}>{component.props.text}</h2>;
          case "h3":
            return <h3 style={headingStyle}>{component.props.text}</h3>;
          case "h4":
            return <h4 style={headingStyle}>{component.props.text}</h4>;
          case "h5":
            return <h5 style={headingStyle}>{component.props.text}</h5>;
          case "h6":
            return <h6 style={headingStyle}>{component.props.text}</h6>;
          default:
            return <h2 style={headingStyle}>{component.props.text}</h2>;
        }

      case "text":
        return (
          <p
            style={{
              fontSize: component.props.fontSize,
              color: component.props.color,
              textAlign: component.props.textAlign,
              margin: 0,
            }}
          >
            {component.props.text}
          </p>
        );

      case "image":
        return (
          <div
            style={{
              width: component.props.width,
              position: "relative",
              minHeight: "200px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={component.props.src}
              alt={component.props.alt}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
              className="rounded-lg"
            />
          </div>
        );

      case "button":
        return (
          <a
            href={component.props.href}
            style={{
              display: "inline-block",
              backgroundColor: component.props.backgroundColor,
              color: component.props.color,
              padding: component.props.padding,
              borderRadius: component.props.borderRadius,
              textDecoration: "none",
            }}
            onClick={(e) => e.preventDefault()}
          >
            {component.props.text}
          </a>
        );

      case "divider":
        return (
          <hr
            style={{
              height: component.props.height,
              backgroundColor: component.props.backgroundColor,
              margin: component.props.margin,
              border: "none",
            }}
          />
        );

      default:
        return (
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Unknown component: {component.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group ${
        isSelected ? "ring-2 ring-brand-500 rounded-lg" : ""
      }`}
    >
      {/* Component Content */}
      <div className={isSelected ? "p-2" : ""}>{renderComponent()}</div>

      {/* Hover Controls */}
      {isSelected && (
        <div className="absolute -top-8 right-0 flex items-center gap-2 bg-brand-600 text-white px-3 py-1 rounded-lg shadow-lg text-xs font-medium">
          <span>{component.type}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 hover:text-red-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
