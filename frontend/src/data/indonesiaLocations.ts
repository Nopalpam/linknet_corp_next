import citiesJson from "../../../web/data/location/cities.json";
import provincesJson from "../../../web/data/location/provinces.json";

type ProvinceRecord = {
  code: string;
  name: string;
};

type CityRecord = {
  code: string;
  provinceCode: string;
  name: string;
};

export type ProvinceOption = {
  code: string;
  hcKey: string;
  label: string;
  value: string;
  searchText: string;
};

export type CityOption = {
  code: string;
  provinceCode: string;
  provinceName: string;
  label: string;
  value: string;
  searchText: string;
};

const HIGHCHARTS_PROVINCE_KEYS: Record<string, string> = {
  "11": "id-ac",
  "12": "id-su",
  "13": "id-sb",
  "14": "id-ri",
  "15": "id-ja",
  "16": "id-sl",
  "17": "id-be",
  "18": "id-1024",
  "19": "id-bb",
  "21": "id-kr",
  "31": "id-jk",
  "32": "id-jr",
  "33": "id-jt",
  "34": "id-yo",
  "35": "id-ji",
  "36": "id-bt",
  "51": "id-ba",
  "52": "id-nb",
  "53": "id-nt",
  "61": "id-kb",
  "62": "id-kt",
  "63": "id-ks",
  "64": "id-ki",
  "65": "id-ku",
  "71": "id-sw",
  "72": "id-st",
  "73": "id-se",
  "74": "id-sg",
  "75": "id-go",
  "76": "id-sr",
  "81": "id-ma",
  "82": "id-la",
  "91": "id-pa",
  "92": "id-ib",
};

const PROVINCE_LABEL_OVERRIDES: Record<string, string> = {
  "Daerah Istimewa Yogyakarta": "DI Yogyakarta",
  "Dki Jakarta": "DKI Jakarta",
};

function toTitleCase(value: string) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      if (part === "dki") return "DKI";
      if (part === "di") return "DI";
      if (part === "adm.") return "Adm.";
      if (part === "kab.") return "Kab.";
      if (part === "kab") return "Kab.";
      if (part === "kep.") return "Kep.";
      if (part === "kota") return "Kota";
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

function sortByLabel<T extends { label: string }>(left: T, right: T) {
  return left.label.localeCompare(right.label, "id", { sensitivity: "base" });
}

function formatProvinceLabel(name: string) {
  const titleName = toTitleCase(name);
  return PROVINCE_LABEL_OVERRIDES[titleName] ?? titleName;
}

function formatCityLabel(name: string) {
  const normalizedName = toTitleCase(name);

  if (normalizedName.startsWith("Kota Adm. ")) {
    return normalizedName.replace("Kota Adm. ", "");
  }

  if (normalizedName.startsWith("Kab. Adm. ")) {
    return `Kab. ${normalizedName.replace("Kab. Adm. ", "")}`;
  }

  return normalizedName;
}

const provinces = provincesJson as ProvinceRecord[];
const cities = citiesJson as CityRecord[];

export const INDONESIA_PROVINCE_OPTIONS: ProvinceOption[] = provinces
  .map((province) => {
    const label = formatProvinceLabel(province.name);
    const hcKey = HIGHCHARTS_PROVINCE_KEYS[province.code] ?? province.code;

    return {
      code: province.code,
      hcKey,
      label,
      value: hcKey,
      searchText: `${label} ${province.code} ${hcKey}`.toLowerCase(),
    };
  })
  .sort(sortByLabel);

const provinceNameByCode = new Map(
  INDONESIA_PROVINCE_OPTIONS.map((province) => [province.code, province.label])
);

export const INDONESIA_CITY_OPTIONS: CityOption[] = cities
  .map((city) => {
    const label = formatCityLabel(city.name);
    const provinceName = provinceNameByCode.get(city.provinceCode) ?? city.provinceCode;

    return {
      code: city.code,
      provinceCode: city.provinceCode,
      provinceName,
      label,
      value: label,
      searchText: `${label} ${city.code} ${provinceName}`.toLowerCase(),
    };
  })
  .sort(sortByLabel);

export function getProvinceByHcKey(hcKey: string) {
  return INDONESIA_PROVINCE_OPTIONS.find((province) => province.hcKey === hcKey);
}

export function getProvinceCodesFromHcKeys(hcKeys: string[]) {
  return new Set(
    hcKeys
      .map((hcKey) => getProvinceByHcKey(hcKey)?.code)
      .filter((code): code is string => Boolean(code))
  );
}
