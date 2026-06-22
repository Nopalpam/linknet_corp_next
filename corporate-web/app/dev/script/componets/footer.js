// /scripts/lnFooter.js
const ACC_BREAKPOINT = 768; // <768 = accordion mode
function setupFooterAccordion() {
  const wrap = document.querySelector('[data-accordion="lnFooter"]');
  if (!wrap) return;
  const groups = [...wrap.querySelectorAll('.lnFooterMenu')];
  const mql = window.matchMedia(`(max-width:${ACC_BREAKPOINT - 0.02}px)`);

  function applyMode() {
    const isMobile = mql.matches;
    groups.forEach(g => {
      const title = g.querySelector('.lnFooterMenu__title');
      const list  = g.querySelector('.lnFooterMenu__list');
      if (isMobile) {
        title.setAttribute('aria-expanded', 'false');
        g.classList.remove('is-open');
        list.style.maxHeight = '';
      } else {
        title.setAttribute('aria-expanded', 'true');
        g.classList.add('is-open');        // keep all open on desktop
        list.style.maxHeight = 'none';
      }
    });
  }

  function onClick(e) {
    const btn = e.target.closest('.lnFooterMenu__title');
    if (!btn) return;
    if (!mql.matches) return; // no accordion on desktop
    const group = btn.parentElement;
    const list  = group.querySelector('.lnFooterMenu__list');
    const isOpen = group.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', String(isOpen));
    list.style.maxHeight = isOpen ? `${list.scrollHeight}px` : '0';
  }

  wrap.addEventListener('click', onClick);
  applyMode();
  mql.addEventListener('change', applyMode);
}
setupFooterAccordion();