import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onBack?: () => void;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onBack, showBack = true }) => {
  const { user, openLoginModal, openSignupModal, logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="navbar">
      {showBack ? (
        <button
          type="button"
          className="back"
          style={{ margin: 0, padding: '8px 14px', fontSize: '15px' }}
          onClick={handleBack}
        >
          ← Back
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' }}>
          <img
            src="/images/logo.webp"
            alt="Brilliant IAS Academy Logo"
            style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span
            style={{
              fontWeight: 800,
              fontSize: 'clamp(10px, 1.6vw, 13px)',
              color: '#103665',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.1
            }}
          >
            BRILLIANT IAS ACADEMY
          </span>
        </div>
      )}

      <div className="nav-right">
        {user ? (
          <>
            <span className="user-badge">
              {user.fullName} {user.role === 'admin' && '(Admin)'}
            </span>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-btn nav-btn-admin" style={{ textDecoration: 'none' }}>
                Admin Portal
              </Link>
            )}
            <button type="button" className="nav-btn nav-btn-logout" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button type="button" className="nav-btn" style={{ background: '#103665', color: '#fff' }} onClick={openLoginModal}>
              Login
            </button>
            <button type="button" className="nav-btn nav-btn-admin" onClick={openSignupModal}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
