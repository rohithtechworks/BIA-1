import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { getVideoUrl } from '../services/r2.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = Router();
const videoRateLimiter = createRateLimiter(30, 60 * 1000);

const EXACT_VIDEO_MAP: Record<string, string> = {
  // Relative Circle
  'relative-mother': '1_MOTHER.mp4',
  'relative-father': '2_FATHER.mp4',
  'relative-elder-brother': '3_ELDERBROTHER.mp4',
  'relative-younger-brother': '4_YOUNGERBROTHER.mp4',
  'relative-elder-sister': '5_ELDERSISTER.mp4',
  'relative-younger-sister': '6_YOUNGERSISTER.mp4',
  'relative-grandpa': '7_GRANDFATHER.mp4',
  'relative-grandma': '8_GRANDMOTHER.mp4',
  'relative-uncle': '9_UNCLE.mp4',
  'relative-auntie': '10_AUNTY.mp4',
  'relative-paternal-uncle': '11_PATERNALUNCLE.mp4',
  'relative-cousin': '12_COUSIN.mp4',
  'relative-niece': '13_NIECE.mp4',

  // Personal Circle
  'personal-friend': '14_FRIEND.mp4',
  'personal-classmate': '15_CLASSMATE.mp4',
  'personal-girlfriend': '16_GIRLFRIEND.mp4',
  'personal-close-friend': '17_CLOSEFRIEND.mp4',
  'personal-birthday-girl': '18_BIRTHDAYGIRL.mp4',
  'personal-college-mate': '19_COLLEGEMATE.mp4',
  'personal-cricket-captain': '20_CAPTAIN.mp4',
  'personal-class-leader': '21_CLASSLEADER.mp4',
  'personal-neighbor': '22_NEIGHBOUR.mp4',
  'personal-co-passenger': '23_CO-PASSENGER.mp4',

  // Official Circle
  'official-class-teacher': '24_TEACHER.mp4',
  'official-tuition-master': '25_TUITIONMASTER.mp4',
  'official-headmaster': '26_HEADMASTER.mp4',
  'official-professor': '27_PROFESSOR.mp4',
  'official-principal': '28_PRINCIPAL.mp4',
  'official-librarian': '29_LIBRARIAN.mp4',
  'official-interviewer': '30_INTERVIEWER.mp4',

  // Public Circle
  'public-bank-manager': '31_BANKMANAGER.mp4',
  'public-postmaster': '32_POSTMASTER.mp4',
  'public-railway-clerk': '33_RAILWAYBOOKINGCLERK.mp4',
  'public-tte': '34_TTE.mp4',
  'public-receptionist': '35_RECEPTIONIST.mp4',
  'public-doctor': '36_DOCTOR.mp4',
  'public-inspector': '37_INSPECTOR.mp4',
  'public-mla': '38_MLA.mp4',
  'public-junior-engineer': '39_JUNIOR_ENGINEER.mp4',
  'public-general-manager': '40_GENERAL_MANAGER.mp4',

  // Business Circle
  'business-buyer': '41_BEARER.mp4',
  'business-vendor': '42_VENDOR.mp4',
  'business-shopkeeper': '43_SHOPKEEPER.mp4',
  'business-supplier': '44_SUPPLIER.mp4',
  'business-salesgirl': '45_SALESGIRL.mp4',
  'business-salesman': '46_SALESMAN.mp4',
  'business-courier-manager': '47_COURIERMANAGER.mp4',
  'business-centre-in-charge': '48_BROWSINGCENTREINCHARGE.mp4',

  // Fluency Practice
  'fluency-friend': '49_FRIEND.mp4',
  'fluency-missed-call-friend': '50_MISSEDCALLFRIEND.mp4',
  'fluency-heroine': '51_HEROINE.mp4',
  'fluency-travel-friend': '52_TRAVELFRIEND.mp4',
  'fluency-business': '53_BUSINESSCONVERSATION.mp4',
  'fluency-hero': '54_HERO.mp4',
  'fluency-politician': '55_POLITICIAN.mp4',
  'fluency-interviewer': '56_INTERVIEWER.mp4'
};

/**
 * GET SHAKA / DRM PLAYBACK CONFIG: /api/lessons/:lessonId/playback
 */
router.get('/lessons/:lessonId/playback', authenticateToken, videoRateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Login required' });
      return;
    }

    const lessonId = String(req.params.lessonId || '');
    const r2Key = EXACT_VIDEO_MAP[lessonId] || `${lessonId}.mp4`;

    const url = await getVideoUrl(r2Key);

    res.json({
      url,
      signedUrl: url,
      watermarkText: `${user.fullName} (${user.phoneNumber})`
    });
  } catch (err) {
    logger.error('Unable to fetch lesson playback', err);
    res.status(500).json({ error: 'Unable to play video' });
  }
});

/**
 * GET SIGNED PLAYBACK URL: /api/lessons/:lessonId/play
 */
router.get('/lessons/:lessonId/play', authenticateToken, videoRateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Login required' });
      return;
    }

    const lessonId = String(req.params.lessonId || '');
    const r2Key = EXACT_VIDEO_MAP[lessonId] || `${lessonId}.mp4`;

    const url = await getVideoUrl(r2Key);

    res.json({
      url,
      signedUrl: url,
      watermarkText: `${user.fullName} (${user.phoneNumber})`
    });
  } catch (err) {
    logger.error('Unable to play video', err);
    res.status(500).json({ error: 'Unable to play video' });
  }
});

/**
 * POST AUTHORIZE COMPATIBILITY ENDPOINT
 */
router.post('/authorize', authenticateToken, videoRateLimiter, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Login required' });
      return;
    }

    const lessonId = req.body?.lessonId;
    if (!lessonId) {
      res.status(400).json({ error: 'lessonId is required' });
      return;
    }

    const r2Key = EXACT_VIDEO_MAP[lessonId] || `${lessonId}.mp4`;
    const url = await getVideoUrl(r2Key);

    res.json({
      url,
      signedUrl: url,
      watermarkText: `${user.fullName} (${user.phoneNumber})`
    });
  } catch (err) {
    logger.error('Unable to authorize video', err);
    res.status(500).json({ error: 'Unable to authorize video' });
  }
});

export default router;
