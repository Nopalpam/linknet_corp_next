// /src/js/lnManagementModal.js
(() => {
    const modalEl = document.getElementById('lnManagementModal');
    if (!modalEl) return;

    const items = Array.from(document.querySelectorAll('.js-mgmt-item'));
    if (!items.length) return;

    const modal = new bootstrap.Modal(modalEl);

    const els = {
        photoLg: document.getElementById('mgmtModalPhoto'),
        photoSm: document.getElementById('mgmtModalPhotoSm'), // optional
        name:    document.getElementById('mgmtModalName'),
        role:    document.getElementById('mgmtModalRole'),
        bio:     document.getElementById('mgmtModalBio'),
        prevName: modalEl.querySelector('#mgmtPrevName'),
        nextName: modalEl.querySelector('#mgmtNextName'),
        prevBtn:  modalEl.querySelector('.js-mgmt-prev'),
        nextBtn:  modalEl.querySelector('.js-mgmt-next'),
    };

    // State aktif per sesi modal
    let activeGroup = null;      // string data-group
    let activeList  = [];        // array .js-mgmt-item dalam grup
    let current     = 0;         // index di activeList

    // ===== Utils =====
    const getGroup = (el) =>
        el.closest('[data-group]')?.getAttribute('data-group') ||
        el.dataset.group || ''; // fallback jika nanti ditaruh di card

    const escapeHTML = (s = "") =>
        s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

    const formatParagraphs = (raw = "") => {
        if (!raw) return "";
        let norm = raw.replace(/\r\n/g, "\n").replace(/\s*\/n\s*/gi, "\n").trim();
        if (!norm) return "";
        return `${norm.replace(/\n{2,}/g, "</p><p class='mb-3'>").replace(/\n/g, "<br>")}`;
    };

    const sanitizeHTML = (html = "") => {
        if (window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
            const safe = window.DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ["b","strong","i","em","u","br","p","ul","ol","li","a"],
                ALLOWED_ATTR: ["href","target","rel"]
            });
            const wrap = document.createElement("div");
            wrap.innerHTML = safe;
            wrap.querySelectorAll("a[href]").forEach(a => {
                if (!a.hasAttribute("target")) a.setAttribute("target","_blank");
                a.setAttribute("rel","noopener noreferrer");
            });
            return wrap.innerHTML;
        }
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const textOnly = tmp.textContent || tmp.innerText || "";
        const safe = escapeHTML(textOnly);
        // return `<p class="mb-3">${safe.replace(/\n{2,}/g, "</p><p class='mb-3'>").replace(/\n/g, "<br>")}</p>`;
    };

    const readItem = (el) => ({
        id:    el.dataset.id    || '',
        name:  el.dataset.name  || el.querySelector('.lnManagementCard__name')?.textContent?.trim() || '',
        role:  el.dataset.role  || el.querySelector('.lnManagementCard__role')?.textContent?.trim() || '',
        bio:   el.dataset.bio   || '',
        photo: el.dataset.photo || el.querySelector('.lnManagementCard__media img')?.getAttribute('src') || '',
    });

    const setDisabled = (btn, disabled) => {
        if (!btn) return;
        btn.toggleAttribute('disabled', disabled);
        btn.setAttribute('aria-disabled', String(disabled));
        btn.classList.toggle('is-disabled', disabled);
        if (disabled) btn.setAttribute('tabindex', '-1');
        else btn.removeAttribute('tabindex');
    };

    // ===== Render hanya berdasarkan activeList (grup aktif) =====
    const render = (idx) => {
        const el = activeList[idx];
        const d  = readItem(el);

        els.name.textContent  = d.name;
        els.role.textContent  = d.role;

        const htmlBio = formatParagraphs(d.bio);
        els.bio.innerHTML     = sanitizeHTML(htmlBio);

        els.photoLg.src       = d.photo;
        els.photoLg.alt       = d.name;
        if (els.photoSm) { els.photoSm.src = d.photo; els.photoSm.alt = d.name; }

        const atStart = idx <= 0;
        const atEnd   = idx >= activeList.length - 1;

        const prevIdx = atStart ? null : idx - 1;
        const nextIdx = atEnd   ? null : idx + 1;

        els.prevName.textContent = prevIdx !== null ? readItem(activeList[prevIdx]).name : '—';
        els.nextName.textContent = nextIdx !== null ? readItem(activeList[nextIdx]).name : '—';

        if (prevIdx !== null) els.prevBtn.dataset.idx = String(prevIdx); else delete els.prevBtn.dataset.idx;
        if (nextIdx !== null) els.nextBtn.dataset.idx = String(nextIdx); else delete els.nextBtn.dataset.idx;

        setDisabled(els.prevBtn, atStart);
        setDisabled(els.nextBtn, atEnd);

        current = idx;
    };

    // ===== Open: set activeGroup & activeList berdasar kartu yang diklik =====
    document.addEventListener('click', (e) => {
        const trg = e.target.closest('.js-open-mgmt');
        if (!trg) return;
        e.preventDefault();

        const card = trg.closest('.js-mgmt-item');
        if (!card) return;

        activeGroup = getGroup(card);
        activeList  = items.filter(it => getGroup(it) === activeGroup);

        const idxInGroup = Math.max(0, activeList.indexOf(card));

        // Edge: kalau grup cuma 1 item
        if (activeList.length === 1) {
            setDisabled(els.prevBtn, true);
            setDisabled(els.nextBtn, true);
        }

        render(idxInGroup);
        modal.show();
    });

    // ===== Prev/Next di dalam grup aktif =====
    els.prevBtn.addEventListener('click', (e) => {
        if (els.prevBtn.hasAttribute('disabled')) return;
        const idx = parseInt(els.prevBtn.dataset.idx || '', 10);
        if (Number.isInteger(idx)) render(idx);
    });

    els.nextBtn.addEventListener('click', (e) => {
        if (els.nextBtn.hasAttribute('disabled')) return;
        const idx = parseInt(els.nextBtn.dataset.idx || '', 10);
        if (Number.isInteger(idx)) render(idx);
    });
})();

(() => {
    const KEY = 'ln_cookie_ok';
    const banner = document.getElementById('lnCookiePopup');
    const accept = document.getElementById('lnCookieAccept');

    if (!banner || !accept) return;

    // show only if not accepted
    const show = () => banner.classList.add('is-visible');
    const hide = () => banner.classList.remove('is-visible');

    if (!localStorage.getItem(KEY)) show();

    accept.addEventListener('click', () => {
        try { localStorage.setItem(KEY, '1'); } catch (e) {}
        hide();
    });

    // Optional: close on ESC for a11y (doesn't accept cookies)
    banner.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hide();
    });
})();