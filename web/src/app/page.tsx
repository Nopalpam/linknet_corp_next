import type { Metadata } from "next";
import { getPageBySlug, getHighlightedNews } from "@/lib/api";
import { Section, SectionHeading, Button } from "@/components/ui";
import type { NewsArticle, PageComponent } from "@/types";
import { SITE_NAME } from "@/config/env";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: `Home | ${SITE_NAME}`,
  description:
    "LinkNet - Connecting Indonesia with reliable and innovative network solutions.",
};

export default async function HomePage() {
  // Fetch homepage data & highlighted news from backend API
  const [pageData, highlightedNews] = await Promise.all([
    getPageBySlug("home"),
    getHighlightedNews(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <HeroSection components={pageData?.components} />

      {/* About Preview */}
      <AboutPreview />

      {/* Highlighted News */}
      {highlightedNews.length > 0 && (
        <NewsHighlights news={highlightedNews} />
      )}

      {/* CTA Section */}
      <CTASection />
    </>
  );
}

// ---- Sub-components ----

function HeroSection({ components }: { components?: PageComponent[] }) {
  // Try to get hero content from backend page components
  const hero = components?.find(
    (c) => c.componentType === "hero" || c.componentType === "banner"
  );

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {hero?.title || "Connecting Indonesia"}
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            {hero?.subtitle ||
              "Reliable and innovative network solutions for businesses and communities across Indonesia."}
          </p>
          <div className="mt-10 flex gap-4">
            <Button href="/about" variant="primary" className="bg-white text-blue-900 hover:bg-blue-50">
              Learn More
            </Button>
            <Button href="/contact" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative element */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/30 blur-3xl" />
      </div>
    </section>
  );
}

function AboutPreview() {
  return (
    <Section className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            title="About LinkNet"
            subtitle="Building digital infrastructure for a connected Indonesia"
            centered={false}
          />
          <p className="text-gray-600 leading-relaxed">
            LinkNet is committed to delivering high-quality, reliable
            connectivity services. With our extensive fiber-optic network, we
            empower businesses and communities to thrive in the digital era.
          </p>
          <div className="mt-8">
            <Button href="/about">Read More</Button>
          </div>
        </div>
        <div className="relative h-80 overflow-hidden rounded-2xl bg-gray-100">
          <div className="flex h-full items-center justify-center text-gray-400">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </div>
        </div>
      </div>
    </Section>
  );
}

function NewsHighlights({ news }: { news: NewsArticle[] }) {
  return (
    <Section className="bg-gray-50">
      <SectionHeading
        title="Latest News"
        subtitle="Stay updated with our latest developments"
      />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {news.slice(0, 3).map((article) => (
          <article
            key={article.id}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {article.image && (
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6">
              <time className="text-xs font-medium text-gray-500">
                {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h3 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                <Link href={`/news/${article.slug}`}>{article.title}</Link>
              </h3>
              {article.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {article.excerpt}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function CTASection() {
  return (
    <Section className="bg-blue-600 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Connect?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
          Get in touch with us to learn how LinkNet can power your business
          with reliable network infrastructure.
        </p>
        <div className="mt-8">
          <Button
            href="/contact"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            Contact Us Today
          </Button>
        </div>
      </div>
    </Section>
  );
}
