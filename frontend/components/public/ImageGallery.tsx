'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ImageGalleryData } from '@/types/component';

interface ImageGalleryProps {
  data: ImageGalleryData;
}

export default function ImageGallery({ data }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className="image-gallery py-5">
      <div className="container">
        <div className="row g-4">
          {data.images.map((image, index) => (
            <motion.div
              key={index}
              className="col-md-6 col-lg-4"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className="gallery-item cursor-pointer"
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image.url}
                  alt={image.alt}
                  width={400}
                  height={300}
                  className="img-fluid rounded"
                  style={{ objectFit: 'cover', width: '100%', height: '300px' }}
                />
                {image.caption && (
                  <p className="text-center mt-2 text-muted">{image.caption}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div
            className="modal d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
            onClick={() => setSelectedImage(null)}
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content bg-transparent border-0">
                <Image
                  src={data.images[selectedImage].url}
                  alt={data.images[selectedImage].alt}
                  width={1200}
                  height={800}
                  className="img-fluid rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
