import type { Metadata } from "next";
import Image from "next/image";
import { getPageBySlug, getManagementsByCategory } from "@/lib/api";
import { Section, SectionHeading } from "@/components/ui";
import type { Management } from "@/types";
import { SITE_NAME } from "@/config/env";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${SITE_NAME} - our vision, mission, and the team behind reliable network solutions in Indonesia.`,
};

export default async function AboutPage() {
  // Fetch about page content and management team from backend
  const [pageData, managementsByCategory] = await Promise.all([
    getPageBySlug("about"),
    getManagementsByCategory(),
  ]);

  // Extract content from page components if available
  const aboutContent = pageData?.components?.find(
    (c) => c.componentType === "content" || c.componentType === "text"
  );
  const visionMission = pageData?.components?.find(
    (c) => c.componentType === "vision-mission" || c.componentType === "highlight"
  );

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            About Us
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-300">
            {pageData?.metaDescription ||
              "Discover our story, values, and the people driving innovation in Indonesia's digital infrastructure."}
          </p>
        </div>
      </section>

      {/* Company Overview */}
      <Section className="bg-white">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="Who We Are"
              subtitle={aboutContent?.subtitle || undefined}
              centered={false}
            />
            <div className="space-y-4 text-gray-600 leading-relaxed">
              {aboutContent?.content ? (
                <div dangerouslySetInnerHTML={{ __html: aboutContent.content }} />
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100 lg:h-96">
            <div className="flex h-full items-center justify-center text-gray-400">
              <svg className="h-20 w-20" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A8.966 8.966 0 0 1 3 12c0-1.264.26-2.467.732-3.558" />
              </svg>
            </div>
          </div>
        </div>
      </Section>

      {/* Vision & Mission */}
      <Section className="bg-gray-50">
        <SectionHeading title="Vision & Mission" />
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Our Vision</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {visionMission?.items?.[0]?.description ||
                "To be the most trusted digital infrastructure provider, connecting every corner of Indonesia."}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
            <p className="mt-3 text-gray-600 leading-relaxed">
              {visionMission?.items?.[1]?.description ||
                "Delivering innovative, reliable, and affordable broadband services while fostering digital literacy and economic growth."}
            </p>
          </div>
        </div>
      </Section>

      {/* Management Team */}
      {Object.keys(managementsByCategory).length > 0 && (
        <Section className="bg-white">
          <SectionHeading
            title="Our Leadership"
            subtitle="Meet the team driving our vision forward"
          />
          {Object.entries(managementsByCategory).map(
            ([category, members]) => (
              <div key={category} className="mb-12 last:mb-0">
                <h3 className="mb-6 text-center text-lg font-semibold uppercase tracking-wider text-gray-500">
                  {category}
                </h3>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {(members as Management[]).map((member) => (
                    <div
                      key={member.id}
                      className="text-center"
                    >
                      <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full bg-gray-100">
                        {member.photo ? (
                          <Image
                            src={member.photo}
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="mt-4 text-lg font-semibold text-gray-900">
                        {member.name}
                      </h4>
                      <p className="text-sm text-gray-500">{member.position}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </Section>
      )}
    </>
  );
}
