import { supabaseAdmin } from './supabase.js';
import { generateRandomToken } from '../utils/hashUtils.js';
import { logger } from '../utils/logger.js';

export const courseCodeService = {
  /**
   * Validates and claims a 10-digit hexadecimal course access code atomically for a user
   */
  async validateAndClaimCode(code: string, userId: string, phoneNumber: string, courseId = 'home-spoken-english'): Promise<{ success: boolean; accessCodeId?: string; message?: string }> {
    const trimmedCode = code.trim().toUpperCase();

    // 1. Find unused code matching the 10-digit hex code
    const { data: accessCode, error } = await supabaseAdmin
      .from('course_access_codes')
      .select('*')
      .eq('code', trimmedCode)
      .eq('status', 'unused')
      .maybeSingle();

    if (error || !accessCode) {
      logger.warn('Attempted claim on invalid or already used course code', { code: trimmedCode });
      return { success: false, message: 'Invalid or already used course access code' };
    }

    // 2. Atomic claim update (prevent race conditions by checking status = 'unused' in update)
    const { data: updated, error: claimError } = await supabaseAdmin
      .from('course_access_codes')
      .update({
        status: 'used',
        assigned_phone: phoneNumber,
        used_at: new Date().toISOString()
      })
      .eq('id', accessCode.id)
      .eq('status', 'unused')
      .select()
      .maybeSingle();

    if (claimError || !updated) {
      logger.warn('Course code claim race condition or update failure', { codeId: accessCode.id });
      return { success: false, message: 'Course access code was just claimed by another user' };
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
   * Generates a new 10-digit hex course access code
   */
  async generateCode(_courseId: string, _createdByUserId?: string, customCode?: string): Promise<{ code: string; id: string }> {
    // Generate 10-digit hex code if not provided
    const rawCode = customCode ? customCode.trim().toUpperCase() : generateRandomToken(5).toUpperCase();

    const { data, error } = await supabaseAdmin
      .from('course_access_codes')
      .insert({
        code: rawCode,
        status: 'unused'
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
      .select('id, code, status, assigned_phone, created_at, used_at')
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
