/**
 * About Page
 * 
 * Renders the "about" page from the Page Builder API.
 * Falls back to a branded about screen if the API is unavailable.
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPageBySlug } from "@/lib/api";
import { getLocaleFromCookies } from "@/lib/i18n";
import { ComponentRenderer } from "@/components/page-builder/ComponentRenderer";
import { SITE_NAME } from "@/config/env";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME} - our vision, mission, and the team behind reliable network solutions in Indonesia.`,
};

export default async function AboutPage() {
  const pageData = await getPageBySlug("about");

  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const locale = getLocaleFromCookies(cookieHeader);

  const visibleComponents = (pageData?.components || [])
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  if (visibleComponents.length > 0) {
    return (
      <div className="page-builder-content">
        {visibleComponents.map((component) => (
          <ComponentRenderer
            key={component.id}
            component={component}
            locale={locale}
          />
        ))}
      </div>
    );
  }

  // Fallback: no backend data yet
  return (
    <div className="page-builder-content">
      {/* Page Header */}
      <section className="relative overflow-hidden bg-black text-white py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-0 max-w-5xl">
          <p className="text-caption-c2 text-warning font-medium uppercase tracking-wider mb-2">Company</p>
          <h1 className="text-headline-h1 font-bold leading-tight">About Us</h1>
          <p className="mt-4 max-w-2xl text-body-b4 text-neutral-300">
            Discover our story, values, and the people driving innovation in Indonesia&apos;s digital infrastructure.
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-0 max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-caption-c2 text-warning font-medium uppercase tracking-wider mb-2">Who We Are</p>
              <h2 className="text-headline-h3 font-bold text-black leading-tight mb-4">LinkNet Corporation</h2>
              <div className="space-y-4 text-body-b4 text-secondary leading-relaxed">
                <p>
                  LinkNet is one of Indonesia&apos;s leading fixed broadband
                  network providers, delivering high-speed internet
                  connectivity to residential and business customers across
                  the nation.
                </p>
                <p>
                  With an extensive fiber-optic infrastructure, we are
                  committed to bridging the digital divide and empowering
                  communities through reliable, high-quality connectivity
                  services.
                </p>
              </div>
            </div>
            <div className="relative h-80 overflow-hidden rounded-[40px] bg-light-2 lg:h-96 flex items-center justify-center">
              <span className="icon icon__globe text-neutral-200" style={{ '--icon-size': '80px' } as React.CSSProperties} />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 md:py-24 bg-light-2">
        <div className="container mx-auto px-4 md:px-0 max-w-5xl">
          <h2 className="text-headline-h3 font-bold text-black text-center mb-10 leading-tight">Vision & Mission</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-8 border border-neutral-100">
              <div className="mb-4 w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <span className="icon icon__eye text-warning" style={{ '--icon-size': '24px' } as React.CSSProperties} />
              </div>
              <h3 className="text-body-b3 font-bold text-black">Our Vision</h3>
              <p className="mt-3 text-body-b4 text-secondary leading-relaxed">
                To be the most trusted digital infrastructure provider, connecting every corner of Indonesia.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 border border-neutral-100">
              <div className="mb-4 w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                <span className="icon icon__rocket text-warning" style={{ '--icon-size': '24px' } as React.CSSProperties} />
              </div>
              <h3 className="text-body-b3 font-bold text-black">Our Mission</h3>
              <p className="mt-3 text-body-b4 text-secondary leading-relaxed">
                Delivering innovative, reliable, and affordable broadband services while fostering digital literacy and economic growth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Revalidate every 60 seconds */
export const revalidate = 60;
