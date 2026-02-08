"use client";

import React from "react";
import type { PageComponent } from "@/services/pages.service";

/**
 * PageComponentRenderer
 * 
 * Renders page components from the page_components table.
 * Each component has:
 * - type (component_type): determines which renderer to use
 * - data (component_data): JSON object with all configuration/props
 * - order (sort_order): display order (already sorted by backend)
 * - isVisible (is_visible): visibility flag (filtered by backend for public)
 * 
 * The data field structure matches the legacy page_components.component_data column,
 * which can contain nested structures (e.g. tabs, children, etc.)
 */

interface PageComponentRendererProps {
  components: PageComponent[];
  className?: string;
}

export default function PageComponentRenderer({ components, className }: PageComponentRendererProps) {
  if (!components || components.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {components.map((component) => (
        <ComponentErrorBoundary key={component.id} componentType={component.type}>
          <SingleComponentRenderer component={component} />
        </ComponentErrorBoundary>
      ))}
    </div>
  );
}

/**
 * Renders a single component based on its type.
 * Handles the component_type → React component mapping.
 */
function SingleComponentRenderer({ component }: { component: PageComponent }) {
  const { type, data } = component;

  switch (type) {
    // === Layout Components ===
    case "section":
      return <SectionComponent data={data} />;
    case "divider":
      return <DividerComponent data={data} />;

    // === Content Components ===
    case "heading":
      return <HeadingComponent data={data} />;
    case "text":
      return <TextComponent data={data} />;
    case "image":
      return <ImageComponent data={data} />;
    case "button":
      return <ButtonComponent data={data} />;

    // === Complex Components (from legacy SQL) ===
    case "hero-section":
    case "hero_section":
      return <HeroSectionComponent data={data} />;
    case "business_tab":
      return <BusinessTabComponent data={data} />;
    case "news_highlight":
      return <NewsHighlightComponent data={data} />;
    case "text-block":
    case "text_block":
      return <TextBlockComponent data={data} />;
    case "call-to-action":
    case "call_to_action":
      return <CallToActionComponent data={data} />;
    case "video-embed":
    case "video_embed":
      return <VideoEmbedComponent data={data} />;
    case "accordion":
      return <AccordionComponent data={data} />;
    case "tabs":
      return <TabsComponent data={data} />;
    case "stats-counter":
    case "stats_counter":
      return <StatsCounterComponent data={data} />;
    case "image-gallery":
    case "image_gallery":
      return <ImageGalleryComponent data={data} />;
    case "custom-html":
    case "custom_html":
      return <CustomHtmlComponent data={data} />;

    default:
      if (process.env.NODE_ENV === "development") {
        return (
          <div className="p-4 my-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Unknown component type: <code>{type}</code>
            </p>
            <pre className="mt-2 text-xs text-yellow-700 overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        );
      }
      return null;
  }
}

// =============================================================================
// Error Boundary
// =============================================================================

class ComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; componentType: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; componentType: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`Component [${this.props.componentType}] render error:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 my-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            ⚠️ Failed to render component: {this.props.componentType}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// =============================================================================
// Basic Components (Page Builder primitives)
// =============================================================================

function SectionComponent({ data }: { data: Record<string, any> }) {
  const { backgroundColor, padding, className, children: nestedChildren } = data;
  
  const style: React.CSSProperties = {};
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (padding) style.padding = padding;

  return (
    <div style={style} className={className || ""}>
      {nestedChildren && Array.isArray(nestedChildren) && nestedChildren.map((child: any, index: number) => (
        <ComponentErrorBoundary key={child.id || index} componentType={child.type}>
          <SingleComponentRenderer
            component={{
              id: child.id || `child-${index}`,
              type: child.type,
              data: child.props || child.data || {},
              order: index,
            }}
          />
        </ComponentErrorBoundary>
      ))}
    </div>
  );
}

function HeadingComponent({ data }: { data: Record<string, any> }) {
  const { text, level = "h2", color, fontSize, textAlign, className } = data;
  const style: React.CSSProperties = {};
  if (color) style.color = color;
  if (fontSize) style.fontSize = fontSize;
  if (textAlign) style.textAlign = textAlign;

  const cls = className || "";

  switch (level) {
    case "h1": return <h1 style={style} className={cls}>{text}</h1>;
    case "h3": return <h3 style={style} className={cls}>{text}</h3>;
    case "h4": return <h4 style={style} className={cls}>{text}</h4>;
    case "h5": return <h5 style={style} className={cls}>{text}</h5>;
    case "h6": return <h6 style={style} className={cls}>{text}</h6>;
    default:   return <h2 style={style} className={cls}>{text}</h2>;
  }
}

function TextComponent({ data }: { data: Record<string, any> }) {
  const { text, content, fontSize, color, textAlign, className } = data;
  const style: React.CSSProperties = {};
  if (fontSize) style.fontSize = fontSize;
  if (color) style.color = color;
  if (textAlign) style.textAlign = textAlign;

  return <p style={style} className={className || ""}>{text || content}</p>;
}

function ImageComponent({ data }: { data: Record<string, any> }) {
  const { src, alt = "Image", width, className } = data;
  
  return (
    <div style={{ width: width || "100%" }} className={className || ""}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "auto", display: "block" }}
        className="rounded-lg"
        loading="lazy"
      />
    </div>
  );
}

function ButtonComponent({ data }: { data: Record<string, any> }) {
  const { text, href = "#", backgroundColor, color, padding, borderRadius, className } = data;
  
  const style: React.CSSProperties = {
    display: "inline-block",
    textDecoration: "none",
  };
  if (backgroundColor) style.backgroundColor = backgroundColor;
  if (color) style.color = color;
  if (padding) style.padding = padding;
  if (borderRadius) style.borderRadius = borderRadius;

  return (
    <a href={href} style={style} className={className || ""}>
      {text}
    </a>
  );
}

function DividerComponent({ data }: { data: Record<string, any> }) {
  const { height = "1px", backgroundColor = "#e5e7eb", margin = "20px 0" } = data;
  
  return (
    <hr
      style={{
        height,
        backgroundColor,
        margin,
        border: "none",
      }}
    />
  );
}

// =============================================================================
// Complex Components (from legacy page_components.sql)
// =============================================================================

/**
 * Hero Section - full-width hero banner
 * Legacy type: 'hero-section' or 'hero_section'
 */
function HeroSectionComponent({ data }: { data: Record<string, any> }) {
  const { title, subtitle, backgroundImage, ctaText, ctaLink } = data;

  return (
    <section
      className="relative py-20 md:py-32 bg-cover bg-center text-white"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundColor: backgroundImage ? undefined : "#1a1a2e",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative container mx-auto px-4 text-center">
        {title && <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>}
        {subtitle && <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">{subtitle}</p>}
        {ctaText && ctaLink && (
          <a
            href={ctaLink}
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

/**
 * Business Tab - tabbed content section
 * Legacy type: 'business_tab' (from page_components.sql)
 * Data structure follows the legacy component_data JSON format
 */
function BusinessTabComponent({ data }: { data: Record<string, any> }) {
  const { intro_label, intro_title, intro_description, tabs = [], bg_color } = data;

  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: bg_color || "#ffffff" }}
    >
      <div className="container mx-auto px-4">
        {/* Intro */}
        <div className="text-center mb-12">
          {typeof intro_label === "string" && <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">{intro_label}</span>}
          {typeof intro_label === "object" && intro_label?.en && <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">{intro_label.en}</span>}
          
          {typeof intro_title === "string" && <h2 className="text-3xl md:text-4xl font-bold mt-2">{intro_title}</h2>}
          {typeof intro_title === "object" && intro_title?.en && <h2 className="text-3xl md:text-4xl font-bold mt-2">{intro_title.en}</h2>}
          
          {typeof intro_description === "string" && <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{intro_description}</p>}
          {typeof intro_description === "object" && intro_description?.en && <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{intro_description.en}</p>}
        </div>

        {/* Tab Navigation */}
        {tabs.length > 0 && (
          <>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {tabs.map((tab: any, index: number) => (
                <button
                  key={tab.id || index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    activeTab === index
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {tabs[activeTab] && (
              <div
                className="relative rounded-xl overflow-hidden min-h-[400px] bg-cover bg-center"
                style={{
                  backgroundImage: tabs[activeTab].background_image
                    ? `url(${tabs[activeTab].background_image})`
                    : undefined,
                  backgroundPosition: tabs[activeTab].bg_position || "center",
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative p-8 md:p-12 text-white flex flex-col justify-center min-h-[400px]">
                  {tabs[activeTab].logo_image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={tabs[activeTab].logo_image}
                      alt={tabs[activeTab].name}
                      className="h-10 mb-6"
                      loading="lazy"
                    />
                  )}
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">{tabs[activeTab].title}</h3>
                  <p className="text-lg opacity-90 max-w-2xl mb-6">{tabs[activeTab].description}</p>
                  {tabs[activeTab].cta_text && tabs[activeTab].cta_link && (
                    <a
                      href={tabs[activeTab].cta_link}
                      className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition w-fit"
                    >
                      {tabs[activeTab].cta_text}
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * News Highlight - shows recent news
 * Legacy type: 'news_highlight' (from page_components.sql)
 */
function NewsHighlightComponent({ data }: { data: Record<string, any> }) {
  const { intro_label, intro_title, bg_section, grid_count = 3, featured_count = 1 } = data;

  return (
    <section className={`py-16 md:py-24 ${bg_section || "bg-gray-50"}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {intro_label && (
            <span className="text-sm font-semibold text-brand-600 uppercase tracking-wider">
              {intro_label}
            </span>
          )}
          {intro_title && (
            <h2 className="text-3xl md:text-4xl font-bold mt-2">{intro_title}</h2>
          )}
        </div>
        {/* News items would be fetched separately or passed in data */}
        <div className={`grid grid-cols-1 md:grid-cols-${grid_count} gap-6`}>
          {Array.from({ length: grid_count + featured_count }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextBlockComponent({ data }: { data: Record<string, any> }) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {data.title && <h2 className="text-3xl font-bold mb-6">{data.title}</h2>}
        {data.content && (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
        )}
      </div>
    </section>
  );
}

function CallToActionComponent({ data }: { data: Record<string, any> }) {
  const { title, subtitle, buttonText, buttonLink, backgroundColor = "#3b82f6" } = data;

  return (
    <section className="py-16 text-white text-center" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>}
        {subtitle && <p className="text-xl mb-8 opacity-90">{subtitle}</p>}
        {buttonText && buttonLink && (
          <a
            href={buttonLink}
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {buttonText}
          </a>
        )}
      </div>
    </section>
  );
}

