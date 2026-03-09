// path: src/data/usp-os.js

export const onestreamplusData = {
  // Detail
  title: "Smart Entertainment. Spectacular Experience.",
  desc: "One Stream+ delivers a world-class entertainment experience in one elegant box, supported with Audio by Bang & Olufsen, Dolby Vision–Atmos technology, and thousands of apps from Google Certified Android TV.",
  textCTA: "Get One Stream+",
  textCTA_secondary: "View Specs",
  usp: [
    {
      id: 1,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_1ST.webp',
      title: '1st Time in Indonesia',
      desc: 'Indonesia’s first Premium Video Soundbox, delivering a world-class entertainment experience.'
    },
    {
      id: 2,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_MULTIDIMENSIONALSOUND.webp',
      title: 'Immersive Multidimensional Sound',
      desc: 'Multidimensional sound with Dolby Atmos, delivering a premium viewing experience.'
    },
    {
      id: 3,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_4K.webp',
      title: 'Ultra-Clear 4K Viewing*',
      desc: 'Stunningly sharp visuals with exceptional detail, powered by Dolby Vision 4K UHD.'
    },
    {
      id: 4,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_PREINSTALLED.webp',
      title: 'Pre-installed HBO Max & Premium Channels**',
      desc: 'Premium content ready to watch, including HBO Max and leading local & international channels.'
    },
    {
      id: 5,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_VOICECOMMAND.webp',
      title: 'Voice Command',
      desc: 'Google Assistant, entertainment made easier through hands-free voice control, users can operate comfortably without the hassle of remotes.'
    },
    {
      id: 6,
      iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/os_plus/USP_HDMIARC.webp',
      title: 'HDMI ARC, One Cable Simplicity',
      desc: 'Use One Stream+ as your TV speaker with rich, powerful sound all through a single HDMI connection.'
    }
  ],
  note: "*Dolby Vision 4K UHD requires compatible TV, content, and sufficient bandwidth.\n**Premium channel access subject to service agreements",
  
  // Spesification
  specifications: {
    title: "One Stream+ Device Specification",
    items: [ // Tambahkan key 'items' di sini
      {
        category: "Features", // Sesuai permintaan sebelumnya, ini akan di-handle if-else di UI
        specs: [
          { label: "Features", value: "Audio by Bang & Olufsen, Dolby Vision/Atmos, Wi-Fi 6" }
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
    title: "Get One Stream+ Now",
    by: {
      retail: {
        title: "Get One Stream+ now at your nearest authorized retail partner store",
        list: [
          {
            url_logo: "https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-Urban-Republic.png", 
            name: "Urban Republic (*Certain Stores)",
            desc: "Available at PIM, Kelapa Gading, Ashta, Grand Indonesia, Senayan City, Summarecon Bekasi, Kota Kasablanka, Gandaria City, Bintaro Exchange, & Summarecon Mall Serpong."
          }
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

export default onestreamplusData;