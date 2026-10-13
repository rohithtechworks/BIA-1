import { Request, Response, NextFunction } from 'express';
import { sessionService } from '../services/sessionService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    sessionId: string;
    role: string;
    fullName: string;
    phoneNumber: string;
  };
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const tokenFromCookie = req.cookies?.hsc_session;
  const tokenFromHeader = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  const rawToken = tokenFromCookie || tokenFromHeader;

  if (!rawToken) {
    res.status(401).json({ error: 'Unauthorized: Missing session token', code: 'UNAUTHORIZED' });
    return;
  }

  const session = await sessionService.verifySessionToken(rawToken);

  if (!session) {
    res.status(401).json({
      error: 'Session invalid, expired, or terminated from another device.',
      code: 'SESSION_REVOKED'
    });
    return;
  }

  req.user = session;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    return;
  }
  next();
}
