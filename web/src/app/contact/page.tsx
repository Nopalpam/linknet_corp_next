/**
 * Contact Page
 * 
 * Renders the "contact" page from the Page Builder API.
 * Falls back to a branded contact screen if the API is unavailable.
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import { getPageBySlug } from "@/lib/api";
import { getLocaleFromCookies } from "@/lib/i18n";
import { ComponentRenderer } from "@/components/page-builder/ComponentRenderer";
import { SITE_NAME } from "@/config/env";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with ${SITE_NAME}. We'd love to hear from you.`,
};

export default async function ContactPage() {
  const pageData = await getPageBySlug("contact");

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
          <p className="text-caption-c2 text-warning font-medium uppercase tracking-wider mb-2">Support</p>
          <h1 className="text-headline-h1 font-bold leading-tight">Contact Us</h1>
          <p className="mt-4 max-w-2xl text-body-b4 text-neutral-300">
            Have a question or want to collaborate? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-0 max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="text-headline-h3 font-bold text-black">Get in Touch</h2>
              <p className="mt-4 text-body-b4 text-secondary leading-relaxed">
                Fill out the form and our team will get back to you as soon as possible.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="icon icon__map-pin text-warning" style={{ '--icon-size': '20px' } as React.CSSProperties} />
                  </div>
                  <div>
                    <h3 className="text-body-b5 font-bold text-neutral-900">Address</h3>
                    <p className="text-caption-c2 text-secondary mt-1">Jakarta, Indonesia</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="icon icon__mail text-warning" style={{ '--icon-size': '20px' } as React.CSSProperties} />
                  </div>
                  <div>
                    <h3 className="text-body-b5 font-bold text-neutral-900">Email</h3>
                    <p className="text-caption-c2 text-secondary mt-1">info@linknet.co.id</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="icon icon__phone text-warning" style={{ '--icon-size': '20px' } as React.CSSProperties} />
                  </div>
                  <div>
                    <h3 className="text-body-b5 font-bold text-neutral-900">Phone</h3>
                    <p className="text-caption-c2 text-secondary mt-1">(021) 2556-7888</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Revalidate every 60 seconds */
export const revalidate = 60;
