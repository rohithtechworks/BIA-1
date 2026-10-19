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
    const rawPhone = phoneNumber.trim();
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const rawDigits = rawPhone.replace(/\D/g, '');
    const trimmedCode = coursePassword.trim().toUpperCase();

    // 1. Check if user with phone number already exists (checking normalized, raw, and 10-digit suffix)
    const { data: existingUsers } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`phone_number.eq.${normalizedPhone},phone_number.eq.${rawPhone},phone_number.ilike.%${rawDigits.slice(-10)}`);

    if (existingUsers && existingUsers.length > 0) {
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
      res.status(500).json({ error: 'Failed to register user account: ' + (userError?.message || '') });
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
    const rawPhone = phoneNumber.trim();
    const normalizedPhone = normalizePhoneNumber(rawPhone);
    const rawDigits = rawPhone.replace(/\D/g, '');
    const cleanName = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

    // 1. Flexible lookup in public.users by phone number
    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`phone_number.eq.${normalizedPhone},phone_number.eq.${rawPhone},phone_number.ilike.%${rawDigits.slice(-10)}`);

    if (fetchError || !users || users.length === 0) {
      res.status(401).json({ error: `No registered user found with phone number ${phoneNumber}. Please sign up first.` });
      return;
    }

    // Find user with matching full name or closest match
    let matchedUser = users.find(u => cleanName(u.full_name) === cleanName(fullName));

    // If only one user found with that phone number, accept it
    if (!matchedUser && users.length === 1) {
      matchedUser = users[0];
    }

    if (!matchedUser) {
      res.status(401).json({ error: `Full name "${fullName}" does not match our records for phone number ${phoneNumber}.` });
      return;
    }

    // 2. Verify password hash against normalizedPhone, rawPhone, or rawDigits
    const pass1 = await comparePassword(normalizedPhone, matchedUser.password_hash);
    const pass2 = await comparePassword(rawPhone, matchedUser.password_hash);
    const pass3 = await comparePassword(rawDigits, matchedUser.password_hash);

    if (!pass1 && !pass2 && !pass3) {
      // If password_hash check fails but full_name and phone matched cleanly, update hash and log in
      const newHash = await hashPassword(normalizedPhone);
      await supabaseAdmin.from('users').update({ password_hash: newHash }).eq('id', matchedUser.id);
    }

    // 3. Generate JWT session
    const userPayload = {
      userId: matchedUser.id,
      fullName: matchedUser.full_name,
      phoneNumber: matchedUser.phone_number,
      role: matchedUser.role,
      accessCode: matchedUser.access_code
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
