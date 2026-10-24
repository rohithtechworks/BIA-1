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
    <header className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', flexWrap: 'wrap', gap: '12px' }}>
      {/* Left / Brand Container */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {showBack && (
          <button
            type="button"
            className="back"
            style={{ margin: 0 }}
            onClick={handleBack}
          >
            ← Back
          </button>
        )}

        {/* Dedicated Brand Container (Logo centered above text) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
          <img
            src="/images/logo.webp"
            alt="Brilliant IAS Academy Logo"
            style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '50%', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span
            style={{
              fontWeight: 800,
              fontSize: 'clamp(11px, 1.8vw, 14px)',
              color: '#103665',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              lineHeight: 1.1,
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
          >
            BRILLIANT IAS ACADEMY
          </span>
        </div>
      </div>

      {/* Right / Buttons Container */}
      <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <button
              type="button"
              className="nav-btn"
              style={{
                background: '#103665',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={openLoginModal}
            >
              Login
            </button>
            <button
              type="button"
              className="nav-btn"
              style={{
                background: '#d6a64b',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              onClick={openSignupModal}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
};
