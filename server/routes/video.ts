import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { videoAuthSchema } from '../schemas/auth.js';
import { videoStorageService } from '../services/videoStorageService.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = Router();
const videoRateLimiter = createRateLimiter(30, 60 * 1000);

const EXACT_VIDEO_MAP: Record<string, string> = {
  // Relative Circle
  'relative-mother': '01_MOTHER.mp4',
  'relative-father': '02_FATHER.mp4',
  'relative-elder-brother': '03_ELDER_BROTHER.mp4',
  'relative-younger-brother': '04_YOUNGER_BROTHER.mp4',
  'relative-elder-sister': '05_ELDER_SISTER.mp4',
  'relative-younger-sister': '06_YOUNGER_SISTER.mp4',
  'relative-grandpa': '07_GRANDPA.mp4',
  'relative-grandma': '08_GRANDMA.mp4',
  'relative-uncle': '09_UNCLE.mp4',
  'relative-auntie': '10_AUNTIE.mp4',
  'relative-paternal-uncle': '11_PATERNAL_UNCLE.mp4',
  'relative-cousin': '12_COUSIN.mp4',
  'relative-niece': '13_NIECE.mp4',

  // Personal Circle
  'personal-friend': '14_FRIEND.mp4',
  'personal-classmate': '15_CLASSMATE.mp4',
  'personal-girlfriend': '16_GIRLFRIEND.mp4',
  'personal-close-friend': '17_CLOSE_FRIEND.mp4',
  'personal-birthday-girl': '18_BIRTHDAY_GIRL.mp4',
  'personal-college-mate': '19_COLLEGEMATE.mp4',
  'personal-cricket-captain': '20_CRICKET_CAPTAIN.mp4',
  'personal-class-leader': '21_CLASS_LEADER.mp4',
  'personal-neighbor': '22_NEIGHBOR.mp4',
  'personal-co-passenger': '23_CO-PASSENGER.mp4',

  // Official Circle
  'official-class-teacher': '24_CLASS_TEACHER.mp4',
  'official-tuition-master': '25_TUITION_MASTER.mp4',
  'official-headmaster': '26_HEADMASTER.mp4',
  'official-professor': '27_PROFESSOR.mp4',
  'official-principal': '28_PRINCIPAL.mp4',
  'official-librarian': '29_LIBRARIAN.mp4',
  'official-interviewer': '30_INTERVIEWER.mp4',

  // Public Circle
  'public-bank-manager': '31_BANK_MANAGER.mp4',
  'public-postmaster': '32_POSTMASTER.mp4',
  'public-railway-clerk': '33_RAILWAY_CLERK.mp4',
  'public-tte': '34_TTE.mp4',
  'public-receptionist': '35_RECEPTIONIST.mp4',
  'public-doctor': '36_DOCTOR.mp4',
  'public-inspector': '37_INSPECTOR.mp4',
  'public-mla': '38_MLA.mp4',
  'public-junior-engineer': '39_JUNIOR_ENGINEER.mp4',
  'public-general-manager': '40_GENERAL_MANAGER.mp4',

  // Business Circle
  'business-buyer': '41_BUYER.mp4',
  'business-vendor': '42_VENDOR.mp4',
  'business-shopkeeper': '43_SHOPKEEPER.mp4',
  'business-supplier': '44_SUPPLIER.mp4',
  'business-salesgirl': '45_SALESGIRL.mp4',
  'business-salesman': '46_SALESMAN.mp4',
  'business-courier-manager': '47_COURIER_MANAGER.mp4',
  'business-centre-in-charge': '48_CENTRE_IN_CHARGE.mp4',

  // Fluency Practice
  'fluency-friend': '49_FRIEND.mp4',
  'fluency-missed-call-friend': '50_MISSED_CALL_FRIEND.mp4',
  'fluency-heroine': '51_HEROINE.mp4',
  'fluency-travel-friend': '52_TRAVEL_FRIEND.mp4',
  'fluency-business': '53_BUSINESS.mp4',
  'fluency-hero': '54_HERO.mp4',
  'fluency-politician': '55_POLITICIAN.mp4',
  'fluency-interviewer': '56_INTERVIEWER.mp4'
};

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

    // Resolve exact video filename
    const videoKey = EXACT_VIDEO_MAP[lessonId] || `${lessonId}.mp4`;
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

/**
 * STREAM VIDEO PROXY WITH HTTP RANGE SUPPORT
 */
router.get('/stream', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lessonId = String(req.query.lessonId || '');
    if (!lessonId) {
      res.status(400).json({ error: 'lessonId query parameter is required' });
      return;
    }

    const videoKey = EXACT_VIDEO_MAP[lessonId] || `${lessonId}.mp4`;
    const rangeHeader = req.headers.range;

    const { stream, contentLength, contentRange, contentType } = await videoStorageService.getVideoStream(videoKey, rangeHeader);

    res.status(rangeHeader ? 206 : 200);
    res.set({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    });

    if (contentLength !== undefined) {
      res.set('Content-Length', String(contentLength));
    }
    if (contentRange) {
      res.set('Content-Range', contentRange);
    }

    if (stream && typeof (stream as unknown as { pipe: Function }).pipe === 'function') {
      (stream as unknown as { pipe: Function }).pipe(res);
    } else {
      res.end(await (stream as unknown as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray());
    }
  } catch (err) {
    logger.error('Streaming error', err);
    res.status(404).json({ error: 'Video file not found or unable to stream from Cloudflare R2' });
  }
});

export default router;
