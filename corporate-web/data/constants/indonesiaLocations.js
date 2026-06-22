import cities from '@/data/location/cities.json';
import provinces from '@/data/location/provinces.json';
import zips from '@/data/location/zips.json';

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
  'Daerah Istimewa Yogyakarta': 'DI Yogyakarta',
  'Dki Jakarta': 'DKI Jakarta',
};

// The source zip file uses shifted DKI city codes, while the city file uses official city codes.
const ZIP_CITY_CODE_OVERRIDES = {
  3171: '3174',
  3172: '3175',
  3173: '3171',
  3174: '3173',
  3175: '3172',
};

const provinceValueToCode = new Map();
const cityOptionsByProvinceValue = new Map();
const provincePostalIndexCache = new Map();

function toTitleCase(value) {
  return String(value ?? '')
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
  const titleName = toTitleCase(name);

  return PROVINCE_LABEL_OVERRIDES[titleName] ?? titleName;
}

function formatCityLabel(name) {
  const normalizedName = toTitleCase(name);

  if (normalizedName.startsWith('Kota Adm. ')) {
    return normalizedName.replace('Kota Adm. ', '');
  }

  if (normalizedName.startsWith('Kab. Adm. ')) {
    return `Kab. ${normalizedName.replace('Kab. Adm. ', '')}`;
  }

  return normalizedName;
}

function formatDistrictLabel(name) {
  return toTitleCase(name);
}

function normalizeZipCityCode(cityCode) {
  return ZIP_CITY_CODE_OVERRIDES[cityCode] ?? cityCode;
}

function buildProvinceOptions() {
  return provinces
    .map((province) => {
      const label = formatProvinceLabel(province.name);
      const option = { label, value: label };

      provinceValueToCode.set(option.value, province.code);

      return option;
    })
    .sort(sortOptions);
}

const INDONESIA_PROVINCE_OPTIONS = buildProvinceOptions();

function buildProvincePostalIndex(provinceValue) {
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

  const cityNameByCode = new Map(
    cities
      .filter((city) => city.provinceCode === provinceCode)
      .map((city) => [city.code, formatCityLabel(city.name)])
  );
  const zipOptionsByCity = new Map();
  const wardZipOptionsByCity = new Map();

  zips.forEach((record) => {
    const cityValue = cityNameByCode.get(normalizeZipCityCode(record.cityCode));

    if (!cityValue) {
      return;
    }

    const districtLabel = formatDistrictLabel(record.district);

    if (!zipOptionsByCity.has(cityValue)) {
      zipOptionsByCity.set(cityValue, new Map());
    }

    if (!wardZipOptionsByCity.has(cityValue)) {
      wardZipOptionsByCity.set(cityValue, new Map());
    }

    const zipOptions = zipOptionsByCity.get(cityValue);
    const wardZipOptions = wardZipOptionsByCity.get(cityValue);

    if (!zipOptions.has(record.zip)) {
      zipOptions.set(record.zip, {
        label: `${record.zip} - ${districtLabel}`,
        value: record.zip,
      });
    }

    const wardZipValue = `${districtLabel} - ${record.zip}`;

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

  return normalizedIndex;
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

  const options = cities
    .filter((city) => city.provinceCode === provinceCode)
    .map((city) => {
      const label = formatCityLabel(city.name);
      return { label, value: label };
    })
    .sort(sortOptions);

  cityOptionsByProvinceValue.set(normalizedProvince, options);

  return options;
}

export async function getIndonesiaZipOptions(provinceValue, cityValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);
  const normalizedCity = normalizeIndonesiaCityValue(normalizedProvince, cityValue);
  const provinceIndex = buildProvincePostalIndex(normalizedProvince);

  return provinceIndex.zipOptionsByCity.get(normalizedCity) ?? [];
}

export async function getIndonesiaWardZipOptions(provinceValue, cityValue) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(provinceValue);
  const normalizedCity = normalizeIndonesiaCityValue(normalizedProvince, cityValue);
  const provinceIndex = buildProvincePostalIndex(normalizedProvince);

  return provinceIndex.wardZipOptionsByCity.get(normalizedCity) ?? [];
}

export function resolveCachedIndonesiaLocationLabels({ province, city, zip }) {
  const normalizedProvince = normalizeIndonesiaProvinceValue(province);
  const normalizedCity = normalizeIndonesiaCityValue(normalizedProvince, city);
  const provinceIndex = buildProvincePostalIndex(normalizedProvince);
  const provinceLabel =
    INDONESIA_PROVINCE_OPTIONS.find((option) => option.value === normalizedProvince)?.label ??
    normalizedProvince ??
    '';
  const cityOptions = getIndonesiaCityOptions(normalizedProvince);
  const zipOptions = provinceIndex.zipOptionsByCity.get(normalizedCity) ?? [];

  return {
    cityLabel: cityOptions.find((option) => option.value === normalizedCity)?.label ?? normalizedCity ?? '',
    provinceLabel,
    zipLabel: zipOptions.find((option) => option.value === zip)?.label ?? zip ?? '',
  };
}
