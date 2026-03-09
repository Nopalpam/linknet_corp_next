// Section Business Tab
const tabsSwiper = new Swiper('.lnTabs', {
    slidesPerView: 'auto',
    spaceBetween: 2,          // ganti margin antar-tab
    freeMode: true,        
});

(() => {
  const initLnTabs = (rootSel = '.lnTabsWrapper') => {
    document.querySelectorAll(rootSel).forEach((wrapper) => {
      const tabsContainer = wrapper.querySelector('.lnTabs');
      const tabs = Array.from(wrapper.querySelectorAll('.lnTabs .lnTab'));
      const panels = Array.from(wrapper.querySelectorAll('.lnTabPanel'));

      if (!tabs.length || !panels.length) return;

      const getPanelForBtn = (btn) => {
        const sel = btn.dataset.target;
        return sel ? wrapper.querySelector(sel) : null;
      };

      const activate = (idx) => {
        // Tabs state + ARIA
        tabs.forEach((t, i) => {
          const active = i === idx;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', String(active));
          t.setAttribute('tabindex', active ? '0' : '-1');
        });

        // Panels state (clear dulu semua, lalu aktifkan target)
        panels.forEach((p) => p.classList.remove('is-active'));
        const targetPanel = getPanelForBtn(tabs[idx]) || panels[idx];
        if (targetPanel) targetPanel.classList.add('is-active');

        // Sync Swiper per-container (opsional, aman jika tidak ada)
        const slideEl = tabs[idx]?.closest('.swiper-slide');
        const swiper = tabsContainer?.swiper; // instance ter-attach oleh Swiper
        if (slideEl && swiper) {
          const slidesArr = Array.from(swiper.slides);
          const sIdx = slidesArr.indexOf(slideEl);
          if (sIdx >= 0) swiper.slideTo(sIdx, 300);
        }
      };

      // Click handler per tab
      tabs.forEach((btn, i) => {
        btn.addEventListener('click', () => activate(i));
      });

      // Deep-link via hash (jika cocok dengan data-target)
      const byHash = (() => {
        if (!location.hash) return -1;
        const h = location.hash;
        return tabs.findIndex((b) => b.dataset.target === h);
      })();

      // Initial active: prioritaskan .is-active/aria-selected, lalu hash, else 0
      let startIdx =
        tabs.findIndex(
          (b) =>
            b.classList.contains('is-active') ||
            b.getAttribute('aria-selected') === 'true'
        );
      if (startIdx < 0 && byHash >= 0) startIdx = byHash;
      if (startIdx < 0) startIdx = 0;

      activate(startIdx);
    });
  };

  // Init
  initLnTabs();
})();

// /src/js/polaroid-marquee.js
(() => {
    const init = () => {
        const marquees = document.querySelectorAll('.polaroidMarquee');
        if (!marquees.length) return;

        const reduced = matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

        marquees.forEach((marquee) => {
            const track = marquee.querySelector('.polaroidTrack');
            if (!track) return;

            // speed via data-speed="24s" (optional)
            const speed = marquee.dataset.speed || track.dataset.speed;
            if (speed) track.style.setProperty('--speed', String(speed));

            let groups = track.querySelectorAll('.polaroidGroup');

            // Penting: pastikan ADA 2 group untuk seamless -50%
            if (groups.length === 1) {
                const clone = groups[0].cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.querySelectorAll('img').forEach(img => { img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; });
                track.appendChild(clone);
                groups = track.querySelectorAll('.polaroidGroup');
            }

            // Lazy tips
            track.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) img.loading = 'lazy';
                img.decoding = 'async';
            });

            // Matikan animasi bila user prefer reduce motion
            if (reduced) track.style.animation = 'none';

            // Jika total lebar <= container, tak perlu animasi
            const measureOnce = () => {
                const totalW = Array.from(groups).reduce((acc, g) => acc + g.getBoundingClientRect().width, 0);
                const wrapW = marquee.getBoundingClientRect().width;
                if (totalW <= wrapW + 32) track.style.animation = 'none';
            };

            // Tunggu gambar (agar ukuran akurat), lalu ukur
            const imgs = Array.from(track.querySelectorAll('img'));
            let left = imgs.length;
            if (!left) measureOnce();
            imgs.forEach(img => {
                if (img.complete) { if (--left === 0) measureOnce(); }
                else img.addEventListener('load', () => { if (--left === 0) measureOnce(); }, { once: true });
            });

            // Pause saat tab tidak aktif → hemat resource
            const onVis = () => { track.style.animationPlayState = document.hidden ? 'paused' : ''; };
            document.addEventListener('visibilitychange', onVis, { passive: true });
        });
    };

    // Pastikan DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();

