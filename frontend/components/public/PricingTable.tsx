'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PricingTableData } from '@/types/component';
import { FaCheck } from 'react-icons/fa';

interface PricingTableProps {
  data: PricingTableData;
}

export default function PricingTable({ data }: PricingTableProps) {
  const gridColumns = data.columns || 3;
  const colClass = `col-md-${12 / gridColumns}`;

  return (
    <section className="pricing-table py-5">
      <div className="container">
        <div className="row g-4 justify-content-center">
          {data.plans.map((plan, index) => (
            <motion.div
              key={index}
              className={colClass}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className={`card h-100 ${
                  plan.is_featured ? 'border-primary shadow-lg' : 'border-0 shadow-sm'
                }`}
              >
                {plan.is_featured && (
                  <div className="card-header bg-primary text-white text-center fw-bold">
                    MOST POPULAR
                  </div>
                )}
                <div className="card-body text-center">
                  <h4 className="card-title mb-3">{plan.name}</h4>
                  {plan.description && (
                    <p className="text-muted small mb-3">{plan.description}</p>
                  )}
                  <div className="mb-4">
                    <span className="h2 fw-bold">{plan.currency}{plan.price.toLocaleString()}</span>
                    <span className="text-muted">{plan.period}</span>
                  </div>
                  {plan.features && (
                    <ul className="list-unstyled mb-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="mb-2">
                          <FaCheck className="text-success me-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="card-footer bg-transparent border-0 pb-4">
                  <Link
                    href={plan.cta_url || '#'}
                    className={`btn w-100 ${
                      plan.is_featured ? 'btn-primary' : 'btn-outline-primary'
                    }`}
                  >
                    {plan.cta_text || 'Get Started'}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
