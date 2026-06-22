// path: src/data/hospitality.js

export const hospitalityData = {
  // Bagian Kategori (Hotel, Villa, dsb)
  hospitalityUsage: {
    title: "Our OTT solutions extend beyond homes.",
    desc: "Delivering scalable, secure, and premium entertainment experiences for every business environment.",
    items: [
      {
        id: 1,
        label: 'Hotels & Resorts',
        image: 'https://d2fsl11s4twg7t.cloudfront.net/assets/bg/room-interior-hotel-bedroom.jpg',
        title: 'Premium Guest Entertainment Experience',
        features: [
          'Optimized for modern hospitality environments',
          'Premium, secure entertainment for every room',
          'Customizable tailored to your brand'
        ],
        textCTA: 'Schedule a Demo'
      },
      {
        id: 2,
        label: 'Apartments & Serviced Residences',
        image: 'https://d2fsl11s4twg7t.cloudfront.net/assets/bg/hospitality_apartment.jpg',
        title: 'Smart Living Entertainment Solution',
        features: [
          'Centralized entertainment for multi-unit properties',
          'Easy installation',
          'Flexible packages'
        ],
        textCTA: 'Schedule a Demo'
      },
      
      {
        id: 3,
        label: 'Hospitals & Clinics',
        image: 'https://d2fsl11s4twg7t.cloudfront.net/assets/bg/hospitality_hospital.jpg',
        title: 'Comfort-Focused Patient Experience',
        features: [
          'On-demand entertainment for patients and visitors',
          'Quiet, secure, and reliable system operation',
          'Easy integration with existing infrastructure'
        ],
        textCTA: 'Schedule a Demo'
      },
      {
        id: 4,
        label: 'Corporate Office',
        image: 'https://d2fsl11s4twg7t.cloudfront.net/assets/bg/mateusz-zatorski-wN9oyogyjQc-unsplash.jpg',
        title: 'Engaging Workplace Entertainment',
        features: [
          'Entertainment and information displays for common areas',
          'Live TV, streaming and digital content access',
          'Enhance employee experience and workplace engagement'
        ],
        textCTA: 'Schedule a Demo'
      },
      {
        id: 5,
        label: 'Lounges & Airports',
        image: 'https://d2fsl11s4twg7t.cloudfront.net/assets/bg/wkh-studio-8DxDVnNGhzI-unsplash.jpg',
        title: 'Seamless Public Entertainment',
        features: [
          'Reliable streaming for high-traffic environments',
          'Premium content for passenger comfort',
          'Scalable deployment across multiple locations'
        ],
        textCTA: 'Schedule a Demo'
      }
    ]
  },

  // Bagian Fitur Global (Icon & Title)
  hospitalityFeatures: {
    title: "Enterprise-Grade Hospitality Features",
    items: [
      { 
        id: 1, 
        icon: 'world', 
        title: 'Centralized content management' 
      },
      { 
        id: 2, 
        icon: 'full-screen', 
        title: 'Customizable home screen for property branding' 
      },
      { 
        id: 3, 
        icon: 'building', 
        title: 'Multi-room deployment' 
      },
      { 
        id: 4, 
        icon: 'shield', 
        title: 'Secure & controlled access' 
      },
      { 
        id: 5, 
        icon: 'plug-and-play', 
        title: 'Plug-and-play for large installations' 
      }
    ]
  },
  hospitalityAppFeatures: {
    title: "Enjoy our Hospitality Feature",
    items: [
      {
        id: 1,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-welcome-note.webp',
        title: 'Welcome Message',
        desc: 'Display personalized greetings on screen to welcome visitors upon arrival.'
      },
      {
        id: 2,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-inroom-dining.webp',
        title: 'Service Ordering',
        desc: 'Browse menus or services and place orders directly through the screen.'
      },
      {
        id: 3,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-amenities.webp',
        title: 'Service Requests',
        desc: 'Request additional services or facilities easily without leaving your space.'
      },
      {
        id: 4,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-travel.webp',
        title: 'Area Guide',
        desc: 'Access nearby attractions, facilities, and useful local information.'
      },
      {
        id: 5,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-shopping.webp',
        title: 'Local Recommendations',
        desc: 'Discover curated shopping, dining, and local service recommendations.'
      },
      {
        id: 6,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-billing.webp',
        title: 'Billing Information',
        desc: 'View billing or transaction details conveniently through the TV interface.'
      },
      {
        id: 7,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-multi-lang.webp',
        title: 'Multi-Language Support',
        desc: 'Support multiple languages for a more comfortable and inclusive experience.'
      },
      {
        id: 8,
        iconSrc: 'https://d2fsl11s4twg7t.cloudfront.net/assets/icons/hospitality/app/icon-notif.webp',
        title: 'Screen Notifications',
        desc: 'Send announcements, promotions, or messages directly to screens in real time.'
      }
    ]
  }
};

export default hospitalityData;