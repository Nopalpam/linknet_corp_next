'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import Input    from './Input';
import Select   from './Select';
import Textarea from './Textarea';
import Icon     from '../Icon';

// ─────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────
const MOCK_ADDRESSES = [
  { id: 1, site_id: '9823451', label: 'Centennial Tower, Jl. Gatot Subroto No.24-25, Kuningan Bar., Kec. Mampang Prpt., Kota Jakarta Selatan, Daerah Khusus Ibukota Jakarta 12930' },
  { id: 2, site_id: '9823452', label: 'Gedung Graha Surya Internusa, Jl. HR Rasuna Said Kav. X-0, Kuningan, Jakarta Selatan 12950' },
  { id: 3, site_id: '9823453', label: 'Menara Rajawali, Jl. Mega Kuningan Lot 5.1, Kawasan Mega Kuningan, Jakarta Selatan 12950' },
  { id: 4, site_id: '9823454', label: 'Plaza Sentral, Jl. Jend. Sudirman Kav. 47, Karet Semanggi, Setiabudi, Jakarta Selatan 12930' },
  { id: 5, site_id: '9823455', label: 'Wisma GKBI, Jl. Jend. Sudirman No.28, RT.10/RW.11, Bendungan Hilir, Tanah Abang, Jakarta Pusat 10210' },
  { id: 6, site_id: '9823456', label: 'Jl. Gatot Subroto No.77, Tebet, Kota Jakarta Selatan 12810' },
  { id: 7, site_id: '9823457', label: 'Jl. Sudirman Park, Kav. 5, Karet Tengsin, Tanah Abang, Jakarta Pusat 10250' },
];

const PROVINCE_OPTIONS = [
  { value: 'dki',    label: 'DKI Jakarta' },
  { value: 'jabar',  label: 'Jawa Barat'  },
  { value: 'jateng', label: 'Jawa Tengah' },
  { value: 'jatim',  label: 'Jawa Timur'  },
  { value: 'banten', label: 'Banten'      },
];

const CITY_BY_PROVINCE = {
  dki:    [{ value: 'jaksel', label: 'Jakarta Selatan' }, { value: 'jakpus', label: 'Jakarta Pusat' }, { value: 'jakut', label: 'Jakarta Utara' }],
  jabar:  [{ value: 'bekasi', label: 'Kota Bekasi' }, { value: 'bandung', label: 'Kota Bandung' }, { value: 'bogor', label: 'Kota Bogor' }],
  jateng: [{ value: 'semarang', label: 'Kota Semarang' }, { value: 'solo', label: 'Kota Solo' }],
  jatim:  [{ value: 'surabaya', label: 'Kota Surabaya' }, { value: 'malang', label: 'Kota Malang' }],
  banten: [{ value: 'tangerang', label: 'Kota Tangerang' }, { value: 'cilegon', label: 'Kota Cilegon' }],
};

const ZIP_BY_CITY = {
  jaksel:    [{ value: '12110', label: '12110 – Kebayoran Baru' }, { value: '12120', label: '12120 – Mampang Prapatan' }, { value: '12930', label: '12930 – Karet Kuningan' }],
  jakpus:    [{ value: '10110', label: '10110 – Gambir' }, { value: '10210', label: '10210 – Tanah Abang' }],
  jakut:     [{ value: '14110', label: '14110 – Penjaringan' }],
  bekasi:    [{ value: '17113', label: '17113 – Mustika Jaya' }, { value: '17114', label: '17114 – Mustikasari' }],
  bandung:   [{ value: '40111', label: '40111 – Bandung Kulon' }, { value: '40112', label: '40112 – Babakan Ciparay' }],
  bogor:     [{ value: '16111', label: '16111 – Bogor Tengah' }],
  semarang:  [{ value: '50111', label: '50111 – Semarang Tengah' }],
  solo:      [{ value: '57111', label: '57111 – Laweyan' }],
  surabaya:  [{ value: '60111', label: '60111 – Tegalsari' }],
  malang:    [{ value: '65111', label: '65111 – Klojen' }],
  tangerang: [{ value: '15111', label: '15111 – Tangerang Kota' }],
  cilegon:   [{ value: '42411', label: '42411 – Cilegon Kota' }],
};

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────

function debounce(fn, delay) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

