import prisma from '@config/database';
import { AppError } from '../types/error.types';

export interface MapCoverageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface MapCoverageRegionDTO {
  code: string;
  label?: string;
  title: string;
  color?: string | null;
  provinceKeys?: string[];
  cities?: string[];
  lat?: number | null;
  lon?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

const COVERAGE_COLORS = {
  covered: '#009b77',
  noCoverage: '#8ad1c0',
};

function mapCoverageModel() {
  return (prisma as any).mapCoverageRegion;
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, '_');
}

function normalizeStringArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

function serializeRegion(region: any) {
  return {
    ...region,
    provinceKeys: normalizeStringArray(region.provinceKeys),
    cities: normalizeStringArray(region.cities),
  };
}

function toWriteData(data: MapCoverageRegionDTO, userId?: string) {
  return {
    code: normalizeCode(data.code),
    label: data.label?.trim() || 'Area',
    title: data.title.trim(),
    color: data.color || null,
    provinceKeys: normalizeStringArray(data.provinceKeys),
    cities: normalizeStringArray(data.cities),
    lat: data.lat ?? null,
    lon: data.lon ?? null,
    sortOrder: data.sortOrder ?? 0,
    isActive: data.isActive ?? true,
    updatedBy: userId,
  };
}

export class MapCoverageService {
  static async getAll(params: MapCoverageQueryParams) {
    const page = Math.max(params.page || 1, 1);
    const limit = Math.min(Math.max(params.limit || 20, 1), 100);
    const where: Record<string, any> = { deletedAt: null };

    if (params.search) {
      where.OR = [
        { code: { contains: params.search, mode: 'insensitive' } },
        { title: { contains: params.search, mode: 'insensitive' } },
        { label: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.isActive = params.status === 'ACTIVE';
    }

    const model = mapCoverageModel();
    const [total, rows] = await Promise.all([
      model.count({ where }),
      model.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      }),
    ]);

    return {
      data: rows.map(serializeRegion),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getById(id: string) {
    const row = await mapCoverageModel().findFirst({ where: { id, deletedAt: null } });
    if (!row) throw new AppError('Map coverage region not found', 404);
    return serializeRegion(row);
  }

  static async create(data: MapCoverageRegionDTO, userId?: string) {
    if (!data.code?.trim()) throw new AppError('code is required', 400);
    if (!data.title?.trim()) throw new AppError('title is required', 400);

    const row = await mapCoverageModel().create({
      data: {
        ...toWriteData(data, userId),
        createdBy: userId,
      },
    });

    return serializeRegion(row);
  }

  static async update(id: string, data: Partial<MapCoverageRegionDTO>, userId?: string) {
    await this.getById(id);
    const nextData: Record<string, any> = {
      updatedBy: userId,
    };

    if (data.code !== undefined) nextData.code = normalizeCode(data.code);
    if (data.label !== undefined) nextData.label = data.label?.trim() || 'Area';
    if (data.title !== undefined) nextData.title = data.title.trim();
    if (data.color !== undefined) nextData.color = data.color || null;
    if (data.provinceKeys !== undefined) nextData.provinceKeys = normalizeStringArray(data.provinceKeys);
    if (data.cities !== undefined) nextData.cities = normalizeStringArray(data.cities);
    if (data.lat !== undefined) nextData.lat = data.lat;
    if (data.lon !== undefined) nextData.lon = data.lon;
    if (data.sortOrder !== undefined) nextData.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) nextData.isActive = data.isActive;

    const row = await mapCoverageModel().update({
      where: { id },
      data: nextData,
    });

    return serializeRegion(row);
  }

  static async delete(id: string, userId?: string) {
    await this.getById(id);
    await mapCoverageModel().update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedBy: userId,
      },
    });
    return { message: 'Map coverage region deleted' };
  }

  static async getPublicMapData() {
    let rows: any[] = [];
    try {
      rows = await mapCoverageModel().findMany({
        where: { deletedAt: null, isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      });
    } catch {
      rows = [];
    }

    const businessUnits: Record<string, any> = {};
    const provinceMap: Record<string, string> = {};

    rows.forEach((row: any) => {
      const region = serializeRegion(row);
      businessUnits[region.code] = {
        label: region.label,
        title: region.title,
        lat: region.lat,
        lon: region.lon,
        cities: region.cities,
      };

      region.provinceKeys.forEach((provinceKey: string) => {
        provinceMap[provinceKey] = region.code;
      });
    });

    return {
      colors: {
        ...COVERAGE_COLORS,
        coveredByRegion: rows.reduce<Record<string, string>>((acc, row: any) => {
          if (row.color) acc[row.code] = row.color;
          return acc;
        }, {}),
      },
      businessUnits,
      provinceMap,
    };
  }
}
