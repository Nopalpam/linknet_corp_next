// src/data/components/mainFooter.js

export const MAIN_FOOTER_DATA = {
  "default": {
    logo: "/assets/logos/linknet-logo.svg", 
    slogan: "We LINK the nation for better lives",
    address: "Centennial Tower Lantai 26, Unit D. Jl. Jenderal Gatot Subroto Kav. 24-25. Jakarta 12930, Indonesia.",
    contact: {
      email: "corporate.secretary@linknet.co.id",
      phone: "021-29536800"
    },
    menus: [
      {
        title: "COMPANY",
        links: [
          { label: "About Linknet", href: "/about-us" },
          { label: "Management", href: "/management" },
          { label: "Awards", href: "/awards" },
          { label: "Newsroom", href: "/newsroom" },
          { label: "Career", href: "/career" },
        ]
      },
      {
        title: "INVESTOR",
        links: [
          { label: "Stock Price", href: "/investor/stock-price" },
          { label: "Announcement", href: "/investor/announcement" },
          { label: "Reports", href: "/investor/reports" },
        ]
      },
      {
        title: "PLATFORM",
        links: [
          { label: "Privacy Notice", href: "/privacy-notice" },
          { label: "Cookies Policy", href: "/cookies-policy" },
          { label: "Contact Us", href: "/contact" },
          { label: "Sitemap", href: "/sitemap" },
        ]
      }
    ],
    socials: [
      { iconName: "instagram", href: "#" },
      { iconName: "youtube", href: "#" },
    ],
    copyright: "Copyright © 1996 - 2025 PT Link Net Tbk. All Right Reserved."
  }
};

export default MAIN_FOOTER_DATA;