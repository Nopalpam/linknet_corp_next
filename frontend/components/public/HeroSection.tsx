'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { HeroSectionData } from '@/types/component';

interface HeroSectionProps {
  data: HeroSectionData;
}

export default function HeroSection({ data }: HeroSectionProps) {
  return (
    <section
      className="hero-section position-relative d-flex align-items-center"
      style={{
        minHeight: '500px',
        backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      />

      <div className="container position-relative z-1">
        <div className="row justify-content-center text-center text-white">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="display-3 fw-bold mb-4">{data.title}</h1>
              {data.subtitle && (
                <p className="lead fs-4 mb-4">{data.subtitle}</p>
              )}
              {data.ctaText && data.ctaLink && (
                <Link href={data.ctaLink} className="btn btn-primary btn-lg">
                  {data.ctaText}
                </Link>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