function useFadeIn(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

function useExpand(deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.set(el, { height: 0, opacity: 0 });
    gsap.to(el, { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

const SESSION_PREFIX = 'lnCoverageCheck_';

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────

function useSessionState(keySuffix) {
  const SESSION_KEY = `${SESSION_PREFIX}${keySuffix}`;

  const read = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, [SESSION_KEY]);

  const write = useCallback((patch) => {
    try {
      const current = (() => {
        try { const r = sessionStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : {}; }
        catch { return {}; }
      })();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, ...patch }));
    } catch { /* storage full / private mode */ }
  }, [SESSION_KEY]);

  const clear = useCallback(() => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
  }, [SESSION_KEY]);

  return { read, write, clear };
}

function useMockSearch(query, onResults) {
  const performSearch = useCallback((searchQuery, signal) => {
    const timeout = setTimeout(() => {
      if (signal.aborted) return;
      const filtered = MOCK_ADDRESSES
        .filter((addr) => addr.label.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5);
      onResults(filtered);
    }, 350);
    signal.addEventListener('abort', () => clearTimeout(timeout));
  }, [onResults]);

  useEffect(() => {
    if (query.length < 3) {
      onResults(null);
      return;
    }
    const controller = new AbortController();
    const debounced = debounce(() => performSearch(query, controller.signal), 350);
    debounced();
    return () => {
      debounced.cancel();
      controller.abort();
    };
  }, [query, performSearch, onResults]);
}

// ─────────────────────────────────────────────────────────────
// Coverage mode constants
// ─────────────────────────────────────────────────────────────
export const COVERAGE_MODE = {
  SEARCH:  'search',
  COVERED: 'covered',
  MANUAL:  'manual',
};

// ─────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────

function ErrorText({ error }) {
  if (!error) return null;
  return (
    <small className="lnFormInput__help text-body-b5 text-red-500 is-active mt-1 block">
      {error}
    </small>
  );
}

