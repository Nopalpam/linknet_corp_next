// careerSneakPeek.js

const careerSneakPeek = {
  id: "career-sneak-peek-section",
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
      href: "/life-at-linknet/career" // Sesuaikan dengan routing halaman karir utamamu
    }
  ]
};

export default careerSneakPeek;