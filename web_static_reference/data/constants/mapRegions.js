export const MAP_REGIONS_DATA = {
  // Warna untuk peta
  colors: {
    covered: "#009b77", // GREEN
    noCoverage: "#8ad1c0" // NEUTRAL_200
  },

  // Data Business Units dengan koordinat presisi dari Topology
  businessUnits: {
    "BU1": { 
      label: "Area", 
      title: "Sumatera", 
      lat: 2.36304,    // Dari ID.SU (Sumatera Utara)
      lon: 99.2161,
      cities: ["Medan", "Batam", "Palembang"] 
    },
    "BU2": { 
      label: "Area", 
      title: "Jakarta", 
      lat: -6.22462,   // Dari ID.JK (Jakarta Raya)
      lon: 106.837,
      cities: ["Jabo 1", "Jabo 2", "Jabo 3"] 
    },
    "BU3": { 
      label: "Area", 
      title: "West Java", 
      lat: -6.90763,   // Dari ID.JR (Jawa Barat)
      lon: 107.638,
      cities: ["Bandung", "Cirebon", "Cikampek", "Purwakarta", "Subang", "Sukabumi", "Sumedang", "Cianjur", "Ciamis", "Kuningan", "Indramayu"] 
    },
    "BU4": { 
      label: "Area", 
      title: "Central Java", 
      lat: -7.2901,    // Dari ID.JT (Jawa Tengah)
      lon: 109.896,
      cities: ["Semarang", "Yogyakarta", "Solo", "Tegal", "Purwokerto", "Pemalang", "Mojokerto", "Demak", "Pati", "Banyumas", "Magelang", "Purbalingga", "Brebes", "Cilacap"] 
    },
    "BU5": { 
      label: "Area", 
      title: "East Java & Bali", 
      lat: -7.88129,   // Dari ID.JI (Jawa Timur)
      lon: 112.616,
      cities: ["Surabaya", "Gresik", "Sidoarjo", "Malang", "Kediri", "Madiun", "Bali", "Bojonegoro", "Tulungagung", "Probolinggo", "Ponorogo"] 
    }
  },

  // Mapping hc-key provinsi ke Business Unit
  provinceMap: {
    "id-su": "BU1",
    "id-kr": "BU1",
    "id-sl": "BU1",
    "id-jk": "BU2",
    "id-jr": "BU3",
    "id-jt": "BU4",
    "id-yo": "BU4",
    "id-ji": "BU5",
    "id-ba": "BU5"
  }
};