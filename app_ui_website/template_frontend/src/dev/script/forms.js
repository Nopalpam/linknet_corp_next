(() => {
    const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
    const onlyDigits = (s) => (s || '').replace(/\D+/g, '');

    const getHelpEl = (wrap) =>
        wrap.parentElement?.querySelector('.lnFormInput__help') ||
        wrap.querySelector('.lnFormInput__help');

    const showHelp = (wrap, msg) => {
        const help = getHelpEl(wrap);
        if (!help) return;
        help.textContent = msg || '';
        if (msg && msg.length) help.classList.add('is-active');
    };

    const hideHelp = (wrap) => {
        const help = getHelpEl(wrap);
        if (!help) return;
        help.textContent = '';
        help.classList.remove('is-active');
    };

    const setInvalid = (wrap, msg) => {
        wrap.classList.add('is-invalid');
        const ctl = wrap.querySelector('.lnFormInput__control');
        if (ctl) ctl.setAttribute('aria-invalid', 'true');
        showHelp(wrap, msg || 'Invalid value.');
    };

    const clearInvalid = (wrap) => {
        wrap.classList.remove('is-invalid');
        const ctl = wrap.querySelector('.lnFormInput__control');
        if (ctl) ctl.removeAttribute('aria-invalid');
        hideHelp(wrap); // sembunyikan help saat kembali valid
    };

    const isPhoneValid  = (raw) => /^0\d{9,}$/.test(onlyDigits(raw)); // starts 0, >=10 digits
    const isEmailValid  = (raw) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test((raw || '').trim());
    const autoFormatPhone = (raw) => onlyDigits(raw).replace(/(.{4})/g, '$1 ').trim();

    function validate(wrap) {
        const ctl = wrap.querySelector('.lnFormInput__control');
        if (!ctl) return true;

        const isSelect = ctl.tagName === 'SELECT';
        const valRaw = isSelect ? (ctl.value ?? '') : (ctl.value ?? '').trim();

        // Required
        const requiredMsg = wrap.dataset.error || ctl.dataset.error || 'This field is required.';
        if (ctl.hasAttribute('required') && (valRaw === '' || (isSelect && ctl.value === ''))) {
            setInvalid(wrap, requiredMsg);
            return false;
        }

        // Types
        const mode = (ctl.dataset.validate || ctl.type || '').toLowerCase();
        if (mode === 'phone' || ctl.type === 'tel') {
            const msg = ctl.dataset.errorPhone || 'Nomor HP harus diawali 0 dan minimal 10 digit.';
            if (valRaw && !isPhoneValid(valRaw)) { setInvalid(wrap, msg); return false; }
        }
        if (mode === 'email' || ctl.type === 'email') {
            const msg = ctl.dataset.errorEmail || 'Format email tidak valid.';
            if (valRaw && !isEmailValid(valRaw)) { setInvalid(wrap, msg); return false; }
        }

        clearInvalid(wrap);
        return true;
    }

    function initLnFormInputs(root = document) {
        qsa('.lnFormInput', root).forEach((wrap) => {
            const ctl = wrap.querySelector('.lnFormInput__control');
            if (!ctl) return;

            // Counter (textarea + maxlength)
            const counter = wrap.querySelector('.lnFormInput__counter');
            const hasCounter = !!counter && ctl.tagName === 'TEXTAREA' && ctl.maxLength > 0;
            const updateCounter = () => { if (hasCounter) counter.textContent = `${ctl.value.length}/${ctl.maxLength}`; };
            if (hasCounter) updateCounter();

            // Optional preset error
            if (wrap.dataset.error && wrap.dataset.error.length) setInvalid(wrap, wrap.dataset.error);

            const revalidate = () => {
                const ok = validate(wrap);
                if (hasCounter) updateCounter();
                return ok;
            };

            // HELP non-error saat fokus
            const focusHelp = ctl.dataset.help || wrap.dataset.help || '';
            ctl.addEventListener('focus', () => {
                // hanya tampilkan help non-error bila tidak invalid
                if (!wrap.classList.contains('is-invalid') && focusHelp) {
                    showHelp(wrap, focusHelp);
                }
            });

            // Blur: revalidate + sembunyikan help non-error jika valid
            ctl.addEventListener('blur', () => {
                const ok = revalidate();
                if (ok) hideHelp(wrap);
            });

            // Change: revalidate
            ctl.addEventListener('change', revalidate);

            // Input: format phone + revalidate; jika tetap valid & fokus → pertahankan help non-error
            ctl.addEventListener('input', () => {
                if ((ctl.dataset.autofmt === 'phone') && (ctl.dataset.validate === 'phone' || ctl.type === 'tel')) {
                    const beforeLen = ctl.value.length;
                    const caret = ctl.selectionStart ?? beforeLen;
                    ctl.value = autoFormatPhone(ctl.value);
                    try {
                        const delta = ctl.value.length - beforeLen;
                        ctl.selectionStart = ctl.selectionEnd = Math.min(ctl.value.length, caret + delta);
                    } catch {}
                }
                const ok = revalidate();
                if (ok && document.activeElement === ctl && focusHelp) {
                    // pastikan help non-error tetap tampil saat fokus & valid
                    showHelp(wrap, focusHelp);
                }
            });
        });
    }

    // Submit guard
    function initFormSubmitGuard(formSel = 'form') {
        const form = document.querySelector(formSel);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            const wrappers = qsa('.lnFormInput', form);
            let firstInvalid = null;
            let allValid = true;

            wrappers.forEach((w) => {
                const ok = validate(w);
                if (!ok && !firstInvalid) firstInvalid = w;
                allValid = allValid && ok;
            });

            if (!allValid) {
                e.preventDefault();
                e.stopPropagation();
                const ctl = firstInvalid?.querySelector('.lnFormInput__control');
                ctl?.focus({ preventScroll: true });
                firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        form.addEventListener('reset', () => {
            setTimeout(() => {
                qsa('.lnFormInput', form).forEach((w) => {
                    clearInvalid(w);
                    const ctl = w.querySelector('.lnFormInput__control');
                    const c = w.querySelector('.lnFormInput__counter');
                    if (c && ctl?.tagName === 'TEXTAREA' && ctl.maxLength > 0) c.textContent = `0/${ctl.maxLength}`;
                });
            }, 0);
        });
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLnFormInputs();
            initFormSubmitGuard();
        });
    } else {
        initLnFormInputs();
        initFormSubmitGuard();
    }

    // Expose
    window.initLnFormInputs = initLnFormInputs;
    window.initFormSubmitGuard = initFormSubmitGuard;
})();


