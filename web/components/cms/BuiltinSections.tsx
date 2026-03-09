'use client';

/**
 * Built-in generic CMS section components.
 * 
 * These handle CMS types that don't have dedicated component files—
 * they render data directly from the CMS component_data JSON.
 * Registered in componentMap.ts alongside the heavier components.
 */

/* eslint-disable @next/next/no-img-element */

// ─── TextBlock ──────────────────────────────────────────────────────

export function TextBlock({ label, title, description, className }: {
  label?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {label && <span className="text-caption-c1 text-warning font-bold uppercase">{label}</span>}
        {title && <h2 className="text-headline-h2">{title}</h2>}
        {description && <p className="text-body-b4 text-secondary">{description}</p>}
      </div>
    </section>
  );
}

// ─── CKEditor (Rich HTML) ───────────────────────────────────────────

export function CKEditorBlock({ content, className }: {
  content?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        <div className="detail-post" dangerouslySetInnerHTML={{ __html: content || '' }} />
      </div>
    </section>
  );
}

// ─── Image ──────────────────────────────────────────────────────────

export function ImageBlock({ imageUrl, altText, caption, alignment, className }: {
  imageUrl?: string;
  altText?: string;
  caption?: string;
  alignment?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container" style={{ textAlign: (alignment as any) || 'center' }}>
        {imageUrl && (
          <img src={imageUrl} alt={altText || ''} className="max-w-full rounded-lg" />
        )}
        {caption && <p className="text-caption-c1 text-secondary mt-2">{caption}</p>}
      </div>
    </section>
  );
}

// ─── DocumentList ───────────────────────────────────────────────────

export function DocumentList({ title, documents, className }: {
  title?: string;
  documents?: Array<{ title?: string; filename?: string; url?: string }>;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && <h2 className="text-headline-h2 mb-6">{title}</h2>}
        {Array.isArray(documents) && documents.map((doc, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-200">
            <span className="text-body-b4">{doc.title || doc.filename}</span>
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary underline ml-auto">
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── GenericSection (reusable for list_services, card_with_highlight_summary, etc.) ─

export function GenericSection({ title, description, className }: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && <h2 className="text-headline-h2">{title}</h2>}
        {description && <p className="text-body-b4 text-secondary">{description}</p>}
      </div>
    </section>
  );
}

// ─── AnnouncementList ───────────────────────────────────────────────

export function AnnouncementList({ title, className }: {
  title?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && <h2 className="text-headline-h2 mb-6">{title}</h2>}
        <p className="text-body-b4 text-secondary">Announcements</p>
      </div>
    </section>
  );
}

// ─── TradingViewWidget ──────────────────────────────────────────────

export function TradingViewWidget({ title, className }: {
  title?: string;
  className?: string;
}) {
  return (
    <section className={`lnSection ${className || ''}`}>
      <div className="container">
        {title && <h2 className="text-headline-h2 mb-4">{title}</h2>}
        <p className="text-body-b4 text-secondary">Stock overview widget</p>
      </div>
    </section>
  );
}
