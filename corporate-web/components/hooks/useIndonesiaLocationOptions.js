'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  getIndonesiaCityOptions,
  getIndonesiaProvinceOptions,
  getIndonesiaWardZipOptions,
  getIndonesiaZipOptions,
  normalizeIndonesiaCityValue,
  normalizeIndonesiaProvinceValue,
} from '@/data/constants/indonesiaLocations';

export default function useIndonesiaLocationOptions({ city, finalLevel = 'zip', province }) {
  const normalizedProvince = useMemo(
    () => normalizeIndonesiaProvinceValue(province),
    [province]
  );
  const normalizedCity = useMemo(
    () => normalizeIndonesiaCityValue(normalizedProvince, city),
    [city, normalizedProvince]
  );
  const provinceOptions = useMemo(() => getIndonesiaProvinceOptions(), []);
  const cityOptions = useMemo(
    () => getIndonesiaCityOptions(normalizedProvince),
    [normalizedProvince]
  );
  const [finalOptions, setFinalOptions] = useState([]);

  useEffect(() => {
    let isActive = true;

    if (finalLevel === 'none' || !normalizedProvince || !normalizedCity) {
      setFinalOptions([]);
      return () => {
        isActive = false;
      };
    }

    const loadOptions = finalLevel === 'wardZip'
      ? getIndonesiaWardZipOptions
      : getIndonesiaZipOptions;

    loadOptions(normalizedProvince, normalizedCity)
      .then((options) => {
        if (isActive) {
          setFinalOptions(options);
        }
      })
      .catch(() => {
        if (isActive) {
          setFinalOptions([]);
        }
      });

    return () => {
      isActive = false;
    };
  }, [finalLevel, normalizedCity, normalizedProvince]);

  return {
    cityOptions,
    finalOptions,
    normalizedCity,
    normalizedProvince,
    provinceOptions,
  };
}
