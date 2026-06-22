function bindHoverDropdown() {
  const overlay = document.getElementById('megaOverlay');

  // reset dulu
  document.querySelectorAll('.navbar .dropdown').forEach(dd => {
    dd.onmouseenter = null;
    dd.onmouseleave = null;
  });

  if (window.matchMedia('(min-width: 992px)').matches) {
    document.querySelectorAll('.navbar .dropdown').forEach(dd => {
      let t;
      const menu = dd.querySelector('.dropdown-menu');

      dd.addEventListener('mouseenter', () => {
        clearTimeout(t);
        dd.classList.add('show');
        menu.classList.add('show');
        if (overlay) overlay.classList.add('show');
      });

      dd.addEventListener('mouseleave', () => {
        t = setTimeout(() => {
          dd.classList.remove('show');
          menu.classList.remove('show');

          // cek apakah masih ada dropdown yg terbuka
          const anyOpen = document.querySelector('.navbar .dropdown.show');
          if (!anyOpen && overlay) {
            overlay.classList.remove('show');
          }
        }, 120);
      });
    });

    if (overlay) {
      overlay.onclick = () => {
        document.querySelectorAll('.navbar .dropdown.show').forEach(dd => {
          dd.classList.remove('show');
          const menu = dd.querySelector('.dropdown-menu');
          if (menu) menu.classList.remove('show');
        });
        overlay.classList.remove('show');
      };
    }
  }
}

bindHoverDropdown();
window.addEventListener('resize', bindHoverDropdown);

// subnav
// (function() {
//     const path = location.pathname;
//     document.querySelectorAll('.subnav .subnav-link').forEach(a => {
//       if (a.getAttribute('href') === path) {
//         document.querySelectorAll('.subnav .subnav-link.active').forEach(x => x.classList.remove('active'));
//         a.classList.add('active');
//       }
//     });
//   })();

// offcanvas
(() => {
  const oc = document.getElementById('mobileNav');
  if (!oc) return;

  const pages = {
    main: oc.querySelector('#oc-main'),
    sub: oc.querySelector('#oc-sub'),
    search: oc.querySelector('#oc-search')
  };
  const subTitle = oc.querySelector('.oc-subtitle');
  const subContents = oc.querySelectorAll('.oc-subcontent');
  let current = pages.main;

  function show(page){
    Object.values(pages).forEach(p => p.classList.remove('is-active'));
    page.classList.add('is-active');
    current = page;
  }

  // buka submenu
  oc.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-open');
      if (val === 'search') {
        show(pages.search);
      } else {
        // ganti judul
        if (subTitle) subTitle.textContent = val;
        // tampilkan subcontent sesuai data-for
        subContents.forEach(sc => {
          sc.style.display = sc.dataset.for === val ? 'block' : 'none';
        });
        show(pages.sub);
      }
    });
  });

  // tombol back
  oc.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => show(pages.main));
  });

  // reset ke main tiap dibuka/tutup
  oc.addEventListener('shown.bs.offcanvas', () => show(pages.main));
  oc.addEventListener('hidden.bs.offcanvas', () => show(pages.main));
})();

document.querySelectorAll('#offcanvasLanguage .list-group-item').forEach(item => {
  item.addEventListener('click', () => {
    // reset check
    document.querySelectorAll('#offcanvasLanguage .lang-check').forEach(c => c.classList.add('d-none'));
    // aktifkan check untuk item ini
    item.querySelector('.lang-check').classList.remove('d-none');
    // contoh: simpan pilihan
    const lang = item.querySelector('.lang-check').dataset.lang;
    console.log("Selected language:", lang);
    // bisa tambahkan logic ganti bahasa di sini
  });
});

(() => {
  // Pastikan bootstrap.bundle.min.js sudah ter-load
  // Trigger open #mobileNav ada di luar (misal button data-bs-toggle="offcanvas" data-bs-target="#mobileNav")

  const menuEl = document.getElementById('mobileNav');
  const openBtn = document.getElementById('openLanguage');
  const sheet = document.getElementById('langSheet');
  const backdrop = document.getElementById('langSheetBackdrop');
  const list = document.getElementById('langList');
  const label = document.querySelector('#openLanguage .lang-label');

  if (!menuEl || !openBtn || !sheet || !backdrop || !list) return;

  // state bahasa aktif
  let activeLang = 'en';

  function renderChecks() {
    list.querySelectorAll('.oc-item').forEach(li => {
      const selected = li.dataset.lang === activeLang;
      li.querySelector('.lang-check')?.classList.toggle('d-none', !selected);
    });
    if (label) label.textContent = activeLang.toUpperCase();
  }
  renderChecks();

  function openSheet() {
    backdrop.classList.add('is-open');
    sheet.classList.add('is-open');
  }
  function closeSheet() {
    backdrop.classList.remove('is-open');
    sheet.classList.remove('is-open');
  }

  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openSheet();
  });
  backdrop.addEventListener('click', closeSheet);
  sheet.querySelector('[data-langsheet-close]')?.addEventListener('click', closeSheet);

  // pilih bahasa
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.oc-item');
    if (!item) return;
    activeLang = item.dataset.lang; // 'en' / 'id'
    renderChecks();
    // TODO: panggil handler i18n di sini (set cookie/localStorage, reload teks, dll)
    closeSheet();
  });

  // Tutup sheet kalau offcanvas menu ditutup
  menuEl.addEventListener('hide.bs.offcanvas', closeSheet);
})();

/* /src/scripts/lnHero-parallax.js */
const mqlReduce = window.matchMedia?.('(prefers-reduced-motion: reduce)');
const heroes = Array.from(document.querySelectorAll('.lnHero.lnHero--parallax'));

if (!mqlReduce?.matches && heroes.length) {
    const state = new Map();
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
            const el = e.target;
            const s = state.get(el);
            if (!s) return;
            s.active = e.isIntersecting;
            if (s.active && s.startY == null) {
                s.startY = window.scrollY + el.getBoundingClientRect().top;
            }
        });
    }, { root: null, threshold: 0 });

    heroes.forEach((el) => {
        const img = el.querySelector('.lnHero__media img');
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.25;
        state.set(el, { startY: null, speed, img, active: false });
        io.observe(el);
    });

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            heroes.forEach((el) => {
                const s = state.get(el);
                if (!s?.active || !s.img) return;
                const delta = (window.scrollY - s.startY);
                const translateY = Math.round(delta * s.speed);
                s.img.style.setProperty('--parallax-y', `${translateY}px`);
            });
            ticking = false;
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        heroes.forEach((el) => {
            const s = state.get(el);
            if (s) s.startY = window.scrollY + el.getBoundingClientRect().top;
        });
        onScroll();
    });

    onScroll();
}