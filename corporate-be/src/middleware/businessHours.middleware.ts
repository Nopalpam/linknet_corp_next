import { Request, Response, NextFunction } from 'express';

const parseHour = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 24) return fallback;
  return parsed;
};

export const businessHoursLoginMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.LOGIN_ACCESS_WINDOW_ENABLED !== 'true') {
    return next();
  }

  const startHour = parseHour(process.env.LOGIN_ALLOWED_START_HOUR, 0);
  const endHour = parseHour(process.env.LOGIN_ALLOWED_END_HOUR, 24);
  const currentHour = new Date().getHours();
  const isAllowed =
    startHour < endHour
      ? currentHour >= startHour && currentHour < endHour
      : currentHour >= startHour || currentHour < endHour;

  if (!isAllowed) {
    res.status(403).json({
      success: false,
      message: 'Login is not allowed outside configured business hours',
      code: 'LOGIN_ACCESS_WINDOW_DENIED',
    });
    return;
  }

  next();
};
