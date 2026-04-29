export const INFO_LIST_DATA = {
  "media": {
    config: {
      sectionId: "vision",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: "h2",
      label: "MEDIA & ACTIVITIES",
      title: "Keep up with what’s happening at Linknet",
      description: "Stay Update",
      align: "left"
    },
    items: [
      {
        id: "vision",
        title: "Our Vision",
        // 1. contents diubah menjadi string HTML
        contents: "<p>The company was founded under the name PT Seruling Indah Permai in 1996 and then changed its name to PT Linknet Tbk in 2000 with business activities in the field of trading goods and services.</p><p>The Company operates HFC and FTTH cable systems with high technology and two-way broadband services.</p>",
        relatedArticles: [
          {
            text: "Linknet Successfully Completed IPO On The Indonesia Stock Exchange (IDX)",
            url: "#"
          },
          {
            text: "Rebranding of OTT Service From \"First Media Live\" To \"First Media Go\"",
            url: "#"
          }
        ],
        documents: [
          {
            title: "Anti-Bribery and Anti-Corruption Policy",
            date: "February 26, 2025",
            icon: "/assets/icons/pdf-circlesvg.svg",
            url: "#"
          },
          {
            title: "Gifts, Donations & Sponsorships Policy",
            date: "February 26, 2025",
            icon: "/assets/icons/pdf-circlesvg.svg",
            url: "#"
          },
          {
            title: "Anti-Bribery and Anti-Corruption Clauses",
            date: "Mei 22, 2023",
            icon: "/assets/icons/pdf-circlesvg.svg",
            url: "#"
          }
        ],
        ctaList: [
            {
                text: "Get to Know Us",
                variant: "primary",
                size: "lg",
                iconLeft: "",
                iconRight: "",
                href: "/about"
            },
            {
                text: "Contact Us",
                variant: "secondary-outline",
                size: "lg",
                iconLeft: "",
                iconRight: "",
                href: "/contact"
            }
        ]
      },
      {
        id: "about",
        title: "About Linknet",
        // 1. contents diubah menjadi string HTML
        contents: "<p>Linknet is dedicated to improving lives and supporting Indonesia's digital growth by delivering smart, reliable technology infrastructure through its three main business units.</p>"
      }
    ],
    // 2. Tambahkan ctaList di sini

  }
};
