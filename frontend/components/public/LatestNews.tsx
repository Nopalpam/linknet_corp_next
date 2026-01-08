'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { LatestNewsData } from '@/types/component';

interface LatestNewsProps {
  data: LatestNewsData;
}

// Mock news data - replace with actual API call
const mockNews = [
  {
    id: '1',
    title: 'New Internet Package Launched',
    slug: 'new-internet-package',
    excerpt: 'LinkNet Corp announces new affordable internet packages...',
    image: '/images/news1.jpg',
    date: '2024-01-15',
    author: 'Admin',
  },
  {
    id: '2',
    title: 'Fiber Optic Expansion',
    slug: 'fiber-optic-expansion',
    excerpt: 'We are expanding our fiber optic network to more areas...',
    image: '/images/news2.jpg',
    date: '2024-01-10',
    author: 'Admin',
  },
];

export default function LatestNews({ data }: LatestNewsProps) {
  const gridColumns = data.columns || 3;
  const colClass = `col-md-${12 / gridColumns}`;

  // In production, fetch actual news here
  const news = mockNews.slice(0, data.limit || 6);

  return (
    <section className="latest-news py-5 bg-light">
      <div className="container">
        {data.title && (
          <h2 className="text-center mb-4">{data.title}</h2>
        )}
        
        <div className="row g-4">
          {news.map((item, index) => (
            <motion.div
              key={item.id}
              className={colClass}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card h-100 border-0 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={250}
                  className="card-img-top"
                  style={{ objectFit: 'cover', height: '200px' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  {data.show_excerpt && (
                    <p className="card-text text-muted small">{item.excerpt}</p>
                  )}
                  {(data.show_date || data.show_author) && (
                    <div className="small text-muted mb-3">
                      {data.show_date && <span>{new Date(item.date).toLocaleDateString()}</span>}
                      {data.show_date && data.show_author && <span> • </span>}
                      {data.show_author && <span>By {item.author}</span>}
                    </div>
                  )}
                  <Link href={`/news/${item.slug}`} className="btn btn-sm btn-outline-primary">
                    Read More
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
