/* eslint-disable no-console */

/**
 * Sanitizes log objects to prevent logging sensitive data
 */
function sanitize(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...obj };
  const sensitiveKeys = ['password', 'coursePassword', 'code', 'token', 'secret', 'signedUrl', 'authorization'];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key] as Record<string, unknown>);
    }
  }

  return sanitized;
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, context ? sanitize(context) : '');
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, context ? sanitize(context) : '');
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error, context ? sanitize(context) : '');
  }
};
