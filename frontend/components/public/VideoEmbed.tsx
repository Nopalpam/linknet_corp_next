'use client';

import { motion } from 'framer-motion';
import { VideoEmbedData } from '@/types/component';

interface VideoEmbedProps {
  data: VideoEmbedData;
}

export default function VideoEmbed({ data }: VideoEmbedProps) {
  const getEmbedUrl = (url: string) => {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]
        : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <section className="video-embed py-5">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="ratio ratio-16x9"
        >
          <iframe
            src={getEmbedUrl(data.video_url)}
            title={data.caption || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded"
          />
        </motion.div>
        {data.caption && (
          <p className="text-center mt-3 text-muted">{data.caption}</p>
        )}
      </div>
    </section>
  );
}
