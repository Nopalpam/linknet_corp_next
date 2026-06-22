/**
 * Cookie Consent Controller
 * Handles HTTP requests for cookie consent tracking
 */

import { Request, Response, NextFunction } from 'express';
import { UAParser } from 'ua-parser-js';
import cookieConsentService from '../services/cookieConsent.service';
import { CookieConsentQueryParams } from '../types/cookieConsent.types';

export class CookieConsentController {
  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  /**
   * POST /cookies/consent
   * Record cookie consent from public website
   * No authentication required
   */
  async recordConsent(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract IP address (support proxy headers)
      const ipAddress =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket.remoteAddress ||
        'unknown';

      // Parse user agent
      const userAgentString = req.headers['user-agent'] || '';
      const parser = new UAParser(userAgentString);
      const parserResult = parser.getResult();

      const os = parserResult.os.name
        ? `${parserResult.os.name} ${parserResult.os.version || ''}`.trim()
        : null;

      const browser = parserResult.browser.name
        ? `${parserResult.browser.name} ${parserResult.browser.version || ''}`.trim()
        : null;

      const deviceType = parserResult.device.type || 'desktop';
      const device = deviceType.charAt(0).toUpperCase() + deviceType.slice(1);

      // Optional fingerprint from body (generated client-side)
      const fingerprint = req.body?.fingerprint || null;

      const consent = await cookieConsentService.recordConsent({
        ipAddress,
        os,
        browser,
        device,
        userAgent: userAgentString || null,
        fingerprint,
      });

      res.status(201).json({
        success: true,
        message: 'Cookie consent recorded successfully',
        data: {
          id: consent.id,
          consentedAt: consent.consentedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ============================================
  // CMS ENDPOINTS (Protected)
  // ============================================

  /**
   * GET /cms/cookie-consents
   * Get paginated list of cookie consents
   */
  async getConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const params: CookieConsentQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        sortBy: (req.query.sortBy as string) || 'consentedAt',
        sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      const result = await cookieConsentService.getConsents(params);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /cms/cookie-consents/stats
   * Get consent statistics
   */
  async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await cookieConsentService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /cms/cookie-consents/:id
   * Delete a single consent record
   */
  async deleteConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'ID is required' });
        return;
      }
      await cookieConsentService.deleteConsent(id);

      res.json({
        success: true,
        message: 'Cookie consent record deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /cms/cookie-consents/destroy-multiple
   * Delete multiple consent records
   */
  async deleteMultiple(req: Request, res: Response, next: NextFunction) {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Please provide an array of IDs to delete',
        });
        return;
      }

      await cookieConsentService.deleteMultipleConsents(ids);

      res.json({
        success: true,
        message: `${ids.length} cookie consent record(s) deleted successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /cms/cookie-consents/export
   * Export consent data as JSON
   */
  async exportConsents(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await cookieConsentService.exportConsents({
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      });

      res.json({
        success: true,
        data,
        total: data.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CookieConsentController();
