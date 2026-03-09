/* /src/scripts/lnHero-indicators.js */
const lnHeroSwiper = new Swiper('.lnHeroSwiper', {
    slidesPerView: 1,
    loop: false,
    speed: 700,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    autoplay: { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: false },
    keyboard: { enabled: true },
    navigation: {
        // jika masih ingin tombol default aktif
        nextEl: '.lnHeroSwiper .swiper-button-next',
        prevEl: '.lnHeroSwiper .swiper-button-prev'
    }
});

// Hook nav custom
const root = document.querySelector('.lnHeroSwiper');
const prevBtn = root?.querySelector('.lnHeroSwiper-nav-prev');
const nextBtn = root?.querySelector('.lnHeroSwiper-nav-next');

function bind(el, fn) {
    if (!el) return;
    el.addEventListener('click', fn);
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fn();
        }
    });
}

bind(prevBtn, () => lnHeroSwiper.slidePrev());
bind(nextBtn, () => lnHeroSwiper.slideNext());

// Optional: disable state saat tidak bisa navigasi (jika loop:false)
function updateDisabled() {
    const atStart = lnHeroSwiper.isBeginning;
    const atEnd = lnHeroSwiper.isEnd;
    prevBtn?.setAttribute('aria-disabled', String(atStart));
    nextBtn?.setAttribute('aria-disabled', String(atEnd));
    prevBtn && (prevBtn.style.opacity = atStart ? '.5' : '1');
    nextBtn && (nextBtn.style.opacity = atEnd ? '.5' : '1');
}
lnHeroSwiper.on('afterInit slideChange transitionEnd', updateDisabled);
updateDisabled();

// Pakai indikator statis di DOM
const indicators = Array.from(document.querySelectorAll('#lnHeroIndicators .lnHeroIndicator'));

// Klik → pindah slide
indicators.forEach((btn) => {
    btn.addEventListener('click', () => {
        const i = Number(btn.dataset.index || 0);
        lnHeroSwiper.slideTo(i);
    });
});

// Set active
function setActive(i) {
    indicators.forEach((el, k) => {
        el.classList.toggle('is-active', k === i);
        const bar = el.querySelector('.lnHeroIndicator__bar');
        if (k !== i && bar) bar.style.setProperty('--p', '0'); // reset non-aktif
    });
}
setActive(lnHeroSwiper.realIndex);

// Progress bar via autoplayTimeLeft (0..1)
lnHeroSwiper.on('autoplayTimeLeft', (sw, timeLeft, progress) => {
    const i = sw.realIndex;
    const bar = indicators[i]?.querySelector('.lnHeroIndicator__bar');
    if (!bar) return;
    bar.style.setProperty('--p', `${(1 - progress) * 100}`); // 0→100%
});

// Update active on change
lnHeroSwiper.on('slideChange', (sw) => setActive(sw.realIndex));



// 

/**
 * Reusable Swiper initializer:
 * - Shows custom nav only if slideCount > 3
 * - Always hides nav on mobile via CSS (also respected here)
 */
function initLnSwiper(rootEl, opts = {}) {
    const root = typeof rootEl === 'string' ? document.querySelector(rootEl) : rootEl;
    if (!root) return null;

    const prevEl = root.querySelector('.lnSwiperNav__prev');
    const nextEl = root.querySelector('.lnSwiperNav__next');
    const pagEl  = root.querySelector('.swiper-pagination');
    const navWrap = root.querySelector('.lnSwiperNav');

    const slideCount = root.querySelectorAll('.swiper-wrapper > .swiper-slide').length;

    const swiper = new Swiper(root, {
        speed: 600,
        loop: false,
        grabCursor: true,
        spaceBetween: 24,
        slidesPerView: 1.1, // mobile default
        pagination: pagEl ? { el: pagEl, clickable: true } : undefined,
        navigation: (prevEl && nextEl) ? { prevEl, nextEl } : undefined,
        breakpoints: {
            768:  { slidesPerView: 2, spaceBetween: 20 },
            992:  { slidesPerView: 3, spaceBetween: 24 }
        }
    });

    // Show nav only if slideCount > 3 AND viewport >= 768px
    const mqDesktop = window.matchMedia('(min-width: 768px)');
    function applyNavVisibility() {
        const show = slideCount > 3 && mqDesktop.matches;
        if (navWrap) navWrap.style.display = show ? '' : 'none';
        if (prevEl) prevEl.style.display = show ? '' : 'none';
        if (nextEl) nextEl.style.display = show ? '' : 'none';
    }
    applyNavVisibility();
    mqDesktop.addEventListener('change', applyNavVisibility);

    return swiper;
}

// Init for Services slider
initLnSwiper('.lnServiceSwiper');

const lnTabsFilter = new Swiper('.lnTabsFilter', {
    slidesPerView: 'auto',
    spaceBetween: 8,
    freeMode: true,
});


