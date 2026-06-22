type PageChromeVisibilityProps = {
  showNavbar?: boolean;
  showFooter?: boolean;
};

/** Applies per-page CMS chrome visibility to the navbar/footer owned by the root layout. */
export default function PageChromeVisibility({
  showNavbar = true,
  showFooter = true,
}: PageChromeVisibilityProps) {
  const rules = [
    showNavbar ? "" : "#site-navbar { display: none !important; }",
    showFooter ? "" : "#site-footer { display: none !important; }",
  ].filter(Boolean).join("\n");

  return rules ? <style>{rules}</style> : null;
}
