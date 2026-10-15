import { supabaseAdmin } from './supabase.js';
import { generateRandomToken } from '../utils/hashUtils.js';
import { logger } from '../utils/logger.js';

export const courseCodeService = {
  /**
   * Validates and claims a 10-digit hexadecimal course access code for a user
   */
  async validateAndClaimCode(code: string, phoneNumber: string): Promise<{ success: boolean; accessCodeId?: string; message?: string }> {
    const trimmedCode = code.trim().toUpperCase();

    // 1. Find unused code
    const { data: accessCode, error } = await supabaseAdmin
      .from('course_access_codes')
      .select('*')
      .ilike('code', trimmedCode)
      .eq('status', 'unused')
      .maybeSingle();

    if (error || !accessCode) {
      return { success: false, message: 'Invalid or already used course access code' };
    }

    // 2. Mark code as used
    const { error: claimError } = await supabaseAdmin
      .from('course_access_codes')
      .update({
        status: 'used',
        assigned_phone: phoneNumber,
        used_at: new Date().toISOString()
      })
      .eq('id', accessCode.id)
      .eq('status', 'unused');

    if (claimError) {
      return { success: false, message: 'Course access code was just claimed by another user' };
    }

    return { success: true, accessCodeId: accessCode.id };
  },

  /**
   * Generates a new 10-digit hex course access code
   */
  async generateCode(customCode?: string): Promise<{ code: string; id: string }> {
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
   * Lists course access codes
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
