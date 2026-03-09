'use client';

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
import { COMPONENT_MAP, createLocalizer } from '@/lib/componentMap';
import UnknownComponent from '@/components/UnknownComponent';

interface PageRendererProps {
  components: CMSComponent[];
  locale?: string;
}

export default function PageRenderer({ components, locale = 'id' }: PageRendererProps) {
  if (!components || !Array.isArray(components)) {
    return null;
  }

  const t = createLocalizer(locale);

  const visibleComponents = components
    .filter((c) => c.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {visibleComponents.map((component) => {
        const { type, data, id } = component;
        const entry = COMPONENT_MAP[type];

        // Unknown type → safe fallback
        if (!entry) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[PageRenderer] Unknown component type: "${type}" (id: ${id}). Register it in lib/componentMap.ts`);
          }
          return <UnknownComponent key={id} type={type} id={id} />;
        }

        const Component = entry.component;

        // Build style props from CMS custom_class
        const styleProps: Record<string, any> = {};
        if (data?.custom_class) styleProps.className = data.custom_class;

        // Map props via the registry's mapper, or just pass styleProps
        const props = entry.mapProps
          ? entry.mapProps({ data: data || {}, locale, t, styleProps })
          : styleProps;

        return <Component key={id} {...props} />;
      })}
    </>
  );
}
