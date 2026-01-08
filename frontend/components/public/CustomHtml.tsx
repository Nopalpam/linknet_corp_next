'use client';

import { motion } from 'framer-motion';
import { CustomHtmlData } from '@/types/component';

interface CustomHtmlProps {
  data: CustomHtmlData;
}

export default function CustomHtml({ data }: CustomHtmlProps) {
  return (
    <section className="custom-html py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className={data.container_class || ''}
          dangerouslySetInnerHTML={{ __html: data.html_content }}
        />
      </div>
    </section>
  );
}
