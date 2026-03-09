// path: src/data/global.js

export const globalData = {
  navbar: {
    menuItems: [
      { id: 'start', label: 'home', type: 'icon' },
      { id: 'one-stream-plus', label: 'One Stream+' },
      { id: 'one-stream', label: 'One Stream' },
      { id: 'corporate', label: 'Perusahaan' },
      { id: 'faq', label: 'FAQ' },
    ],
    textCTA: "Dapatkan Penawaran",
  },

  // usp
  usp:{
    list: [
      {
        title: "ALL IN ONE ENTERTAINMENT BOX",
        desc: "Satu box untuk streaming, TV live dan masih banyak lagi."
      },
      {
        title: "WORK WITH ALL INTERNET CONNECTION",
        desc: "Terhubung dengan mudah ke jaringan apa pun dan langsung mulai menonton."
      }
    ]
  },

  // hero
  hero: {
    tagline: "#EntertainmentElevated",
    headline: "SOLUSI OTT FLEKSIBEL UNTUK BISNIS DAN HIBURAN DI RUMAH",
    desc: "Mendorong pertumbuhan bisnis sekaligus menghadirkan pengalaman menonton kelas dunia dengan teknologi hiburan premium tanpa batas.",
    textCTA: "Experience One Stream+",
    
    // Sub-section Cards
    cards: [
      {
        id: "os-plus",
        name: "One Stream+",
        headline: "Smart Entertainment. Spectacular Experiences.",
        textCTA: "Jelajahi One Stream+"
      },
      {
        id: "os-box",
        name: "One Stream",
        headline: "One Small Box, Open a New Big World",
        textCTA: "Jelajahi One Stream"
      }
    ],
    
    hospitality: {
      textCTA: "Lihat Penggunaan Hospitality"
    }
  },

  closingSentence: {
    text: "Elevate Your Home <br className='hidden md:block' /> Entertainment",
    textCTA: "Jadwalkan Demo"
  },

  // contact
  contact: {
    list: [
      {
        id: "instagram",
        icon: "instagram", 
        value: "https://www.instagram.com/linknetmedia"
      },
      {
        id: "youtube",
        icon: "youtube", 
        value: "https://www.youtube.com/@Linknetmedia"
      },
      {
        id: "whatsapp",
        icon: "whatsapp", 
        value: "https://wa.me/6287790508830"
      },

    ]
  },

  // Get started
  getStarted: {
    title: "Dapatkan One Stream+ & One Stream Sekarang",
    by: {
      retail: {
        title: "Dapatkan One Stream+ sekarang juga di toko mitra ritel resmi terdekat Anda.",
        list: [
          {
            url_logo: "https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-Urban-Republic.png", 
            name: "Urban Republic (*Toko Tertentu)",
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

};

export default globalData;