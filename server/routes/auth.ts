import { Router, Request, Response } from 'express';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { normalizePhoneNumber } from '../utils/phoneUtils.js';
import { hashPassword, comparePassword } from '../utils/hashUtils.js';
import { supabaseAdmin } from '../services/supabase.js';
import { authenticateToken, createJwtToken, AuthenticatedRequest } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = Router();
const authRateLimiter = createRateLimiter(20, 60 * 1000);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 3600 * 1000 // 30 days
};

/**
 * SIGNUP / REGISTER (Stores phone number as password in db)
 */
router.post('/register', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { fullName, phoneNumber, coursePassword } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const trimmedCode = coursePassword.trim().toUpperCase();

    // 1. Check if user with phone number already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (existingUser) {
      res.status(409).json({ error: 'An account with this phone number already exists. Please log in.' });
      return;
    }

    // 2. Check if access code is valid and unused
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('course_access_codes')
      .select('id, status')
      .ilike('code', trimmedCode)
      .eq('status', 'unused')
      .maybeSingle();

    if (codeError || !codeData) {
      res.status(400).json({ error: 'Invalid or already used course access code.' });
      return;
    }

    // 3. Store phone number as password in db (hashed securely with bcrypt)
    const passwordHash = await hashPassword(normalizedPhone);

    // 4. Insert user into public.users
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        full_name: fullName.trim(),
        phone_number: normalizedPhone,
        password_hash: passwordHash,
        access_code: trimmedCode,
        role: 'student'
      })
      .select('id, full_name, phone_number, role, access_code')
      .single();

    if (userError || !newUser) {
      logger.error('Failed to create user record', userError);
      res.status(500).json({ error: 'Failed to register user account' });
      return;
    }

    // 5. Mark access code as used
    await supabaseAdmin
      .from('course_access_codes')
      .update({
        status: 'used',
        assigned_phone: normalizedPhone,
        used_at: new Date().toISOString()
      })
      .eq('id', codeData.id);

    // 6. Generate JWT session
    const userPayload = {
      userId: newUser.id,
      fullName: newUser.full_name,
      phoneNumber: newUser.phone_number,
      role: newUser.role,
      accessCode: newUser.access_code
    };

    const token = createJwtToken(userPayload);
    res.cookie('hsc_session', token, COOKIE_OPTIONS);

    res.status(201).json({
      message: 'Account created successfully',
      user: userPayload
    });
  } catch (err) {
    logger.error('Registration error', err);
    res.status(500).json({ error: 'Registration failed due to server error' });
  }
});

/**
 * LOGIN (Asks for Full Name and Phone Number labeled as Password)
 */
router.post('/login', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { fullName, phoneNumber } = parseResult.data;
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // 1. Fetch User by phone number
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone_number', normalizedPhone)
      .maybeSingle();

    if (fetchError || !user) {
      res.status(401).json({ error: 'Invalid full name or phone number' });
      return;
    }

    // 2. Verify full name matches (case-insensitive)
    if (user.full_name.trim().toLowerCase() !== fullName.trim().toLowerCase()) {
      res.status(401).json({ error: 'Invalid full name or phone number' });
      return;
    }

    // 3. Verify phone number as password
    const isPasswordValid = await comparePassword(normalizedPhone, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid full name or phone number' });
      return;
    }

    // 4. Generate JWT session
    const userPayload = {
      userId: user.id,
      fullName: user.full_name,
      phoneNumber: user.phone_number,
      role: user.role,
      accessCode: user.access_code
    };

    const token = createJwtToken(userPayload);
    res.cookie('hsc_session', token, COOKIE_OPTIONS);

    res.json({
      user: userPayload
    });
  } catch (err) {
    logger.error('Login error', err);
    res.status(500).json({ error: 'Login failed due to server error' });
  }
});

/**
 * LOGOUT
 */
router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
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
