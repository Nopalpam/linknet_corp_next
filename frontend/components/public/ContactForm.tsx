'use client';

import { motion } from 'framer-motion';
import { ContactFormData } from '@/types/component';

interface ContactFormProps {
  data: ContactFormData;
}

export default function ContactForm({ data }: ContactFormProps) {
  return (
    <section className="contact-form py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="row justify-content-center"
        >
          <div className="col-lg-8">
            {data.show_title && data.title && (
              <h2 className="text-center mb-3">{data.title}</h2>
            )}
            {data.description && (
              <p className="text-center text-muted mb-4">{data.description}</p>
            )}
            
            {/* Contact Form */}
            <form className="card p-4 shadow-sm">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" className="form-control" id="name" required />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input type="email" className="form-control" id="email" required />
              </div>
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input type="text" className="form-control" id="subject" required />
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea className="form-control" id="message" rows={5} required></textarea>
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Send Message
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
