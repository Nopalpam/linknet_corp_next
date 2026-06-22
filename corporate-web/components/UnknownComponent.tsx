'use client';

/**
 * UnknownComponent — Safe fallback for unregistered CMS component types.
 * 
 * - Development: Renders a visible yellow warning box with the component type name.
 * - Production: Renders nothing (null) — the page continues normally.
 */

interface UnknownComponentProps {
  type: string;
  id: string;
}

export default function UnknownComponent({ type, id }: UnknownComponentProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <section className="lnSection bg-yellow-50 border border-yellow-200 my-2">
      <div className="container py-4">
        <p className="text-body-b5 text-yellow-700">
          ⚠ Unknown component type: <code className="font-mono bg-yellow-100 px-1 rounded">{type}</code>
          <span className="text-yellow-500 text-xs ml-2">(id: {id})</span>
        </p>
        <p className="text-xs text-yellow-600 mt-1">
          Register this type in <code className="font-mono">lib/componentMap.ts</code> to render it.
        </p>
      </div>
    </section>
  );
}
