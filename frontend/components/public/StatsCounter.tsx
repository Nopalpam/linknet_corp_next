'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { StatsCounterData } from '@/types/component';

interface StatsCounterProps {
  data: StatsCounterData;
}

export default function StatsCounter({ data }: StatsCounterProps) {
  const [counts, setCounts] = useState<number[]>(data.stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data.animate || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          data.stats.forEach((stat, index) => {
            const duration = 2000; // 2 seconds
            const steps = 60;
            const increment = stat.number / steps;
            let current = 0;

            const timer = setInterval(() => {
              current += increment;
              if (current >= stat.number) {
                setCounts((prev) => {
                  const newCounts = [...prev];
                  newCounts[index] = stat.number;
                  return newCounts;
                });
                clearInterval(timer);
              } else {
                setCounts((prev) => {
                  const newCounts = [...prev];
                  newCounts[index] = Math.floor(current);
                  return newCounts;
                });
              }
            }, duration / steps);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [data.animate, data.stats, hasAnimated]);

  const gridColumns = data.columns || 4;
  const colClass = `col-md-${12 / gridColumns}`;

  return (
    <section ref={sectionRef} className="stats-counter py-5 bg-primary text-white">
      <div className="container">
        <div className="row g-4 text-center">
          {data.stats.map((stat, index) => (
            <motion.div
              key={index}
              className={colClass}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div>
                {stat.icon && <i className={`${stat.icon} fa-3x mb-3`} />}
                <h2 className="display-4 fw-bold mb-0">
                  {stat.prefix}
                  {data.animate ? counts[index] : stat.number}
                  {stat.suffix}
                </h2>
                <p className="lead mb-0">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
