export const ABOUT_WITH_USP_DATA = {
  home: {
    id: "section-about-network",
    uspVariant: "card",
    bgColor: "var(--bg-white)",
    isSlider: false,
    
    // Background Image & Position
    bgImage: "/assets/bg/bg-usp-home.jpg",
    bgImageMobile: "",
    bgPositionClasses: "bg-right-top md:bg-right",
    bgSizeClass: "bg-cover",
    
    // Intro Section
    introData: {
      as: "h2",
      label: "OUR PURPOSE",
      title: "We LINK the nation for better lives",
      description: "Through Hybrid Fiber Coaxial (HFC) and Fiber To The Home (FTTH) networks, Linknet provides reliable internet, multimedia, and business solutions to over 4 million homepasses in 70+ cities",
      align: "left"
    },
    
    // USP Cards
    uspList: [
      { 
        iconURL: "/assets/icons/usp/icon-homepass.svg", 
        title: "4M+ Homepasses", 
        description: "Spread across more than 47 major cities" 
      },
      { 
        iconURL: "/assets/icons/usp/icon-business.svg", 
        title: "3 Pillars of Business", 
        description: "FiberCo, EnterpriseCo, and MediaCo" 
      },
    ],

    // Call to Action Buttons
    ctaList: [
      { 
        text: "Get to Know Us", 
        variant: "primary", 
        size: "lg", 
        href: "/about" 
      },
      { 
        text: "Contact Us", 
        variant: "secondary-outline", 
        size: "lg", 
        href: "/contact" 
      }
    ]
  },
  
  // Jika nanti ada halaman lain, tambahkan key baru di sini:
  // enterprise: { ... }
};