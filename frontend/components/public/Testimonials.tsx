'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TestimonialsData } from '@/types/component';
import { FaStar } from 'react-icons/fa';

interface TestimonialsProps {
  data: TestimonialsData;
}

export default function Testimonials({ data }: TestimonialsProps) {
  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="d-flex gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? 'text-warning' : 'text-muted'} />
        ))}
      </div>
    );
  };

  const gridColumns = data.columns || 3;
  const colClass = `col-md-${12 / gridColumns}`;

  if (data.layout === 'carousel') {
    return (
      <section className="testimonials py-5 bg-light">
        <div className="container">
          <div id="testimonialsCarousel" className="carousel slide">
            <div className="carousel-inner">
              {data.items.map((testimonial, index) => (
                <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                  <div className="text-center px-5 py-4">
                    {testimonial.photo && (
                      <Image
                        src={testimonial.photo}
                        alt={testimonial.name}
                        width={80}
                        height={80}
                        className="rounded-circle mb-3"
                      />
                    )}
                    {renderStars(testimonial.rating)}
                    <blockquote className="blockquote mb-3">
                      <p>"{testimonial.quote}"</p>
                    </blockquote>
                    <div>
                      <strong>{testimonial.name}</strong>
                      {testimonial.position && <span className="d-block text-muted">{testimonial.position}</span>}
                      {testimonial.company && <span className="d-block text-muted">{testimonial.company}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#testimonialsCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#testimonialsCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="testimonials py-5 bg-light">
      <div className="container">
        <div className="row g-4">
          {data.items.map((testimonial, index) => (
            <motion.div
              key={index}
              className={colClass}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center">
                  {testimonial.photo && (
                    <Image
                      src={testimonial.photo}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="rounded-circle mb-3"
                    />
                  )}
                  {renderStars(testimonial.rating)}
                  <p className="card-text mb-3">"{testimonial.quote}"</p>
                  <div className="mt-auto">
                    <strong className="d-block">{testimonial.name}</strong>
                    {testimonial.position && <span className="text-muted small">{testimonial.position}</span>}
                    {testimonial.company && <span className="text-muted small d-block">{testimonial.company}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
