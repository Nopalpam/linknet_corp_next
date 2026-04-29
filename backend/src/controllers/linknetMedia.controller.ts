import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const MEDIA_API_URL = 'https://ui-stb-cpe.sysln.id/api/mit/portal/data';
const SALT = '@M1Tc0NT3nT#ln';

/**
 * Generate API token for Linknet Media API
 * Token = MD5(YYYYMMDDHH + salt) using current UTC time
 */
function generateMediaToken(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');

  const timestamp = `${year}${month}${day}${hour}`;
  const raw = timestamp + SALT;

  return crypto.createHash('md5').update(raw).digest('hex');
}

/**
 * Load fallback data from contoh_return_api_media.json (for development)
 */
function loadFallbackData(): Record<string, unknown> | null {
  try {
    const fallbackPath = path.resolve(__dirname, '../../..', 'contoh_return_api_media.json');
    if (fs.existsSync(fallbackPath)) {
      const raw = fs.readFileSync(fallbackPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Proxy endpoint to fetch Linknet Media data
 * GET /api/v1/linknet-media
 *
 * If the external API is unreachable (e.g. no VPN), falls back to
 * the sample JSON file so the UI still works during development.
 */
export async function getLinknetMedia(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = generateMediaToken();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(MEDIA_API_URL, {
      method: 'GET',
      headers: { Token: token },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      res.status(response.status).json({
        success: false,
        message: `Media API returned ${response.status}`,
      });
      return;
    }

    const data = await response.json();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    // External API unreachable — use fallback in development
    const fallback = loadFallbackData();
    if (fallback) {
      res.json({
        success: true,
        data: fallback,
        _fallback: true,
      });
      return;
    }
    next(error);
  }
}
