// path: src/data/global.js
import Icon from '../components/base/Icon';

export const globalData = {
  navbar: {
    menuItems: [
      { id: 'start', label: 'home', type: 'icon' },
      { id: 'one-stream-plus', label: 'One Stream+' },
      { id: 'one-stream', label: 'One Stream' },
      { id: 'corporate', label: 'Corporate' },
      { id: 'faq', label: 'FAQ' },
    ],
    textCTA: "Get a Quote",
  },

  // usp
  usp:{
    list: [
      {
        title: "ALL IN ONE ENTERTAINMENT BOX",
        desc: "One box for streaming, live TV and so much more."
      },
      {
        title: "WORK WITH ALL INTERNET CONNECTION",
        desc: "Connect effortlessly to any network and start watching instantly."
      }
    ]
  },

  // hero
  hero: {
    tagline: "#EntertainmentElevated",
    headline: "FLEXIBLE OTT SOLUTIONS TO POWER YOUR BUSINESS AND HOME ENTERTAINMENT",
    desc: "Driving business transformation and delivering world-class viewing experiences through premium, next-generation OTT solutions.",
    textCTA: "Experience One Stream+",
    
    // Sub-section Cards
    cards: [
      {
        id: "os-plus",
        name: "One Stream+",
        headline: "Smart Entertainment. Spectacular Experiences.",
        textCTA: "Discover One Stream+"
      },
      {
        id: "os-box",
        name: "One Stream",
        headline: "One Small Box, Open a New Big World",
        textCTA: "Discover One Stream"
      }
    ],
    
    hospitality: {
      textCTA: "See Hospitality Usage"
    }
  },

  closingSentence: {
    text: "Elevate Your Home <br className='hidden md:block' /> Entertainment",
    textCTA: "Schedule a Demo"
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
    title: "Get One Stream+ & One Stream Now",
    by: {
      retail: {
        title: "Get One Stream+ now at your nearest authorized retail partner store",
        list: [
          {
            url_logo: "https://d2fsl11s4twg7t.cloudfront.net/assets/logos/logo-Urban-Republic.png", 
            name: "Urban Republic (*Certain Stores)",
            desc: "ONLY available at PIM, Kelapa Gading, Ashta, Grand Indonesia, Senayan City, Summarecon Bekasi, Kota Kasablanka, Gandaria City, Bintaro Exchange, & Summarecon Mall Serpong."
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

};

export default globalData;