function HelperText({ visible }) {
  return (
    <div
      aria-hidden={!visible}
      className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${visible ? 'max-h-20 opacity-100 mt-1.5' : 'max-h-0 opacity-0 mt-0'}
      `}
    >
      <p className="text-caption-c1 text-secondary leading-relaxed">
        Masukkan minimal 3 karakter untuk hasil pencarian yang akurat: Nama Jalan / Nomor /
        Apartemen / Komplek / Kelurahan / Kode Pos / Kota.
      </p>
    </div>
  );
}

function SearchInput({ value, onChange, showHelper, error }) {
  const isInvalid = Boolean(error);

  return (
    <div className="lnCoverageCheck__inputBox">
      <div className={`lnCoverageCheck__inputWrap relative flex items-center border rounded-[16px] px-3 py-[12px] bg-white focus-within:border-[var(--color-neutral-200)] transition-colors duration-200 ${isInvalid ? 'border-red-500' : 'border-neutral'}`}>
        <Icon name="pin-map-filled" colorClass="text-danger" className="shrink-0 mr-2 w-5 h-5" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Masukan Alamat"
          aria-label="Cari alamat"
          aria-invalid={isInvalid}
          className="lnCoverageCheck__nativeInput flex-1 outline-none bg-transparent text-body-b4 text-black placeholder:text-secondary"
        />
      </div>
      <ErrorText error={error} />
      <HelperText visible={showHelper} />
    </div>
  );
}

function SearchResults({ results, onSelect, onNotFound, showNotFoundAction = true }) {
  const listRef = useExpand([]);
  const hasResults = results.length > 0;

  return (
    <div
      ref={listRef}
      className="lnCoverageCheck__results overflow-hidden border border-neutral rounded-[16px] bg-white mt-2"
    >
      {hasResults && (
        <div className="lnCoverageCheck__resultsHeader flex flex-wrap justify-between items-center px-4 py-2.5 gap-y-0.5 shadow-md">
          <span className="text-caption-c1 text-secondary">
            Ditemukan: <strong className="text-black">{results.length} Alamat</strong>
          </span>
          <span className="text-caption-c1 text-secondary">
            Menampilkan {results.length} Alamat Teratas
          </span>
        </div>
      )}

      {hasResults ? (
        <ul className="lnCoverageCheck__resultsList max-h-[360px] md:max-h-[240px] overflow-y-auto">
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                aria-label={`Pilih alamat: ${item.label}`}
                className="lnCoverageCheck__resultItem w-full flex items-center gap-3 px-4 py-3 border border-t-0 border-b border-neutral last:border-b-0 text-left cursor-pointer hover:bg-[var(--color-neutral-50)] transition-colors duration-150 group"
              >
                <Icon name="pin-map" colorClass="text-secondary" className="shrink-0 mt-0.5 w-4 h-4" />
                <span className="flex-1 text-body-b5 text-black leading-snug">{item.label}</span>
                <Icon
                  name="chevron-right"
                  colorClass="text-secondary group-hover:text-success"
                  className="shrink-0 mt-0.5 w-4 h-4 transition-colors duration-150"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="lnCoverageCheck__resultsEmpty flex flex-col items-center gap-1.5 px-4 py-6 text-center">
          <Icon name="location" colorClass="text-secondary" className="w-8 h-8 opacity-40" />
          <p className="text-body-b3 text-black font-bold">Alamat tidak ditemukan.</p>
          <p className="text-caption-c1 text-secondary">
            Coba kata kunci lain atau masukkan alamat secara manual.
          </p>
        </div>
      )}

      {showNotFoundAction && (
        <div className="lnCoverageCheck__resultsFooter text-center py-4">
          <span className="text-caption-c1 text-secondary px-4 py-2 bg-[var(--color-neutral-50)] rounded-full">
            Alamat Anda Tidak Ditemukan?{' '}
            <button
              type="button"
              onClick={onNotFound}
              className="text-caption-c1 text-warning font-semibold hover:underline focus:outline-none"
            >
              Klik Di Sini
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

function CoveredCard({
  address,
  addressDetail,
  onAddressDetailChange,
  onEdit,
  errors,
  submitAttempted,
  showAddressDetailInput = true,
}) {
  const cardRef = useFadeIn([]);

  return (
    <div>
      <div
        ref={cardRef}
        className="lnCoverageCheck__coveredCard border border-neutral rounded-[16px] overflow-hidden mb-3"
        style={{ opacity: 0 }}
      >
        <input type="hidden" name="site_id" value={address.site_id ?? ''} />
        <input type="hidden" name="site_address" value={address.label ?? ''} />

        <div className="lnCoverageCheck__coveredHeader bg-success flex items-center justify-center px-4 py-2.5 pb-[20px]">
          <span className="text-body-b5 text-white font-medium text-center">
            This address is accessible by the Linknet network
          </span>
        </div>
        <div className="lnCoverageCheck__coveredBody flex items-center gap-2 px-4 py-4 bg-white rounded-[16px] mt-[-12px]">
          <Icon name="pin-map-filled" colorClass="text-danger" className="shrink-0 mt-0.5 w-5 h-5" />
          <p className="flex-1 text-body-b4 text-black leading-snug">{address.label}</p>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit alamat"
            className="lnCoverageCheck__editBtn shrink-0 hover:opacity-70 transition-opacity duration-150 focus:outline-none cursor-pointer"
          >
            <Icon name="close" colorClass="text-secondary" className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showAddressDetailInput && (
        <div className="bg-white">
          <Input
            id="addressDetail"
            label="Detail Alamat"
            value={addressDetail}
            onChange={onAddressDetailChange}
            error={errors?.addressDetail}
            submitAttempted={submitAttempted}
          />
        </div>
      )}
    </div>
  );
}

function ManualForm({ manualData, onManualDataChange, onBack, errors, submitAttempted }) {
  const formRef = useFadeIn([]);

  const cityOptions = manualData.province ? (CITY_BY_PROVINCE[manualData.province] ?? []) : [];
  const zipOptions  = manualData.city     ? (ZIP_BY_CITY[manualData.city]           ?? []) : [];

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('manual-', '');

    if (key === 'province') {
      onManualDataChange({ ...manualData, province: value, city: '', zip: '' });
    } else if (key === 'city') {
      onManualDataChange({ ...manualData, city: value, zip: '' });
    } else {
      onManualDataChange({ ...manualData, [key]: value });
    }
  };

  const builtAddress = useMemo(() =>
    [
      manualData.detailAddress,
      cityOptions.find((o) => o.value === manualData.city)?.label,
      zipOptions.find((o) => o.value === manualData.zip)?.label,
      PROVINCE_OPTIONS.find((o) => o.value === manualData.province)?.label,
    ]
      .filter(Boolean)
      .join(', '),
    [manualData, cityOptions, zipOptions]
  );

  return (
    <div ref={formRef} className="lnCoverageCheck__manualForm" style={{ opacity: 0 }}>
      <input type="hidden" name="site_id" value="" />
      <input type="hidden" name="address" value={builtAddress} />

      <button
        type="button"
        onClick={onBack}
        className="lnCoverageCheck__backBtn inline-flex items-center gap-1.5 mb-4 text-body-b5 text-secondary hover:text-black transition-colors duration-150 focus:outline-none"
        aria-label="Kembali ke pencarian alamat"
      >
        <Icon name="chevron-left" colorClass="text-current" className="w-4 h-4" />
        <span>Kembali</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        <div className="lnCoverageCheck__formField">
          <Select
            id="manual-province"
            label="Province*"
            options={PROVINCE_OPTIONS}
            required
            value={manualData.province}
            onChange={handleChange}
            error={errors?.province}
            submitAttempted={submitAttempted}
            className="mb-3"
          />
        </div>

        <div className="lnCoverageCheck__formField">
          <Select
            id="manual-city"
            label="City / Regency*"
            options={cityOptions}
            required
            value={manualData.city}
            onChange={handleChange}
            disabled={!manualData.province}
            error={errors?.city}
            submitAttempted={submitAttempted}
            className="mb-3"
          />
        </div>

        <div className="lnCoverageCheck__formField">
          <Select
            id="manual-zip"
            label="Ward / ZIP Code*"
            options={zipOptions}
            required
            value={manualData.zip}
            onChange={handleChange}
            disabled={!manualData.city}
            error={errors?.zip}
            submitAttempted={submitAttempted}
            className="mb-3"
          />
        </div>

        <div className="lnCoverageCheck__formField col-span-1 md:col-span-2">
          <Textarea
            id="manual-detailAddress"
            label="Detail Address*"
            required
            maxLength={300}
            value={manualData.detailAddress}
            onChange={handleChange}
            error={errors?.detailAddress}
            submitAttempted={submitAttempted}
          />
        </div>
      </div>
    </div>
  );
}

// ── Helper: resolve label from option arrays ──────────────────
export function resolveManualLabels(manualData) {
  const cityOptions = manualData.province ? (CITY_BY_PROVINCE[manualData.province] ?? []) : [];
  const zipOptions  = manualData.city     ? (ZIP_BY_CITY[manualData.city]           ?? []) : [];

  return {
    provinceLabel: PROVINCE_OPTIONS.find((o) => o.value === manualData.province)?.label ?? '',
    cityLabel:     cityOptions.find((o) => o.value === manualData.city)?.label ?? '',
    zipLabel:      zipOptions.find((o) => o.value === manualData.zip)?.label ?? '',
    detailAddress: manualData.detailAddress ?? '',
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
/**
 * @param {string}   [site_id]
 * @param {string}   [addressDetail]          - Controlled from parent (CoveredCard)
 * @param {Function} [onAddressDetailChange]  - onChange for addressDetail
 * @param {object}   [manualData]             - Controlled manual form data
 * @param {Function} [onManualDataChange]     - Callback when manual fields change
 * @param {Function} [onModeChange]           - Called with COVERAGE_MODE when step changes
 * @param {Function} [onAddressSelect]        - Called with { site_id, address } when user selects an address
 * @param {Function} [onAddressReset]         - Called when user clicks close/edit to reset address data
 * @param {object}   [errors]
 * @param {boolean}  [submitAttempted]
 * @param {boolean}  [required]
 * @param {boolean}  [showNotFoundAction]
 * @param {boolean}  [showAddressDetailInput]
 * @param {string}   [className]
 */
export default function CoverageCheckInput({
  site_id: prefillSiteId = '',
  addressDetail = '',
  onAddressDetailChange,
  manualData = { province: '', city: '', zip: '', detailAddress: '' },
  onManualDataChange,
  onModeChange,
  onAddressSelect,
  onAddressReset,
  errors = {},
  submitAttempted = false,
  required = false,
  showNotFoundAction = true,
  showAddressDetailInput = true,
  className = '',
}) {
  const resolveAddress = useCallback((siteId) =>
    siteId
      ? MOCK_ADDRESSES.find((a) => a.site_id === siteId) ?? { id: null, site_id: siteId, label: '' }
      : null,
  []);

  const { read: readSession, write: writeSession, clear: clearSession } =
    useSessionState(prefillSiteId || 'free');

  const [step, setStep] = useState(() => {
    if (prefillSiteId) return 3;
    return readSession()?.step ?? 1;
  });

  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);

  const [selectedAddress, setSelectedAddress] = useState(() => {
    if (prefillSiteId) return resolveAddress(prefillSiteId);
    return readSession()?.selectedAddress ?? null;
  });

  const [touched, setTouched] = useState(() => readSession()?.touched ?? false);

  // ── Derive mode and notify parent ───────────────────────────
  const mode = useMemo(() => {
    if (step === 3) return COVERAGE_MODE.COVERED;
    if (step === 4) return COVERAGE_MODE.MANUAL;
    return COVERAGE_MODE.SEARCH;
  }, [step]);

  useEffect(() => {
    onModeChange?.(mode);
  }, [mode, onModeChange]);

  // ── Persist durable states ──────────────────────────────────
  useEffect(() => {
    if (step === 3 || step === 4) {
      writeSession({ step, selectedAddress, touched });
    } else {
      clearSession();
    }
  }, [step, selectedAddress, touched, writeSession, clearSession]);

  // ── Sync when site_id prop changes ──────────────────────────
  useEffect(() => {
    if (prefillSiteId) {
      const resolved = resolveAddress(prefillSiteId);
      setSelectedAddress(resolved);
      setStep(3);
      setQuery('');
      setResults([]);
      // Notify parent of the resolved address
      onAddressSelect?.({
        site_id: resolved?.site_id ?? '',
        address: resolved?.label ?? '',
      });
    } else {
      const saved = readSession();
      if (saved?.step === 3 || saved?.step === 4) {
        setStep(saved.step);
        setSelectedAddress(saved.selectedAddress ?? null);
      } else {
        setSelectedAddress(null);
        setStep(1);
      }
    }
    setTouched(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSiteId]);

  // ── Validation ──────────────────────────────────────────────
  const isCovered  = step === 3 && selectedAddress;
  const isManual   = step === 4;
  const hasValue   = isCovered || isManual;
  const displayError = required && touched && !hasValue ? 'Alamat wajib diisi.' : null;

  // ── Search ──────────────────────────────────────────────────
  const handleSearchResults = useCallback((filtered) => {
    if (filtered === null) {
      setStep((prev) => (prev === 2 ? 1 : prev));
      setResults([]);
    } else {
      setResults(filtered);
      setStep(2);
    }
  }, []);

  useMockSearch(query, handleSearchResults);

  // ── Handlers ────────────────────────────────────────────────
  const showHelper = step === 1;

  const handleQueryChange = useCallback((e) => {
    setTouched(true);
    setQuery(e.target.value);
  }, []);

  const handleSelectAddress = useCallback((address) => {
    setTouched(true);
    setSelectedAddress(address);
    setStep(3);

    // ★ Propagate selected address data to parent
    onAddressSelect?.({
      site_id: address.site_id ?? '',
      address: address.label ?? '',
    });
  }, [onAddressSelect]);

  const handleNotFound = useCallback(() => {
    setTouched(true);
    setStep(4);

    // ★ Reset covered-mode data in parent when switching to manual
    onAddressReset?.();
  }, [onAddressReset]);

  const handleEdit = useCallback(() => {
    clearSession();
    setQuery('');
    setResults([]);
    setSelectedAddress(null);
    setTouched(false);
    setStep(1);

    // ★ Reset ALL address-related data in parent
    onAddressReset?.();
  }, [clearSession, onAddressReset]);

  const handleBack = useCallback(() => {
    setQuery('');
    setResults([]);
    setStep(1);

    // ★ Reset manual data in parent when going back to search
    onAddressReset?.();
  }, [onAddressReset]);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className={`lnCoverageCheck w-full ${className}`}>

      {(step === 1 || step === 2) && (
        <div className="lnCoverageCheck__searchSection">
          <SearchInput
            value={query}
            onChange={handleQueryChange}
            showHelper={showHelper}
            error={displayError}
          />
          {step === 2 && (
            <SearchResults
              results={results}
              onSelect={handleSelectAddress}
              onNotFound={handleNotFound}
              showNotFoundAction={showNotFoundAction}
            />
          )}
        </div>
      )}

      {step === 3 && selectedAddress && (
        <CoveredCard
          address={selectedAddress}
          addressDetail={addressDetail}
          onAddressDetailChange={onAddressDetailChange}
          onEdit={handleEdit}
          errors={errors}
          submitAttempted={submitAttempted}
          showAddressDetailInput={showAddressDetailInput}
        />
      )}

      {step === 4 && (
        <ManualForm
          manualData={manualData}
          onManualDataChange={onManualDataChange}
          onBack={handleBack}
          errors={errors}
          submitAttempted={submitAttempted}
        />
      )}

    </div>
  );
}
