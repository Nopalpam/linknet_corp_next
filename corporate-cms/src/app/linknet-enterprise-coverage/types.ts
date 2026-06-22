export interface CoverageItem {
  providers: string;
  address: string;
  status: string;
  latitude: number;
  longitude: number;
  site_id: string;
  network_type: string;
  site_latitude: number;
  site_longitude: number;
  dwell_type: string;
  network_id: string;
  fat_code: string;
}

export interface CoverageApiResponse {
  success: boolean;
  data: CoverageItem[];
  total?: number;
  _fallback?: boolean;
  message?: string;
}

export interface CitiesApiResponse {
  success: boolean;
  data: string[];
}

export type SearchMode = 'coverage' | 'nearest';
