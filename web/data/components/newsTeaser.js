// src/data/components/newsTeaser.js

// Import data kategori agar bisa digunakan untuk label, title, dan desc
import { NEWS_CATEGORIES } from './newsCategory';

export const NEWS_TEASER_DATA = {
  // Konfigurasi untuk section Press Release
  "press-release": {
    config: {
      sectionId: "press-release-section",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    category: "press-release", // Pastikan ini sama persis (case-sensitive) dengan category di newsList.js
    limit: 6,
    introData: {
      as: "h2",
      // Mengambil data langsung dari NEWS_CATEGORIES
      label: NEWS_CATEGORIES["press-release"].label,
      title: NEWS_CATEGORIES["press-release"].title,
      description: NEWS_CATEGORIES["press-release"].desc,
      align: "left"
    },
    ctaList: [
      {
        text: "See More",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: `${NEWS_CATEGORIES["press-release"].slug}` // href juga bisa dibuat dinamis
      }
    ]
  },

  // Konfigurasi untuk section CSR Programs
  "csr-programs": {
    config: {
      sectionId: "csr-programs-section",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    category: "csr-programs", // Pastikan ini sama persis (case-sensitive) dengan category di newsList.js
    limit: 6,
    introData: {
      as: "h2",
      // Mengambil data langsung dari NEWS_CATEGORIES
      label: NEWS_CATEGORIES["csr-programs"].label,
      title: NEWS_CATEGORIES["csr-programs"].title,
      description: NEWS_CATEGORIES["csr-programs"].desc,
      align: "left"
    },
    ctaList: [
      {
        text: "See More",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: `${NEWS_CATEGORIES["csr-programs"].slug}` // href juga bisa dibuat dinamis
      }
    ]
  },

  // Konfigurasi Home (Semua Berita)
  "home": {
    config: {
      sectionId: "home-news-section",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    category: null, // null berarti menampilkan semua kategori
    limit: 6,
    introData: {
      as: "h2",
      label: "LATEST UPDATES",
      title: "Catch up on the latest news and insights",
      description: "",
      align: "center"
    },
    ctaList: [
      {
        text: "View All News",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        iconRight: "",
        href: "/news"
      }
    ]
  }
};
