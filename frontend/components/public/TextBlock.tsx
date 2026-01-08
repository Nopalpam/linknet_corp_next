'use client';

import { motion } from 'framer-motion';
import { TextBlockData } from '@/types/component';

interface TextBlockProps {
  data: TextBlockData;
}

export default function TextBlock({ data }: TextBlockProps) {
  return (
    <section className="text-block py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="content"
          dangerouslySetInnerHTML={{ __html: data.content }}
        />
      </div>
    </section>
  );
}
