import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { videoAuthSchema } from '../schemas/auth.js';
import { supabaseAdmin } from '../services/supabase.js';
import { videoStorageService } from '../services/videoStorageService.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = Router();
const videoRateLimiter = createRateLimiter(30, 60 * 1000);

/**
 * AUTHORIZE VIDEO PLAYBACK
 */
router.post('/authorize', authenticateToken, videoRateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = videoAuthSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { lessonId } = parseResult.data;
    const userId = req.user!.userId;

    // 1. Verify user active enrollment in the course
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!enrollment) {
      res.status(403).json({ error: 'Course access requirement not satisfied' });
      return;
    }

    // 2. Fetch lesson record
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .maybeSingle();

    if (lessonError || !lesson) {
      res.status(404).json({ error: 'Lesson not found' });
      return;
    }

    if (!lesson.video_storage_key || lesson.video_status !== 'available') {
      res.status(400).json({
        error: 'Video is not currently available for this lesson.',
        status: lesson.video_status || 'unavailable'
      });
      return;
    }

    // 3. Generate signed URL / authorization token
    const authData = await videoStorageService.generatePlaybackAuthorization(lesson.video_storage_key);

    // Audit event
    await supabaseAdmin.from('audit_events').insert({
      user_id: userId,
      event_type: 'video_stream_authorized',
      details: { lessonId, videoKey: lesson.video_storage_key },
      ip_address: req.ip
    });

    res.json({
      lessonId: lesson.id,
      title: lesson.title,
      signedUrl: authData.signedUrl,
      streamToken: authData.streamToken,
      watermarkText: `${req.user!.fullName} (${req.user!.phoneNumber})`
    });
  } catch (err) {
    logger.error('Video auth error', err);
    res.status(500).json({ error: 'Failed to authorize video playback' });
  }
});

export default router;
