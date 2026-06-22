// path: src/data/usp-os.js

export const onestreamData = {
  // Detail
  title: "ONE SMALL BOX, \n OPEN A NEW BIG WORLD",
  desc: "One Stream Smart Box hadir sebagai solusi hiburan praktis untuk Anda dan keluarga. Didukung Android TV, perangkat ini kompatibel dengan berbagai aplikasi favorit yang dapat diunduh melalui Play Store — mulai dari streaming, bermain game, hingga browsing dan media sosial — semuanya dapat dinikmati dengan mudah langsung di TV Anda hanya dengan satu smart box.",
  textCTA: "Dapatkan One Stream",
  textCTA_secondary: "Lihat Spesifikasi",
  usp: [
    {
      id: 1,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-android-games-tv.svg',
      title: 'Android Game',
      desc: 'Mainkan berbagai game favorit langsung di TV untuk hiburan yang lebih seru bersama keluarga.'
    },
    {
      id: 2,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-7-days-catch-up.svg',
      title: 'Tonton Ulang',
      desc: 'Akses kembali tayangan hingga 7 hari terakhir agar tidak ketinggalan acara favorit Anda.'
    },
    {
      id: 3,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-on-demand-movies-and-tv-show.svg',
      title: 'Film & TV On Demand',
      desc: 'Nikmati beragam film dan acara TV kapan saja sesuai waktu yang Anda inginkan.'
    },
    {
      id: 4,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-video-streaming.svg', 
      title: 'Streaming Video',
      desc: 'Streaming berbagai konten favorit, termasuk HBO Max serta channel lokal dan internasional.'
    },
    {
      id: 5,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-google-assistant.svg',
      title: 'Google Assistant',
      desc: 'Cari konten, buka aplikasi, dan kontrol TV dengan perintah suara yang praktis.'
    },
    {
      id: 6,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-chromecast.svg',
      title: 'Chromecast Built-in',
      desc: 'Tampilkan foto, video, atau konten dari smartphone langsung ke layar TV dengan mudah.'
    },
    {
      id: 7,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-quic.svg', 
      title: 'Respon Cepat',
      desc: 'Performa yang responsif untuk navigasi menu dan perpindahan aplikasi yang lebih lancar.'
    },
    {
      id: 8,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-easy.svg',
      title: 'Mudah Terhubung',
      desc: 'Koneksi cepat ke Wi-Fi dan perangkat lain untuk pengalaman menonton tanpa ribet.'
    },
    {
      id: 9,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-smart.svg',
      title: 'Kontrol Cerdas',
      desc: 'Navigasi dan kendalikan hiburan Anda dengan lebih mudah dan praktis.'
    },
    {
      id: 10,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-powerfull.svg',
      title: 'Performa Andal',
      desc: 'Didukung performa stabil untuk streaming, bermain game, dan multitasking sehari-hari.'
    }
  ],
  note: "*Untuk menikmati Dolby Vision 4K UHD, pastikan menggunakan TV dan konten yang kompatibel dengan dukungan koneksi internet stabil.\n**Akses channel premium mengikuti ketentuan layanan yang berlaku.",
  
  // Spesification
  specifications: {
    title: "Spesifikasi Perangkat One Stream",
    items: [ // Tambahkan key 'items' di sini
      {
        category: "Hardware",
        specs: [
          { label: "CPU", value: "Quad-Core Cortex-A53" },
          { label: "GPU", value: "Mali-450 Pentacore" },
          { label: "RAM", value: "2GB" },
          { label: "Storage", value: "8GB" }
        ]
      },
      {
        category: "Software",
        specs: [
          { label: "Software", value: "Android-9 (P)" },
          { label: "DRM", value: "Widevine L1" },
          { label: "Video", value: "HD Only" },
          { label: "Audio", value: "Dolby Audio" }
        ]
      }
    ]
  },

  // Order
  order: {
    title: "Dapatkan One Stream Sekarang",
    by: {
      retail: {
        title: "Dapatkan One Stream+ sekarang juga di toko mitra ritel resmi terdekat Anda.",
        list: [
          {
            url_logo: "https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-Urban-Republic.png", 
            name: "Urban Republic (Toko Tertentu)",
            desc: "Tersedia di PIM, Kelapa Gading, Ashta, Grand Indonesia, Senayan City, Summarecon Bekasi, Kota Kasablanka, Gandaria City, Bintaro Exchange, & Summarecon Mall Serpong."
          }
        ]
      },
      contact: {
        title: "Untuk kemitraan bisnis atau kebutuhan perusahaan, silakan hubungi tim kami melalui",
        list: [
          {
            whatsapp_no: "6287790508830", 
            email: "contact@firstmedia.com"
          }
        ]
      }
    }
  }


  // END
};

export default onestreamData;