(() => {
  const root = document.querySelector('.lnSection__searchFilters');
  if (!root) return;

  const container = root.querySelector('.container');
  const form      = root.querySelector('.lnSearchFilters');

  // State
  let openDD = null;       // element dropdown yang sedang terbuka
  let anchorChip = null;   // chip pemicu dropdown

  // Helper: position dropdown
  const placeDropdown = (dd, chip) => {
    dd.style.removeProperty('top');
    dd.style.removeProperty('left');
    dd.style.removeProperty('right');
    dd.style.removeProperty('width');

    const isDesktop = window.matchMedia('(min-width: 768px)').matches;

    if (isDesktop) {
      // Letakkan tepat di bawah chip (relative to .container)
      const rChip = chip.getBoundingClientRect();
      const rWrap = container.getBoundingClientRect();
      dd.style.position = 'absolute';
      dd.style.top  = `${rChip.bottom - rWrap.top + 8}px`;
      dd.style.left = `${rChip.left   - rWrap.left}px`;
      dd.style.minWidth = `${Math.max(rChip.width, 220)}px`;
    } else {
      // Mobile: full width block, muncul di bawah seluruh bar
      dd.style.position = 'relative';
      dd.style.top = '0';
      dd.style.left = '0';
      dd.style.width = '100%';
    }
  };

  const closeAll = () => {
    if (openDD) {
      openDD.hidden = true;
      openDD = null;
    }
    form.querySelectorAll('.lnSFChip').forEach(ch => {
      ch.classList.remove('is-active');
      ch.setAttribute('aria-expanded', 'false');
    });
    anchorChip = null;
  };

  // Delegation: toggle dropdown ketika chip diklik
  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.lnSFChip');
    if (chip && form.contains(chip)) {
      e.preventDefault();
      const targetSel = chip.getAttribute('data-dropdown');
      const dd = targetSel ? document.querySelector(targetSel) : null;
      if (!dd) return;

      if (openDD === dd) { closeAll(); return; }

      closeAll();
      chip.classList.add('is-active');
      chip.setAttribute('aria-expanded', 'true');
      dd.hidden = false;
      placeDropdown(dd, chip);
      openDD = dd;
      anchorChip = chip;
      return;
    }

    // Klik opsi dropdown
    const opt = e.target.closest('.lnSFDropdown button[role="option"]');
    if (opt) {
      const dd = opt.closest('.lnSFDropdown');
      dd.querySelectorAll('button[role="option"]').forEach(b => b.classList.remove('is-active'));
      opt.classList.add('is-active');

      // Update label chip
      const chip = form.querySelector(`.lnSFChip[data-dropdown="#${dd.id}"]`);
      if (chip) {
        const labelEl = chip.querySelector('.lnSFChip__label');
        const def = labelEl?.dataset.default || labelEl?.textContent || '';
        const val = opt.dataset.value ? opt.textContent.trim() : def;
        if (labelEl) labelEl.textContent = val || def;
      }

      // TODO: panggil fungsi filter data di sini
      closeAll();
      return;
    }

    // Klik di luar => tutup
    if (openDD && !openDD.contains(e.target) && !form.contains(e.target)) {
      closeAll();
    }
  });

  // Reposition on resize/orientation
  window.addEventListener('resize', () => {
    if (openDD && anchorChip) placeDropdown(openDD, anchorChip);
  });
})();