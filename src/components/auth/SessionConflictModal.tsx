import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SessionConflictModal: React.FC = () => {
  const { sessionConflict, closeModals, takeoverSession } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!sessionConflict) return null;

  const handleTakeover = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await takeoverSession();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to switch active session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModals}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ color: '#b71945' }}>Active Session Conflict</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#333', marginBottom: '16px' }}>
          You are already logged in on another device (<strong>{sessionConflict.deviceLabel}</strong>).
        </p>

        <p style={{ fontSize: '14px', lineHeight: '1.4', color: '#666', marginBottom: '20px' }}>
          Home Spoken Centre enforces a single active device policy. Would you like to terminate your previous session on that device and continue on this device?
        </p>

        <button type="button" className="btn-primary" onClick={handleTakeover} disabled={submitting}>
          {submitting ? 'Switching Session...' : 'Revoke Previous Session & Continue Here'}
        </button>

        <button type="button" className="btn-secondary" onClick={closeModals} disabled={submitting}>
          Cancel
        </button>
      </div>
    </div>
  );
};
