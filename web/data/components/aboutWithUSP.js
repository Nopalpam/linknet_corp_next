export const ABOUT_WITH_USP_DATA = {
  home: {
    config: {
      sectionId: "section-about-network",
      className: "",
      bgImage: "/assets/bg/bg-usp-home.jpg",
      bgImageMobile: "",
      bgPositionClasses: "bg-right-top md:bg-right",
      bgSizeClass: "bg-cover",
      layoutVariant: "image-on-left",
      image: {
        src: "/assets/img/sustainability/young-woman-using-phone-while-sitting-table.jpg",
        alt: "Young business woman working at a table"
      },
      usp: {
        variant: "default",
        isSlider: false,
        slidesPerViewDesktop: 4,
        slidesPerViewMobile: 1,
        gridColsDesktop: 2,
        gridColsMobile: 1,
      },
    },

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
        iconRight: "arrow-right",
        href: "/about"
      },
      {
        text: "Contact Us",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "phone",
        href: "/contact"
      }
    ]
  },

  fiberPreview: {
    config: {
      sectionId: "section-about-fiber-preview",
      className: "bg-light rounded-[32px]",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "bg-right-top md:bg-right",
      bgSizeClass: "bg-cover",
      layoutVariant: "default",
      image: {
        src: "",
        alt: ""
      },
      usp: {
        variant: "default",
        isSlider: false,
        slidesPerViewDesktop: 4,
        slidesPerViewMobile: 1,
        gridColsDesktop: 4,
        gridColsMobile: 1,
      },
    },

    introData: {
      as: "h2",
      label: "WHY CHOOSE US",
      title: "Advantages That Drive Your Business Forward",
      description: "",
      align: "left"
    },

    uspList: [
      {
        iconURL: "/assets/icons/fiber/nation-covered.png",
        title: "Nation Covered",
        description: "Connect seamlessly across the nation with our extensive coverage, ensuring reliable internet access wherever you go"
      },
      {
        iconURL: "/assets/icons/fiber/25th.png",
        title: "25 Years of Service",
        description: "Since 1996, we have been present to build Indonesian connectivity."
      },
      {
        iconURL: "/assets/icons/fiber/fast-stable.png",
        title: "Fast & Stable",
        description: "Enjoy lightning-fast speeds and unwavering stability with your internet service"
      },
      {
        iconURL: "/assets/icons/fiber/secure-internet.png",
        title: "Secure Internet",
        description: "Experience peace of mind with our secure internet service, safeguarding your online activities and protecting your data"
      },
    ],

    ctaList: [
      {
        text: "About Us",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        href: "/solutions"
      }
    ]
  },

  mediaPreview: {
    config: {
      sectionId: "section-about-media-preview",
      className: "bg-light rounded-[32px]",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "bg-right-top md:bg-right",
      bgSizeClass: "bg-cover",
      layoutVariant: "default",
      image: {
        src: "",
        alt: ""
      },
      usp: {
        variant: "default",
        isSlider: false,
        slidesPerViewDesktop: 4,
        slidesPerViewMobile: 1,
        gridColsDesktop: 3,
        gridColsMobile: 1,
      },
    },

    introData: {
      as: "h2",
      label: "WHY LINKNET MEDIA",
      title: "Why Choose Us?",
      description: "Link Net empowers your business with trusted connectivity and technology solutions — because with us, transformation is certain.",
      align: "left"
    },

    uspList: [
      {
        iconURL: "/assets/icons/media/4k.svg",
        title: "Most HD & 4K Channels",
        description: "Most HD and 4K channels for superior customer experience"
      },
      {
        iconURL: "/assets/icons/media/first-tv.svg",
        title: "First TV Anywhere in Indonesia",
        description: "First to launch TV Anywhere with 100+ channels"
      },
      {
        iconURL: "/assets/icons/media/ott.svg",
        title: "Partnered with Leading OTTs",
        description: "Recently partnered with OTT providers to enhance the content library"
      },
      {
        iconURL: "/assets/icons/media/world.svg",
        title: "Global & Local Content Partners",
        description: "Content sourced from diverse international and local providers with strong partnerships"
      },
      {
        iconURL: "/assets/icons/media/heart.svg",
        title: "Global & Local Content Partners",
        description: "In-depth understanding of Indonesia's viewership preferences for locals and international visitors"
      },
    ],

    ctaList: [
      {
        text: "More About Us",
        variant: "secondary-outline",
        size: "lg",
        iconLeft: "",
        href: "/about"
      }
    ]
  },

  // Jika nanti ada halaman lain, tambahkan key baru di sini:
  // enterprise: { ... }
};
