import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

export interface AuthenticatedUser {
  userId: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  accessCode: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const tokenFromCookie = req.cookies?.hsc_session;
  const tokenFromHeader = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  const rawToken = tokenFromCookie || tokenFromHeader;

  if (!rawToken) {
    res.status(401).json({ error: 'Unauthorized: Missing token', code: 'UNAUTHORIZED' });
    return;
  }

  try {
    const decoded = jwt.verify(rawToken, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired or invalid', code: 'UNAUTHORIZED' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
}

export function createJwtToken(user: AuthenticatedUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
}
