/**
 * Cookie Consent Service
 * Handles business logic for cookie consent tracking
 */

import { PrismaClient } from '@prisma/client';
import {
  CookieConsentData,
  CookieConsentQueryParams,
  CookieConsentPaginatedResponse,
  CookieConsentStatsResponse,
} from '../types/cookieConsent.types';

const prisma = new PrismaClient();

export class CookieConsentService {
  /**
   * Record a new cookie consent
   */
  async recordConsent(data: CookieConsentData) {
    const consent = await prisma.cookieConsent.create({
      data: {
        ipAddress: data.ipAddress,
        os: data.os,
        browser: data.browser,
        device: data.device,
        userAgent: data.userAgent,
        fingerprint: data.fingerprint,
      },
    });

    return consent;
  }

  /**
   * Get paginated list of cookie consents (CMS)
   */
  async getConsents(params: CookieConsentQueryParams): Promise<CookieConsentPaginatedResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'consentedAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = params;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { os: { contains: search, mode: 'insensitive' } },
        { browser: { contains: search, mode: 'insensitive' } },
        { device: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.consentedAt = {};
      if (startDate) {
        where.consentedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.consentedAt.lte = new Date(endDate);
      }
    }

    // Map sortBy to valid fields
    const validSortFields = ['consentedAt', 'ipAddress', 'os', 'browser', 'device'];
    const mappedSortBy = validSortFields.includes(sortBy) ? sortBy : 'consentedAt';

    const [data, total] = await Promise.all([
      prisma.cookieConsent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [mappedSortBy]: sortOrder },
      }),
      prisma.cookieConsent.count({ where }),
    ]);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  /**
   * Get consent statistics (CMS Dashboard)
   */
  async getStats(): Promise<CookieConsentStatsResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalConsents, todayConsents] = await Promise.all([
      prisma.cookieConsent.count(),
      prisma.cookieConsent.count({
        where: { consentedAt: { gte: today } },
      }),
    ]);

    // Get top browsers
    const browserGroups = await prisma.cookieConsent.groupBy({
      by: ['browser'],
      _count: { browser: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 5,
      where: { browser: { not: null } },
    });

    // Get top OS
    const osGroups = await prisma.cookieConsent.groupBy({
      by: ['os'],
      _count: { os: true },
      orderBy: { _count: { os: 'desc' } },
      take: 5,
      where: { os: { not: null } },
    });

    // Get top devices
    const deviceGroups = await prisma.cookieConsent.groupBy({
      by: ['device'],
      _count: { device: true },
      orderBy: { _count: { device: 'desc' } },
      take: 5,
      where: { device: { not: null } },
    });

    return {
      totalConsents,
      todayConsents,
      topBrowsers: browserGroups.map((g) => ({
        browser: g.browser || 'Unknown',
        count: g._count.browser,
      })),
      topOS: osGroups.map((g) => ({
        os: g.os || 'Unknown',
        count: g._count.os,
      })),
      topDevices: deviceGroups.map((g) => ({
        device: g.device || 'Unknown',
        count: g._count.device,
      })),
    };
  }

  /**
   * Delete a consent record by ID (CMS)
   */
  async deleteConsent(id: string) {
    return prisma.cookieConsent.delete({ where: { id } });
  }

  /**
   * Delete multiple consent records (CMS)
   */
  async deleteMultipleConsents(ids: string[]) {
    return prisma.cookieConsent.deleteMany({
      where: { id: { in: ids } },
    });
  }

  /**
   * Export consent data (CMS)
   */
  async exportConsents(params: { startDate?: string; endDate?: string }) {
    const where: any = {};

    if (params.startDate || params.endDate) {
      where.consentedAt = {};
      if (params.startDate) {
        where.consentedAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.consentedAt.lte = new Date(params.endDate);
      }
    }

    return prisma.cookieConsent.findMany({
      where,
      orderBy: { consentedAt: 'desc' },
      select: {
        ipAddress: true,
        os: true,
        browser: true,
        device: true,
        consentedAt: true,
      },
    });
  }
}

export default new CookieConsentService();
