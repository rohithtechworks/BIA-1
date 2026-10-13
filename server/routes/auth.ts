import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema, takeoverSchema } from '../schemas/auth.js';
import { normalizePhoneNumber } from '../utils/phoneUtils.js';
import { courseCodeService } from '../services/courseCodeService.js';
import { sessionService } from '../services/sessionService.js';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = Router();
const authRateLimiter = createRateLimiter(15, 60 * 1000);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 3600 * 1000 // 7 days
};

/**
 * REGISTER
 */
router.post('/register', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { fullName, phoneNumber, password, coursePassword } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // 1. Check if profile with phone number already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (existingProfile) {
      res.status(409).json({ error: 'An account with this phone number already exists. Please log in.' });
      return;
    }

    // 2. Validate course code before creating user
    const trimmedCode = coursePassword.trim().toUpperCase();
    const { data: codeData } = await supabaseAdmin
      .from('course_access_codes')
      .select('id, status')
      .ilike('code', trimmedCode)
      .eq('status', 'unused')
      .maybeSingle();

    if (!codeData) {
      res.status(400).json({ error: 'Invalid or already used course access code.' });
      return;
    }

    // 3. Create Supabase Auth User with synthetic email
    const syntheticEmail = `${normalizedPhone.replace('+', '')}@homespokencentre.internal`;

    const { data: authData, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone_number: normalizedPhone }
    });

    if (createAuthError || !authData.user) {
      logger.error('Failed to create auth user', createAuthError);
      res.status(400).json({ error: createAuthError?.message || 'Failed to create user account' });
      return;
    }

    const userId = authData.user.id;

    // 4. Create or Upsert Profile
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      phone_number: normalizedPhone,
      role: 'student'
    }, { onConflict: 'id' });

    if (profileError) {
      logger.error('Failed to create profile', profileError);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      res.status(400).json({ error: profileError.message || 'Failed to complete user registration profile' });
      return;
    }

    // 5. Claim course code atomically
    const claimResult = await courseCodeService.validateAndClaimCode(coursePassword, userId, normalizedPhone);
    if (!claimResult.success) {
      // Rollback profile
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      res.status(400).json({ error: claimResult.message || 'Failed to claim course code' });
      return;
    }

    // 6. Create Active Session
    const deviceLabel = req.body.deviceLabel || 'Web Browser';
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const { token } = await sessionService.createSession(userId, deviceLabel, ipAddress);

    res.cookie('hsc_session', token, COOKIE_OPTIONS);

    // Audit Event
    await supabaseAdmin.from('audit_events').insert({
      user_id: userId,
      event_type: 'signup',
      details: { deviceLabel, phoneNumber: normalizedPhone },
      ip_address: ipAddress
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: userId,
        fullName,
        phoneNumber: normalizedPhone,
        role: 'student'
      }
    });
  } catch (err) {
    logger.error('Registration error', err);
    res.status(500).json({ error: 'Registration failed due to server error' });
  }
});

/**
 * LOGIN
 */
router.post('/login', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { phoneNumber, password, deviceLabel } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // 1. Fetch Profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (!profile) {
      res.status(401).json({ error: 'Invalid phone number or password' });
      return;
    }

    // 2. Verify Credentials with Supabase Auth
    const syntheticEmail = `${normalizedPhone.replace('+', '')}@homespokencentre.internal`;
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: syntheticEmail,
      password
    });

    if (signInError) {
      res.status(401).json({ error: 'Invalid phone number or password' });
      return;
    }

    // 3. Check for Active Session on another device
    const activeSession = await sessionService.getActiveUserSession(profile.id);

    if (activeSession) {
      res.status(409).json({
        status: 'CONFLICT',
        message: 'You are already logged in on another device. Please log out from that device or switch your active session.',
        existingSession: {
          deviceLabel: activeSession.device_label,
          lastActivityAt: activeSession.last_activity_at
        }
      });
      return;
    }

    // 4. Create new Active Session
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const { token } = await sessionService.createSession(profile.id, deviceLabel, ipAddress);

    res.cookie('hsc_session', token, COOKIE_OPTIONS);

    // Audit Event
    await supabaseAdmin.from('audit_events').insert({
      user_id: profile.id,
      event_type: 'login',
      details: { deviceLabel },
      ip_address: ipAddress
    });

    res.json({
      user: {
        id: profile.id,
        fullName: profile.full_name,
        phoneNumber: profile.phone_number,
        role: profile.role
      }
    });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});

/**
 * TAKEOVER SESSION (REVOKE PREVIOUS DEVICE & CONTINUE)
 */
router.post('/takeover-session', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = takeoverSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { phoneNumber, password, deviceLabel } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (!profile) {
      res.status(401).json({ error: 'Invalid phone number or password' });
      return;
    }

    // Verify password
    const syntheticEmail = `${normalizedPhone.replace('+', '')}@homespokencentre.internal`;
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: syntheticEmail,
      password
    });

    if (signInError) {
      res.status(401).json({ error: 'Invalid phone number or password' });
      return;
    }

    // Revoke all previous active sessions
    await sessionService.revokeAllUserSessions(profile.id);

    // Create new active session
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const { token } = await sessionService.createSession(profile.id, deviceLabel, ipAddress);

    res.cookie('hsc_session', token, COOKIE_OPTIONS);

    // Audit Event
    await supabaseAdmin.from('audit_events').insert({
      user_id: profile.id,
      event_type: 'session_takeover',
      details: { deviceLabel, message: 'Revoked previous sessions and established new active session' },
      ip_address: ipAddress
    });

    res.json({
      message: 'Previous session revoked. Successfully logged in on this device.',
      user: {
        id: profile.id,
        fullName: profile.full_name,
        phoneNumber: profile.phone_number,
        role: profile.role
      }
    });
  } catch (err) {
    logger.error('Session takeover error', err);
    res.status(500).json({ error: 'Session takeover failed' });
  }
});

/**
 * LOGOUT
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.hsc_session;
  if (token) {
    const session = await sessionService.verifySessionToken(token);
    if (session) {
      await sessionService.revokeSession(session.sessionId);
    }
  }

  res.clearCookie('hsc_session');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET CURRENT USER INFO (/me)
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({
    user: req.user
  });
});

export default router;
