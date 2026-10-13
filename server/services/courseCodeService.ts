import { supabaseAdmin } from './supabase.js';
import { hashToken, generateRandomToken } from '../utils/hashUtils.js';
import { logger } from '../utils/logger.js';

export const courseCodeService = {
  /**
   * Validates and claims a course access code atomically for a user
   */
  async validateAndClaimCode(code: string, userId: string, courseId = 'home-spoken-english'): Promise<{ success: boolean; accessCodeId?: string; message?: string }> {
    const codeHash = hashToken(code);

    // 1. Find active code matching the hash
    const { data: accessCode, error } = await supabaseAdmin
      .from('course_access_codes')
      .select('*')
      .eq('code_hash', codeHash)
      .eq('course_id', courseId)
      .eq('status', 'active')
      .maybeSingle();

    if (error || !accessCode) {
      logger.warn('Attempted claim on invalid or inactive course code');
      return { success: false, message: 'Invalid or already claimed course access code' };
    }

    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      // Mark expired
      await supabaseAdmin
        .from('course_access_codes')
        .update({ status: 'expired' })
        .eq('id', accessCode.id);

      return { success: false, message: 'Course access code has expired' };
    }

    // 2. Atomic claim update (prevent race conditions by checking status = 'active' in update)
    const { data: updated, error: claimError } = await supabaseAdmin
      .from('course_access_codes')
      .update({
        status: 'claimed',
        claimed_by_user_id: userId,
        claimed_at: new Date().toISOString()
      })
      .eq('id', accessCode.id)
      .eq('status', 'active')
      .select()
      .maybeSingle();

    if (claimError || !updated) {
      logger.warn('Course code claim race condition or update failure', { codeId: accessCode.id });
      return { success: false, message: 'Course access code was just claimed or revoked by another user' };
    }

    // 3. Create course enrollment for user
    const { error: enrollError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        access_code_id: accessCode.id,
        status: 'active'
      });

    if (enrollError) {
      logger.error('Failed to create enrollment after code claim', enrollError);
    }

    return { success: true, accessCodeId: accessCode.id };
  },

  /**
   * Generates a new course access code
   */
  async generateCode(courseId: string, createdByUserId?: string, customCode?: string): Promise<{ code: string; id: string }> {
    const rawCode = customCode ? customCode.trim() : `HSC-${generateRandomToken(4).toUpperCase()}`;
    const codeHash = hashToken(rawCode);

    const { data, error } = await supabaseAdmin
      .from('course_access_codes')
      .insert({
        code_hash: codeHash,
        course_id: courseId,
        status: 'active',
        created_by_user_id: createdByUserId || null
      })
      .select('id')
      .single();

    if (error || !data) {
      logger.error('Failed to create course code', error);
      throw new Error('Database error while generating course access code');
    }

    return { code: rawCode, id: data.id };
  },

  /**
   * Lists course access codes for admin
   */
  async listCodes(): Promise<unknown[]> {
    const { data, error } = await supabaseAdmin
      .from('course_access_codes')
      .select('id, course_id, status, claimed_at, expires_at, created_at, profiles:claimed_by_user_id(full_name, phone_number)')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to list course codes', error);
      return [];
    }

    return data || [];
  },

  /**
   * Revokes a course access code
   */
  async revokeCode(codeId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('course_access_codes')
      .update({ status: 'revoked' })
      .eq('id', codeId);

    return !error;
  }
};
