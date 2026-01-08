'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccordionData } from '@/types/component';
import { FaChevronDown } from 'react-icons/fa';

interface AccordionProps {
  data: AccordionData;
}

export default function Accordion({ data }: AccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<number[]>(
    data.items.map((item, i) => (item.is_open ? i : -1)).filter((i) => i !== -1)
  );

  const toggleItem = (index: number) => {
    if (data.allow_multiple) {
      setOpenIndexes((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenIndexes((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  return (
    <section className="accordion-section py-5">
      <div className="container">
        <div className="accordion">
          {data.items.map((item, index) => (
            <motion.div
              key={index}
              className="accordion-item mb-3 border rounded"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button
                className="accordion-button w-100 d-flex justify-content-between align-items-center p-3 bg-light border-0"
                onClick={() => toggleItem(index)}
              >
                <strong>{item.title}</strong>
                <motion.div
                  animate={{ rotate: openIndexes.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndexes.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="accordion-content overflow-hidden"
                  >
                    <div
                      className="p-3"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
