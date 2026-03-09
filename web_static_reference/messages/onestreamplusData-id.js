// path: src/data/usp-os.js

export const onestreamplusData = {
  // Detail
  title: "Smart Entertainment. Spectacular Experience.",
  desc: "One Stream+ menghadirkan pengalaman menonton kelas dunia dalam satu box elegan — didukung oleh Audio by Bang & Olufsen, teknologi Dolby Vision-Atmos dan ribuan aplikasi dari Google Certified Android TV",
  textCTA: "Dapatkan One Stream+",
  textCTA_secondary: "Lihat Spesifikasi",
  usp: [
    {
      id: 1,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_1ST.webp',
      title: 'Pertama di Indonesia',
      desc: 'Premium Video Soundbox pertama di Indonesia, hiburan baru yang tak tertandingi.'
    },
    {
      id: 2,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_MULTIDIMENSIONALSOUND.webp',
      title: 'Suara Sinematik Multidimensi',
      desc: 'Suara multidimensi dengan Dolby Atmos, menghadirkan pengalaman menonton premium.'
    },
    {
      id: 3,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_4K.webp',
      title: 'Visual 4K Ultra Jernih*',
      desc: 'Visual yang detail & tajam dengan Dolby Vision 4K UHD.'
    },
    {
      id: 4,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_PREINSTALLED.webp',
      title: 'Akses Instan ke HBO Max & Channel Premium**',
      desc: 'Konten premium siap dinikmati, termasuk HBO Max serta channel lokal & internasional terkemuka.'
    },
    {
      id: 5,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_VOICECOMMAND.webp',
      title: 'Kontrol Suara',
      desc: 'Google Assistant membuat hiburan lebih mudah diakses dengan kontrol suara hands-free, tanpa repot remote.'
    },
    {
      id: 6,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_HDMIARC.webp',
      title: 'HDMI ARC, Instalasi praktis',
      desc: 'Gunakan One Stream+ sebagai speaker TV Anda dengan suara yang kaya dan powerful — cukup melalui satu koneksi HDMI.'
    }
  ],
  note: "*Untuk menikmati Dolby Vision 4K UHD, pastikan menggunakan TV dan konten yang kompatibel dengan dukungan koneksi internet stabil.\n**Akses channel premium mengikuti ketentuan layanan yang berlaku.",
  
  // Spesification
  specifications: {
    title: "Spesifikasi Perangkat One Stream+",
    items: [ // Tambahkan key 'items' di sini
      {
        category: "Fitur", // Sesuai permintaan sebelumnya, ini akan di-handle if-else di UI
        specs: [
          { label: "Fitur", value: "Audio by Bang & Olufsen, Dolby Vision/Atmos, Wi-Fi 6" }
        ]
      },
      {
        category: "Hardware",
        specs: [
          { label: "CPU", value: "Quad-Core B53, 2.6GHz" },
          { label: "GPU", value: "Broadcom Video Core VI" },
          { label: "RAM", value: "3GB" },
          { label: "Storage", value: "16GB" },
          { label: "Dimensions", value: "165 x 165 x 66 mm (W x D x H)" }
        ]
      },
      {
        category: "Software",
        specs: [
          { label: "Software", value: "Android TV​ 11" },
          { label: "DRM", value: "Widevine L1" },
          { label: "Video Codecs", value: "AV1, VP9, H.264, H.265 (HEVC)" }
        ]
      }
    ]
  },

  // Order
  order: {
    title: "Dapatkan One Stream+ Sekarang",
    by: {
      retail: {
        title: "Dapatkan One Stream+ sekarang juga di toko mitra ritel resmi terdekat Anda.",
        list: [
          {
            url_logo: "https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-Urban-Republic.png", 
            name: "Urban Republic (*Certain Stores)",
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

export default onestreamplusData;