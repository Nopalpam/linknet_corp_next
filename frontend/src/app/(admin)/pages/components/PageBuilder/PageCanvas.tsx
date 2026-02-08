"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePageBuilder, type ComponentSchema } from "./EnhancedPageBuilderContext";
import { normalizeComponentType, getDisplayName } from "./componentRegistry";

export default function PageCanvas() {
  const { components, selectedComponent, selectComponent, deleteComponent, addComponent, loading } =
    usePageBuilder();
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const component = JSON.parse(data);
        addComponent({
          type: component.type,
          props: component.props,
        });
      }
    } catch (error) {
      console.error("Failed to parse dropped component:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading page...</p>
        </div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center transition-all ${
          isDragOver ? "bg-brand-50 dark:bg-brand-900/20 border-2 border-dashed border-brand-500" : "border-2 border-dashed border-gray-300 dark:border-gray-700"
        } rounded-lg`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
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
            {isDragOver ? "Drop to Add Component" : "Start Building Your Page"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isDragOver 
              ? "Release to add the component to your page"
              : "Drag components from the left panel or click to add them to your page"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-lg shadow-lg min-h-full transition-all ${
        isDragOver ? "ring-2 ring-brand-500 bg-brand-50 dark:bg-brand-900/20" : ""
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        // Clear selection when clicking canvas background
        if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.canvas-content-area')) {
          selectComponent(null);
        }
      }}
    >
      {/* Canvas Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {components.length} Component{components.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isDragOver && (
          <div className="flex items-center gap-2 text-brand-600 text-sm font-medium">
            <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Drop here
          </div>
        )}
      </div>

      {/* Canvas Content */}
      <div className="p-8 space-y-4 canvas-content-area min-h-[400px]">
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
  const { addComponent } = usePageBuilder();
  const [isSectionDragOver, setIsSectionDragOver] = useState(false);

  const handleSectionDragOver = (e: React.DragEvent) => {
    if (component.type === "section") {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "copy";
      setIsSectionDragOver(true);
    }
  };

  const handleSectionDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSectionDragOver(false);
  };

  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSectionDragOver(false);

    try {
      const data = e.dataTransfer.getData("application/json");
      if (data) {
        const droppedComponent = JSON.parse(data);
        // Add component as child of this section
        addComponent(
          {
            type: droppedComponent.type,
            props: droppedComponent.props,
          },
          component.id // parentId
        );
      }
    } catch (error) {
      console.error("Failed to parse dropped component:", error);
    }
  };

  const renderComponent = () => {
    // Normalisasi type untuk menangani alias
    const normalizedType = normalizeComponentType(component.type);
    
    switch (normalizedType) {
      case "section":
        return (
          <div
            style={{
              backgroundColor: component.props.backgroundColor,
              padding: component.props.padding,
            }}
            className={`min-h-[100px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${
              isSectionDragOver ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : ""
            }`}
            onDragOver={handleSectionDragOver}
            onDragLeave={handleSectionDragLeave}
            onDrop={handleSectionDrop}
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
              <div className="flex items-center justify-center h-full min-h-[80px] text-gray-400 text-sm">
                Drop components here or click to add
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

      case "hero-section":
        return (
          <div
            style={{
              position: "relative",
              minHeight: "400px",
              backgroundImage: `url(${component.props.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: component.props.alignment === "left" ? "flex-start" : component.props.alignment === "right" ? "flex-end" : "center",
              padding: "60px 40px",
            }}
            className="rounded-lg overflow-hidden"
          >
            {/* Dark overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            />
            
            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                maxWidth: "800px",
                textAlign: component.props.alignment,
                color: "white",
              }}
            >
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                }}
              >
                {component.props.title}
              </h1>
              <p
                style={{
                  fontSize: "20px",
                  marginBottom: "32px",
                  opacity: 0.9,
                }}
              >
                {component.props.subtitle}
              </p>
              {component.props.showButton && (
                <a
                  href={component.props.buttonLink}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  {component.props.buttonText}
                </a>
              )}
            </div>
          </div>
        );

      case "pricing-section":
        return (
          <div style={{ padding: "40px 0" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: "48px",
              }}
            >
              {component.props.title}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${component.props.plans?.length || 3}, 1fr)`,
                gap: "24px",
              }}
            >
              {component.props.plans?.map((plan: any, index: number) => (
                <div
                  key={index}
                  style={{
                    border: plan.isFeatured ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "32px",
                    backgroundColor: plan.isFeatured ? "#eff6ff" : "white",
                    position: "relative",
                  }}
                >
                  {plan.isFeatured && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        padding: "4px 16px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      POPULAR
                    </div>
                  )}
                  <h3
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginBottom: "8px",
                    }}
                  >
                    {plan.name}
                  </h3>
                  <div style={{ marginBottom: "24px" }}>
                    <span
                      style={{
                        fontSize: "48px",
                        fontWeight: "bold",
                        color: plan.isFeatured ? "#3b82f6" : "#1f2937",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "16px", color: "#6b7280" }}>
                      /month
                    </span>
                  </div>
                  <ul style={{ marginBottom: "24px", listStyle: "none", padding: 0 }}>
                    {plan.features?.map((feature: string, fIndex: number) => (
                      <li
                        key={fIndex}
                        style={{
                          marginBottom: "12px",
                          paddingLeft: "24px",
                          position: "relative",
                          fontSize: "14px",
                        }}
                      >
                        <svg
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "2px",
                            width: "16px",
                            height: "16px",
                            color: "#10b981",
                          }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: plan.isFeatured ? "#3b82f6" : "white",
                      color: plan.isFeatured ? "white" : "#3b82f6",
                      border: plan.isFeatured ? "none" : "2px solid #3b82f6",
                      borderRadius: "8px",
                      fontWeight: "600",
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        // Jangan render "Unknown component" untuk yang valid
        // Tampilkan pesan yang lebih informatif
        return (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-dashed border-yellow-300 dark:border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Component: {getDisplayName(component.type)}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This component type ({component.type}) does not have a renderer yet.
                </p>
              </div>
            </div>
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
      className={`relative group transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
        isSelected ? "ring-2 ring-brand-500 rounded-lg shadow-lg" : ""
      }`}
    >
      {/* Component Content */}
      <div className={`transition-all ${isSelected ? "p-2" : ""}`}>
        {renderComponent()}
      </div>

      {/* Hover Controls */}
      {isSelected && (
        <div className="absolute -top-10 right-0 flex items-center gap-2 bg-brand-600 text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium z-10 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="capitalize">{getDisplayName(component.type)}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="ml-2 hover:text-red-200 transition"
            title="Delete component"
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
      
      {/* Hover Indicator */}
      {!isSelected && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-300 rounded-lg pointer-events-none transition-all duration-200" />
      )}
    </div>
  );
}
