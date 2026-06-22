// path: src/data/usp-os.js

export const onestreamData = {
  // Detail
  title: "ONE SMALL BOX, \n OPEN A NEW BIG WORLD",
  desc: "One Stream Smart Box is designed to meet your everyday entertainment needs. Powered by Android TV, it supports a wide range of apps available on the Play Store — from streaming and gaming to browsing and social media — all accessible easily on your TV with just one simple device.",
  textCTA: "Get One Stream",
  textCTA_secondary: "View Specs",
  usp: [
    {
      id: 1,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-android-games-tv.svg',
      title: 'Android Game',
      desc: 'Play your favorite Android games directly on your TV for more fun at home.'
    },
    {
      id: 2,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-7-days-catch-up.svg',
      title: '7 Days Catch Up',
      desc: 'Catch up on shows from the past 7 days so you never miss your favorite programs.'
    },
    {
      id: 3,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-on-demand-movies-and-tv-show.svg',
      title: 'On Demand Movies & TV Shows',
      desc: 'Enjoy a wide selection of movies and TV shows anytime you want.'
    },
    {
      id: 4,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-video-streaming.svg', 
      title: 'Video Streaming',
      desc: 'Stream your favorite content, including leading local and international channels.'
    },
    {
      id: 5,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-google-assistant.svg',
      title: 'Google Assistant',
      desc: 'Search content, open apps, and control your TV easily with voice commands.'
    },
    {
      id: 6,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-chromecast.svg',
      title: 'Chromecast Built-in',
      desc: 'Cast photos, videos, and content from your smartphone directly to your TV screen.'
    },
    {
      id: 7,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-quic.svg', 
      title: 'Quick & Responsive',
      desc: 'Smooth and responsive performance for faster navigation and app switching.'
    },
    {
      id: 8,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-easy.svg',
      title: 'Easy to Connect',
      desc: 'Connect quickly to Wi-Fi and other devices for a hassle-free viewing experience.'
    },
    {
      id: 9,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-smart.svg',
      title: 'Smart Control',
      desc: 'Navigate and control your entertainment with ease and convenience.'
    },
    {
      id: 10,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os/icon-feature-powerfull.svg',
      title: 'Powerful Performance',
      desc: 'Reliable performance for smooth streaming, gaming, and everyday multitasking.'
    }
  ],
  note: "*Untuk menikmati Dolby Vision 4K UHD, pastikan menggunakan TV dan konten yang kompatibel dengan dukungan koneksi internet stabil.\n**Akses channel premium mengikuti ketentuan layanan yang berlaku.",
  
  // Spesification
  specifications: {
    title: "One Stream Device Specification",
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
    title: "Get One Stream Now",
    by: {
      retail: {
        title: "Get One Stream+ now at your nearest authorized retail partner store",
        list: [
          {
            url_logo: "https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-Urban-Republic.png", 
            name: "Urban Republic (*Certain Stores)",
            desc: "Available at PIM, Kelapa Gading, Ashta, Grand Indonesia, Senayan City, Summarecon Bekasi, Kota Kasablanka, Gandaria City, Bintaro Exchange, & Summarecon Mall Serpong."
          },
        ]
      },
      contact: {
        title: "For business partnerships or corporate needs, please contact our team via",
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