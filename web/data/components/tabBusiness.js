// src/data/components/tabBusiness.js

export const TAB_BUSINESS_DATA = {
  "default": {
    config: {
      sectionId: "explore-business",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: "h2",
      label: "EXPLORE OUR BUSINESS",
      title: "Driving Better Lives Through Innovation",
      description: "Linknet advances Indonesia's digital transformation through innovative, reliable infrastructure",
      align: "center"
    },
    items: [
      {
        id: "tab-1",
        label: "EnterpriseCo",
        tagline: "#WeLINKTheNationforBetterLives",
        title: "Seamless Connectivity, Smart ICT Solutions, and Trusted Cybersecurity",
        desc: "Empowering digital transformation with secure internet & ICT. Trusted by 3,300+ businesses.",
        textCTA: "Learn More",
        href: "/enterprise",
        image: "/assets/bg/bg-enterprise-home.jpg",
        imageMobile: "", // <-- Tambahan Mobile Image
        logoSrc: "/assets/logos/logo-enterprise.svg"
      },
      {
        id: "tab-2",
        label: "FiberCo",
        tagline: "#ConnectingTheFuture",
        title: "Your Solution for Nationwide Connectivity",
        desc: "Empowering ISPs with fiber optic backbone and last mile networks for the ultimate internet.",
        textCTA: "Learn More",
        href: "/fiberco",
        image: "/assets/bg/bg-fiber-desktop.jpg",
        imageMobile: "",
        logoSrc: "/assets/logos/logo-fiberco.svg"
      },
      {
        id: "tab-3",
        label: "MediaCo",
        tagline: "#EntertainingTheNation",
        title: "Your Gateway to Quality Content and Smarter Media",
        desc: "Premium entertainment and media solutions that bring the best content directly to your home and business.",
        textCTA: "Learn More",
        href: "/mediaco",
        image: "/assets/bg/onestreamheroimage.jpg",
        imageMobile: "", // <-- Jika kosong, komponen otomatis merender gambar desktop di layar mobile
        logoSrc: "/assets/logos/logo-mediaco.svg"
      }
    ]
  }
};

export default TAB_BUSINESS_DATA;
