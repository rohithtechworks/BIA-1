import { supabaseAdmin } from './supabase.js';
import { hashToken, generateRandomToken } from '../utils/hashUtils.js';
import { logger } from '../utils/logger.js';

export interface SessionRecord {
  id: string;
  user_id: string;
  session_token_hash: string;
  device_label: string;
  ip_address: string | null;
  is_active: boolean;
  last_activity_at: string;
  expires_at: string;
  revoked_at: string | null;
}

const SESSION_DURATION_HOURS = 24 * 7; // 7 days

export const sessionService = {
  /**
   * Checks if an active unexpired session exists for the user
   */
  async getActiveUserSession(userId: string): Promise<SessionRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('active_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('last_activity_at', { ascending: false })
      .maybeSingle();

    if (error) {
      logger.error('Error fetching active user session', error);
      return null;
    }

    return data as SessionRecord | null;
  },

  /**
   * Creates a new session record and returns raw session token
   */
  async createSession(userId: string, deviceLabel: string, ipAddress?: string): Promise<{ token: string; session: SessionRecord }> {
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);

    const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 3600 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('active_sessions')
      .insert({
        user_id: userId,
        session_token_hash: tokenHash,
        device_label: deviceLabel,
        ip_address: ipAddress || null,
        is_active: true,
        last_activity_at: new Date().toISOString(),
        expires_at: expiresAt
      })
      .select()
      .single();

    if (error || !data) {
      logger.error('Failed to create session record', error);
      throw new Error('Database error while creating session');
    }

    return { token: rawToken, session: data as SessionRecord };
  },

  /**
   * Verifies raw token against database active sessions
   */
  async verifySessionToken(token: string): Promise<{ userId: string; sessionId: string; role: string; fullName: string; phoneNumber: string } | null> {
    if (!token) return null;

    const tokenHash = hashToken(token);

    const { data: session, error } = await supabaseAdmin
      .from('active_sessions')
      .select('*, profiles(id, full_name, phone_number, role)')
      .eq('session_token_hash', tokenHash)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error || !session || !session.profiles) {
      return null;
    }

    // Update last activity timestamp asynchronously
    supabaseAdmin
      .from('active_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', session.id)
      .then();

    const profile = session.profiles as unknown as { id: string; full_name: string; phone_number: string; role: string };

    return {
      userId: session.user_id,
      sessionId: session.id,
      role: profile.role,
      fullName: profile.full_name,
      phoneNumber: profile.phone_number
    };
  },

  /**
   * Revokes all active sessions for a user (used during takeover or logout all)
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('active_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      logger.error('Failed to revoke user sessions', error);
    }
  },

  /**
   * Revokes a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await supabaseAdmin
      .from('active_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }
};
