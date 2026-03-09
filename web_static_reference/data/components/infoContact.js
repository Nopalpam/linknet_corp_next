export const INFO_CONTACT_DATA = {
  // Data berdasarkan kode HTML yang Anda berikan
  "enterprise": {
    introData: {
      as: "h2",
      title: "Get More Information about Linknet EnterpriseCo",
      description: "Have questions or need more information? Our team is here to help. Reach out to us and we’ll respond as soon as possible.",
      align: "center"
    },
    items: [
      {
        icon: "world", // Pastikan nama icon ini ada di komponen <Icon /> Anda
        label: "Visit Website",
        value: "enterprise.linknet.co.id",
        href: "https://enterprise.linknet.co.id",
        target: "_blank"
      },
      {
        icon: "phone",
        label: "Hubungi CS",
        value: "(021) 2994 0808",
        href: "tel:+622129940808"
      },
      {
        icon: "mail",
        label: "Email",
        value: "enterprise.inquiry@linknet.co.id",
        href: "mailto:enterprise.inquiry@linknet.co.id"
      }
    ]
  },
  
  // Data berdasarkan referensi gambar "Engage With Us"
  "esg": {
    introData: {
      as: "h2",
      title: "Engage With Us",
      description: "Meet our ESG team, connect with us, and share your feedback to help shape a more sustainable future together.",
      align: "center"
    },
    items: [
      {
        icon: "phone", 
        label: "Contact ESG Team",
        value: "(021) 2994 0808",
        href: "tel:+622129940808"
      },
      {
        icon: "mail",
        label: "Email ESG Team",
        value: "esg-inquiry@linknet.co.id",
        href: "mailto:esg-inquiry@linknet.co.id"
      }
    ]
  }
};