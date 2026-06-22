import { TV_HIGHLIGHT_SLIDERS_DATA } from './tvHighlightSliders';

const TV_HIGHLIGHT_HERO_IMAGE_MAP = {
  1: '/assets/img/tv-highlight/thumbnail/fast-farious.jpg',
  2: '/assets/img/tv-highlight/thumbnail/hitman-2.jpg',
  3: '/assets/img/tv-highlight/thumbnail/midnight-runners.jpg',
  4: '/assets/img/tv-highlight/thumbnail/mr-bean-holiday.jpg',
  5: '/assets/img/tv-highlight/thumbnail/mummy.jpg',
  6: '/assets/img/tv-highlight/thumbnail/my-doughter-zombie.jpg',
  7: '/assets/img/tv-highlight/thumbnail/papa-zola.jpg'
};

const sourceSlides = TV_HIGHLIGHT_SLIDERS_DATA['today-highlight']?.items || [];

export const HERO_SLIDERS_TV_HIGHLIGHT_DATA = {
  config: {
    sectionId: 'hero-sliders-tv-highlight',
    className: '',
    bgImage: '',
    bgImageMobile: '',
    thumbsVisible: false,
    bgPositionClasses: '',
    bgSizeClass: ''
  },
  'today-highlight': {
    slides: sourceSlides.map((item) => ({
      ...item,
      tabTitle: item.title,
      heroImage: TV_HIGHLIGHT_HERO_IMAGE_MAP[item.id] || item.bgImageVertical || item.posterImage,
      logoSrc: item.channelLogo,
      genre: item.genre || item.rating || '',
      ctaList: [
        { text: 'View Detail', variant: 'secondary-outline--white', size: 'lg' }
      ]
    }))
  }
};
