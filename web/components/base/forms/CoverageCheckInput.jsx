'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import gsap from 'gsap';
import Button from '../Button';
import Input    from './Input';
import Select   from './Select';
import Textarea from './Textarea';
import Icon     from '../Icon';
import useIndonesiaLocationOptions from '@/components/hooks/useIndonesiaLocationOptions';
import { resolveCachedIndonesiaLocationLabels } from '@/data/constants/indonesiaLocations';

// ─────────────────────────────────────────────────────────────
// COVERAGE SEARCH
// ─────────────────────────────────────────────────────────────
const COVERAGE_SEARCH_ENDPOINT = '/linknet-enterprise-coverage';
const COVERAGE_SEARCH_MIN_LENGTH = 3;

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

function normalizeCoverageText(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function extractProviderNames(source) {
  if (Array.isArray(source)) {
    return source.flatMap(extractProviderNames);
  }

  if (source && typeof source === 'object') {
    return [source.name, source.label, source.value, source.provider, source.providers]
      .flatMap(extractProviderNames);
  }

  if (typeof source !== 'string') {
    return [];
  }

  return source
    .split(',')
    .map(normalizeCoverageText)
    .filter(Boolean);
}

function withMergedCoverageProviders(result, providers) {
  if (!Array.isArray(providers) || providers.length === 0) {
    return result;
  }

  const existingRaw = result?.raw && typeof result.raw === 'object' ? result.raw : {};

  return {
    ...result,
    providers,
    raw: {
      ...existingRaw,
      providers: providers.join(', '),
    },
  };
}

function getCoverageResultKey(result) {
  const label = normalizeCoverageText(result?.label);

  if (label) {
    return `address:${label.toLowerCase()}`;
  }

  const siteId = normalizeCoverageText(String(result?.site_id ?? result?.id ?? ''));

  if (siteId) {
    return `site:${siteId.toLowerCase()}`;
  }

  return null;
}

function mergeCoverageResults(existingResult, nextResult) {
  const mergedProviders = Array.from(new Set([
    ...(existingResult?.providers ?? []),
    ...(nextResult?.providers ?? []),
  ]));

  const existingRaw = existingResult?.raw && typeof existingResult.raw === 'object'
    ? existingResult.raw
    : {};
  const nextRaw = nextResult?.raw && typeof nextResult.raw === 'object'
    ? nextResult.raw
    : {};

  return withMergedCoverageProviders(
    {
      ...nextResult,
      ...existingResult,
      raw: {
        ...nextRaw,
        ...existingRaw,
      },
    },
    mergedProviders,
  );
}

function dedupeCoverageResults(results) {
  const uniqueResults = [];
  const seenIndexes = new Map();

  results.forEach((result) => {
    const key = getCoverageResultKey(result);

    if (!key) {
      uniqueResults.push(result);
      return;
    }

    const existingIndex = seenIndexes.get(key);

    if (existingIndex == null) {
      uniqueResults.push(result);
      seenIndexes.set(key, uniqueResults.length - 1);
      return;
    }

    uniqueResults[existingIndex] = mergeCoverageResults(uniqueResults[existingIndex], result);
  });

  return uniqueResults;
}

function normalizeCoverageResult(item, index) {
  const siteId = item?.site_id == null ? '' : String(item.site_id).trim();
  const label = [item?.address, item?.site_address, item?.label]
    .find((value) => typeof value === 'string' && value.trim())
    ?.trim() || '';
  const providers = Array.from(new Set(
    extractProviderNames(
      item?.providers
      ?? item?.provider
      ?? item?.availableProviders
      ?? item?.available_providers
      ?? (item?.data && Array.isArray(item.data) ? item.data[0]?.providers : undefined)
      ?? (Array.isArray(item) ? item[0]?.providers : undefined),
    ),
  ));

  if (!siteId || !label) {
    return null;
  }

  return withMergedCoverageProviders({
    id: item?.id ?? siteId ?? `coverage-${index}`,
    site_id: siteId,
    label,
    raw: item,
  }, providers);
}

function useCoverageSearch(query, onResults, onErrorChange, onLoadingChange) {
  const performSearch = useCallback(async (searchQuery, signal) => {
    try {
      onLoadingChange(true);
      onErrorChange(null);

      const params = new URLSearchParams({ search: searchQuery });
      const response = await fetch(
        `${COVERAGE_SEARCH_ENDPOINT}?${params.toString()}`,
        {
          signal,
          cache: 'no-store',
          headers: {
            Accept: 'application/json',
          },
        },
      );

      const payload = await response.json().catch(() => null);
      const normalizedResults = Array.isArray(payload?.data)
        ? dedupeCoverageResults(payload.data.map(normalizeCoverageResult).filter(Boolean)).slice(0, 5)
        : [];

      if (!response.ok || !payload?.success) {
        onErrorChange(payload?.message || 'Gagal mengambil data coverage.');
        onResults([]);
        return;
      }

      onResults(normalizedResults);
    } catch (error) {
      if (signal.aborted) {
        return;
      }

      console.error('Coverage search failed:', error);
      onErrorChange('Gagal menghubungi server. Silakan coba lagi.');
      onResults([]);
    } finally {
      if (!signal.aborted) {
        onLoadingChange(false);
      }
    }
  }, [onErrorChange, onLoadingChange, onResults]);

  useEffect(() => {
    if (query.length < COVERAGE_SEARCH_MIN_LENGTH) {
      onLoadingChange(false);
      onErrorChange(null);
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
  }, [onErrorChange, onLoadingChange, onResults, performSearch, query]);
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

function SearchResults({
  results,
  onSelect,
  onNotFound,
  showNotFoundAction = true,
  isLoading = false,
  error = null,
}) {
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

      {isLoading ? (
        <div className="lnCoverageCheck__resultsEmpty flex flex-col items-center gap-1.5 px-4 py-6 text-center">
          <Icon name="location" colorClass="text-secondary" className="w-8 h-8 opacity-40 animate-pulse" />
          <p className="text-body-b3 text-black font-bold">Mencari alamat...</p>
          <p className="text-caption-c1 text-secondary">
            Mengambil data coverage terbaru dari server.
          </p>
        </div>
      ) : error ? (
        <div className="lnCoverageCheck__resultsEmpty flex flex-col items-center gap-1.5 px-4 py-6 text-center">
          <Icon name="location" colorClass="text-warning" className="w-8 h-8 opacity-60" />
          <p className="text-body-b3 text-black font-bold">Pencarian belum berhasil.</p>
          <p className="text-caption-c1 text-secondary">{error}</p>
        </div>
      ) : hasResults ? (
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/illustrations/ill-search-not-found.svg" alt="Not Found" className="w-24 mb-4 h-auto" />
          <p className="text-body-b3 text-black font-bold">Alamat tidak ditemukan.</p>
          <p className="text-caption-c1 text-secondary">
            Coba kata kunci lain atau masukkan alamat secara manual.
          </p>
        </div>
      )}

      {showNotFoundAction && (
        <div className="lnCoverageCheck__resultsFooter text-center py-4">
          <span className="text-caption-c1 text-secondary px-4 py-2 bg-[#f3f3f3] rounded-full">
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
  headerText = 'This address is accessible by the Linknet network',
  actionIconName = 'close',
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
            {headerText}
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
            <Icon name={actionIconName} colorClass="text-secondary" className="w-5 h-5" />
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

function ManualForm({
  manualData,
  onManualDataChange,
  onBack,
  errors,
  submitAttempted,
  showDetailAddress = true,
  manualCheckCtaLabel = '',
  onManualCheckCoverage,
}) {
  const formRef = useFadeIn([]);
  const {
    cityOptions,
    finalOptions: zipOptions,
    normalizedCity,
    normalizedProvince,
    provinceOptions,
  } = useIndonesiaLocationOptions({
    city: manualData.city,
    finalLevel: 'zip',
    province: manualData.province,
  });

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
      zipOptions.find((o) => o.value === manualData.zip)?.label,
      cityOptions.find((o) => o.value === normalizedCity)?.label ?? normalizedCity,
      provinceOptions.find((o) => o.value === normalizedProvince)?.label ?? normalizedProvince,
      showDetailAddress ? manualData.detailAddress : '',
    ]
      .filter(Boolean)
      .join(', '),
    [
      cityOptions,
      manualData.detailAddress,
      manualData.zip,
      normalizedCity,
      normalizedProvince,
      provinceOptions,
      showDetailAddress,
      zipOptions,
    ]
  );

  const isManualCoverageReady = Boolean(
    normalizedProvince && normalizedCity && manualData.zip,
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
        <span>Complete address</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        <div className="lnCoverageCheck__formField">
          <Select
            id="manual-province"
            label="Province*"
            options={provinceOptions}
            required
            value={normalizedProvince}
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
            value={normalizedCity}
            onChange={handleChange}
            disabled={!normalizedProvince}
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
            disabled={!normalizedCity}
            error={errors?.zip}
            submitAttempted={submitAttempted}
            className="mb-3"
          />
        </div>

        {manualCheckCtaLabel ? (
          <div className="lnCoverageCheck__formField col-span-1 md:col-span-2">
            <Button
              type="button"
              variant="warning"
              size="lg"
              disabled={!isManualCoverageReady}
              onClick={onManualCheckCoverage}
              className="w-full md:w-auto mt-4"
            >
              {manualCheckCtaLabel}
            </Button>
          </div>
        ) : null}

        {showDetailAddress ? (
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
        ) : null}
      </div>
    </div>
  );
}

// ── Helper: resolve label from option arrays ──────────────────
export function resolveManualLabels(manualData) {
  const labels = resolveCachedIndonesiaLocationLabels({
    city: manualData.city,
    province: manualData.province,
    zip: manualData.zip,
  });

  return {
    provinceLabel: labels.provinceLabel,
    cityLabel: labels.cityLabel,
    zipLabel: labels.zipLabel,
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
 * @param {Function} [onAddressSelect]        - Called with { site_id, address, raw, providers } when user selects an address
 * @param {Function} [onAddressReset]         - Called when user clicks close/edit to reset address data
 * @param {object}   [errors]
 * @param {boolean}  [submitAttempted]
 * @param {boolean}  [required]
 * @param {boolean}  [showNotFoundAction]
 * @param {boolean}  [showAddressDetailInput]
 * @param {boolean}  [showManualDetailAddress]
 * @param {string}   [manualCheckCtaLabel]
 * @param {Function} [onManualCheckCoverage]
 * @param {string}   [coveredHeaderText]
 * @param {string}   [coveredActionIconName]
 * @param {string}   [className]
 */
export default function CoverageCheckInput({
  site_id: prefillSiteId = '',
  address: prefillAddress = '',
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
  showManualDetailAddress = true,
  manualCheckCtaLabel = '',
  onManualCheckCoverage,
  coveredHeaderText = 'This address is accessible by the Linknet network',
  coveredActionIconName = 'close',
  className = '',
}) {
  const resolveAddress = useCallback((siteId, label = '') => (
    siteId
      ? { id: siteId, site_id: siteId, label }
      : null
  ), []);

  const { read: readSession, write: writeSession, clear: clearSession } =
    useSessionState(prefillSiteId || 'free');

  const [step, setStep] = useState(() => {
    if (prefillSiteId) return 3;
    return readSession()?.step ?? 1;
  });

  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const [selectedAddress, setSelectedAddress] = useState(() => {
    if (prefillSiteId) {
      const saved = readSession();
      return resolveAddress(
        prefillSiteId,
        prefillAddress || saved?.selectedAddress?.label || '',
      );
    }
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
      const saved = readSession();
      const resolved = resolveAddress(
        prefillSiteId,
        prefillAddress || saved?.selectedAddress?.label || '',
      );
      setSelectedAddress(resolved);
      setStep(3);
      setQuery('');
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      // Notify parent of the resolved address
      onAddressSelect?.({
        site_id: resolved?.site_id ?? '',
        address: resolved?.label ?? '',
        raw: resolved?.raw ?? null,
        providers: resolved?.providers ?? [],
      });
    } else {
      const saved = readSession();
      if (saved?.step === 3 || saved?.step === 4) {
        setStep(saved.step);
        setSelectedAddress(saved.selectedAddress ?? null);

        if (saved.step === 3 && saved.selectedAddress) {
          onAddressSelect?.({
            site_id: saved.selectedAddress.site_id ?? '',
            address: saved.selectedAddress.label ?? '',
            raw: saved.selectedAddress.raw ?? null,
            providers: saved.selectedAddress.providers ?? [],
          });
        }
      } else {
        setSelectedAddress(null);
        setStep(1);
      }
      setSearchError(null);
      setIsSearching(false);
    }
    setTouched(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillAddress, prefillSiteId]);

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

  useCoverageSearch(query, handleSearchResults, setSearchError, setIsSearching);

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
    // Build a robust providers array from possible shapes
    const providersFromAddress = (() => {
      if (Array.isArray(address?.providers) && address.providers.length > 0) {
        return address.providers;
      }

      // Try common raw shapes and fall back to the whole raw object
      const candidate =
        address?.raw?.providers
        ?? address?.raw?.provider
        ?? address?.raw?.availableProviders
        ?? address?.raw?.available_providers
        ?? (address?.raw?.data && Array.isArray(address.raw.data) ? address.raw.data[0]?.providers : undefined)
        ?? address?.raw
        ?? address;

      const extracted = extractProviderNames(candidate);
      return Array.isArray(extracted) ? extracted : [];
    })();

    onAddressSelect?.({
      site_id: address.site_id ?? '',
      address: address.label ?? '',
      raw: address.raw ?? null,
      providers: providersFromAddress,
    });
  }, [onAddressSelect]);

  const handleNotFound = useCallback(() => {
    setTouched(true);
    setStep(4);
    setSearchError(null);

    // ★ Reset covered-mode data in parent when switching to manual
    onAddressReset?.();
  }, [onAddressReset]);

  const handleEdit = useCallback(() => {
    clearSession();
    setQuery('');
    setResults([]);
    setSelectedAddress(null);
    setSearchError(null);
    setIsSearching(false);
    setTouched(false);
    setStep(1);

    // ★ Reset ALL address-related data in parent
    onAddressReset?.();
  }, [clearSession, onAddressReset]);

  const handleBack = useCallback(() => {
    setQuery('');
    setResults([]);
    setSearchError(null);
    setIsSearching(false);
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
              isLoading={isSearching}
              error={searchError}
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
          headerText={coveredHeaderText}
          actionIconName={coveredActionIconName}
        />
      )}

      {step === 4 && (
        <ManualForm
          manualData={manualData}
          onManualDataChange={onManualDataChange}
          onBack={handleBack}
          errors={errors}
          submitAttempted={submitAttempted}
          showDetailAddress={showManualDetailAddress}
          manualCheckCtaLabel={manualCheckCtaLabel}
          onManualCheckCoverage={onManualCheckCoverage}
        />
      )}

    </div>
  );
}