function VideoEmbedComponent({ data }: { data: Record<string, any> }) {
  const { url, title, poster } = data;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {title && <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
          {url && (
            <iframe
              src={url}
              title={title || "Video"}
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
            />
          )}
          {!url && poster && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={poster} alt={title || "Video poster"} className="w-full h-full object-cover" />
          )}
        </div>
      </div>
    </section>
  );
}

function AccordionComponent({ data }: { data: Record<string, any> }) {
  const { title, items = [] } = data;
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="space-y-3">
          {items.map((item: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50 transition"
              >
                <span>{item.title || item.question}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${openIndex === index ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4 text-gray-600">
                  {item.content || item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabsComponent({ data }: { data: Record<string, any> }) {
  const { title, items = [] } = data;
  const [activeTab, setActiveTab] = React.useState(0);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {items.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === index
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {item.title || item.label}
            </button>
          ))}
        </div>
        {items[activeTab] && (
          <div className="p-4">
            {typeof items[activeTab].content === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: items[activeTab].content }} />
            ) : (
              <p>{JSON.stringify(items[activeTab].content)}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function StatsCounterComponent({ data }: { data: Record<string, any> }) {
  const { title, items = [], backgroundColor } = data;

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: backgroundColor || "#f9fafb" }}
    >
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-brand-600 mb-2">
                {item.value || item.number}
                {item.suffix}
              </div>
              <div className="text-gray-600">{item.label || item.title}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImageGalleryComponent({ data }: { data: Record<string, any> }) {
  const { title, images = [], columns = 3 } = data;

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
          {images.map((img: any, index: number) => (
            <div key={index} className="rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url || img.src}
                alt={img.alt || img.caption || `Image ${index + 1}`}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              {img.caption && (
                <p className="text-sm text-gray-500 mt-2 text-center">{img.caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CustomHtmlComponent({ data }: { data: Record<string, any> }) {
  const { html, content } = data;
  const htmlContent = html || content || "";

  return (
    <div
      className="custom-html-block"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
