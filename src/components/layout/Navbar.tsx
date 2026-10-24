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
    <header className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {showBack && (
          <button
            type="button"
            className="back"
            style={{ margin: 0, padding: '8px 14px', fontSize: '15px' }}
            onClick={handleBack}
          >
            ← Back
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/images/logo.webp"
            alt="Brilliant IAS Academy Logo"
            style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span
            style={{
              fontWeight: 800,
              fontSize: 'clamp(13px, 2.2vw, 18px)',
              color: '#103665',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            BRILLIANT IAS ACADEMY
          </span>
        </div>
      </div>

      <div className="nav-right">
        {user ? (
          <>
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
            <button type="button" className="nav-btn nav-btn-logout" onClick={openLoginModal}>
              Login
            </button>
            <button type="button" className="nav-btn nav-btn-logout" onClick={openSignupModal}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