/* ===== Filter logic by data-group ===== */
(() => {
    const chips = Array.from(document.querySelectorAll('.lnTabsFilter .lnTab'));
    const grid  = document.getElementById('lnAwardsGrid');
    if (!chips.length || !grid) return;

    const cards = Array.from(grid.querySelectorAll('[data-year]'));

    const setActiveChip = (val) => {
        chips.forEach(ch => {
            const active = (ch.dataset.filter === val) || (val === 'all' && ch.dataset.filter === 'all');
            ch.classList.toggle('is-active', active);
            ch.setAttribute('aria-selected', String(active));
            ch.setAttribute('tabindex', active ? '0' : '-1');
        });
    };

    const show = (el) => el.classList.remove('is-hidden');
    const hide = (el) => el.classList.add('is-hidden');

    const applyFilter = (val = 'all') => {
        const v = String(val).toLowerCase();
        cards.forEach(card => {
            const year = String(card.getAttribute('data-year')).toLowerCase();
            if (v === 'all' || v === year) show(card);
            else hide(card);
        });
        setActiveChip(v);
        // sync URL param (tanpa reload)
        const url = new URL(window.location.href);
        if (v === 'all') url.searchParams.delete('year'); else url.searchParams.set('year', v);
        history.replaceState({}, '', url);
    };

    // Click handlers
    chips.forEach(ch => {
        ch.addEventListener('click', () => applyFilter(ch.dataset.filter || 'all'));
    });

    // Initial state: by URL ?year=YYYY or .is-active chip or 'all'
    const getInit = () => {
        const sp = new URLSearchParams(location.search);
        const byQuery = sp.get('year');
        if (byQuery && (byQuery === 'all' || chips.some(c => c.dataset.filter === byQuery))) return byQuery;
        const byActive = chips.find(c => c.classList.contains('is-active') || c.getAttribute('aria-selected') === 'true');
        return byActive?.dataset.filter || 'all';
    };

    applyFilter(getInit());
})();

const swiper = new Swiper('.joinSquadSwiper', {
    centeredSlides: true,
    slidesPerView: 1.4,
    spaceBetween: 12,
    initialSlide: 1,
    speed: 600,
    loop: false,
    grabCursor: true,
    navigation: {
        nextEl: '.joinSquadSwiper .lnSwiperNav__next',
        prevEl: '.joinSquadSwiper .lnSwiperNav__prev'
    },
    keyboard: { enabled: true },
    breakpoints: {
        992: { 
            spaceBetween: 16, 
            slidesPerView: 3,
        },
        1400: { 
            slidesPerView: 3,
            spaceBetween: 20, 
        }
    }
});

// Sync joinCopy with active slide
const $title = document.getElementById('joinCopyTitle');
const $desc  = document.getElementById('joinCopyDesc');
const $cta   = document.getElementById('joinCopyCta');
const $ctaTxt= document.getElementById('joinCopyCtaText');

function updateCopy() {
    const slide = document.querySelector('.joinSquadSwiper .swiper-slide-active');
    if (!slide) return;
    const headline = slide.dataset.headline || '—';
    const desc     = slide.dataset.desc || '';
    const cta      = slide.dataset.cta  || 'Learn More';
    const href     = slide.dataset.href || '#';

    $title.textContent = headline;
    $desc.textContent  = desc;
    $ctaTxt.textContent = cta;
    $cta.setAttribute('href', href);
}

// Init + on change
swiper.on('init', updateCopy);
swiper.on('slideChangeTransitionEnd', updateCopy);
if (swiper.initialized) updateCopy(); else swiper.init();


const careerSwiper = new Swiper('.careerSwiper', {
    slidesPerView: 1.4,
    centeredSlides: false,
    spaceBetween: 16,
    speed: 500,
    loop: false,
    grabCursor: true,
    keyboard: { enabled: true },
    navigation: {
        nextEl: '.careerSwiper .lnSwiperNav__next',
        prevEl: '.careerSwiper .lnSwiperNav__prev'
    },
    breakpoints: {
        576:  { slidesPerView: 2.4, spaceBetween: 16 },
        768:  { slidesPerView: 3,   spaceBetween: 20, grabCursor: false },
        1200: { slidesPerView: 4,   spaceBetween: 20, grabCursor: false }
    },
});

const keyHighlightSwiper = new Swiper('.lnKHSlider', {
    slidesPerView: 1.2,
    spaceBetween: 16,
    centeredSlides: true,
    centeredSlidesBounds: true,
    speed: 500,
    loop: false,
    grabCursor: true,
    keyboard: { enabled: true },
    navigation: {
        nextEl: '.lnKHSliderWrap .lnSwiperNav__next',
        prevEl: '.lnKHSliderWrap .lnSwiperNav__prev'
    },
    breakpoints: {
        576:  { slidesPerView: 2.1, spaceBetween: 16 },
        768:  { slidesPerView: 2.1,   spaceBetween: 20, grabCursor: false },
        1200: { slidesPerView: 3.2,   spaceBetween: 16, grabCursor: false }
    },
});

