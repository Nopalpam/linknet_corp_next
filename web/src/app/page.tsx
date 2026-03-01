/**
 * Homepage
 * 
 * Renders the "home" page from the Page Builder API.
 * Falls back to a welcome screen if the API is unavailable.
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getPageBySlug } from "@/lib/api";
import { getLocaleFromCookies } from "@/lib/i18n";
import { ComponentRenderer } from "@/components/page-builder/ComponentRenderer";
import { SITE_NAME } from "@/config/env";

export const metadata: Metadata = {
  title: `Home | ${SITE_NAME}`,
  description:
    "LinkNet - Connecting Indonesia with reliable and innovative network solutions.",
};

export default async function HomePage() {
  const pageData = await getPageBySlug("home");

  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") || "";
  const locale = getLocaleFromCookies(cookieHeader);

  // Filter visible components and sort by order
  const visibleComponents = (pageData?.components || [])
    .filter((c) => c.isVisible !== false)
    .sort((a, b) => a.order - b.order);

  // If we have page builder data, render dynamically
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

  // Fallback: no backend data yet — show a branded welcome screen
  return (
    <div className="page-builder-content">
      {/* Hero Fallback */}
      <section className="relative overflow-hidden bg-black text-white py-24 md:py-32">
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/bg/bg-hero-home.jpg"
            alt=""
            className="w-full h-full object-cover opacity-40"
          />
        </div>
        <div className="container mx-auto px-4 md:px-0 relative z-10 max-w-3xl text-center">
          <h1 className="text-headline-h1 font-bold leading-tight mb-6">
            We <span className="text-warning">LINK</span> the nation<br />for better lives
          </h1>
          <p className="text-body-b3 text-neutral-200 mb-10 max-w-xl mx-auto">
            Reliable and innovative network solutions for businesses and communities across Indonesia.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/about" className="btn btn-primary btn-lg">Learn More</Link>
            <Link href="/contact" className="btn btn-secondary-outline btn-lg">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* About Fallback */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-0 max-w-5xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-caption-c2 text-warning font-medium uppercase tracking-wider mb-2">About Us</p>
              <h2 className="text-headline-h3 font-bold text-black leading-tight mb-4">About LinkNet</h2>
              <p className="text-body-b4 text-secondary leading-relaxed">
                LinkNet is committed to delivering high-quality, reliable connectivity services.
                With our extensive fiber-optic network, we empower businesses and communities
                to thrive in the digital era.
              </p>
              <Link href="/about" className="btn btn-primary btn-sm mt-6 inline-block">Read More</Link>
            </div>
            <div className="relative h-80 overflow-hidden rounded-[40px] bg-light-2">
              <img
                src="/assets/img/about-preview.jpg"
                alt="About LinkNet"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Fallback */}
      <section className="py-16 md:py-24 bg-warning text-black">
        <div className="container mx-auto px-4 md:px-0 text-center max-w-2xl">
          <h2 className="text-headline-h3 font-bold leading-tight mb-4">Ready to Connect?</h2>
          <p className="text-body-b4 text-black/70 mb-8 max-w-xl mx-auto">
            Get in touch with us to learn how LinkNet can power your business with reliable network infrastructure.
          </p>
          <Link href="/contact" className="btn btn-primary btn-lg bg-black text-white hover:bg-neutral-800">
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
}

/** Revalidate every 60 seconds */
export const revalidate = 60;
