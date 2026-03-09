export const LIST_REPORT_HOME_DATA = {
  // Key 'home' untuk digunakan di halaman utama
  home: {
    id: "section-report-announcement",
    
    // Data untuk komponen Intro
    introData: {
      as: "h2",
      label: "REPORT & ANNOUNCEMENT",
      title: "Performance Transparency & Corporate Announcements", // Gunakan \n jika butuh enter
      align: "left"
    },

    // Opsi untuk Segment Picker
    tabs: [
      { label: "Report", value: "report" },
      { label: "Announcement", value: "announcement" }
    ],

    // Isi konten berdasarkan value tab yang aktif
    items: {
      // Data saat tab "Report" aktif
      report: [
        {
          id: "r1",
          iconSrc: "/assets/icons/pdf-circle.svg",
          title: "Annual Reports",
          description: "Temukan perjalanan pertumbuhan, strategi, dan pencapaian kami setiap tahunnya.",
          ctaText: "View More",
          ctaLink: "/reports/annual-2025",
          year: "2025"
        },
        {
          id: "r2",
          iconSrc: "/assets/icons/pdf-circle.svg",
          title: "Financial Statement",
          description: "Lihat transparansi keuangan kami yang mendorong kepercayaan dan peluang baru.",
          ctaText: "View More",
          ctaLink: "/reports/financial-2025",
          year: "2025"
        },
        {
          id: "r3",
          iconSrc: "/assets/icons/pdf-circle.svg",
          title: "Sustainable Reports",
          description: "Ikuti komitmen kami membangun masa depan berkelanjutan bagi bisnis dan masyarakat.",
          ctaText: "View More",
          ctaLink: "/reports/sustainable-2025",
          year: "2025"
        }
      ],

      // Data saat tab "Announcement" aktif
      announcement: [
        {
          id: "a1",
          iconSrc: "/assets/icons/pdf-circle.svg",
          title: "RUPSLB 2025",
          description: "Pengumuman Rapat Umum Pemegang Saham Luar Biasa tahun 2025.",
          ctaText: "View More",
          ctaLink: "/announcements/rupslb-2025",
          year: "2025"
        },
        // Tambahkan pengumuman lainnya di sini...
      ]
    }
  }
};