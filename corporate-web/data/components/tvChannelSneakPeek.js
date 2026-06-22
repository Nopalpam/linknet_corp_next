export const TV_CHANNEL_SNEAK_PEEK_DATA = {
  home: {
    config: {
      sectionId: 'tv-channel-sneak-peek',
      className: 'bg-light-2',
      bgImage: '',
      bgImageMobile: '',
      bgPositionClasses: 'bg-center md:bg-center',
      bgSizeClass: 'bg-cover',
      initialTab: 'all',
      displayLimit: 8,
      mobileSlidesPerView: 2.1,
      mobileGridRows: 2
    },
    introData: {
      as: 'h2',
      title: 'Enjoy 100+ of the best TV channels',
      align: 'left'
    },
    tabs: [
      { value: 'all', label: 'All Channel' },
      { value: 'sports', label: 'Sports' },
      { value: 'variety', label: 'Variety' },
      { value: 'movies', label: 'Movies' },
      { value: 'kids', label: 'Kids' },
      { value: 'news', label: 'News' },
      { value: 'indian', label: 'Indian' },
      { value: 'chinese', label: 'Chinese' }
    ],
    ctaList: [
      {
        text: 'See All Channel',
        variant: 'secondary-outline',
        size: 'lg',
        href: '/entertainment/channels'
      }
    ]
  }
};

export default TV_CHANNEL_SNEAK_PEEK_DATA;
