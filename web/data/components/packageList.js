export const PACKAGE_LIST_DATA = {
  enterprise: {
    config: {
      sectionId: "enterprise-package-list",
      className: "",
      bgImage: "",
      bgImageMobile: "",
      bgPositionClasses: "",
      bgSizeClass: ""
    },
    introData: {
      as: 'h2',
      title: 'Discover Linknet Near You, Check Business Coverage Availability Today',
      description:
        '',
      align: 'center',
    },
    highlights: [
      { icon: 'phone', text: '24/7 support' },
      { icon: 'shield', text: 'Network Security' },
      { icon: 'business', text: 'Consult with Expert' },
    ],
    packages: [
      {
        id: 1,
        title: 'Broadband',
        speed: '30',
        speedUnit: 'Mbps',
        badgeText: 'Up To',
        description:
          'Connectivity package consisting of ONT and broadband connectivity up to 30 Mbps.',
        price: 'Rp350.000',
        priceUnit: '/month',
        registrationInternetService: 'Broadband 30 Mbps - Rp 350.000/Bulan',
        bodyTitle: "What you’ll get",
        features: [
          { url: '/assets/icons/home-wifi.svg', text: 'Unlimited Internet' },
          { url: '/assets/icons/plug-and-play.svg', text: 'Modem Internet' },
          { url: '/assets/icons/shield.svg', text: 'SLA 98,5%' },
        ],
        primaryCtaLabel: 'Sign Up Now',
        primaryCtaHref: '#',
        secondaryCtaLabel: 'Call Our Sales',
        secondaryCtaHref: '#',
      },
      {
        id: 2,
        title: 'Broadband',
        speed: '50',
        speedUnit: 'Mbps',
        badgeText: 'Up To',
        description:
          'Connectivity package consisting of ONT and broadband connectivity up to 50 Mbps.',
        price: 'Rp400.000',
        priceUnit: '/month',
        registrationInternetService: 'Broadband 50 Mbps - Rp 400.000/Bulan',
        bodyTitle: "What you’ll get",
        features: [
          { url: '/assets/icons/home-wifi.svg', text: 'Unlimited Internet' },
          { url: '/assets/icons/plug-and-play.svg', text: 'Modem Internet' },
          { url: '/assets/icons/shield.svg', text: 'SLA 98,5%' },
        ],
        primaryCtaLabel: 'Sign Up Now',
        primaryCtaHref: '#',
        secondaryCtaLabel: 'Call Our Sales',
        secondaryCtaHref: '#',
      },
      {
        id: 3,
        title: 'Broadband',
        speed: '100',
        speedUnit: 'Mbps',
        badgeText: 'Up To',
        description:
          'Connectivity package consisting of ONT',
        price: 'Rp600.000',
        priceUnit: '/month',
        registrationInternetService: 'Broadband 100 Mbps - Rp 600.000/Bulan',
        bodyTitle: "What you’ll get",
        features: [
          { url: '/assets/icons/home-wifi.svg', text: 'Unlimited Internet' },
          { url: '/assets/icons/plug-and-play.svg', text: 'Modem Internet' },
        ],
        primaryCtaLabel: 'Sign Up Now',
        primaryCtaHref: '#',
        secondaryCtaLabel: 'Call Our Sales',
        secondaryCtaHref: '#',
      },
    ],
    footerText:
      'The price displayed is the monthly rate excluding applicable taxes. The total price for the plan to be paid upfront at checkout includes the monthly rate multiplied by the number of months in your plan, along with any applicable taxes.',
  },
};
