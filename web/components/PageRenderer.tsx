/**
 * PageRenderer — Renders CMS Page Builder components on the public website.
 * 
 * Uses the Auto Component Registry (lib/componentMap.ts) to resolve
 * CMS component types to React components. Unknown types are safely
 * handled by UnknownComponent (visible in dev, hidden in prod).
 * 
 * To add a new CMS component, edit lib/componentMap.ts — no changes
 * needed here.
 */

import React from 'react';
import { CMSComponent } from '@/lib/componentRegistry';
import { COMPONENT_MAP, createLocalizer, normalizeComponentData } from '@/lib/componentMap';
import UnknownComponent from '@/components/UnknownComponent';

interface PageRendererProps {
  components: CMSComponent[];
  locale?: string;
  pageContext?: {
    product?: string | null;
    promo?: string | null;
    source?: string | null;
  };
}

function normalizeDebugToken(value: unknown, fallback: string) {
  const normalized = String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function getComponentDebugAttributes(component: CMSComponent, index: number) {
  const componentName = component.type || 'unknown_component';
  const componentId = component.id || `${componentName}-${component.order ?? index}`;
  const safeComponentName = normalizeDebugToken(componentName, 'unknown-component');
  const safeComponentId = normalizeDebugToken(componentId, `${index}`);

  return {
    id: `cms-component-${safeComponentName}-${safeComponentId}`,
    'data-cms-component': componentName,
    'data-cms-component-name': componentName,
    'data-cms-component-id': componentId,
    'data-cms-component-order': String(component.order ?? index),
    'data-cms-debug-id': `${componentName}:${componentId}`,
  };
}

export default function PageRenderer({ components, locale = 'id', pageContext }: PageRendererProps) {
  if (!components || !Array.isArray(components)) {
    return null;
  }

  const t = createLocalizer(locale);

  const visibleComponents = components
    .filter((c) => c.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleComponents.map((component, index) => {
        const { type, id } = component;
        const data = normalizeComponentData({
          ...(component.data || {}),
          ...(component.mainData !== undefined ? { mainData: component.mainData } : {}),
        });
        const entry = COMPONENT_MAP[type];
        const debugAttributes = getComponentDebugAttributes(component, index);

        // Unknown type → safe fallback
        if (!entry) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[PageRenderer] Unknown component type: "${type}" (id: ${id}). Register it in lib/componentMap.ts`);
          }
          return (
            <div
              key={debugAttributes.id}
              {...debugAttributes}
              style={{ display: 'contents' }}
              suppressHydrationWarning
            >
              <UnknownComponent type={type} id={id} />
            </div>
          );
        }

        const Component = entry.component;

        // Build style props from CMS config.className
        const styleProps: Record<string, any> = {};
        if (data.config?.className || data.custom_class) {
          styleProps.className = data.config?.className || data.custom_class;
        }

        // Map props via the registry's mapper. Components without a mapper still
        // receive the CMS payload so one-to-one synced components can render
        // stored Page Builder data instead of silently falling back to static data.
        const props = entry.mapProps
          ? entry.mapProps({ data: data || {}, locale, t, styleProps })
          : {
              data: data || {},
              cmsData: data || {},
              locale,
              pageContext,
              ...styleProps,
            };

        if (!entry.mapProps) {
          props.pageContext = pageContext;
        } else if (pageContext) {
          props.pageContext = pageContext;
        }

        return (
          <div
            key={debugAttributes.id}
            {...debugAttributes}
            style={{ display: 'contents' }}
            suppressHydrationWarning
          >
            <Component {...props} />
          </div>
        );
      })}
    </>
  );
}
