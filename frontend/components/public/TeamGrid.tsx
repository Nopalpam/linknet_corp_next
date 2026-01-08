'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { TeamGridData } from '@/types/component';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';

interface TeamGridProps {
  data: TeamGridData;
}

export default function TeamGrid({ data }: TeamGridProps) {
  const gridColumns = data.columns || 4;
  const colClass = `col-md-${12 / gridColumns}`;

  return (
    <section className="team-grid py-5">
      <div className="container">
        <div className="row g-4">
          {data.members.map((member, index) => (
            <motion.div
              key={index}
              className={colClass}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="card h-100 border-0 shadow-sm text-center">
                {member.photo && (
                  <div className="p-4">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      width={150}
                      height={150}
                      className="rounded-circle"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title mb-1">{member.name}</h5>
                  <p className="text-muted small mb-2">{member.position}</p>
                  {member.bio && (
                    <p className="card-text small mb-3">{member.bio}</p>
                  )}
                  
                  {/* Contact Info */}
                  {(member.email || member.phone) && (
                    <div className="mb-3">
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="d-block small text-decoration-none mb-1">
                          <FaEnvelope className="me-1" /> {member.email}
                        </a>
                      )}
                      {member.phone && (
                        <a href={`tel:${member.phone}`} className="d-block small text-decoration-none">
                          <FaPhone className="me-1" /> {member.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Social Links */}
                  {member.social_links && (
                    <div className="d-flex gap-2 justify-content-center">
                      {member.social_links.linkedin && (
                        <a href={member.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                          <FaLinkedin />
                        </a>
                      )}
                      {member.social_links.twitter && (
                        <a href={member.social_links.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">
                          <FaTwitter />
                        </a>
                      )}
                      {member.social_links.facebook && (
                        <a href={member.social_links.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                          <FaFacebook />
                        </a>
                      )}
                      {member.social_links.instagram && (
                        <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-danger">
                          <FaInstagram />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
