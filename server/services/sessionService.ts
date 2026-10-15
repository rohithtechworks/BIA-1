import { createJwtToken, AuthenticatedUser } from '../middleware/auth.js';

export const sessionService = {
  createJwtToken(user: AuthenticatedUser): string {
    return createJwtToken(user);
  }
};
