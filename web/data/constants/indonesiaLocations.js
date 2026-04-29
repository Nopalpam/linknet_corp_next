import { DataWilayahService } from '@damarkuncoro/data-wilayah-indonesia';
import { TsDataProvider } from '@damarkuncoro/posindonesia';

const wilayahService = new DataWilayahService();
const postalDataProvider = new TsDataProvider({
  maxCacheSize: 64,
  ttl: 1000 * 60 * 60,
});

const LEGACY_PROVINCE_VALUES = {
  dki: 'DKI Jakarta',
  jabar: 'Jawa Barat',
  jateng: 'Jawa Tengah',
  jatim: 'Jawa Timur',
  banten: 'Banten',
};

const LEGACY_CITY_VALUES = {
  'DKI Jakarta': {
    jaksel: 'Jakarta Selatan',
    jakbar: 'Jakarta Barat',
    jakpus: 'Jakarta Pusat',
    jakut: 'Jakarta Utara',
    jaktim: 'Jakarta Timur',
  },
  'Jawa Barat': {
    bandung: 'Kota Bandung',
    bekasi: 'Kota Bekasi',
    bogor: 'Kota Bogor',
  },
  'Jawa Tengah': {
    semarang: 'Kota Semarang',
    solo: 'Kota Surakarta',
    magelang: 'Kota Magelang',
  },
  'DI Yogyakarta': {
    yogyakarta: 'Kota Yogyakarta',
    sleman: 'Kab. Sleman',
    bantul: 'Kab. Bantul',
  },
  'Jawa Timur': {
    surabaya: 'Kota Surabaya',
    sidoarjo: 'Kab. Sidoarjo',
    malang: 'Kota Malang',
  },
  Banten: {
    tangerang: 'Kota Tangerang',
    serpong: 'Kota Tangerang Selatan',
    serang: 'Kota Serang',
    cilegon: 'Kota Cilegon',
  },
};

const PROVINCE_LABEL_OVERRIDES = {
  'DAERAH ISTIMEWA YOGYAKARTA': 'DI Yogyakarta',
  'DKI JAKARTA': 'DKI Jakarta',
};

const provinceValueToCode = new Map();
const cityOptionsByProvinceValue = new Map();
const provincePostalIndexCache = new Map();
const provincePostalIndexPromises = new Map();

function toTitleCase(value) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => {
      if (part === 'dki') return 'DKI';
      if (part === 'di') return 'DI';
      if (part === 'adm.') return 'Adm.';
      if (part === 'kab.') return 'Kab.';
      if (part === 'kab') return 'Kab.';
      if (part === 'kep.') return 'Kep.';
      if (part === 'kota') return 'Kota';

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function sortOptions(left, right) {
  return left.label.localeCompare(right.label, 'id', { sensitivity: 'base' });
}

function formatProvinceLabel(name) {
  return PROVINCE_LABEL_OVERRIDES[name] ?? toTitleCase(name);
}

function formatRegencyLabel(name, type, provinceCode) {
  const baseName = toTitleCase(name);

  if (provinceCode === '31' && type === 'KOTA') {
    return baseName;
  }

  return type === 'KABUPATEN' ? `Kab. ${baseName}` : `Kota ${baseName}`;
}

function formatPostalCityLabel(name) {
  const normalizedName = name.replace(/\s+/g, ' ').trim();

  if (normalizedName.startsWith('KOTA ADM. ')) {
    return toTitleCase(normalizedName.replace('KOTA ADM. ', ''));
  }

  if (normalizedName.startsWith('KAB. ADM. ')) {
    return `Kab. ${toTitleCase(normalizedName.replace('KAB. ADM. ', ''))}`;
  }

  if (normalizedName.startsWith('KOTA ')) {
    return `Kota ${toTitleCase(normalizedName.replace('KOTA ', ''))}`;
  }

  if (normalizedName.startsWith('KAB. ')) {
    return `Kab. ${toTitleCase(normalizedName.replace('KAB. ', ''))}`;
  }

  if (normalizedName.startsWith('KAB ')) {
    return `Kab. ${toTitleCase(normalizedName.replace('KAB ', ''))}`;
  }

  return toTitleCase(normalizedName);
}

function formatDistrictLabel(name) {
  return toTitleCase(name);
}

function buildProvinceOptions() {
  return wilayahService
    .getAllProvinces()
    .map((province) => {
      const label = formatProvinceLabel(province.name);
      const option = { label, value: label };

      provinceValueToCode.set(option.value, province.code);

      return option;
    })
    .sort(sortOptions);
}

const INDONESIA_PROVINCE_OPTIONS = buildProvinceOptions();

async function getProvincePostalIndex(provinceValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);
  const provinceCode = provinceValueToCode.get(normalizedProvince);

  if (!provinceCode) {
    return {
      wardZipOptionsByCity: new Map(),
      zipOptionsByCity: new Map(),
    };
  }

  const cachedIndex = provincePostalIndexCache.get(provinceCode);
  if (cachedIndex) {
    return cachedIndex;
  }

  const cachedPromise = provincePostalIndexPromises.get(provinceCode);
  if (cachedPromise) {
    return cachedPromise;
  }

  const loadPromise = (async () => {
    const records = await postalDataProvider.getByProvince(provinceCode);
    const zipOptionsByCity = new Map();
    const wardZipOptionsByCity = new Map();

    records.forEach((record) => {
      const cityValue = formatPostalCityLabel(record.city);
      const districtLabel = formatDistrictLabel(record.district);

      if (!zipOptionsByCity.has(cityValue)) {
        zipOptionsByCity.set(cityValue, new Map());
      }

      if (!wardZipOptionsByCity.has(cityValue)) {
        wardZipOptionsByCity.set(cityValue, new Map());
      }

      const zipOptions = zipOptionsByCity.get(cityValue);
      const wardZipOptions = wardZipOptionsByCity.get(cityValue);

      if (!zipOptions.has(record.postalCode)) {
        zipOptions.set(record.postalCode, {
          label: `${record.postalCode} - ${districtLabel}`,
          value: record.postalCode,
        });
      }

      const wardZipValue = `${districtLabel} - ${record.postalCode}`;

      if (!wardZipOptions.has(wardZipValue)) {
        wardZipOptions.set(wardZipValue, {
          label: wardZipValue,
          value: wardZipValue,
        });
      }
    });

    const normalizedIndex = {
      wardZipOptionsByCity: new Map(
        Array.from(wardZipOptionsByCity.entries()).map(([city, options]) => [
          city,
          Array.from(options.values()).sort(sortOptions),
        ])
      ),
      zipOptionsByCity: new Map(
        Array.from(zipOptionsByCity.entries()).map(([city, options]) => [
          city,
          Array.from(options.values()).sort(sortOptions),
        ])
      ),
    };

    provincePostalIndexCache.set(provinceCode, normalizedIndex);
    provincePostalIndexPromises.delete(provinceCode);

    return normalizedIndex;
  })();

  provincePostalIndexPromises.set(provinceCode, loadPromise);

  return loadPromise;
}

