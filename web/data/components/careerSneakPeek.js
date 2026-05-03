// careerSneakPeek.js

const careerSneakPeek = {
  config: {
    sectionId: "career-sneak-peek-section",
    className: "",
    bgImage: "",
    bgImageMobile: "",
    bgPositionClasses: "",
    bgSizeClass: ""
  },
  limit: 8, // Menampilkan 4 card sesuai desain (grid 4 kolom)
  introData: {
    as: "h2",
    label: "Let's Discover Possibilities Together", // Menggantikan preTitle
    title: "Let's join Linknet and become First Squad, now!",
    align: "center"
  },
  ctaList: [
    {
      text: "Discover More",
      variant: "secondary-outline",
      size: "lg",
      iconLeft: "",
      iconRight: "",
      href: "/career" // Sesuaikan dengan routing halaman karir utamamu
    }
  ]
};

export default careerSneakPeek;
