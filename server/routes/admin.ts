import { Router, Response } from 'express';
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { generateCodeSchema } from '../schemas/auth.js';
import { courseCodeService } from '../services/courseCodeService.js';
import { csvMappingService } from '../services/csvMappingService.js';
import { supabaseAdmin } from '../services/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Apply auth & admin middleware to all routes in this router
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GENERATE COURSE ACCESS CODES
 */
router.post('/codes/generate', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = generateCodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { code, count } = parseResult.data;
    const generatedCodes: { code: string; id: string }[] = [];

    if (code) {
      const result = await courseCodeService.generateCode(code);
      generatedCodes.push(result);
    } else {
      for (let i = 0; i < count; i++) {
        const result = await courseCodeService.generateCode();
        generatedCodes.push(result);
      }
    }

    res.status(201).json({
      message: `Generated ${generatedCodes.length} course access code(s)`,
      codes: generatedCodes
    });
  } catch (err) {
    logger.error('Code generation error', err);
    res.status(500).json({ error: 'Failed to generate course access code' });
  }
});

/**
 * LIST COURSE ACCESS CODES
 */
router.get('/codes', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const codes = await courseCodeService.listCodes();
    res.json({ codes });
  } catch (err) {
    logger.error('List codes error', err);
    res.status(500).json({ error: 'Failed to list course access codes' });
  }
});

/**
 * REVOKE COURSE ACCESS CODE
 */
router.post('/codes/revoke', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { codeId } = req.body;
    if (!codeId) {
      res.status(400).json({ error: 'codeId is required' });
      return;
    }

    const success = await courseCodeService.revokeCode(codeId);
    if (success) {
      res.json({ message: 'Course access code revoked successfully' });
    } else {
      res.status(400).json({ error: 'Failed to revoke course access code' });
    }
  } catch (err) {
    logger.error('Revoke code error', err);
    res.status(500).json({ error: 'Failed to revoke course access code' });
  }
});

/**
 * LIST ALL LESSONS AND VIDEO MAPPINGS
 */
router.get('/lessons', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { data: lessons, error } = await supabaseAdmin
      .from('lessons')
      .select('id, category_id, title, video_storage_key, video_status, display_order, categories(name)')
      .order('display_order', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch lessons' });
      return;
    }

    res.json({ lessons });
  } catch (err) {
    logger.error('Admin lessons error', err);
    res.status(500).json({ error: 'Failed to list lessons' });
  }
});

/**
 * IMPORT CSV VIDEO MAPPINGS
 */
router.post('/video-mappings/import', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { csvContent } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      res.status(400).json({ error: 'csvContent string is required' });
      return;
    }

    const result = await csvMappingService.processCsvMapping(csvContent);

    res.json({
      message: `Processed CSV video mappings. Successfully updated ${result.successCount} lessons.`,
      successCount: result.successCount,
      errors: result.errors
    });
  } catch (err) {
    logger.error('CSV Import error', err);
    res.status(500).json({ error: 'Failed to process CSV video mappings' });
  }
});

export default router;
