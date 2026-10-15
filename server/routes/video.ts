import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { videoAuthSchema } from '../schemas/auth.js';
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
    const user = req.user!;

    // Generate signed URL / authorization token for lesson video key
    const videoKey = `videos/${lessonId}.mp4`;
    const authData = await videoStorageService.generatePlaybackAuthorization(videoKey);

    res.json({
      lessonId,
      title: lessonId,
      signedUrl: authData.signedUrl,
      streamToken: authData.streamToken,
      watermarkText: `${user.fullName} (${user.phoneNumber})`
    });
  } catch (err) {
    logger.error('Video auth error', err);
    res.status(500).json({ error: 'Failed to authorize video playback' });
  }
});

export default router;
