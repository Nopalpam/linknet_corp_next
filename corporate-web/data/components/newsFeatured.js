// src/data/components/newsFeatured.js

import { NEWS_LIST } from './newsList';

// Fungsi helper untuk mengambil berita berdasarkan ID dan memastikan statusnya "active"
const getActiveNewsById = (id) => {
  return NEWS_LIST.find(news => news.id === id && news.status === 'active');
};

export const NEWS_FEATURED_DATA = {
  home: {
    config: {
      sectionId: "news-featured-section",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },

    introData: {
      as: "h2",
      label: "MEDIA & ACTIVITIES",
      title: "Keep up with what's happening at Linknet",
      description: "",
      align: "left"
    },

    // Semua ID berita digabungkan ke dalam satu list ini
    featuredNews: [
      getActiveNewsById("news-001"),
      getActiveNewsById("news-002"),
      getActiveNewsById("news-003"),
      getActiveNewsById("news-004"),
      getActiveNewsById("news-005")
    ].filter(Boolean), // Membuang hasil 'undefined' jika ID salah atau status 'draft'

    // Call to Action Buttons
    ctaList: [
      {
        text: "See More",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: "/news"
      }
    ]

  }
};
