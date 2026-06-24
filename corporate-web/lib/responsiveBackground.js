function normalizeImageUrl(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function getResponsiveBackgroundProps(bgImage, bgImageMobile) {
  const desktopImage = normalizeImageUrl(bgImage);
  const mobileImage = normalizeImageUrl(bgImageMobile) || desktopImage;
  const hasBackgroundImage = Boolean(desktopImage || mobileImage);

  if (!hasBackgroundImage) {
    return {
      hasBackgroundImage: false,
      backgroundStyle: undefined,
      backgroundImageClassName: '',
    };
  }

  return {
    hasBackgroundImage,
    backgroundStyle: {
      '--bg-image-desktop': desktopImage ? `url('${desktopImage}')` : undefined,
      '--bg-image-mobile': mobileImage ? `url('${mobileImage}')` : undefined,
    },
    backgroundImageClassName: 'bg-[image:var(--bg-image-mobile)] md:bg-[image:var(--bg-image-desktop)]',
  };
}
