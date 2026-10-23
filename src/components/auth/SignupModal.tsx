import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SignupModal: React.FC = () => {
  const { showSignupModal, closeModals, openLoginModal, register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [coursePassword, setCoursePassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!showSignupModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(fullName, phoneNumber, coursePassword);
    } catch (err: unknown) {
      setError((err as Error).message || 'Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModals}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Account</h2>
          <div className="modal-subtitle">Enroll in Home Spoken Centre Course</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Your full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Your phone number"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Course Password</label>
            <input
              type="text"
              className="form-input"
              placeholder="Company Provided Password"
              value={coursePassword}
              onChange={e => setCoursePassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="modal-switch-text">
          Already have an account?{' '}
          <button type="button" className="modal-switch-btn" onClick={openLoginModal}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
