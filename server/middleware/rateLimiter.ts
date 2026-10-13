import { Request, Response, NextFunction } from 'express';

const attemptsMap = new Map<string, { count: number; resetAt: number }>();

/**
 * Basic in-memory rate limiter for auth & sensitive endpoints
 */
export function createRateLimiter(maxAttempts = 10, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const current = attemptsMap.get(key);

    if (!current || now > current.resetAt) {
      attemptsMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= maxAttempts) {
      res.status(429).json({
        error: 'Too many requests. Please try again in a minute.',
        retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000)
      });
      return;
    }

    current.count++;
    next();
  };
}