export function normalizeIndonesiaProvinceValue(value) {
  return LEGACY_PROVINCE_VALUES[value] ?? value ?? '';
}

export function normalizeIndonesiaCityValue(provinceValue, cityValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);

  return LEGACY_CITY_VALUES[normalizedProvince]?.[cityValue] ?? cityValue ?? '';
}

export function getIndonesiaProvinceOptions() {
  return INDONESIA_PROVINCE_OPTIONS;
}

export function getIndonesiaCityOptions(provinceValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);

  if (!normalizedProvince) {
    return [];
  }

  const cachedOptions = cityOptionsByProvinceValue.get(normalizedProvince);
  if (cachedOptions) {
    return cachedOptions;
  }

  const provinceCode = provinceValueToCode.get(normalizedProvince);
  if (!provinceCode) {
    return [];
  }

  const options = wilayahService
    .getRegenciesByProvince(provinceCode)
    .map((regency) => {
      const label = formatRegencyLabel(regency.name, regency.type, provinceCode);
      return { label, value: label };
    })
    .sort(sortOptions);

  cityOptionsByProvinceValue.set(normalizedProvince, options);

  return options;
}

export async function getIndonesiaZipOptions(provinceValue, cityValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);
  const normalizedCity = normalizeIndonesiaCityValue(normalizedProvince, cityValue);
  const provinceIndex = await getProvincePostalIndex(normalizedProvince);

  return provinceIndex.zipOptionsByCity.get(normalizedCity) ?? [];
}

export async function getIndonesiaWardZipOptions(provinceValue, cityValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);
  const normalizedCity = normalizeIndonesiaCityValue(normalizedProvince, cityValue);
  const provinceIndex = await getProvincePostalIndex(normalizedProvince);

  return provinceIndex.wardZipOptionsByCity.get(normalizedCity) ?? [];
}

export function resolveCachedIndonesiaLocationLabels({ province, city, zip }) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(province);
  const normalizedCity = normalizeIndonesiaCityValue(normalizedProvince, city);
  const provinceCode = provinceValueToCode.get(normalizedProvince);
  const provinceIndex = provinceCode ? provincePostalIndexCache.get(provinceCode) : null;
  const provinceLabel =
    INDONESIA_PROVINCE_OPTIONS.find((option) => option.value === normalizedProvince)?.label ??
    normalizedProvince ??
    '';
  const cityOptions = getIndonesiaCityOptions(normalizedProvince);
  const zipOptions = provinceIndex?.zipOptionsByCity.get(normalizedCity) ?? [];

  return {
    cityLabel: cityOptions.find((option) => option.value === normalizedCity)?.label ?? normalizedCity ?? '',
    provinceLabel,
    zipLabel: zipOptions.find((option) => option.value === zip)?.label ?? zip ?? '',
  };
}