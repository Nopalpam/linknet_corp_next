'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

// Lazy load all components
const HeroSection = dynamic(() => import('./HeroSection'));
const TextBlock = dynamic(() => import('./TextBlock'));
const ImageGallery = dynamic(() => import('./ImageGallery'));
const CallToAction = dynamic(() => import('./CallToAction'));
const VideoEmbed = dynamic(() => import('./VideoEmbed'));
const Accordion = dynamic(() => import('./Accordion'));
const Tabs = dynamic(() => import('./Tabs'));
const Testimonials = dynamic(() => import('./Testimonials'));
const TeamGrid = dynamic(() => import('./TeamGrid'));
const StatsCounter = dynamic(() => import('./StatsCounter'));
const PricingTable = dynamic(() => import('./PricingTable'));
const ContactForm = dynamic(() => import('./ContactForm'));
const LatestNews = dynamic(() => import('./LatestNews'));
const CustomHtml = dynamic(() => import('./CustomHtml'));

interface ComponentRendererProps {
  type: string;
  data: any;
  isVisible?: boolean;
  index?: number;
}

export default function ComponentRenderer({
  type,
  data,
  isVisible = true,
  index = 0,
}: ComponentRendererProps) {
  // Don't render if not visible
  if (!isVisible) return null;

  // Wrapper with animation
  const ComponentWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );

  // Render component based on type
  switch (type) {
    case 'hero-section':
      return (
        <ComponentWrapper>
          <HeroSection data={data} />
        </ComponentWrapper>
      );

    case 'text-block':
      return (
        <ComponentWrapper>
          <TextBlock data={data} />
        </ComponentWrapper>
      );

    case 'image-gallery':
      return (
        <ComponentWrapper>
          <ImageGallery data={data} />
        </ComponentWrapper>
      );

    case 'call-to-action':
      return (
        <ComponentWrapper>
          <CallToAction data={data} />
        </ComponentWrapper>
      );

    case 'video-embed':
      return (
        <ComponentWrapper>
          <VideoEmbed data={data} />
        </ComponentWrapper>
      );

    case 'accordion':
      return (
        <ComponentWrapper>
          <Accordion data={data} />
        </ComponentWrapper>
      );

    case 'tabs':
      return (
        <ComponentWrapper>
          <Tabs data={data} />
        </ComponentWrapper>
      );

    case 'testimonials':
      return (
        <ComponentWrapper>
          <Testimonials data={data} />
        </ComponentWrapper>
      );

    case 'team-grid':
      return (
        <ComponentWrapper>
          <TeamGrid data={data} />
        </ComponentWrapper>
      );

    case 'stats-counter':
      return (
        <ComponentWrapper>
          <StatsCounter data={data} />
        </ComponentWrapper>
      );

    case 'pricing-table':
      return (
        <ComponentWrapper>
          <PricingTable data={data} />
        </ComponentWrapper>
      );

    case 'contact-form':
      return (
        <ComponentWrapper>
          <ContactForm data={data} />
        </ComponentWrapper>
      );

    case 'latest-news':
      return (
        <ComponentWrapper>
          <LatestNews data={data} />
        </ComponentWrapper>
      );

    case 'custom-html':
      return (
        <ComponentWrapper>
          <CustomHtml data={data} />
        </ComponentWrapper>
      );

    default:
      console.warn(`Unknown component type: ${type}`);
      return null;
  }
}
