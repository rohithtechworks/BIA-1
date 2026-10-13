import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { updateProgressSchema } from '../schemas/auth.js';
import { supabaseAdmin } from '../services/supabase.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * GET CATEGORIES LIST WITH USER PROGRESS
 */
router.get('/categories', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Fetch categories
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (catError) {
      logger.error('Error fetching categories', catError);
      res.status(500).json({ error: 'Failed to fetch categories' });
      return;
    }

    // Fetch progress for this user
    const { data: progressList } = await supabaseAdmin
      .from('lesson_progress')
      .select('lesson_id, completed, lessons(category_id)')
      .eq('user_id', userId)
      .eq('completed', true);

    // Group completed counts by category_id
    const completedCounts: Record<string, number> = {};
    if (progressList) {
      for (const item of progressList) {
        const catId = (item.lessons as unknown as { category_id: string })?.category_id;
        if (catId) {
          completedCounts[catId] = (completedCounts[catId] || 0) + 1;
        }
      }
    }

    const categoriesWithProgress = categories.map(cat => ({
      ...cat,
      completedCount: completedCounts[cat.id] || 0
    }));

    res.json({ categories: categoriesWithProgress });
  } catch (err) {
    logger.error('Categories API error', err);
    res.status(500).json({ error: 'Failed to load course categories' });
  }
});

/**
 * GET LESSONS FOR A SPECIFIC CATEGORY
 */
router.get('/lessons/:categoryId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    const userId = req.user!.userId;

    // 1. Fetch lessons
    const { data: lessons, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('category_id', categoryId)
      .order('display_order', { ascending: true });

    if (lessonError) {
      logger.error('Error fetching lessons', lessonError);
      res.status(500).json({ error: 'Failed to fetch lessons' });
      return;
    }

    // 2. Fetch user progress for these lessons
    const lessonIds = lessons.map(l => l.id);
    const { data: progressData } = await supabaseAdmin
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds);

    const progressMap = new Map((progressData || []).map(p => [p.lesson_id, p]));

    const lessonsWithStatus = lessons.map(lesson => {
      const userProgress = progressMap.get(lesson.id);
      return {
        id: lesson.id,
        categoryId: lesson.category_id,
        title: lesson.title,
        description: lesson.description,
        videoStatus: lesson.video_status,
        completed: userProgress?.completed || false,
        completedActivities: userProgress?.completed_activities || []
      };
    });

    res.json({ lessons: lessonsWithStatus });
  } catch (err) {
    logger.error('Lessons API error', err);
    res.status(500).json({ error: 'Failed to load lessons' });
  }
});

/**
 * UPDATE LESSON PROGRESS
 */
router.post('/progress', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = updateProgressSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { lessonId, completed, completedActivities } = parseResult.data;
    const userId = req.user!.userId;

    const { data, error } = await supabaseAdmin
      .from('lesson_progress')
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed,
          completed_activities: completedActivities || [],
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();

    if (error) {
      logger.error('Error updating progress', error);
      res.status(500).json({ error: 'Failed to update progress' });
      return;
    }

    res.json({ progress: data });
  } catch (err) {
    logger.error('Progress update error', err);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

export default router;
