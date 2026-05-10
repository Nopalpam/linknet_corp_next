export const HERO_DATA = {
  // Key 'mission' (atau bisa Anda ganti jadi 'home', 'about', dll)
  mission: {
    config: {
      sectionId: "mission",
      className: "",
      bgImage: "/assets/herosliders/mission-desktop.jpg",
      bgImageMobile: "/assets/herosliders/mission-mobile.jpg",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "md",
    parentProduct: {
      iconImage: "/assets/logos/favicon-onestream.svg",
      productName: "OneStream",
    },
    logoSrc: "/assets/logos/logo-onestream.svg",
    logoSquare: false,
    labelIconSrc: "", // Kosongkan jika tidak ada icon di pill
    introData: {
      as: "h2",
      label: "Our Mission",
      title: "Improving Lives and Supporting Indonesia's Digital Growth",
      description: "Linknet is dedicated to improving lives and supporting Indonesia's digital growth by delivering smart",
      align: "left",
    },
    theme: "light",
    title: "Improving Lives and Supporting Indonesia's Digital Growth",
    description: "Linknet is dedicated to improving lives and supporting Indonesia's digital growth by delivering smart",
    ctaList: [
      { text: "Get to Know Us", href: "/about-us", target: "_self", variant: "secondary-outline--white", size: "lg" }
    ],
    bgOverlay: false,
  },

  // Slide 1
  slidersHomeMission: {
    config: {
      sectionId: "sliders-home-mission",
      className: "",
      bgImage: "/assets/herosliders/mission-desktop.jpg",
      bgImageMobile: "/assets/herosliders/mission-mobile.jpg",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "md",
    parentProduct: {
      iconImage: "/assets/logos/favicon-onestream.svg",
      productName: "OneStream",
    },
    // logoSrc: "/assets/logos/logo-onestream.svg", // Uncomment jika mau dipakai
    logoSquare: false,
    introData: {
      as: "h2",
      label: "Our Mission",
      title: "Improving Lives and Supporting Indonesia's Digital Growth",
      description: "Linknet is dedicated to improving lives and supporting Indonesia's digital growth by delivering smart",
      align: "left",
    },
    theme: "light",
    title: "Improving Lives and Supporting Indonesia's Digital Growth",
    description: "Linknet is dedicated to improving lives and supporting Indonesia's digital growth by delivering smart",
    bgOverlay: false,
    ctaList: [
      { text: "Get to Know Us", href: "/about-us", target: "_self", variant: "secondary-outline--white", size: "lg" }
    ],
  },

  // Slide 2
  slidersHomeVision: {
    config: {
      sectionId: "sliders-home-vision",
      className: "",
      bgImage: "/assets/herosliders/homepass-desktop.jpg",
      bgImageMobile: "/assets/herosliders/homepass-mobile.jpg",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "md",
    // logoSrc: "/assets/logos/logo-firstmedia.svg",
    logoSquare: false,
    introData: {
      as: "h2",
      label: "Our Vision",
      title: "Connecting 4 Million Homes, On Track to 8.4 Million by 2027",
      description: "Link Net Continues to Expand Its Digital Footprint for a Closer, More Connected Future.",
      align: "left",
    },
    theme: "light",
    title: "Connecting 4 Million Homes, On Track to 8.4 Million by 2027",
    description: "Link Net Continues to Expand Its Digital Footprint for a Closer, More Connected Future.",
    bgOverlay: false,
    ctaList: [
      { text: "Get to Know Us", href: "/promo", target: "_self", variant: "secondary-outline--white", size: "lg" }
    ],
  },

  // Slide 3
  slidersHomeHiring: {
    config: {
      sectionId: "sliders-home-hiring",
      className: "",
      bgImage: "/assets/herosliders/mt-desktop.jpg",
      bgImageMobile: "/assets/herosliders/mt-mobile.jpg",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "md",
    // logoSrc: "/assets/logos/logo-linknet.svg",
    logoSquare: false,
    introData: {
      as: "h2",
      label: "We're Hiring",
      title: "Let's Join Management Trainee Generation 6",
      description: "Link Net Management Trainee Program is a comprehensive program that enables the organization",
      align: "left",
    },
    title: "Let's Join Management Trainee Generation 6",
    description: "Link Net Management Trainee Program is a comprehensive program that enables the organization",
    bgOverlay: false,
    ctaList: [
      { text: "Apply Now", href: "/apply", target: "_self", variant: "secondary-outline--white", size: "lg" }
    ],
  },

  news: {
    config: {
      sectionId: "news",
      className: "",
      bgImage: "/assets/herosliders/mt-desktop.jpg",
      bgImageMobile: "/assets/herosliders/mt-mobile.jpg",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "md",
    // logoSrc: "/assets/logos/logo-linknet.svg",
    logoSquare: false,
    introData: {
      as: "h2",
      label: "We're Hiring",
      title: "Let's Join Management Trainee Generation 6",
      description: "Link Net Management Trainee Program is a comprehensive program that enables the organization",
      align: "left",
    },
    theme: "light",
    title: "Let's Join Management Trainee Generation 6",
    description: "Link Net Management Trainee Program is a comprehensive program that enables the organization",
    bgOverlay: false,
    ctaList: [
      { text: "Apply Now", href: "/apply", target: "_self", variant: "secondary-outline--white", size: "lg" }
    ],
  },
  life_at_linknet: {
    config: {
      sectionId: "life-at-linknet",
      className: "",
      bgImage: "/assets/bg/bg-career.jpg",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "sm",
    logoSrc: "/assets/logos/life-at-linknet.png",
    logoSquare: true,
    theme: "dark",
    title: "Let's Discover the Possibilities Together!",
    description: "",
    bgOverlay: true,
    ctaList: [],
  },
  career: {
    config: {
      sectionId: "career",
      className: "",
      bgImage: "/assets/bg/bg-career.jpg",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    heroSize: "sm",
    logoSrc: "",
    logoSquare: false,
    introData: {
      as: "h2",
      label: "Join Us, Now!",
      title: "Be a Part In Our Journey to Discover the Possibilities Together",
      description: "We believe in your potential. This is the right time for you to step up your skills and discover endless possibilities.",
      align: "left",
    },
    theme: "dark",
    title: "Be a Part In Our Journey to Discover the Possibilities Together",
    description: "We believe in your potential. This is the right time for you to step up your skills and discover endless possibilities.",
    bgOverlay: true,
    ctaList: [],
  }


};
