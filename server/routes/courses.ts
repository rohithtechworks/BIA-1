import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { updateProgressSchema } from '../schemas/auth.js';

const router = Router();

/**
 * GET CATEGORIES LIST
 */
router.get('/categories', authenticateToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ categories: [] });
});

/**
 * GET LESSONS FOR A SPECIFIC CATEGORY
 */
router.get('/lessons/:categoryId', authenticateToken, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ lessons: [] });
});

/**
 * UPDATE LESSON PROGRESS
 */
router.post('/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parseResult = updateProgressSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
    return;
  }

  res.json({ success: true });
});

export default router;