const FeaturedArticleSwiper = new Swiper('.lnFeaturedArticleSwiper', {
    slidesPerView: 1.2,
    spaceBetween: 16,
    centeredSlides: true,
    centeredSlidesBounds: true,
    grabCursor: true,
    breakpoints: {
      576: { slidesPerView: 2,   spaceBetween: 20 },
      992: { slidesPerView: 3,   spaceBetween: 28, grabCursor: false, allowTouchMove: false}
    }
});

const filterSwiper = new Swiper('.lnFilters', {
    slidesPerView: 'auto',
    spaceBetween: 8,
    freeMode: true,
});


function setupMarquee(rootEl = document) {
  rootEl.querySelectorAll('.marquee').forEach((marquee) => {
    const content = marquee.querySelector('.marquee-content');
    if (!content) return;

    // 1) Ambil snapshot isi asli (untuk loopDistance yang stabil)
    const originalChildren = Array.from(content.children).map(node => node.cloneNode(true));

    // 2) Bersihkan & pasang kembali isi asli (hindari innerHTML+= yang bisa buang listener)
    content.innerHTML = '';
    originalChildren.forEach(n => content.appendChild(n));

    // 3) Pastikan ukuran sudah render (font/img bisa mempengaruhi)
    const compute = () => {
      const containerW = marquee.clientWidth;
      const originalW  = content.scrollWidth;

      // set loop distance = lebar konten asli
      marquee.style.setProperty('--loop-distance', `${originalW}px`);

      // 4) Gandakan sampai total lebar >= container + originalW (butuh 2 blok agar seamless)
      //    Tujuannya: saat geser -originalW, blok kembar persis menyambung tanpa gap.
      while (content.scrollWidth < containerW + originalW) {
        originalChildren.forEach(n => content.appendChild(n.cloneNode(true)));
      }
    };

    // Hitung awal
    compute();

    // Recompute saat resize (responsif, tidak "hilang" saat viewport berubah)
    let rafId;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        compute();
      });
    });
    ro.observe(marquee);

    // Recompute setelah font/gambar load (kalau ada)
    window.addEventListener('load', compute, { once: true });
  });
}

setupMarquee();

const socSwiper = new Swiper('.lnSocSwiper', {
    slidesPerView: 1.1,           // mobile default
    spaceBetween: 12,
    centeredSlides: true,
    centeredSlidesBounds: true,
    // freeMode: { enabled: true },  // biar bisa “geser” bebas di mobile
    watchOverflow: true,
    breakpoints: {
      // ≥768px (tablet): 3
      768: { slidesPerView: 3, spaceBetween: 16, freeMode: { enabled: false } },
      // ≥992px (desktop): 3
      992: { slidesPerView: 3, spaceBetween: 16, freeMode: { enabled: false } },
    },
  });


document.querySelectorAll('.lnUSPSwiper').forEach((el) => {
    const slidesPerView = el.dataset.slidesPerView || 'auto';
    // const spaceBetween = parseInt(el.dataset.spaceBetween || 0, 10);

    new Swiper(el, {
        slidesPerView: 1.4,           // mobile default
        spaceBetween: 12,
        freeMode: true,
        centeredSlides: true,
        centeredSlidesBounds: true,
        // freeMode: { enabled: true },  // biar bisa “geser” bebas di mobile
        watchOverflow: true,
        breakpoints: {
            // ≥768px (tablet): 3
            768: { slidesPerView: 3, spaceBetween: 16, freeMode: { enabled: false } },
            // ≥992px (desktop): 3
            992: { slidesPerView: slidesPerView === 'auto' ? 'auto' : parseFloat(slidesPerView), spaceBetween: 24, allowTouchMove: false,  simulateTouch: false, grabCursor: false, freeMode: { enabled: false } },
        },
    });
});


const lnTabsBusiness = new Swiper('.lnTabs-Business', {
    slidesPerView: 'auto',
    spaceBetween: 8,
    freeMode: true,
});

const businessSwiper = new Swiper('.lnSwiperBusinessTabs', {
    slidesPerView: 1,
    spaceBetween: 16,
    speed: 800,
    thumbs: {
        swiper: lnTabsBusiness,
      },
    navigation: {
        nextEl: '.lnSwiperBusinessTabs .lnSwiperNav__next',
        prevEl: '.lnSwiperBusinessTabs .lnSwiperNav__prev'
    },
     breakpoints: {
        // ≥992px (desktop): 3
        992: { 
            allowTouchMove: false, simulateTouch: false,
            slidesPerView: 1.2,
        },
    },
});


