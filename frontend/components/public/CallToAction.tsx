'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CallToActionData } from '@/types/component';

interface CallToActionProps {
  data: CallToActionData;
}

export default function CallToAction({ data }: CallToActionProps) {
  return (
    <section
      className="call-to-action py-5"
      style={{ backgroundColor: data.backgroundColor || '#007bff' }}
    >
      <div className="container">
        <div className="row justify-content-center text-center text-white">
          <div className="col-lg-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="display-4 fw-bold mb-3">{data.title}</h2>
              {data.description && (
                <p className="lead mb-4">{data.description}</p>
              )}
              <Link
                href={data.buttonLink}
                className="btn btn-light btn-lg"
              >
                {data.buttonText}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
